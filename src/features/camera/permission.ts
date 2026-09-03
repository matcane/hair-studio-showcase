import { VisionCamera } from "react-native-vision-camera";

export async function promptCameraPermission(requestPermission: () => Promise<boolean>) {
  const statusBefore = VisionCamera.cameraPermissionStatus;

  const granted = await requestPermission();
  if (granted) return "granted";

  const statusAfter = VisionCamera.cameraPermissionStatus;

  const isPermanentlyDenied = statusBefore === "denied" && statusAfter === "denied";

  if (isPermanentlyDenied) return "permanently-denied";

  return "canceled";
}
