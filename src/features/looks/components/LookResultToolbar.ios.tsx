import { Stack } from "expo-router";

interface LookResultToolbarProps {
  isComparing: boolean;
  handleCompare: () => void;
  handleDownload: () => void;
  handleShareLook: () => void;
  handleOpenDetails: () => void;
  handleDelete: () => void;
}

export function LookResultToolbar({
  isComparing,
  handleCompare,
  handleDownload,
  handleShareLook,
  handleOpenDetails,
  handleDelete,
}: LookResultToolbarProps) {
  return (
    <Stack.Toolbar placement="bottom">
      <Stack.Toolbar.Button
        icon={isComparing ? "square.split.2x1.fill" : "square.split.2x1"}
        onPress={handleCompare}
      />
      <Stack.Toolbar.Spacer />
      <Stack.Toolbar.Button icon="square.and.arrow.down" onPress={handleDownload} />
      <Stack.Toolbar.Button icon="square.and.arrow.up" onPress={handleShareLook} />
      <Stack.Toolbar.Button icon="info.circle" onPress={handleOpenDetails} />
      <Stack.Toolbar.Spacer />
      <Stack.Toolbar.Button icon="trash" onPress={handleDelete} />
    </Stack.Toolbar>
  );
}
