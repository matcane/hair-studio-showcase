import { Stack } from "expo-router";

interface CameraBottomBarProps {
  canCapture: boolean;
  handleCapture: () => void;
  handleGallery: () => void;
  handleCameraFlip: () => void;
}

export function CameraBottomBar({
  canCapture,
  handleCapture,
  handleGallery,
  handleCameraFlip,
}: CameraBottomBarProps) {
  return (
    <Stack.Toolbar placement="bottom">
      <Stack.Toolbar.Button icon="photo.on.rectangle.angled" onPress={handleGallery} />
      <Stack.Toolbar.Spacer />
      <Stack.Toolbar.Button
        icon="camera.circle.fill"
        onPress={handleCapture}
        separateBackground
        disabled={!canCapture}
      />
      <Stack.Toolbar.Spacer />
      <Stack.Toolbar.Button icon="arrow.triangle.2.circlepath" onPress={handleCameraFlip} />
    </Stack.Toolbar>
  );
}
