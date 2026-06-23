import React from "react";
import { StyleSheet, View, TouchableOpacity, Pressable } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { AnimatePresence, MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { ActivityIcon, CardIcon, ListIcon, SettingsIcon } from "../../../shared/ui/icons";
import { theme } from "../../../shared/styles/theme";

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenSubscriptions: () => void;
  onOpenAnalytics: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function MoreMenu({
  open,
  onClose,
  onOpenSubscriptions,
  onOpenAnalytics,
  onOpenHistory,
  onOpenSettings,
}: MoreMenuProps) {
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
              <Text style={styles.itemText}>Bugünün harcamaları</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={onOpenSubscriptions} activeOpacity={0.7}>
              <CardIcon color={theme.colors.textSoft} />
              <Text style={styles.itemText}>Bütçe & Giderler</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={onOpenAnalytics} activeOpacity={0.7}>
              <ActivityIcon color={theme.colors.textSoft} />
              <Text style={styles.itemText}>Tempo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item} onPress={onOpenSettings} activeOpacity={0.7}>
              <SettingsIcon color={theme.colors.textSoft} />
              <Text style={styles.itemText}>Ayarlar</Text>
            </TouchableOpacity>
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
});
