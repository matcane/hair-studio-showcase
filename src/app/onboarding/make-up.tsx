import { useTranslation } from "react-i18next";

import { OnboardingComparisonStep, OnboardingState } from "@/features/onboarding";

export default function OnboardingMakeUp() {
  const { t } = useTranslation("onboarding");

  function finishOnboarding() {
    OnboardingState().completeOnboarding();
  }

  return (
    <OnboardingComparisonStep
      stepIndex={2}
      title={t("steps.make-up.title")}
      titleAccent={t("steps.make-up.titleAccent")}
      subtitle={t("steps.make-up.subtitle")}
      cta={t("steps.make-up.cta")}
      leftSource={require("@/assets/images/onboarding_clean_girl.webp")}
      rightSource={require("@/assets/images/onboarding_soft_glam.webp")}
      onContinue={finishOnboarding}
    />
  );
}
