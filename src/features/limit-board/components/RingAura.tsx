import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { MotiView } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { Tone } from "../../../shared/lib/tone";

export function RingAura({
  tone,
  size,
  alarm = false,
}: {
  tone: Tone;
  size: number;
  alarm?: boolean;
}) {
  const dashR = size / 2 + 22;
  const fullSize = (dashR + 4) * 2;
  const rotateValue = useSharedValue(0);

  useEffect(() => {
    rotateValue.value = withRepeat(
      withTiming(360, { duration: 32000, easing: Easing.linear }),
      -1, // repeat infinitely
      false // no yoyo
    );
  }, [rotateValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotateValue.value}deg` }],
    };
  });

  return (
    <View style={[styles.aura, { width: fullSize, height: fullSize }]} pointerEvents="none">
      {/* Glow / Pulse */}
      <MotiView
        style={[styles.pulse, { width: size * 1.08, height: size * 1.08 }]}
        animate={{
          scale: alarm ? 1.14 : 1.08,
          opacity: alarm ? 1 : 0.8,
        }}
        from={{
          scale: 1,
          opacity: alarm ? 0.55 : 0.4,
        }}
        transition={{
          type: "timing",
          duration: alarm ? 1100 : 3000,
          loop: true,
        }}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="grad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={tone.color} stopOpacity={alarm ? "0.3" : "0.2"} />
              <Stop offset="50%" stopColor={tone.color} stopOpacity={alarm ? "0.15" : "0.05"} />
              <Stop offset="100%" stopColor={tone.color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#grad)" />
        </Svg>
      </MotiView>

      {/* Dashed rotating ring */}
      <Animated.View style={[styles.dashContainer, animatedStyle]}>
        <Svg width={fullSize} height={fullSize}>
          <Circle
            cx={fullSize / 2}
            cy={fullSize / 2}
            r={dashR}
            fill="none"
            stroke={tone.color}
            strokeWidth={2}
            strokeDasharray="4, 16"
            opacity={0.1}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  aura: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
  },
  dashContainer: {
    ...StyleSheet.absoluteFill,
  },
});
