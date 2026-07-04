import React, { ReactNode, useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions, Keyboard, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { XIcon } from "./icons";
import { theme } from "../styles/theme";
import { Text } from "../typography/Text";
import { useT } from "../i18n";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
// Aşağı sürükleme kapatma eşiği: bu mesafeyi ya da hızı aşınca sheet kapanır.
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 800;

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const { t } = useT();
  // Çıkış animasyonu bitene kadar DOM'da kalsın diye iç "mounted" durumu.
  const [mounted, setMounted] = useState(open);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  // Klavye yüksekliği kadar sheet'i yukarı kaldır — alttaki input (tutar girişi)
  // klavyenin altında kalmasın. Sheet alta sabit olduğu için bottom kaydırılır.
  const keyboardLift = useSharedValue(0);

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvt, (e) => {
      keyboardLift.value = withTiming(e.endCoordinates.height, {
        duration: Platform.OS === "ios" ? 240 : 160,
        easing: Easing.out(Easing.cubic),
      });
    });
    const hide = Keyboard.addListener(hideEvt, () => {
      keyboardLift.value = withTiming(0, {
        duration: Platform.OS === "ios" ? 240 : 160,
        easing: Easing.out(Easing.cubic),
      });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        { duration: 260, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
  }, [open]);

  // Grabber/başlık bölgesinden aşağı sürükleme — bounce yok, kısa timing.
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_DISTANCE || e.velocityY > CLOSE_VELOCITY) {
        // Mevcut konumdan kapanış animasyonunu effect yürütsün.
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    // Açılış/sürükleme translate'i + klavye kaldırması (yukarı negatif).
    transform: [{ translateY: translateY.value - keyboardLift.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  if (!mounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 30 }]} pointerEvents="box-none">
      {/* Backdrop — sürükledikçe sönen */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.close")}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Sürükleme bölgesi: grabber + başlık. İçerideki ScrollView'a karışmaz. */}
        <GestureDetector gesture={pan}>
          <View style={styles.dragZone}>
            <View style={styles.grabber} />
            <View style={styles.head}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                style={styles.close}
                onPress={onClose}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t("a11y.close")}
              >
                <XIcon size={16} color={theme.colors.textSoft} />
              </TouchableOpacity>
            </View>
          </View>
        </GestureDetector>

        {children}
      </Animated.View>
    </View>
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
    backgroundColor: theme.colors.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // Sheet animasyonlu bir View (her frame translateY değişiyor). iOS shadowPath
    // olmadan büyük blur'lu gölgeyi her karede yeniden rasterize eder ve maliyet
    // yarıçapın karesiyle artar — 56 çok pahalıydı. Daha küçük yarıçapla derinliği
    // koruyup UI thread maliyetini büyük ölçüde düşürürüz.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 24,
  },
  dragZone: {
    // Sürükleme alanını genişletmek için başlığa kadar uzanır.
    marginBottom: 20,
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
