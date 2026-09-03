// eslint-disable-next-line import/no-named-as-default
import SegmentedControl from "@expo/ui/community/segmented-control";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";

import { Button, BUTTON_HEIGHT } from "@/shared/components/Button";
import type { HairOptionType } from "@/shared/types";

import { CELEB_DATA, COLOR_DATA, FUN_DATA, MAKEUP_DATA, STYLE_DATA } from "../data";
import type { HairOption } from "../types";
import { hairOptionTitle } from "../utils";
import { HAIR_CARD_ASPECT_RATIO, HAIR_CARD_HEIGHT, HairCard } from "./HairCard";

interface DraftPanelProps {
  selectedOption: { id: string; type: HairOptionType } | null;
  onSelectOption: (option: HairOption) => void;
  onGenerate: () => void;
}

function segmentIndexForOptionType(type: HairOptionType): number {
  if (type === "hair_change") return 0;
  if (type === "celebrity_hair_change") return 1;
  if (type === "makeup_change") return 2;
  if (type === "fun_change") return 3;
  return 4;
}

const OPTION_ITEM_WIDTH = HAIR_CARD_HEIGHT * HAIR_CARD_ASPECT_RATIO;
const OPTION_ITEM_GAP = 8;

export function DraftPanel({ selectedOption, onSelectOption, onGenerate }: DraftPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(() =>
    selectedOption ? segmentIndexForOptionType(selectedOption.type) : 0,
  );

  const { t } = useTranslation("main");

  const currentListData = useMemo(() => {
    if (selectedIndex === 0) {
      return STYLE_DATA;
    } else if (selectedIndex === 1) {
      return CELEB_DATA;
    } else if (selectedIndex === 2) {
      return MAKEUP_DATA;
    } else if (selectedIndex === 3) {
      return FUN_DATA;
    }
    return COLOR_DATA;
  }, [selectedIndex]);

  const initialScrollIndex = (() => {
    if (!selectedOption) return undefined;

    const index = currentListData.findIndex((item) => item.id === selectedOption.id);

    return index > 0 ? index : undefined;
  })();

  return (
    <>
      <SegmentedControl
        style={styles.segmentedControl}
        values={[
          t("gallery.segments.styles"),
          t("gallery.segments.celebs"),
          t("gallery.segments.makeup"),
          t("gallery.segments.fun"),
          t("gallery.segments.colors"),
        ]}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
        }}
      />

      <FlatList
        key={selectedIndex}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        data={currentListData}
        keyExtractor={(item) => item.id}
        initialScrollIndex={initialScrollIndex}
        getItemLayout={(_, index) => ({
          length: OPTION_ITEM_WIDTH,
          offset: index * (OPTION_ITEM_WIDTH + OPTION_ITEM_GAP),
          index,
        })}
        renderItem={({ item }) => (
          <HairCard
            image={item.image}
            title={hairOptionTitle(item)}
            selected={selectedOption?.id === item.id}
            soften={item.type === "celebrity_hair_change"}
            onPress={() => onSelectOption(item)}
            style={{ height: HAIR_CARD_HEIGHT }}
          />
        )}
      />

      <View style={styles.generateRow}>
        <Button title={t("gallery.generate")} onPress={onGenerate} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  segmentedControl: {
    marginHorizontal: 16,
  },
  listContent: {
    gap: 8,
    paddingHorizontal: 16,
  },
  generateRow: {
    paddingHorizontal: 16,
    minHeight: BUTTON_HEIGHT,
  },
});
