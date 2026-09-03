import type { FlashMode } from "react-native-vision-camera";

export const FLASH_MODE_ORDER: FlashMode[] = ["off", "on", "auto"];

export function nextFlashMode(current: FlashMode): FlashMode {
  const nextIndex = (FLASH_MODE_ORDER.indexOf(current) + 1) % FLASH_MODE_ORDER.length;
  return FLASH_MODE_ORDER[nextIndex] ?? "off";
}

export function getCaptureFlash(facing: "front" | "back", flashMode: FlashMode) {
  return {
    useScreenFlash: facing === "front" && flashMode === "on",
    captureFlashMode: facing === "front" ? "off" : flashMode,
  };
}

export async function waitForScreenFlashReady() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
  await new Promise<void>((resolve) => setTimeout(resolve, 120));
}
