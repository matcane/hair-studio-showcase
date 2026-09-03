import { useQuery, useQueryClient } from "@tanstack/react-query";
import { File, Paths } from "expo-file-system";
import { Link, useFocusEffect } from "expo-router";
import { memo, useCallback, useEffect } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type ListRenderItem,
} from "react-native";

import { clearUnseenReadyLook, getLooksOptions, PendingLookImage } from "@/features/looks";
import { Logger } from "@/services/logger";
import { seedLooksGalleryIfEmpty } from "@/showcase/gallery-seed";
import type { LookRow } from "@/sqlite/schema";

interface LookGridItemProps {
  item: LookRow;
  styles: ReturnType<typeof createStyles>;
}

export default function GalleryTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery(getLooksOptions());
  const { width: windowWidth } = useWindowDimensions();
  const itemWidth = windowWidth / 3;
  const styles = createStyles(itemWidth);

  useEffect(() => {
    let cancelled = false;

    seedLooksGalleryIfEmpty()
      .then(async (seeded) => {
        if (cancelled || !seeded) return;
        await queryClient.invalidateQueries({ queryKey: getLooksOptions().queryKey });
      })
      .catch((error: unknown) => {
        Logger.error(error instanceof Error ? error : new Error(String(error)), {
          message: "Looks gallery seed failed",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  useFocusEffect(
    useCallback(() => {
      clearUnseenReadyLook();
      return () => clearUnseenReadyLook();
    }, []),
  );

  const renderItem = useCallback<ListRenderItem<LookRow>>(
    ({ item }) => <LookGridItem item={item} styles={styles} />,
    [styles],
  );

  return (
    <FlatList
      data={data ?? []}
      numColumns={3}
      keyExtractor={(item) => item.uuid}
      renderItem={renderItem}
      ListHeaderComponentStyle={styles.listHeader}
    />
  );
}

const LookGridItem = memo(function LookGridItem({ item, styles }: LookGridItemProps) {
  const isPending = item.status === "pending";
  const filename = item.afterFilename ?? item.beforeFilename;
  const uri = new File(Paths.document, "Looks", item.uuid, filename).uri;

  return (
    <Link disabled={isPending} href={{ pathname: "/preview", params: { uuid: item.uuid } }} asChild>
      <Link.Trigger withAppleZoom>
        <Pressable style={styles.imageContainer}>
          <PendingLookImage
            pending={isPending}
            startedAt={item.createdAt}
            source={{ uri }}
            style={styles.image}
          />
        </Pressable>
      </Link.Trigger>
    </Link>
  );
});

const createStyles = (itemWidth: number) =>
  StyleSheet.create({
    imageContainer: {
      width: itemWidth,
      aspectRatio: 2 / 3,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    listHeader: {
      paddingVertical: 16,
    },
  });
