import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Share, Alert, Switch, ScrollView } from "react-native";
import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import { Text } from "../../../shared/typography/Text";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { useCurrency } from "../../../shared/store/useCurrency";
import { CURRENCIES } from "../../../shared/lib/money";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { expensesToCSV } from "../../../shared/lib/csv";
import {
  ensureNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  sendTestNotification,
} from "../../../shared/lib/notifications";
import { CardIcon, ChevronLeftIcon, SparklesIcon, TrashIcon, CheckIcon, DownloadIcon, LockIcon, BellIcon } from "../../../shared/ui/icons";
import { theme } from "../../../shared/styles/theme";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onOpenSubscriptions: () => void;
}

const VERSION = Constants.expoConfig?.version ?? "1.0.0";

export function SettingsSheet({ open, onClose, onUpgrade, onOpenSubscriptions }: SettingsSheetProps) {
  const budget = usePaceStore((s) => s.budget);
  const subscriptions = usePaceStore((s) => s.subscriptions);
  const entries = usePaceStore((s) => s.entries);
  const isPro = usePaceStore((s) => s.isPro);
  const resetAll = usePaceStore((s) => s.resetAll);
  const unlockPro = usePaceStore((s) => s.unlockPro);
  const lockPro = usePaceStore((s) => s.lockPro);
  const reminderEnabled = usePaceStore((s) => s.reminderEnabled);
  const reminderHour = usePaceStore((s) => s.reminderHour);
  const reminderMinute = usePaceStore((s) => s.reminderMinute);
  const setReminder = usePaceStore((s) => s.setReminder);
  const setCurrency = usePaceStore((s) => s.setCurrency);
  const { currency, fmt, toDisplay } = useCurrency();

  const [confirmReset, setConfirmReset] = useState(false);
  const [exporting, setExporting] = useState(false);

  const reminderTime = `${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}`;

  const toggleReminder = async () => {
    if (reminderEnabled) {
      await cancelDailyReminder();
      setReminder(false, reminderHour, reminderMinute);
      return;
    }
    const granted = await ensureNotificationPermission();
    if (!granted) {
      Alert.alert(
        "Bildirim izni kapalı",
        "Hatırlatma için telefon Ayarlar → Bildirimler → pace'ten izin vermen gerekiyor.",
      );
      return;
    }
    await scheduleDailyReminder(reminderHour, reminderMinute);
    setReminder(true, reminderHour, reminderMinute);
  };

  // Sheet kapanınca onay adımını sıfırla.
  useEffect(() => {
    if (!open) setConfirmReset(false);
  }, [open]);

  const handleReset = () => {
    resetAll();
    setConfirmReset(false);
    onClose();
  };

  const handleExport = async () => {
    if (!isPro) {
      onUpgrade();
      return;
    }
    if (entries.length === 0) {
      Alert.alert("Dışa aktarılacak veri yok", "Önce birkaç harcama gir.");
      return;
    }
    try {
      setExporting(true);
      // UTF-8 BOM → Excel'in Türkçe karakterleri doğru okuması için.
      const csv =
        String.fromCharCode(0xfeff) +
        expensesToCSV(entries, { convert: toDisplay, currencyCode: currency });
      const file = new File(Paths.cache, "pace-harcamalar.csv");
      file.create({ overwrite: true });
      file.write(csv);
      await Share.share({ url: file.uri, title: "pace harcamalar" });
    } catch (e) {
      Alert.alert("Dışa aktarma başarısız", "Bir şeyler ters gitti, tekrar dene.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Ayarlar">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Pro durumu */}
      {isPro ? (
        <View style={[styles.proCard, styles.proCardActive]}>
          <View style={styles.proBadge}>
            <CheckIcon color="#fff" size={16} />
          </View>
          <View style={styles.proInfo}>
            <Text style={styles.proTitle}>Pace Pro aktif</Text>
            <Text style={styles.proSub}>Tüm özellikler açık · ömür boyu</Text>
          </View>
        </View>
      ) : (
        <View style={styles.proCard}>
          <View style={[styles.proBadge, styles.proBadgeIdle]}>
            <SparklesIcon color="#fff" size={16} />
          </View>
          <View style={styles.proInfo}>
            <Text style={styles.proTitle}>Pace Pro</Text>
            <Text style={styles.proSub}>Tempo analizi ve fazlası · tek seferlik</Text>
          </View>
          <TouchableOpacity style={styles.proCta} onPress={onUpgrade} activeOpacity={0.9}>
            <Text style={styles.proCtaText}>Geç</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bildirimler */}
      <Text style={styles.sectionLabel}>Bildirimler</Text>
      <View style={styles.row}>
        <View style={styles.rowIcon}>
          <BellIcon color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>Günlük hatırlatma</Text>
          <Text style={styles.rowSub}>
            {reminderEnabled ? `Her gün ${reminderTime}` : "Kapalı"}
          </Text>
        </View>
        <Switch
          style={{ alignSelf: "center" }}
          value={reminderEnabled}
          onValueChange={toggleReminder}
          trackColor={{ false: "rgba(255,255,255,0.15)", true: theme.colors.stateGood }}
          thumbColor="#fff"
        />
      </View>

      {/* Bütçe */}
      <Text style={styles.sectionLabel}>Bütçe</Text>
      <TouchableOpacity style={styles.row} onPress={onOpenSubscriptions} activeOpacity={0.7}>
        <View style={styles.rowIcon}>
          <CardIcon color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>Bütçe & sabit giderler</Text>
          <Text style={styles.rowSub}>
            Aylık {fmt(budget)} · {subscriptions.length} sabit gider
          </Text>
        </View>
        <View style={styles.chevron}>
          <ChevronLeftIcon color={theme.colors.textDim} size={18} />
        </View>
      </TouchableOpacity>

      {/* Para birimi */}
      <Text style={styles.sectionLabel}>Para birimi</Text>
      <View style={styles.currencyRow}>
        {CURRENCIES.map((c) => {
          const active = currency === c.code;
          return (
            <TouchableOpacity
              key={c.code}
              style={[styles.currencyChip, active && styles.currencyChipActive]}
              onPress={() => setCurrency(c.code)}
              activeOpacity={0.8}
            >
              <Text style={[styles.currencySymbol, active && styles.currencyTextActive]}>
                {c.symbol}
              </Text>
              <Text style={[styles.currencyCode, active && styles.currencyTextActive]}>
                {c.code}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Veri / tehlikeli bölge */}
      <Text style={styles.sectionLabel}>Veri</Text>

      <TouchableOpacity
        style={[styles.row, { marginBottom: 8 }]}
        onPress={handleExport}
        disabled={exporting}
        activeOpacity={0.7}
      >
        <View style={styles.rowIcon}>
          <DownloadIcon color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>Harcamaları dışa aktar</Text>
          <Text style={styles.rowSub}>
            {exporting ? "Hazırlanıyor…" : "CSV olarak paylaş (Excel, Numbers…)"}
          </Text>
        </View>
        {!isPro && (
          <View style={styles.proChip}>
            <LockIcon color={theme.colors.stateGood} size={12} />
            <Text style={styles.proChipText}>Pro</Text>
          </View>
        )}
      </TouchableOpacity>

      {!confirmReset ? (
        <TouchableOpacity style={styles.dangerRow} onPress={() => setConfirmReset(true)} activeOpacity={0.7}>
          <View style={styles.rowIcon}>
            <TrashIcon color="#f87171" />
          </View>
          <Text style={styles.dangerText}>Tüm veriyi sıfırla</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>
            Bütçe, sabit giderler ve tüm harcamalar silinir; kurulum baştan başlar. Pro hakkın korunur.
          </Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity style={styles.cancel} onPress={() => setConfirmReset(false)} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Vazgeç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDanger} onPress={handleReset} activeOpacity={0.85}>
              <Text style={styles.confirmDangerText}>Sıfırla</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {__DEV__ && (
        <>
          <Text style={styles.sectionLabel}>Geliştirici</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => (isPro ? lockPro() : unlockPro())}
            activeOpacity={0.7}
          >
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Pace Pro (test)</Text>
              <Text style={styles.rowSub}>Şu an: {isPro ? "açık" : "kapalı"} — dokun değiştir</Text>
            </View>
            <View style={[styles.devToggle, isPro && styles.devToggleOn]}>
              <Text style={[styles.devToggleText, isPro && styles.devToggleTextOn]}>
                {isPro ? "PRO" : "FREE"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { marginTop: 8 }]}
            onPress={async () => {
              const ok = await ensureNotificationPermission();
              if (!ok) {
                Alert.alert("Bildirim izni kapalı", "Önce bildirim izni ver.");
                return;
              }
              await sendTestNotification();
              Alert.alert("Gönderildi", "5 saniye içinde bildirim gelecek (uygulamayı arka plana al).");
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Test bildirimi gönder</Text>
              <Text style={styles.rowSub}>5 sn sonra tek seferlik bildirim</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.about}>pace · sürüm {VERSION}</Text>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  proCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginBottom: 8,
  },
  proCardActive: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.25)",
  },
  proBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
  },
  proBadgeIdle: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  proInfo: {
    flex: 1,
  },
  proTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  proSub: {
    fontSize: 13,
    color: theme.colors.textSoft,
    marginTop: 2,
  },
  proCta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.stateGood,
  },
  proCtaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textDim,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  rowIcon: {
    width: 28,
    alignItems: "center",
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  rowSub: {
    fontSize: 13,
    color: theme.colors.textSoft,
    marginTop: 2,
  },
  chevron: {
    transform: [{ rotate: "180deg" }],
  },
  currencyRow: {
    flexDirection: "row",
    gap: 8,
  },
  currencyChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  currencyChipActive: {
    borderColor: theme.colors.stateGood,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  currencySymbol: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textSoft,
  },
  currencyCode: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textMute,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  currencyTextActive: {
    color: theme.colors.textPrimary,
  },
  proChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  proChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.stateGood,
  },
  devToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  devToggleOn: {
    backgroundColor: theme.colors.stateGood,
  },
  devToggleText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.textSoft,
  },
  devToggleTextOn: {
    color: "#fff",
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  dangerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f87171",
  },
  confirm: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  confirmText: {
    fontSize: 13,
    color: theme.colors.textSoft,
    lineHeight: 19,
    marginBottom: 14,
  },
  confirmBtns: {
    flexDirection: "row",
    gap: 8,
  },
  cancel: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  confirmDanger: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#dc2626",
    alignItems: "center",
  },
  confirmDangerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  about: {
    fontSize: 12,
    color: theme.colors.textMute,
    textAlign: "center",
    marginTop: 28,
  },
});
