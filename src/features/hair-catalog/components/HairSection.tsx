import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";

import type { HairOption } from "../types";
import { HairCard } from "./HairCard";
import { HairSectionFooter } from "./HairSectionFooter";
import { HairSectionHeader } from "./HairSectionHeader";

const HORIZONTAL_PADDING = 16;
const GAP = 8;

interface HairSectionProps {
  title: string;
  moreLabel: string;
  seeAllLabel: string;
  items: HairOption[];
  getItemTitle: (item: HairOption) => string;
  onSelect: (item: HairOption) => void;
  onPressMore?: () => void;
  showItemBottomSoften?: boolean;
}

export function HairSection({
  title,
  moreLabel,
  seeAllLabel,
  items,
  getItemTitle,
  onSelect,
  onPressMore,
  showItemBottomSoften,
}: HairSectionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const itemWidth = (windowWidth - HORIZONTAL_PADDING * 2 - GAP) / 2;

  const styles = createStyles();

  return (
    <View style={styles.container}>
      <HairSectionHeader title={title} moreLabel={moreLabel} onPressMore={onPressMore} />
      <FlatList
        horizontal
        style={styles.horizontalList}
        contentContainerStyle={styles.horizontalListContent}
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HairCard
            image={item.image}
            title={getItemTitle(item)}
            soften={showItemBottomSoften}
            onPress={() => onSelect(item)}
            style={{ width: itemWidth }}
          />
        )}
        ListFooterComponent={
          onPressMore && (
            <HairSectionFooter label={seeAllLabel} itemWidth={itemWidth} onPress={onPressMore} />
          )
        }
      />
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    horizontalList: {
      flexGrow: 0,
    },
    horizontalListContent: {
      paddingHorizontal: 16,
      flexGrow: 0,
      gap: GAP,
    },
  });
