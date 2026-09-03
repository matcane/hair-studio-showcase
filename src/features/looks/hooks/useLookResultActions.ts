import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { Analytics } from "@/services/analytics";

import { deleteLook, getLooksOptions } from "../api";
import { saveImageToLibraryAsync, shareImageAsync } from "../export";
import { clearPendingLook } from "../store";
import type { LookMeta } from "../types";

interface LookResultActionsProps {
  imageUri: string;
  meta?: LookMeta;
  onDeleted: () => void;
}

export function useLookResultActions({ imageUri, meta, onDeleted }: LookResultActionsProps) {
  const router = useRouter();
  const { t } = useTranslation("main");
  const queryClient = useQueryClient();

  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = () => setIsComparing((prev) => !prev);

  const handleShareLook = async () => {
    const didShare = await shareImageAsync(imageUri);
    if (didShare) {
      Analytics.track("look_shared", {});
    }
  };

  const handleDownload = async () => {
    const didSave = await saveImageToLibraryAsync(imageUri);
    if (didSave) {
      Analytics.track("look_saved", {});
    }
  };

  const handleOpenDetails = () => {
    router.navigate({
      pathname: "/details",
      params: { meta: JSON.stringify(meta) },
    });
  };

  const handleDelete = (uuid?: string) => {
    Alert.alert(t("gallery.delete.title"), t("gallery.delete.message"), [
      { text: t("gallery.cancel"), style: "cancel" },
      {
        text: t("gallery.delete.confirm"),
        style: "destructive",
        onPress: async () => {
          if (uuid) {
            try {
              await deleteLook(uuid);
              await queryClient.invalidateQueries({ queryKey: getLooksOptions().queryKey });
            } catch {
              Alert.alert(t("gallery.delete.failed.title"), t("gallery.delete.failed.message"));
              return;
            }
          }

          onDeleted();
        },
      },
    ]);
  };

  const handleReusePhoto = (uri: string) => {
    clearPendingLook();
    router.navigate({
      pathname: "/draft",
      params: { draftSource: uri, source: "reuse" },
    });
  };

  return {
    isComparing,
    handleCompare,
    handleShareLook,
    handleDownload,
    handleOpenDetails,
    handleDelete,
    handleReusePhoto,
  };
}
