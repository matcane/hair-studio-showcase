import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { useTheme, type AppTheme } from "@/integrations/theme";

import type { HairOption } from "../types";
import { hairOptionTitle } from "../utils";
import { HairCard } from "./HairCard";

interface HairOptionListProps {
  items: HairOption[];
  onSelect: (item: HairOption) => void;
  listHeaderComponent?: ReactElement | null;
  showCelebImageBottomSoften?: boolean;
}

const HORIZONTAL_PADDING = 16;
const GAP = 16;

export function HairOptionList({
  items,
  onSelect,
  listHeaderComponent,
  showCelebImageBottomSoften = false,
}: HairOptionListProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const itemWidth = (windowWidth - HORIZONTAL_PADDING * 2 - GAP) / 2;
  const styles = useMemo(() => createStyles(theme, insets, itemWidth), [theme, insets, itemWidth]);

  const renderItem = useCallback(
    ({ item }: { item: HairOption }) => (
      <HairCard
        image={item.image}
        title={hairOptionTitle(item)}
        soften={showCelebImageBottomSoften}
        onPress={() => onSelect(item)}
        style={{ width: itemWidth }}
      />
    ),
    [itemWidth, onSelect, showCelebImageBottomSoften],
  );

  return (
    <View style={styles.container}>
      <FlatList
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.listColumn}
        showsVerticalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeaderComponent}
      />
    </View>
  );
}

function createStyles(theme: AppTheme, insets: EdgeInsets, itemWidth: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      gap: 16,
      paddingHorizontal: HORIZONTAL_PADDING,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      gap: GAP,
      paddingBottom: insets.bottom,
    },
    listColumn: {
      gap: GAP,
    },
  });
}
