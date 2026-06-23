import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from "react-native";
import { theme } from "../styles/theme";

export interface TextProps extends RNTextProps {
  weight?: "400" | "500" | "600" | "700" | "800";
}

export function Text({ style, weight, ...props }: TextProps) {
  let fontFamily = theme.fonts.outfitRegular;
  
  // Resolve font family based on weight or flatten styles to find fontWeight
  let resolvedWeight: string | undefined = weight;
  if (!resolvedWeight && style) {
    const flatStyle = StyleSheet.flatten(style) as any;
    if (flatStyle?.fontWeight) {
      resolvedWeight = String(flatStyle.fontWeight) as any;
    }
  }

  if (resolvedWeight === "500") fontFamily = theme.fonts.outfitMedium;
  else if (resolvedWeight === "600") fontFamily = theme.fonts.outfitSemi;
  else if (resolvedWeight === "700" || resolvedWeight === "bold") fontFamily = theme.fonts.outfitBold;
  else if (resolvedWeight === "800") fontFamily = theme.fonts.outfitExtra;

  return <RNText style={[{ fontFamily }, style]} {...props} />;
}
