import React from "react";
import { StyleSheet } from "react-native";
import { MotiText } from "moti";
import { theme } from "../styles/theme";

export function Logo({ color }: { color: string }) {
  let dotColor = color;
  if (color === theme.colors.stateGood) dotColor = "#60a5fa"; // parlak açık mavi
  else if (color === theme.colors.stateWarn) dotColor = "#fcd34d"; // parlak sarı/turuncu
  else if (color === theme.colors.stateCrit || color === theme.colors.stateOver) dotColor = "#fca5a5"; // parlak açık kırmızı

  return (
    <MotiText style={styles.logo}>
      pace
      <MotiText
        from={{ opacity: 1, color: dotColor } as any}
        animate={{ opacity: 0.5, color: dotColor } as any}
        transition={{
          opacity: { type: "timing", duration: 800, loop: true },
          color: { type: "timing", duration: 700 },
        } as any}
      >
        .
      </MotiText>
    </MotiText>
  );
}

const styles = StyleSheet.create({
  logo: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    fontFamily: theme.fonts.outfitExtra,
  },
});
