import { Alert, Linking } from "react-native";

import i18n from "@/integrations/i18n";
import { globalStorage } from "@/services/storage";

const CURRENT_VERSION = 3;
const KEY = "image_consent_version";

globalStorage.remove("openai_consent_version");
globalStorage.remove("OPENAI_CONSENT");

export function hasImageConsent() {
  return globalStorage.getNumber(KEY) === CURRENT_VERSION;
}

export function grantImageConsent() {
  globalStorage.set(KEY, CURRENT_VERSION);
}

export function revokeImageConsent() {
  globalStorage.remove(KEY);
}

export function ensureImageConsent(privacyUrl: string): Promise<boolean> {
  if (hasImageConsent()) return Promise.resolve(true);

  return new Promise((resolve) => {
    Alert.alert(
      i18n.t("main:gallery.imageConsent.title"),
      i18n.t("main:gallery.imageConsent.message"),
      [
        { text: i18n.t("main:gallery.cancel"), style: "cancel", onPress: () => resolve(false) },
        {
          text: i18n.t("main:gallery.imageConsent.privacyPolicy"),
          onPress: () => {
            Linking.openURL(privacyUrl).catch(() => {
              Alert.alert(
                i18n.t("main:gallery.imageConsent.openLinkFailed.title"),
                i18n.t("main:gallery.imageConsent.openLinkFailed.message"),
              );
            });
            resolve(false);
          },
        },
        {
          text: i18n.t("main:gallery.imageConsent.agree"),
          onPress: () => {
            grantImageConsent();
            resolve(true);
          },
        },
      ],
    );
  });
}
