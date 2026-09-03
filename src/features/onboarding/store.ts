import { create } from "zustand";

import { Analytics } from "@/services/analytics";
import { globalStorage } from "@/services/storage";

export type ProgressKey = "default";

const DEFAULT_ONBOARDING_MAX_STEPS = 3;

interface ProgressState {
  currentStep: number;
  maxSteps: number;
}

interface OnboardingStore {
  progress: Record<ProgressKey, ProgressState>;
  setProgress: (key: ProgressKey, step: number) => void;

  isOnboardingCompleted: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  progress: {
    default: {
      currentStep: 0,
      maxSteps: DEFAULT_ONBOARDING_MAX_STEPS,
    },
  },

  setProgress: (key, step) =>
    set((state) => {
      const progress = state.progress[key];
      if (!progress) return state;

      const clamped = Math.max(0, Math.min(step, progress.maxSteps));

      return {
        progress: {
          ...state.progress,
          [key]: { ...progress, currentStep: clamped },
        },
      };
    }),

  isOnboardingCompleted: globalStorage.getBoolean("completedOnboarding") ?? false,

  completeOnboarding() {
    globalStorage.set("completedOnboarding", true);
    set({ isOnboardingCompleted: true });
    Analytics.track("onboarding_completed", {});
  },

  resetOnboarding() {
    globalStorage.remove("completedOnboarding");

    set({
      isOnboardingCompleted: false,
      progress: {
        default: {
          currentStep: 0,
          maxSteps: DEFAULT_ONBOARDING_MAX_STEPS,
        },
      },
    });
  },
}));

export const OnboardingState = useOnboardingStore.getState;
