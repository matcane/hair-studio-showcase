import { router } from "expo-router";
import type { ParseKeys } from "i18next";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { FaceShapeDetectorCard } from "@/features/face-shape";
import {
  CELEB_DATA,
  COLOR_DATA,
  FUN_DATA,
  HairSection,
  MAKEUP_DATA,
  STYLE_DATA,
  type HairOption,
} from "@/features/hair-catalog";
import { setPendingLook } from "@/features/looks";
import { useTheme, type AppTheme } from "@/integrations/theme";
import { Analytics } from "@/services/analytics";

const HORIZONTAL_PADDING = 16;

const HOME_LIMIT = 5;

const homeDataCeleb = CELEB_DATA.slice(0, HOME_LIMIT);
const homeDataStyle = STYLE_DATA.slice(0, HOME_LIMIT);
const homeDataColor = COLOR_DATA.slice(0, HOME_LIMIT);
const homeDataMakeup = MAKEUP_DATA.slice(0, HOME_LIMIT);

export default function HomeTab() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const { t } = useTranslation("main");

  const sectionDefaults = {
    moreLabel: t("home.more"),
    seeAllLabel: t("home.seeAll"),
    getItemTitle: (item: HairOption) =>
      t(`hairCatalog.${item.type}.${item.id}.title` as ParseKeys<"main">),
    onSelect: (item: HairOption) => {
      setPendingLook(item);
      Analytics.track("hair_option_opened", {
        id: item.id,
        type: item.type,
        title: item.title,
      });
      router.push({ pathname: "/camera", params: { source: "catalog" } });
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardSection}>
        <FaceShapeDetectorCard />
      </View>

      <HairSection
        {...sectionDefaults}
        title={t("home.hair_change")}
        items={homeDataStyle}
        onPressMore={() =>
          router.push({
            pathname: "/catalog/[type]",
            params: { type: "hair_change" },
          })
        }
      />

      <HairSection
        {...sectionDefaults}
        title={t("home.celebrity_hair_change")}
        items={homeDataCeleb}
        onPressMore={() =>
          router.push({
            pathname: "/catalog/[type]",
            params: { type: "celebrity_hair_change" },
          })
        }
        showItemBottomSoften
      />

      <HairSection
        {...sectionDefaults}
        title={t("home.color_change")}
        items={homeDataColor}
        onPressMore={() =>
          router.push({
            pathname: "/catalog/[type]",
            params: { type: "color_change" },
          })
        }
      />

      <HairSection
        {...sectionDefaults}
        title={t("home.makeup_change")}
        items={homeDataMakeup}
        onPressMore={() =>
          router.push({
            pathname: "/catalog/[type]",
            params: { type: "makeup_change" },
          })
        }
      />

      <HairSection
        {...sectionDefaults}
        title={t("home.fun_change")}
        items={FUN_DATA}
        onPressMore={undefined}
      />
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      gap: 32,
      paddingVertical: 16,
      backgroundColor: theme.colors.background,
    },
    cardSection: {
      paddingHorizontal: HORIZONTAL_PADDING,
    },
  });
