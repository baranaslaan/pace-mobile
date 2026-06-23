import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { theme } from "../../../shared/styles/theme";

export function WelcomeStep() {
  return (
    <View style={styles.welcome}>
      <Text style={styles.title}>
        Günlük harcama{"\n"}tempona hâkim ol.
      </Text>
      <Text style={styles.subtitle}>
        Bütçeni ve sabit giderlerini bir kez gir; pace her gün ne kadar
        harcayabileceğini senin için hesaplasın.
      </Text>
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
