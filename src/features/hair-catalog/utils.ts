import type { ParseKeys } from "i18next";

import i18n from "@/integrations/i18n";

import type { HairOption } from "./types";

export function hairOptionTitle(option: HairOption): string {
  if (option.type === "celebrity_hair_change") return option.title;
  return i18n.t(`hairCatalog.${option.type}.${option.id}.title` as ParseKeys<"main">, {
    ns: "main",
  });
}
