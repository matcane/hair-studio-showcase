import PostHog from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;

export const posthog = apiKey ? new PostHog(apiKey, { host, disabled: __DEV__ }) : undefined;
