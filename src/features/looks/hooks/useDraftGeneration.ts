import { File } from "expo-file-system";
import { Image } from "expo-image";
import { useRef, useState } from "react";

import { lookImageUri } from "../api";
import type { LookMeta, PendingLook } from "../types";
import { useGenerateLook } from "./useGenerateLook";

interface DraftGenerationReveal {
  prepareReveal: () => void;
  startReveal: () => void;
}

interface DraftGenerationProps {
  draftSource: string;
  selectedOption: PendingLook | null;
  onGenerated: () => void;
}

export function useDraftGeneration({
  draftSource,
  selectedOption,
  onGenerated,
}: DraftGenerationProps) {
  const [generatedLook, setGeneratedLook] = useState("");
  const [generatedMeta, setGeneratedMeta] = useState<LookMeta>();
  const generationLockRef = useRef(false);

  const { mutate: triggerGeneration, isPending: isGenerationPending } = useGenerateLook();

  const generate = ({ prepareReveal, startReveal }: DraftGenerationReveal) => {
    if (!selectedOption || isGenerationPending || generationLockRef.current) {
      return;
    }

    const userImageB64 = new File(draftSource).base64Sync();
    generationLockRef.current = true;

    triggerGeneration(
      {
        requestParams: {
          action_id: selectedOption.id,
          action_type: selectedOption.type,
          user_image_b64: userImageB64,
        },
        draftSource,
        title: selectedOption.title,
        styleLength: selectedOption.styleLength,
        styleTexture: selectedOption.styleTexture,
      },
      {
        onSuccess: async (_data, _variables, context) => {
          if (!context?.meta) return;

          prepareReveal();
          const afterUri = lookImageUri(context.meta.uuid, "after.png");
          await Image.prefetch(afterUri);
          setGeneratedLook(afterUri);
          setGeneratedMeta(context.meta);
          startReveal();
          onGenerated();
        },
        onSettled: () => {
          generationLockRef.current = false;
        },
      },
    );
  };

  return { generatedLook, generatedMeta, isGenerationPending, generate };
}
