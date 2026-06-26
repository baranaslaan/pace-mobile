import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold
} from "@expo-google-fonts/outfit";
import { usePaceStore } from "@/shared/store/usePaceStore";
import { fetchRates } from "@/shared/lib/rates";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { PrivacyShield } from "@/shared/ui/PrivacyShield";
import { theme } from "@/shared/styles/theme";

SplashScreen.preventAutoHideAsync();

/** Kur 6 saatten eskiyse canlı kuru çek; başarısızsa son bilinen korunur. */
const RATES_TTL = 6 * 60 * 60 * 1000;
function refreshRatesIfStale() {
  const { ratesUpdatedAt } = usePaceStore.getState();
  if (Date.now() - ratesUpdatedAt < RATES_TTL) return;
  fetchRates()
    .then((rates) => usePaceStore.getState().setRates(rates))
    .catch(() => {});
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit: Outfit_400Regular,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Hydration sonrası canlı kuru tazele (persisted son bilinen kurları
  // ezmemek için hydration'ı bekle).
  useEffect(() => {
    if (usePaceStore.persist.hasHydrated()) {
      refreshRatesIfStale();
      return;
    }
    const unsub = usePaceStore.persist.onFinishHydration(refreshRatesIfStale);
    return unsub;
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.bgPage }}>
      <ErrorBoundary>
        <Stack
          screenOptions={{
            headerShown: false,
            // Splash→app opacity geçişinde arkada beyaz parlama olmasın diye
            // navigator içeriğini de koyu zemine sabitle.
            contentStyle: { backgroundColor: theme.colors.bgPage },
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </ErrorBoundary>
      {/* Uygulama değiştirici anlık görüntüsünde finansal veriyi gizler. */}
      <PrivacyShield />
    </GestureHandlerRootView>
  );
}
