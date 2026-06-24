import React from "react";
import { StyleSheet, View } from "react-native";
import { MotiView } from "moti";
import { theme } from "../../../shared/styles/theme";

interface StepDotsProps {
  total: number;
  active: number;
  accent: string;
}

export function StepDots({ total, active, accent }: StepDotsProps) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <MotiView
          key={i}
          style={styles.dot}
          animate={{
            width: i === active ? 22 : 7,
            backgroundColor: i === active ? accent : "rgba(255,255,255,0.16)",
          }}
          transition={{ type: "timing", duration: 240 }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  dot: {
    height: 7,
    borderRadius: theme.radius.pill,
  },
});
