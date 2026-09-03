import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Alert, Linking } from "react-native";

import i18n from "@/integrations/i18n";

export async function shareImageAsync(uri: string) {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert(
      i18n.t("main:gallery.share.unavailable.title"),
      i18n.t("main:gallery.share.unavailable.message"),
    );
    return false;
  }

  try {
    await Sharing.shareAsync(uri, {
      mimeType: "image/jpeg",
      dialogTitle: i18n.t("main:gallery.share.dialogTitle"),
    });
    return true;
  } catch {
    Alert.alert(
      i18n.t("main:gallery.share.failed.title"),
      i18n.t("main:gallery.share.failed.message"),
    );
    return false;
  }
}

export async function saveImageToLibraryAsync(uri: string) {
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      i18n.t("main:gallery.save.permission.title"),
      i18n.t("main:gallery.save.permission.message"),
      [
        { text: i18n.t("main:gallery.save.permission.notNow"), style: "cancel" },
        {
          text: i18n.t("main:gallery.save.permission.openSettings"),
          onPress: () => Linking.openSettings(),
        },
      ],
    );
    return false;
  }

  try {
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert(
      i18n.t("main:gallery.save.success.title"),
      i18n.t("main:gallery.save.success.message"),
    );
    return true;
  } catch {
    Alert.alert(
      i18n.t("main:gallery.save.failed.title"),
      i18n.t("main:gallery.save.failed.message"),
    );
    return false;
  }
}
