import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Share, Alert, Switch, ScrollView, Linking } from "react-native";
import Constants from "expo-constants";
import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { Text } from "../../../shared/typography/Text";
import {
  usePaceStore,
  zustandStorage,
  PERSIST_KEY,
} from "../../../shared/store/usePaceStore";
import { serializeBackup, parseBackup, BackupError } from "../../../shared/lib/backup";
import { useCurrency } from "../../../shared/store/useCurrency";
import { useCategories } from "../../../shared/store/useCategories";
import { CURRENCIES } from "../../../shared/lib/money";
import { useT, LANGUAGES } from "../../../shared/i18n";
import { BottomSheet } from "../../../shared/ui/BottomSheet";
import { expensesToCSV } from "../../../shared/lib/csv";
import {
  ensureNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  sendTestNotification,
} from "../../../shared/lib/notifications";
import { CardIcon, ChevronLeftIcon, SparklesIcon, TrashIcon, CheckIcon, DownloadIcon, LockIcon, BellIcon, ActivityIcon, RotateCcwIcon, ListIcon, ArchiveIcon } from "../../../shared/ui/icons";
import { theme } from "../../../shared/styles/theme";
import { PRIVACY_URL, TERMS_URL } from "../../../shared/config/legal";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onOpenSubscriptions: () => void;
  onOpenCategoryBudgets: () => void;
}

const VERSION = Constants.expoConfig?.version ?? "1.0.0";

