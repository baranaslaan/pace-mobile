import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { ActivityIcon, ListIcon, RepeatIcon, GlobeIcon } from "../../../shared/ui/icons";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

export function FeaturesStep() {
  const { t } = useT();
  const items = [
    { Icon: ActivityIcon, title: t("features.alertsTitle"), desc: t("features.alertsDesc") },
    { Icon: ListIcon, title: t("features.categoriesTitle"), desc: t("features.categoriesDesc") },
    { Icon: RepeatIcon, title: t("features.recurringTitle"), desc: t("features.recurringDesc") },
    { Icon: GlobeIcon, title: t("features.localeTitle"), desc: t("features.localeDesc") },
  ];

  return (
    <View style={styles.step}>
      <View style={styles.heading}>
        <Text style={styles.title}>{t("features.title")}</Text>
        <Text style={styles.subtitle}>{t("features.subtitle")}</Text>
      </View>

      <View style={styles.list}>
        {items.map(({ Icon, title, desc }) => (
          <View key={title} style={styles.card}>
            <View style={styles.iconWrap}>
              <Icon color={theme.colors.stateGood} size={20} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    flex: 1,
    justifyContent: "center",
    gap: 28,
  },
  heading: {},
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: theme.colors.textSoft,
    lineHeight: 22,
  },
  list: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  cardDesc: {
    marginTop: 3,
    fontSize: 13,
    color: theme.colors.textSoft,
    lineHeight: 19,
  },
});
