import { ConfigContext, ExpoConfig } from "expo/config";

import { version } from "./package.json";

type Environment = "production" | "development";

const APP_ENV: Environment = process.env.APP_ENV === "production" ? "production" : "development";

const isProd = APP_ENV === "production";

console.log(`[app.config.ts] Running in ${APP_ENV} mode`);

const IOS_TABLET_SUPPORT = false;

const EAS_PROJECT_ID = "";
const PROJECT_SLUG = "hair-studio-showcase";
const SCHEME = "hair-studio-showcase";

const APP_NAME = "Hair Studio Showcase";
const NAME = isProd ? APP_NAME : `(Dev) ${APP_NAME}`;

const BUNDLE_IDENTIFIER = "com.showcase.hair.studio";
const APP_STORE_URL = "";

const PACKAGE_NAME = "com.showcase.hair.studio";

const ICON = "./assets/images/icon.png";
const ADAPTIVE_ICON = "./assets/images/icon.png";
const ADAPTIVE_ICON_BG = "#0a0a3c";

const SPLASH_ICON = "./assets/images/icon.png";
const SPLASH_ICON_BG = "#000000";

const IOS_CAMERA_USAGE_DESCRIPTION =
  "$(PRODUCT_NAME) uses the camera to capture portrait photos of your face. Those photos are used to create personalized virtual hairstyle previews—for example, to show how different cuts or colors could look on you.";

const IOS_PHOTO_LIBRARY_USAGE_DESCRIPTION =
  "$(PRODUCT_NAME) uses your photo library so you can select portrait photos as the basis for virtual hairstyle previews, and so preview images you save can be stored in your library—for example, using an existing portrait instead of a new photo, or keeping a generated look you want to hold on to.";

const IOS_PHOTO_LIBRARY_ADD_DESCRIPTION =
  "$(PRODUCT_NAME) adds AI-generated hairstyle preview images to your photo library when you save them—for example, to keep a copy of a result you want in your own albums.";

const INTERFACE_STYLE: ExpoConfig["userInterfaceStyle"] = "light";
const APP_ORIENTATION: ExpoConfig["orientation"] = "portrait";

const BLOCKED_ANDROID_PERMISSIONS = [
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_COARSE_LOCATION",
];

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: NAME,
    slug: PROJECT_SLUG,
    scheme: SCHEME,
    version: version,
    orientation: APP_ORIENTATION,
    icon: ICON,
    userInterfaceStyle: INTERFACE_STYLE,
    locales: {
      pl: {
        NSCameraUsageDescription:
          "$(PRODUCT_NAME) używa aparatu do robienia portretowych zdjęć twarzy. Zdjęcia te służą do tworzenia spersonalizowanych, wirtualnych podglądów fryzur - np. aby pokazać, jak różne cięcia lub kolory mogłyby wyglądać na Tobie.",
        NSPhotoLibraryUsageDescription:
          "$(PRODUCT_NAME) używa biblioteki zdjęć, aby umożliwić wybór zdjęcia portretowego jako podstawy wirtualnego podglądu fryzury oraz zapisywanie wygenerowanych podglądów w Twojej bibliotece - np. użycie istniejącego portretu zamiast nowego zdjęcia lub zachowanie wygenerowanej stylizacji.",
        NSPhotoLibraryAddUsageDescription:
          "$(PRODUCT_NAME) dodaje wygenerowane przez AI podglądy fryzur do Twojej biblioteki zdjęć, gdy je zapisujesz - np. aby zachować kopię efektu we własnych albumach.",
      },
    },
    ios: {
      supportsTablet: IOS_TABLET_SUPPORT,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      appStoreUrl: APP_STORE_URL,
      entitlements: {
        "com.apple.developer.devicecheck.appattest-environment": isProd
          ? "production"
          : "development",
      },
      infoPlist: {
        ...config.ios?.infoPlist,
        NSCameraUsageDescription: IOS_CAMERA_USAGE_DESCRIPTION,
        CFBundleLocalizations: ["en", "pl"],
        CFBundleDevelopmentRegion: "en",
        ITSAppUsesNonExemptEncryption: false,
        BGTaskSchedulerPermittedIdentifiers: ["$(PRODUCT_BUNDLE_IDENTIFIER)"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: ADAPTIVE_ICON,
        backgroundColor: ADAPTIVE_ICON_BG,
      },
      predictiveBackGestureEnabled: false,
      package: PACKAGE_NAME,
      blockedPermissions: BLOCKED_ANDROID_PERMISSIONS,
    },
    plugins: [
      "expo-router",
      "expo-image",
      "expo-sharing",
      "expo-localization",
      [
        "expo-image-picker",
        {
          photosPermission: IOS_PHOTO_LIBRARY_USAGE_DESCRIPTION,
          cameraPermission: IOS_CAMERA_USAGE_DESCRIPTION,
          microphonePermission: false,
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: IOS_PHOTO_LIBRARY_USAGE_DESCRIPTION,
          savePhotosPermission: IOS_PHOTO_LIBRARY_ADD_DESCRIPTION,
          granularPermissions: ["photo"],
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "hair-studio-showcase",
          organization: "",
        },
      ],
      [
        "expo-font",
        {
          fonts: [],
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            deploymentTarget: "15.5",
          },
          android: {
            minSdkVersion: 26,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            networkInspector: false,
          },
        },
      ],
      [
        "expo-splash-screen",
        {
          image: SPLASH_ICON,
          backgroundColor: SPLASH_ICON_BG,
          imageWidth: 200,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    },
  };
};
