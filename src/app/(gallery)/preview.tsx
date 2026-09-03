import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import {
  Link,
  Redirect,
  useLocalSearchParams,
  usePreventZoomTransitionDismissal,
  useRouter,
} from "expo-router";
import { StyleSheet, View } from "react-native";

import {
  CloseToolbar,
  getLooksOptions,
  LookResultToolbar,
  lookUrisFromRow,
  ReusePhotoToolbar,
  useLookResultActions,
  type LookMeta,
} from "@/features/looks";
import { useTheme, type AppTheme } from "@/integrations/theme";
import { ComparisonImageSlider } from "@/shared/components/ComparisonImageSlider";
import { type LookRow } from "@/sqlite/schema";

export default function GalleryPreviewScreen() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const queryClient = useQueryClient();

  const data = queryClient
    .getQueryData<LookRow[]>(getLooksOptions().queryKey)
    ?.find((row) => row.uuid === uuid);

  if (!uuid || !data) return <Redirect href="/(tabs)/(looks)" />;

  return <GalleryPreview uuid={uuid} data={data} />;
}

function GalleryPreview({ uuid, data }: { uuid: string; data: LookRow }) {
  const router = useRouter();

  const theme = useTheme();
  const styles = createStyles(theme);

  usePreventZoomTransitionDismissal({
    unstable_dismissalBoundsRect: { maxX: 0, maxY: 0 },
  });

  const { beforeUri, afterUri } = lookUrisFromRow(data);

  const generatedMeta = {
    uuid: data.uuid,
    createdAt: data.createdAt,
    actionType: data.actionType,
    actionId: data.actionId,
    actionTitle: data.actionTitle,
    styleTexture: data.styleTexture,
    styleLength: data.styleLength,
  } as LookMeta;

  const handleClose = () => router.back();

  const {
    isComparing,
    handleCompare,
    handleShareLook,
    handleDownload,
    handleOpenDetails,
    handleDelete,
    handleReusePhoto,
  } = useLookResultActions({
    imageUri: afterUri,
    meta: generatedMeta,
    onDeleted: handleClose,
  });

  return (
    <View style={styles.root}>
      <View style={styles.preview}>
        <Image
          source={{ uri: afterUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={40}
          cachePolicy="memory-disk"
        />

        <Link.AppleZoomTarget>
          <View style={styles.imageFrame}>
            <ComparisonImageSlider
              borderRadius={24}
              leftSource={{ uri: beforeUri }}
              rightSource={{ uri: afterUri }}
              rightImageProps={{ transition: 0, cachePolicy: "memory-disk" }}
              comparisonEnabled={isComparing}
              handleColor={theme.colors.primary}
            />
          </View>
        </Link.AppleZoomTarget>

        <CloseToolbar onPress={handleClose} />

        <ReusePhotoToolbar beforeUri={beforeUri} afterUri={afterUri} onReuse={handleReusePhoto} />
        <LookResultToolbar
          isComparing={isComparing}
          handleCompare={handleCompare}
          handleDownload={handleDownload}
          handleShareLook={handleShareLook}
          handleOpenDetails={handleOpenDetails}
          handleDelete={() => handleDelete(uuid)}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    preview: {
      flex: 1,
      minHeight: 0,
      justifyContent: "center",
    },
    imageFrame: {
      width: "100%",
      aspectRatio: 2 / 3,
      overflow: "hidden",
      borderRadius: 24,
    },
  });
