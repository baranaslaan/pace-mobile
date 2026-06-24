import React from "react";
import { StyleSheet, View, TouchableOpacity, Pressable } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { AnimatePresence, MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { usePaceStore } from "../../../shared/store/usePaceStore";
import { ActivityIcon, CardIcon, ListIcon, RepeatIcon, SettingsIcon, SparklesIcon } from "../../../shared/ui/icons";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenSubscriptions: () => void;
  onOpenAnalytics: () => void;
  onOpenHistory: () => void;
  onOpenRecurring: () => void;
  onOpenSettings: () => void;
  onOpenPaywall: () => void;
}

export function MoreMenu({
  open,
  onClose,
  onOpenSubscriptions,
  onOpenAnalytics,
  onOpenHistory,
  onOpenRecurring,
  onOpenSettings,
  onOpenPaywall,
}: MoreMenuProps) {
  const isPro = usePaceStore((s) => s.isPro);
  const { t } = useT();
  return (
    <AnimatePresence>
      {open && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <MotiView
              style={styles.scrim}
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 200 }}
              pointerEvents="none"
            />
          </Pressable>

          <MotiView
            style={styles.menu}
            from={{ opacity: 0, scale: 0.96, translateY: -6 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.98, translateY: -6 }}
            transition={{ type: "timing", duration: 160, easing: Easing.out(Easing.cubic) }}
          >
            <TouchableOpacity style={styles.item} onPress={onOpenHistory} activeOpacity={0.7}>
              <ListIcon color={theme.colors.textSoft} />
              <Text style={styles.itemText}>{t("menu.today")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={onOpenSubscriptions} activeOpacity={0.7}>
              <CardIcon color={theme.colors.textSoft} />
              <Text style={styles.itemText}>{t("menu.budget")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={onOpenAnalytics} activeOpacity={0.7}>
              <ActivityIcon color={theme.colors.textSoft} />
              <Text style={styles.itemText}>{t("menu.pace")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={onOpenRecurring} activeOpacity={0.7}>
              <RepeatIcon color={theme.colors.textSoft} />
              <Text style={styles.itemText}>{t("menu.recurring")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={onOpenSettings} activeOpacity={0.7}>
              <SettingsIcon color={theme.colors.textSoft} />
              <Text style={styles.itemText}>{t("menu.settings")}</Text>
            </TouchableOpacity>

            {!isPro && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.proItem} onPress={onOpenPaywall} activeOpacity={0.85}>
                  <SparklesIcon color={theme.colors.stateGood} size={18} />
                  <View style={styles.proInfo}>
                    <Text style={styles.proTitle}>Pace Pro</Text>
                    <Text style={styles.proSub}>{t("menu.proSub")}</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  menu: {
    position: "absolute",
    top: 60, // Adjust dynamically for safe area top if needed
    right: 20,
    width: 224,
    padding: 6,
    borderRadius: 18,
    backgroundColor: "#161922",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.6,
    shadowRadius: 56,
    elevation: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  itemText: {
    marginLeft: 12,
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 6,
    marginHorizontal: 8,
    backgroundColor: theme.colors.hairline,
  },
  proItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  proInfo: {
    marginLeft: 12,
  },
  proTitle: {
    color: theme.colors.stateGood,
    fontSize: 15,
    fontWeight: "700",
  },
  proSub: {
    color: theme.colors.textSoft,
    fontSize: 12,
    marginTop: 1,
  },
});
