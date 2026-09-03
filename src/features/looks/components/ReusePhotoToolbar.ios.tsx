import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ReusePhotoToolbarProps {
  beforeUri: string;
  afterUri: string;
  onReuse: (uri: string) => void;
}

export function ReusePhotoToolbar({ beforeUri, afterUri, onReuse }: ReusePhotoToolbarProps) {
  const { t } = useTranslation("main");
  const [isHidden, setIsHidden] = useState(false);
  const isReusingRef = useRef(false);
  const canReuseAfter = Boolean(afterUri) && afterUri !== beforeUri;

  const handleReuse = (uri: string) => {
    if (isReusingRef.current) return;

    isReusingRef.current = true;
    setIsHidden(true);
    requestAnimationFrame(() => onReuse(uri));
  };

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu hidden={isHidden}>
        <Stack.Toolbar.Label>{t("gallery.reuse.button")}</Stack.Toolbar.Label>
        <Stack.Toolbar.MenuAction icon="photo" onPress={() => handleReuse(beforeUri)}>
          {t("gallery.reuse.before")}
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon="sparkles"
          disabled={!canReuseAfter}
          onPress={() => handleReuse(afterUri)}>
          {t("gallery.reuse.after")}
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
