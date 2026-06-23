import React, { ReactNode } from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { XIcon } from "./icons";
import { theme } from "../styles/theme";
import { Text } from "../typography/Text";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 30 }]} pointerEvents="box-none">
          {/* Backdrop */}
          <MotiView
            style={styles.backdrop}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 250 }}
          >
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={onClose} 
            />
          </MotiView>

          {/* Sheet */}
          <MotiView
            style={styles.sheet}
            from={{ translateY: SCREEN_HEIGHT }}
            animate={{ translateY: 0 }}
            exit={{ translateY: SCREEN_HEIGHT }}
            transition={{ type: "timing", duration: 300, easing: Easing.out(Easing.cubic) }}
          >
            <View style={styles.grabber} />

            <View style={styles.head}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                style={styles.close}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <XIcon size={16} color={theme.colors.textSoft} />
              </TouchableOpacity>
            </View>

            {children}
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "88%",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#11141c",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -24 },
    shadowOpacity: 0.55,
    shadowRadius: 56,
    elevation: 24,
  },
  grabber: {
    width: 40,
    height: 4,
    marginTop: 4,
    marginBottom: 16,
    alignSelf: "center",
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: theme.colors.textPrimary,
  },
  close: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
});
