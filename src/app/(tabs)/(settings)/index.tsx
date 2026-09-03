import * as Application from "expo-application";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { Alert, SectionList, StyleSheet, Text, View } from "react-native";
import { useMMKVString } from "react-native-mmkv";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { revokeImageConsent } from "@/features/looks";
import { OnboardingState } from "@/features/onboarding";
import { PRIVACY_URL, SettingsRow, TERMS_URL, type SettingsRowProps } from "@/features/settings";
import { requestNativeStoreReview, resetStoreReview } from "@/features/store-review";
import i18n, { LANGUAGE_KEY, setAppLanguage, type TLanguages } from "@/integrations/i18n";
import { useTheme, type AppTheme } from "@/integrations/theme";
import { globalStorage } from "@/services/storage";

const LANGUAGE_CHOICES: TLanguages[] = ["en", "pl", "system"];

export default function SettingsTab() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  const { t } = useTranslation(["common", "main"]);

  const setLanguage = (choice: TLanguages) => setAppLanguage(i18n, choice);

  const [savedLanguageRaw] = useMMKVString(LANGUAGE_KEY, globalStorage);
  const savedLanguage = LANGUAGE_CHOICES.find((choice) => choice === savedLanguageRaw) ?? "system";
  const languageMenuActions = LANGUAGE_CHOICES.map((id) => ({
    id,
    title: t(`language.${id}`),
    state: savedLanguage === id ? ("on" as const) : ("off" as const),
  }));

  const developerSection: { title: string; data: SettingsRowProps[] } = {
    title: "Developer",
    data: [
      {
        id: "reset-onboarding",
        title: "Reset Onboarding",
        iconRight: { name: "restore" },
        onPress: () => OnboardingState().resetOnboarding(),
      },
      {
        id: "reset-store-review",
        title: "Reset Store Review",
        iconRight: { name: "restore" },
        onPress: resetStoreReview,
      },
    ],
  };

  const DATA: { title: string; data: SettingsRowProps[] }[] = [
    {
      title: t("main:settings.experience.label"),
      data: [
        {
          title: t("main:settings.experience.rateTheApp.title"),
          iconLeft: { name: "star", color: theme.colors.primary },
          iconRight: { name: "chevron-right" },
          onPress: () => requestNativeStoreReview("settings"),
        },
        {
          title: t("main:settings.experience.language.title"),
          iconLeft: { name: "translate", color: theme.colors.primary },
          textRight: t(`language.${savedLanguage}`),
          iconRight: { name: "chevron-right" },
          menu: {
            actions: languageMenuActions,
            onPressAction: ({ nativeEvent }) => {
              const choice = nativeEvent.event;
              if (choice === "en" || choice === "pl" || choice === "system") {
                setLanguage(choice);
              }
            },
          },
        },
      ],
    },
    {
      title: t("main:settings.legal.label"),
      data: [
        {
          title: t("main:settings.legal.privacyPolicy.title"),
          iconRight: { name: "open-in-new" },
          onPress: () => Linking.openURL(PRIVACY_URL),
        },
        {
          title: t("main:settings.legal.termsOfUse.title"),
          iconRight: { name: "open-in-new" },
          onPress: () => Linking.openURL(TERMS_URL),
        },
        {
          id: "reset-ai-sharing",
          title: t("main:settings.legal.resetAiSharing.title"),
          iconRight: { name: "refresh" },
          onPress: () =>
            Alert.alert(
              t("main:settings.legal.resetAiSharing.alertTitle"),
              t("main:settings.legal.resetAiSharing.alertMessage"),
              [
                { text: t("actions.cancel"), style: "cancel" },
                { text: t("actions.reset"), onPress: revokeImageConsent },
              ],
            ),
        },
      ],
    },
    ...(__DEV__ ? [developerSection] : []),
    {
      title: t("main:settings.information.label"),
      data: [
        {
          title: t("main:settings.information.version.title"),
          textRight: `v${Application.nativeApplicationVersion!}`,
        },
      ],
    },
  ];

  return (
    <SectionList
      sections={DATA}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => item.title + index}
      renderItem={({ item, section, index }) => {
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;

        return (
          <SettingsRow
            title={item.title}
            iconLeft={item.iconLeft}
            textRight={item.textRight}
            iconRight={item.iconRight}
            roundedTop={isFirst}
            roundedBottom={isLast}
            menu={item.menu}
            onPress={item.onPress}
          />
        );
      }}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      renderSectionFooter={() => <View style={{ height: 16 }} />}
      ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
    />
  );
}

const createStyles = (theme: AppTheme, insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingTop: 16,
      paddingBottom: insets.bottom,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
    },
    section: {
      paddingVertical: 8,
    },
    sectionTitle: {
      paddingHorizontal: 8,
      color: theme.colors.text,
    },
  });
