import { Stack } from "expo-router";

interface CloseToolbarProps {
  onPress: () => void;
}

export function CloseToolbar({ onPress }: CloseToolbarProps) {
  return (
    <Stack.Toolbar placement="left">
      <Stack.Toolbar.Button icon="xmark" onPress={onPress} />
    </Stack.Toolbar>
  );
}
