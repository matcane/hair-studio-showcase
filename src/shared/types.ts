export type Result<T, E extends string = string> = { ok: true; data: T } | { ok: false; error: E };

export type HairStyleTexture = "straight" | "wavy" | "curly";
export type HairStyleLength = "short" | "medium" | "long";

export type HairOptionType =
  "hair_change" | "color_change" | "celebrity_hair_change" | "makeup_change" | "fun_change";