export function SettingsSheet({ open, onClose, onUpgrade, onOpenSubscriptions, onOpenCategoryBudgets }: SettingsSheetProps) {
  const budget = usePaceStore((s) => s.budget);
  const subscriptions = usePaceStore((s) => s.subscriptions);
  const entries = usePaceStore((s) => s.entries);
  const isPro = usePaceStore((s) => s.isPro);
  const categoryBudgets = usePaceStore((s) => s.categoryBudgets);
  const resetAll = usePaceStore((s) => s.resetAll);
  const unlockPro = usePaceStore((s) => s.unlockPro);
  const lockPro = usePaceStore((s) => s.lockPro);
  const reminderEnabled = usePaceStore((s) => s.reminderEnabled);
  const reminderHour = usePaceStore((s) => s.reminderHour);
  const reminderMinute = usePaceStore((s) => s.reminderMinute);
  const setReminder = usePaceStore((s) => s.setReminder);
  const budgetAlertsEnabled = usePaceStore((s) => s.budgetAlertsEnabled);
  const setBudgetAlertsEnabled = usePaceStore((s) => s.setBudgetAlertsEnabled);
  const setCurrency = usePaceStore((s) => s.setCurrency);
  const language = usePaceStore((s) => s.language);
  const setLanguage = usePaceStore((s) => s.setLanguage);
  const { currency, fmt, toDisplay } = useCurrency();
  const { resolve: resolveCat } = useCategories();
  const { t, tu } = useT();

  const [confirmReset, setConfirmReset] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      // TODO(revenuecat): const info = await Purchases.restorePurchases();
      // const active = !!info.entitlements.active["pro"]; → unlockPro()
      const restored = false; // mock: gerçek satın alma henüz entegre değil
      if (restored) {
        unlockPro();
        Alert.alert(t("settings.restoredTitle"), t("settings.restoredBody"));
      } else {
        Alert.alert(t("settings.restoreNoneTitle"), t("settings.restoreNoneBody"));
      }
    } finally {
      setRestoring(false);
    }
  };

  const openURL = (url: string) => Linking.openURL(url).catch(() => {});

  const reminderTime = `${String(reminderHour).padStart(2, "0")}:${String(reminderMinute).padStart(2, "0")}`;
  const catBudgetCount = Object.keys(categoryBudgets).length;

  const toggleReminder = async () => {
    if (reminderEnabled) {
      await cancelDailyReminder();
      setReminder(false, reminderHour, reminderMinute);
      return;
    }
    const granted = await ensureNotificationPermission();
    if (!granted) {
      Alert.alert(t("settings.permTitle"), t("settings.permBody"));
      return;
    }
    await scheduleDailyReminder(reminderHour, reminderMinute, {
      title: t("notif.title"),
      body: t("notif.body"),
    });
    setReminder(true, reminderHour, reminderMinute);
  };

  const toggleBudgetAlerts = async () => {
    if (budgetAlertsEnabled) {
      setBudgetAlertsEnabled(false);
      return;
    }
    // Eşik aşımında bildirim atabilmek için izin şart.
    const granted = await ensureNotificationPermission();
    if (!granted) {
      Alert.alert(t("settings.permTitle"), t("settings.permBody"));
      return;
    }
    setBudgetAlertsEnabled(true);
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
      Alert.alert(t("settings.noDataTitle"), t("settings.noDataBody"));
      return;
    }
    try {
      setExporting(true);
      // UTF-8 BOM → Excel'in Türkçe karakterleri doğru okuması için.
      const csv =
        String.fromCharCode(0xfeff) +
        expensesToCSV(entries, {
          convert: toDisplay,
          currencyCode: currency,
          categoryLabel: (id) => resolveCat(id).name,
          headers: {
            date: t("csv.date"),
            time: t("csv.time"),
            category: t("csv.category"),
            amount: t("csv.amount"),
            note: t("csv.note"),
          },
        });
      const file = new File(Paths.cache, "pace-expenses.csv");
      file.create({ overwrite: true });
      file.write(csv);
      await Share.share({ url: file.uri, title: "pace" });
    } catch (e) {
      Alert.alert(t("settings.exportFailTitle"), t("settings.exportFailBody"));
    } finally {
      setExporting(false);
    }
  };

  // Tüm store state'ini tek JSON dosyasına yedekler ve paylaşır. Ücretsiz —
  // veri kaybı koruması temel bir güven özelliği (CSV/analiz Pro'da kalır).
  const handleBackup = async () => {
    if (backingUp) return;
    try {
      setBackingUp(true);
      // getItem senkron (MMKV) — StateStorage tipi async union döndürse de.
      const raw = zustandStorage.getItem(PERSIST_KEY) as string | null;
      const json = serializeBackup(raw, { appVersion: VERSION });
      const file = new File(Paths.cache, "pace-backup.json");
      file.create({ overwrite: true });
      file.write(json);
      await Share.share({ url: file.uri, title: "pace" });
    } catch (e) {
      if (e instanceof BackupError) {
        Alert.alert(t("settings.backupNoDataTitle"), t("settings.backupNoDataBody"));
      } else {
        Alert.alert(t("settings.backupFailTitle"), t("settings.backupFailBody"));
      }
    } finally {
      setBackingUp(false);
    }
  };

  // Yedek dosyasını seçtirir, doğrular ve mevcut veriyi onunla değiştirir.
  // Onay zorunlu — geri alınamaz.
  const handleImport = () => {
    Alert.alert(
      t("settings.restoreConfirmTitle"),
      t("settings.restoreConfirmBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.restoreConfirmCta"),
          style: "destructive",
          onPress: runImport,
        },
      ],
    );
  };

  const runImport = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "public.json", "*/*"],
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;
      const text = await new File(picked.assets[0].uri).text();
      const blob = parseBackup(text);
      // version'ı 0'a düşür → rehydrate her zaman migrate'i çalıştırır, böylece
      // her alan store'un kendi doğrulamasından geçer (kötü/eski veri temizlenir).
      zustandStorage.setItem(PERSIST_KEY, JSON.stringify({ ...blob, version: 0 }));
      await usePaceStore.persist.rehydrate();
      // Yedek geçmiş bir aydan geliyorsa ay devrini uygula.
      usePaceStore.getState().rollIfNewMonth();
      Alert.alert(t("settings.restoreSuccessTitle"), t("settings.restoreSuccessBody"));
      onClose();
    } catch (e) {
      Alert.alert(t("settings.restoreFailTitle"), t("settings.restoreFailBody"));
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t("settings.title")}>
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
            <Text style={styles.proTitle}>{t("settings.proActive")}</Text>
            <Text style={styles.proSub}>{t("settings.proActiveSub")}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.proCard}>
          <View style={[styles.proBadge, styles.proBadgeIdle]}>
            <SparklesIcon color="#fff" size={16} />
          </View>
          <View style={styles.proInfo}>
            <Text style={styles.proTitle}>Pace Pro</Text>
            <Text style={styles.proSub}>{t("settings.proIdleSub")}</Text>
          </View>
          <TouchableOpacity style={styles.proCta} onPress={onUpgrade} activeOpacity={0.9}>
            <Text style={styles.proCtaText}>{t("settings.go")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hesap — satın almaları geri yükle (App Store zorunlu) */}
      <Text style={styles.sectionLabel}>{tu("settings.account")}</Text>
      <TouchableOpacity
        style={styles.row}
        onPress={handleRestore}
        disabled={restoring}
        activeOpacity={0.7}
      >
        <View style={styles.rowIcon}>
          <RotateCcwIcon color={theme.colors.textSoft} size={18} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.restore")}</Text>
          <Text style={styles.rowSub}>
            {restoring ? t("settings.restoring") : t("settings.restoreSub")}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Bildirimler */}
      <Text style={styles.sectionLabel}>{tu("settings.notifications")}</Text>
      <View style={[styles.row, { marginBottom: 8 }]}>
        <View style={styles.rowIcon}>
          <BellIcon color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.dailyReminder")}</Text>
          <Text style={styles.rowSub}>
            {reminderEnabled ? t("settings.everyDayAt", { time: reminderTime }) : t("settings.off")}
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
      <View style={styles.row}>
        <View style={styles.rowIcon}>
          <ActivityIcon color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.budgetAlerts")}</Text>
          <Text style={styles.rowSub}>
            {budgetAlertsEnabled ? t("settings.budgetAlertsOn") : t("settings.off")}
          </Text>
        </View>
        <Switch
          style={{ alignSelf: "center" }}
          value={budgetAlertsEnabled}
          onValueChange={toggleBudgetAlerts}
          trackColor={{ false: "rgba(255,255,255,0.15)", true: theme.colors.stateGood }}
          thumbColor="#fff"
        />
      </View>

      {/* Bütçe */}
      <Text style={styles.sectionLabel}>{tu("settings.budget")}</Text>
      <TouchableOpacity style={[styles.row, { marginBottom: 8 }]} onPress={onOpenSubscriptions} activeOpacity={0.7}>
        <View style={styles.rowIcon}>
          <CardIcon color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.budgetRow")}</Text>
          <Text style={styles.rowSub}>
            {t("settings.budgetSub", { budget: fmt(budget), n: subscriptions.length })}
          </Text>
        </View>
        <View style={styles.chevron}>
          <ChevronLeftIcon color={theme.colors.textDim} size={18} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={onOpenCategoryBudgets} activeOpacity={0.7}>
        <View style={styles.rowIcon}>
          <ListIcon color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.categoryBudgetsRow")}</Text>
          <Text style={styles.rowSub}>
            {catBudgetCount > 0
              ? t("settings.categoryBudgetsSub", { n: catBudgetCount })
              : t("settings.categoryBudgetsSubEmpty")}
          </Text>
        </View>
        {!isPro && (
          <View style={styles.rowIcon}>
            <LockIcon color={theme.colors.textDim} />
          </View>
        )}
        <View style={styles.chevron}>
          <ChevronLeftIcon color={theme.colors.textDim} size={18} />
        </View>
      </TouchableOpacity>

      {/* Para birimi */}
      <Text style={styles.sectionLabel}>{tu("settings.currency")}</Text>
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

      {/* Dil */}
      <Text style={styles.sectionLabel}>{tu("settings.language")}</Text>
      <View style={styles.currencyRow}>
        {LANGUAGES.map((l) => {
          const active = language === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              style={[styles.langChip, active && styles.currencyChipActive]}
              onPress={() => setLanguage(l.code)}
              activeOpacity={0.8}
            >
              <Text style={[styles.langLabel, active && styles.currencyTextActive]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Veri / tehlikeli bölge */}
      <Text style={styles.sectionLabel}>{tu("settings.data")}</Text>

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
          <Text style={styles.rowTitle}>{t("settings.export")}</Text>
          <Text style={styles.rowSub}>
            {exporting ? t("settings.exportPreparing") : t("settings.exportSub")}
          </Text>
        </View>
        {!isPro && (
          <View style={styles.proChip}>
            <LockIcon color={theme.colors.stateGood} size={12} />
            <Text style={styles.proChipText}>Pro</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, { marginBottom: 8 }]}
        onPress={handleBackup}
        disabled={backingUp}
        activeOpacity={0.7}
      >
        <View style={styles.rowIcon}>
          <ArchiveIcon color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.backup")}</Text>
          <Text style={styles.rowSub}>
            {backingUp ? t("settings.backupPreparing") : t("settings.backupSub")}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, { marginBottom: 8 }]}
        onPress={handleImport}
        activeOpacity={0.7}
      >
        <View style={styles.rowIcon}>
          <RotateCcwIcon size={18} color={theme.colors.textSoft} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.dataRestore")}</Text>
          <Text style={styles.rowSub}>{t("settings.dataRestoreSub")}</Text>
        </View>
      </TouchableOpacity>

      {!confirmReset ? (
        <TouchableOpacity style={styles.dangerRow} onPress={() => setConfirmReset(true)} activeOpacity={0.7}>
          <View style={styles.rowIcon}>
            <TrashIcon color={theme.colors.danger} />
          </View>
          <Text style={styles.dangerText}>{t("settings.resetAll")}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>{t("settings.confirmResetText")}</Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity style={styles.cancel} onPress={() => setConfirmReset(false)} activeOpacity={0.7}>
              <Text style={styles.cancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDanger} onPress={handleReset} activeOpacity={0.85}>
              <Text style={styles.confirmDangerText}>{t("common.reset")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {__DEV__ && (
        <>
          <Text style={styles.sectionLabel}>{tu("settings.dev")}</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => (isPro ? lockPro() : unlockPro())}
            activeOpacity={0.7}
          >
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{t("settings.devPro")}</Text>
              <Text style={styles.rowSub}>
                {t("settings.devProSub", { state: isPro ? t("settings.stateOn") : t("settings.stateOff") })}
              </Text>
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
                Alert.alert(t("settings.permTitle"), t("settings.testPermBody"));
                return;
              }
              await sendTestNotification({ title: t("notif.title"), body: t("notif.testBody") });
              Alert.alert(t("settings.testSentTitle"), t("settings.testSentBody"));
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{t("settings.testNotif")}</Text>
              <Text style={styles.rowSub}>{t("settings.testNotifSub")}</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      {/* Yasal */}
      <Text style={styles.sectionLabel}>{tu("settings.legal")}</Text>
      <TouchableOpacity
        style={[styles.row, { marginBottom: 8 }]}
        onPress={() => openURL(PRIVACY_URL)}
        activeOpacity={0.7}
      >
        <View style={styles.rowIcon}>
          <LockIcon color={theme.colors.textSoft} size={16} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.privacy")}</Text>
        </View>
        <View style={styles.chevron}>
          <ChevronLeftIcon color={theme.colors.textDim} size={18} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={() => openURL(TERMS_URL)} activeOpacity={0.7}>
        <View style={styles.rowIcon}>
          <ListIcon color={theme.colors.textSoft} size={18} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{t("settings.terms")}</Text>
        </View>
        <View style={styles.chevron}>
          <ChevronLeftIcon color={theme.colors.textDim} size={18} />
        </View>
      </TouchableOpacity>

      <Text style={styles.about}>{t("settings.version", { version: VERSION })}</Text>
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
  langChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  langLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSoft,
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
    color: theme.colors.danger,
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
    backgroundColor: theme.colors.stateOver,
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
