import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { MotiView, MotiText } from "moti";
import { theme } from "../../../shared/styles/theme";

export function Splash() {
  return (
    <MotiView
      style={styles.splash}
      exit={{ opacity: 0 }}
      transition={{ type: "timing", duration: 500 }}
    >
      <View style={styles.glow} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="splashGlow" cx="50%" cy="45%" rx="100%" ry="55%">
              <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.14" />
              <Stop offset="60%" stopColor="#3b82f6" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#splashGlow)" />
        </Svg>
      </View>

      <View style={styles.center}>
        <View style={styles.pings} pointerEvents="none">
          {[0, 1].map((i) => (
            <MotiView
              key={i}
              style={styles.ping}
              from={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{
                type: "timing",
                duration: 2400,
                loop: true,
                delay: i * 1200,
              }}
            />
          ))}
        </View>

        <MotiText
          style={styles.logo}
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
        >
          pace
          <MotiText
            style={styles.dot}
            from={{ opacity: 1 }}
            animate={{ opacity: 0.35 }}
            transition={{
              type: "timing",
              duration: 800,
              loop: true,
            }}
          >
            .
          </MotiText>
        </MotiText>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bgPage,
  },
  glow: {
    ...StyleSheet.absoluteFill,
  },
  center: {
    position: "relative",
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pings: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  ping: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.5)",
  },
  logo: {
    color: theme.colors.textPrimary,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
    fontFamily: theme.fonts.outfitExtra,
  },
  dot: {
    color: "#3b82f6",
  },
});
