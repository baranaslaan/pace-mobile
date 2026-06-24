import React from "react";
import { StyleSheet, View, SafeAreaView, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Text } from "../../../shared/typography/Text";
import { AnimatePresence, MotiView } from "moti";
import { ChevronLeftIcon } from "../../../shared/ui/icons";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import { WelcomeStep } from "./WelcomeStep";
import { BudgetStep } from "./BudgetStep";
import { SubscriptionsStep } from "./SubscriptionsStep";
import { RecapStep } from "./RecapStep";
import { StepDots } from "./StepDots";
import { useT } from "../../../shared/i18n";
import { theme } from "../../../shared/styles/theme";

const ACCENT = theme.colors.stateGood;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function Onboarding() {
  const flow = useOnboardingFlow();
  const { t } = useT();
  const { step, direction } = flow;

  const parsedBudget = Number.parseFloat(flow.budget);
  const budgetValid = !Number.isNaN(parsedBudget) && parsedBudget > 0;
  const advanceBudget = () => budgetValid && flow.goNext();

  const cta =
    step === 0
      ? { label: t("common.start"), disabled: false, onClick: flow.goNext }
      : step === 1
        ? { label: t("common.continue"), disabled: !budgetValid, onClick: advanceBudget }
        : step === 2
          ? { label: t("common.continue"), disabled: false, onClick: flow.goNext }
          : { label: t("common.finish"), disabled: false, onClick: flow.finish };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.header}>
        <View style={styles.slot}>
          {step > 0 && (
            <TouchableOpacity
              style={styles.back}
              onPress={flow.goBack}
              activeOpacity={0.7}
            >
              <ChevronLeftIcon color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>

        {step === 0 ? (
          <Text style={[styles.logo, { color: ACCENT }]}>pace.</Text>
        ) : (
          <StepDots total={3} active={step - 1} accent={ACCENT} />
        )}

        <View style={styles.slot} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.body}>
        <AnimatePresence exitBeforeEnter custom={direction}>
          <MotiView
            key={step}
            style={styles.stepWrap}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {step === 0 && <WelcomeStep />}
            {step === 1 && (
              <BudgetStep
                value={flow.budget}
                onChange={flow.setBudget}
                onSubmit={advanceBudget}
              />
            )}
            {step === 2 && (
              <SubscriptionsStep
                subs={flow.subs}
                onAdd={flow.addSub}
                onRemove={flow.removeSub}
              />
            )}
            {step === 3 && <RecapStep budget={flow.budget} subs={flow.subs} />}
          </MotiView>
        </AnimatePresence>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, cta.disabled && { opacity: 0.35 }]}
          onPress={cta.onClick}
          disabled={cta.disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.ctaLabel}>{cta.label}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bgPage,
  },
  glow: {
    ...StyleSheet.absoluteFill,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 8,
  },
  slot: {
    width: 40,
    alignItems: "flex-start",
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  body: {
    flex: 1,
    paddingHorizontal: 32,
  },
  stepWrap: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 28,
  },
  cta: {
    height: 56,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
  },
  ctaLabel: {
    fontFamily: theme.fonts.outfitBold,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: "#fff",
  },
});
