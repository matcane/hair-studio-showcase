import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  type HairOption,
  CELEB_DATA,
  COLOR_DATA,
  filterHairStyleOptions,
  HairOptionList,
  HairStyleFilterBar,
  MAKEUP_DATA,
  STYLE_DATA,
} from "@/features/hair-catalog";
import { setPendingLook } from "@/features/looks";
import { Analytics } from "@/services/analytics";
import type { HairOptionType, HairStyleLength, HairStyleTexture } from "@/shared/types";

type EXCLUDED_HAIR_OPTIONS = "fun_change" | "hair_change";

const CATALOG_TYPE_VALUES: Record<Exclude<HairOptionType, EXCLUDED_HAIR_OPTIONS>, HairOption[]> = {
  celebrity_hair_change: CELEB_DATA,
  color_change: COLOR_DATA,
  makeup_change: MAKEUP_DATA,
};

export default function Catalog() {
  const { type } = useLocalSearchParams<{ type: Exclude<HairOptionType, "fun_change"> }>();

  const { t } = useTranslation("main");

  const router = useRouter();

  const [selectedTexture, setSelectedTexture] = useState<HairStyleTexture | null>(null);
  const [selectedLength, setSelectedLength] = useState<HairStyleLength | null>(null);

  const filteredItems = useMemo(
    () => filterHairStyleOptions(STYLE_DATA, selectedTexture, selectedLength),
    [selectedLength, selectedTexture],
  );

  const handleSelect = useCallback(
    (option: HairOption) => {
      setPendingLook(option);
      Analytics.track("hair_option_opened", {
        id: option.id,
        type: option.type,
        title: option.title,
      });
      router.push({ pathname: "/camera", params: { source: "catalog" } });
    },
    [router],
  );

  const listHeader = (
    <HairStyleFilterBar
      selectedTexture={selectedTexture}
      selectedLength={selectedLength}
      onSelectTexture={setSelectedTexture}
      onSelectLength={setSelectedLength}
    />
  );

  return (
    <>
      <Stack.Screen options={{ title: t(`navigation.${type}`) }} />
      <HairOptionList
        items={type === "hair_change" ? filteredItems : CATALOG_TYPE_VALUES[type]}
        listHeaderComponent={type === "hair_change" ? listHeader : undefined}
        showCelebImageBottomSoften={type === "celebrity_hair_change"}
        onSelect={handleSelect}
      />
    </>
  );
}
