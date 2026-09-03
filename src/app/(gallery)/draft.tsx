import { Image } from "expo-image";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, BackHandler, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";

import { DraftPanel } from "@/features/hair-catalog";
import {
  CloseToolbar,
  ensureImageConsent,
  GenerationProgressOverlay,
  LookResultToolbar,
  PendingPanel,
  ReusePhotoToolbar,
  useDraftGeneration,
  useGalleryRevealAnimation,
  useLookResultActions,
  usePendingLookStore,
  type PendingLook,
} from "@/features/looks";
import { PRIVACY_URL } from "@/features/settings";
import { clearPendingStoreReviewTimeout, maybePromptForStoreReview } from "@/features/store-review";
import { useTheme, type AppTheme } from "@/integrations/theme";
import { Analytics } from "@/services/analytics";
import type { DraftOpenedSource } from "@/services/analytics/types";
import { ComparisonImageSlider } from "@/shared/components/ComparisonImageSlider";

export default function GalleryDraftScreen() {
  const { draftSource, source } = useLocalSearchParams<{
    draftSource: string;
    source?: DraftOpenedSource;
  }>();
  const { t } = useTranslation("main");

  const router = useRouter();

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets);

  const pendingLook = usePendingLookStore((state) => state.pendingLook);

  const [selectedOption, setSelectedOption] = useState<PendingLook | null>(pendingLook);

  const { generatedLook, generatedMeta, isGenerationPending, generate } = useDraftGeneration({
    draftSource,
    selectedOption,
    onGenerated: maybePromptForStoreReview,
  });

  const handleClose = () => {
    router.dismissTo(shouldExitToLooks ? "/(tabs)/(looks)" : "/(tabs)/(home)");
  };

  const {
    isComparing,
    handleCompare,
    handleShareLook,
    handleDownload,
    handleOpenDetails,
    handleDelete,
    handleReusePhoto,
  } = useLookResultActions({
    imageUri: generatedLook,
    meta: generatedMeta,
    onDeleted: handleClose,
  });

  const {
    blurRadius,
    generationProgress,
    showDraftPanel,
    showResultChrome,
    isPanelCollapsing,
    showPendingPanel,
    panelShellStyle,
    panelResizeDurationMs,
    onPanelContentLayout,
    prepareRevealFromGenerationSuccess,
    startRevealAnimation,
  } = useGalleryRevealAnimation(isGenerationPending);

  const shouldExitToLooks =
    isGenerationPending || showPendingPanel || showResultChrome || Boolean(generatedLook);

  useEffect(() => {
    if (!source) return;
    Analytics.track("draft_opened", { source });
  }, [source]);

  useEffect(() => {
    if (!shouldExitToLooks) return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      router.dismissTo("/(tabs)/(looks)");
      return true;
    });

    return () => subscription.remove();
  }, [router, shouldExitToLooks]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        clearPendingStoreReviewTimeout();
      };
    }, []),
  );

  const handleGenerate = async () => {
    if (!selectedOption) {
      Alert.alert(t("gallery.noSelectedOption.title"), t("gallery.noSelectedOption.message"));
      return;
    }

    if (!(await ensureImageConsent(PRIVACY_URL))) return;

    generate({
      prepareReveal: prepareRevealFromGenerationSuccess,
      startReveal: startRevealAnimation,
    });
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ gestureEnabled: !shouldExitToLooks }} />
      <View style={styles.preview}>
        <Image
          source={{ uri: generatedLook || draftSource }}
          style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          contentFit="cover"
          blurRadius={40}
          cachePolicy="memory-disk"
          transition={0}
        />
        <View style={styles.imageFrame}>
          <ComparisonImageSlider
            leftSource={{ uri: draftSource }}
            rightSource={{ uri: generatedLook || draftSource }}
            rightBlurRadius={blurRadius}
            rightImageProps={{ transition: 0, cachePolicy: "memory-disk" }}
            comparisonEnabled={isComparing}
            handleColor={theme.colors.primary}
          />
          {showPendingPanel && !isPanelCollapsing ? (
            <Animated.View
              entering={FadeIn.duration(240)}
              exiting={FadeOut.duration(180)}
              style={StyleSheet.absoluteFill}
              pointerEvents="none">
              <GenerationProgressOverlay progress={generationProgress} />
            </Animated.View>
          ) : null}
        </View>

        <CloseToolbar onPress={handleClose} />

        {showResultChrome && (
          <>
            <ReusePhotoToolbar
              beforeUri={draftSource}
              afterUri={generatedLook}
              onReuse={handleReusePhoto}
            />
            <LookResultToolbar
              isComparing={isComparing}
              handleCompare={handleCompare}
              handleDownload={handleDownload}
              handleShareLook={handleShareLook}
              handleOpenDetails={handleOpenDetails}
              handleDelete={() => handleDelete(generatedMeta?.uuid)}
            />
          </>
        )}
      </View>

      {showDraftPanel ? (
        <Animated.View style={[styles.draftPanel, panelShellStyle]}>
          <Animated.View
            {...(!isPanelCollapsing && {
              layout: LinearTransition.duration(panelResizeDurationMs),
            })}
            onLayout={(event) => {
              onPanelContentLayout(event.nativeEvent.layout.height);
            }}>
            {showPendingPanel ? (
              <PendingPanel
                optionType={selectedOption?.type}
                collapsing={isPanelCollapsing}
                onClose={handleClose}
              />
            ) : (
              // No entering animation here: the option badges lose their liquid glass when their
              // native effect view is created while this panel is below alpha 1.
              <Animated.View key="draft" exiting={FadeOut.duration(180)} style={styles.panelDraft}>
                <DraftPanel
                  selectedOption={selectedOption}
                  onSelectOption={setSelectedOption}
                  onGenerate={handleGenerate}
                />
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme, insets: EdgeInsets) =>
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
    draftPanel: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderCurve: "continuous",
    },
    panelDraft: {
      gap: 16,
      paddingTop: 20,
      paddingBottom: insets.bottom,
    },
  });
