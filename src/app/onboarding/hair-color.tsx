import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { OnboardingComparisonStep } from "@/features/onboarding";

export default function OnboardingHairColor() {
  const { t } = useTranslation("onboarding");

  return (
    <OnboardingComparisonStep
      stepIndex={1}
      title={t("steps.hair-color.title")}
      titleAccent={t("steps.hair-color.titleAccent")}
      subtitle={t("steps.hair-color.subtitle")}
      cta={t("steps.hair-color.cta")}
      leftSource={require("@/assets/images/onboarding_comprasion2_left.webp")}
      rightSource={require("@/assets/images/onboarding_comprasion2_right.webp")}
      onContinue={() => router.navigate("/onboarding/make-up")}
    />
  );
}
