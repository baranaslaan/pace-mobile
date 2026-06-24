import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

export function WelcomeStep() {
  const { t } = useT();
  return (
    <View style={styles.welcome}>
      <Text style={styles.title}>{t("welcome.title")}</Text>
      <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -1,
  },
  subtitle: {
    maxWidth: 300,
    fontSize: 15,
    fontWeight: "400",
    color: theme.colors.textSoft,
    lineHeight: 23,
  },
});
