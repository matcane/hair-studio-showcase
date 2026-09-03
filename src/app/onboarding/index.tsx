import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { OnboardingComparisonStep } from "@/features/onboarding";

export default function OnboardingHairChange() {
  const { t } = useTranslation("onboarding");

  return (
    <OnboardingComparisonStep
      stepIndex={0}
      title={t("steps.hair-change.title")}
      titleAccent={t("steps.hair-change.titleAccent")}
      subtitle={t("steps.hair-change.subtitle")}
      cta={t("steps.hair-change.cta")}
      leftSource={require("@/assets/images/onboarding_comprasion_left.webp")}
      rightSource={require("@/assets/images/onboarding_comprasion_right.webp")}
      onContinue={() => router.navigate("/onboarding/hair-color")}
    />
  );
}
