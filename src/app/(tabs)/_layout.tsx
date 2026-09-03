import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";
import { router, Tabs, useSegments } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { clearPendingLook, getLooksOptions, usePendingLookStore } from "@/features/looks";
import { useTheme } from "@/integrations/theme";

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation("main");
  const segments = useSegments();
  const onLooksTab = segments.some((segment) => segment === "(looks)");

  const { data: looks } = useQuery(getLooksOptions());
  const pendingCount = looks?.filter((look) => look.status === "pending").length ?? 0;
  const unseenReadyLookCount = usePendingLookStore((state) => state.unseenReadyLookCount);

  const showReadyBadge = !onLooksTab && unseenReadyLookCount > 0;
  const showGeneratingBadge = !onLooksTab && !showReadyBadge && pendingCount > 0;
  const badgeColor = showReadyBadge ? theme.colors.success : theme.colors.primary;
  const badgeValue = showReadyBadge
    ? String(unseenReadyLookCount)
    : showGeneratingBadge
      ? String(pendingCount)
      : undefined;
  const showBadge = showReadyBadge || showGeneratingBadge;

  if (Platform.OS === "android") {
    return (
      <Tabs
        screenOptions={{
          sceneStyle: { backgroundColor: theme.colors.background },
          tabBarStyle: { backgroundColor: theme.colors.background },
          tabBarActiveTintColor: theme.colors.primary,
          headerStyle: { backgroundColor: theme.colors.background },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="(home)"
          options={{
            title: t("tabs.home"),
            headerTitle: t("navigation.home"),
            headerShown: true,
            headerShadowVisible: false,
            headerTitleStyle: {
              fontSize: 36,
              lineHeight: 36 * 1.25,
              fontStyle: "italic",
              fontWeight: "bold",
            },
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(looks)"
          options={{
            title: t("tabs.gallery"),
            headerTitle: t("navigation.gallery"),
            headerShown: true,
            headerShadowVisible: false,
            headerTitleStyle: {
              fontSize: 36,
              lineHeight: 36 * 1.25,
              fontStyle: "italic",
              fontWeight: "bold",
            },
            tabBarBadge: showBadge ? badgeValue : undefined,
            tabBarBadgeStyle: showBadge
              ? { backgroundColor: badgeColor, color: "#FFFFFF" }
              : undefined,
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="image-multiple" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(settings)"
          options={{
            title: t("tabs.settings"),
            headerTitle: t("navigation.settings"),
            headerShown: true,
            headerShadowVisible: false,
            headerTitleStyle: {
              fontSize: 36,
              lineHeight: 36 * 1.25,
              fontStyle: "italic",
              fontWeight: "bold",
            },
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="action"
          options={{
            title: "",
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="camera" size={size + 4} color={color} />
            ),
          }}
          listeners={{
            tabPress: (event) => {
              event.preventDefault();
              clearPendingLook();
              router.navigate({ pathname: "/camera", params: { source: "create" } });
            },
          }}
        />
      </Tabs>
    );
  }

  return (
    <NativeTabs
      backBehavior="history"
      tintColor={theme.colors.primary}
      badgeBackgroundColor={badgeColor}
      badgeTextColor="#FFFFFF">
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon sf="house.fill" />
        <NativeTabs.Trigger.Label>{t("tabs.home")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(looks)">
        <NativeTabs.Trigger.Icon sf="photo.on.rectangle" />
        <NativeTabs.Trigger.Label>{t("tabs.gallery")}</NativeTabs.Trigger.Label>
        {showReadyBadge && (
          <NativeTabs.Trigger.Badge selectedBackgroundColor={badgeColor}>
            {badgeValue}
          </NativeTabs.Trigger.Badge>
        )}
        {showGeneratingBadge && <NativeTabs.Trigger.Badge>{badgeValue}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Icon sf="gearshape.fill" />
        <NativeTabs.Trigger.Label>{t("tabs.settings")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="action"
        role="search"
        listeners={{
          tabPress: () => {
            clearPendingLook();
            router.navigate({ pathname: "/camera", params: { source: "create" } });
          },
        }}>
        <NativeTabs.Trigger.Icon sf="camera.fill" />
        <NativeTabs.Trigger.Label hidden>Create</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
