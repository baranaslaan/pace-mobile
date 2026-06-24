import React, { useEffect, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";
import { Logo } from "../typography/Logo";
import { theme } from "../styles/theme";

/**
 * Gizlilik örtüsü: uygulama arka plana/uygulama değiştiriciye geçerken iOS bir
 * ekran görüntüsü alır ve bu küçük resim finansal verini gösterebilir. Uygulama
 * "active" değilken tüm ekranı opak bir katmanla kapatırız — böylece anlık
 * görüntüde yalnızca logo görünür, bütçe/harcama rakamları değil.
 *
 * Saf JS (AppState) — native bağımlılık/rebuild gerektirmez. 'inactive' durumu
 * iOS snapshot'ından önce tetiklendiği için örtü zamanında devreye girer.
 */
export function PrivacyShield() {
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setCovered(state !== "active");
    });
    return () => sub.remove();
  }, []);

  if (!covered) return null;

  return (
    <View style={styles.shield}>
      <Logo color={theme.colors.stateGood} />
    </View>
  );
}

const styles = StyleSheet.create({
  shield: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bgPage,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
});
