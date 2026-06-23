import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { MotiText } from "moti";
import { RingAura } from "./RingAura";
import { theme } from "../../../shared/styles/theme";
import Animated, { useAnimatedProps, withTiming } from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 240;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function fitFontSize(length: number): number {
  if (length <= 4) return 60;
  if (length === 5) return 52;
  if (length === 6) return 44;
  if (length === 7) return 38;
  return 32;
}

export function Ring({ remaining, limit, tone }: any) {
  const over = tone.key === "over";
  const ratio = Math.max(0, Math.min(1, limit > 0 ? remaining / limit : 0));
  const offset = CIRC * (1 - ratio);
  const shown = Math.round(remaining);
  const valueSize = fitFontSize(String(shown).length);

  const circleAnimatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: withTiming(offset, { duration: 750 }),
      stroke: withTiming(tone.color, { duration: 750 }),
    };
  }, [offset, tone.color]);

  const trackAnimatedProps = useAnimatedProps(() => {
    return {
      stroke: withTiming(over ? tone.color : "rgba(255,255,255,0.05)", { duration: 400 }),
    };
  }, [over, tone.color]);

  return (
    <View style={[styles.ring, { width: SIZE, height: SIZE }]}>
      <RingAura tone={tone} size={SIZE} alarm={over} />

      <Svg style={styles.svg} width={SIZE} height={SIZE}>
        {/* Track */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          strokeWidth={STROKE}
          fill="none"
          animatedProps={trackAnimatedProps}
        />
        {/* Progress */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animatedProps={circleAnimatedProps}
        />
      </Svg>

      <View style={styles.center}>
        <MotiText style={styles.kalan}>kalan</MotiText>
        <MotiText
          key={shown}
          style={[styles.value, { fontSize: valueSize }]}
          from={{ opacity: 0.3, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          {shown}
        </MotiText>
        <MotiText style={styles.unit}>₺ / gün</MotiText>
        <MotiText
          style={styles.status}
          animate={{ color: tone.color } as any}
          transition={{ type: "timing", duration: 700 }}
        >
          {tone.label}
        </MotiText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
    transform: [{ rotate: "-90deg" }], // Circle start at top
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  kalan: {
    fontFamily: theme.fonts.outfitSemi,
    color: theme.colors.textMute,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: theme.fonts.outfitExtra,
    color: theme.colors.textPrimary,
    fontWeight: "800",
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
    paddingHorizontal: 10,
  },
  unit: {
    fontFamily: theme.fonts.outfitMedium,
    fontSize: 13,
    color: theme.colors.textMute,
    fontWeight: "500",
  },
  status: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.88,
    textTransform: "uppercase",
    marginTop: 8,
  },
});
