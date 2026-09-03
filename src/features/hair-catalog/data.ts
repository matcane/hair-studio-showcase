import type { HairOption } from "./types";

export const STYLE_DATA: HairOption[] = [
  {
    id: "wolf_cut",
    type: "hair_change",
    title: "Wolf Cut",
    image: require("@/assets/images/styles/wolf_cut.webp"),
    styleTexture: "wavy",
    styleLength: "medium",
  },
  {
    id: "beach_waves",
    type: "hair_change",
    title: "Beach Waves",
    image: require("@/assets/images/styles/beach_waves.webp"),
    styleTexture: "wavy",
    styleLength: "long",
  },
  {
    id: "butterfly_cut",
    type: "hair_change",
    title: "Butterfly Cut",
    image: require("@/assets/images/styles/butterfly_cut.webp"),
    styleTexture: "straight",
    styleLength: "long",
  },
  {
    id: "curly_bob",
    type: "hair_change",
    title: "Curly Bob",
    image: require("@/assets/images/styles/curly_bob.webp"),
    styleTexture: "curly",
    styleLength: "medium",
  },
  {
    id: "french_bob",
    type: "hair_change",
    title: "French Bob",
    image: require("@/assets/images/styles/french_bob.webp"),
    styleTexture: "straight",
    styleLength: "medium",
  },
  {
    id: "pixie_cut",
    type: "hair_change",
    title: "Pixie Cut",
    image: require("@/assets/images/styles/pixie_cut.webp"),
    styleTexture: "straight",
    styleLength: "short",
  },
  {
    id: "gorgeous_curls",
    type: "hair_change",
    title: "Gorgeous Curls",
    image: require("@/assets/images/styles/gorgeous_curls.webp"),
    styleTexture: "curly",
    styleLength: "medium",
  },
  {
    id: "shag",
    type: "hair_change",
    title: "Shag",
    image: require("@/assets/images/styles/shag.webp"),
    styleTexture: "wavy",
    styleLength: "medium",
  },
  {
    id: "long_bob",
    type: "hair_change",
    title: "Long Bob",
    image: require("@/assets/images/styles/long_bob.webp"),
    styleTexture: "straight",
    styleLength: "medium",
  },
  {
    id: "curtain_bangs",
    type: "hair_change",
    title: "Curtain Bangs",
    image: require("@/assets/images/styles/curtain_bangs.webp"),
    styleTexture: "wavy",
    styleLength: "medium",
  },
];

export const COLOR_DATA: HairOption[] = [
  {
    id: "honey_balayage",
    type: "color_change",
    title: "Honey Balayage",
    image: require("@/assets/images/colors/honey_balayage.webp"),
  },
  {
    id: "caramel_highlights",
    type: "color_change",
    title: "Caramel Highlights",
    image: require("@/assets/images/colors/caramel_highlights.webp"),
  },
  {
    id: "bronde",
    type: "color_change",
    title: "Bronde",
    image: require("@/assets/images/colors/bronde.webp"),
  },
  {
    id: "money_piece",
    type: "color_change",
    title: "Money Piece",
    image: require("@/assets/images/colors/money_piece.webp"),
  },
  {
    id: "shadow_root_blonde",
    type: "color_change",
    title: "Shadow Root Blonde",
    image: require("@/assets/images/colors/shadow_root_blonde.webp"),
  },
  {
    id: "mocha_brunette",
    type: "color_change",
    title: "Mocha Brunette",
    image: require("@/assets/images/colors/mocha_brunette.webp"),
  },
  {
    id: "chocolate_brown",
    type: "color_change",
    title: "Chocolate Brown",
    image: require("@/assets/images/colors/chocolate_brown.webp"),
  },
  {
    id: "soft_copper",
    type: "color_change",
    title: "Soft Copper",
    image: require("@/assets/images/colors/soft_copper.webp"),
  },
  {
    id: "ash_brown",
    type: "color_change",
    title: "Ash Brown",
    image: require("@/assets/images/colors/ash_brown.webp"),
  },
  {
    id: "strawberry_blonde",
    type: "color_change",
    title: "Strawberry Blonde",
    image: require("@/assets/images/colors/strawberry_blonde.webp"),
  },
];

export const CELEB_DATA: HairOption[] = [
  {
    id: "alisa_liu",
    type: "celebrity_hair_change",
    title: "Alisa Liu",
    image: require("@/assets/images/styles/celeb/alisa_liu.jpg"),
  },
  {
    id: "anya_taylor_joy",
    type: "celebrity_hair_change",
    title: "Anya Taylor-Joy",
    image: require("@/assets/images/styles/celeb/anya_taylor_joy.jpg"),
  },
  {
    id: "anne_hathaway",
    type: "celebrity_hair_change",
    title: "Anne Hathaway",
    image: require("@/assets/images/styles/celeb/anne_hathaway.jpg"),
  },
  {
    id: "ariana_grande",
    type: "celebrity_hair_change",
    title: "Ariana Grande",
    image: require("@/assets/images/styles/celeb/ariana_grande.jpg"),
  },
  {
    id: "billie_eilish",
    type: "celebrity_hair_change",
    title: "Billie Eilish",
    image: require("@/assets/images/styles/celeb/billie_eilish.jpg"),
  },
  {
    id: "blake_lively",
    type: "celebrity_hair_change",
    title: "Blake Lively",
    image: require("@/assets/images/styles/celeb/blake_lively.jpg"),
  },
  {
    id: "brooke_monk",
    type: "celebrity_hair_change",
    title: "Brooke Monk",
    image: require("@/assets/images/styles/celeb/brooke_monk.jpg"),
  },
  {
    id: "dakota_johnson",
    type: "celebrity_hair_change",
    title: "Dakota Johnson",
    image: require("@/assets/images/styles/celeb/dakota_johnson.jpg"),
  },
  {
    id: "dua_lipa",
    type: "celebrity_hair_change",
    title: "Dua Lipa",
    image: require("@/assets/images/styles/celeb/dua_lipa.jpg"),
  },
  {
    id: "emily_blunt",
    type: "celebrity_hair_change",
    title: "Emily Blunt",
    image: require("@/assets/images/styles/celeb/emily_blunt.jpg"),
  },
];

export const MAKEUP_DATA: HairOption[] = [
  {
    id: "soft_glam",
    type: "makeup_change",
    title: "Soft Glam",
    image: require("@/assets/images/makeup/soft_glam.webp"),
  },
  {
    id: "everyday_neutral",
    type: "makeup_change",
    title: "Everyday Neutral",
    image: require("@/assets/images/makeup/everyday_neutral.webp"),
  },
  {
    id: "office_polished",
    type: "makeup_change",
    title: "Office Polished",
    image: require("@/assets/images/makeup/office_polished.webp"),
  },
  {
    id: "bridal_classic",
    type: "makeup_change",
    title: "Bridal Classic",
    image: require("@/assets/images/makeup/bridal_classic.webp"),
  },
  {
    id: "fresh_face",
    type: "makeup_change",
    title: "Fresh Face",
    image: require("@/assets/images/makeup/fresh_face.webp"),
  },
  {
    id: "soft_lift",
    type: "makeup_change",
    title: "Soft Lift",
    image: require("@/assets/images/makeup/soft_lift.webp"),
  },
  {
    id: "cool_taupe",
    type: "makeup_change",
    title: "Cool Taupe",
    image: require("@/assets/images/makeup/cool_taupe.webp"),
  },
  {
    id: "smoky_eye",
    type: "makeup_change",
    title: "Smoky Eye",
    image: require("@/assets/images/makeup/smoky_eye.webp"),
  },
  {
    id: "bold_red_lip",
    type: "makeup_change",
    title: "Bold Red Lip",
    image: require("@/assets/images/makeup/bold_red_lip.webp"),
  },
  {
    id: "bronze_goddess",
    type: "makeup_change",
    title: "Bronze Goddess",
    image: require("@/assets/images/makeup/bronze_goddess.webp"),
  },
];

export const FUN_DATA: HairOption[] = [
  {
    id: "old_me",
    type: "fun_change",
    title: "Old Me",
    image: require("@/assets/images/fun/old_me.webp"),
  },
  {
    id: "baby_face",
    type: "fun_change",
    title: "Baby Face",
    image: require("@/assets/images/fun/baby_face.webp"),
  },
  {
    id: "glow_up",
    type: "fun_change",
    title: "Glow Up",
    image: require("@/assets/images/fun/glow_up.webp"),
  },
  {
    id: "freckles",
    type: "fun_change",
    title: "Freckles",
    image: require("@/assets/images/fun/freckles.webp"),
  },
  {
    id: "gender_swap",
    type: "fun_change",
    title: "Gender Swap",
    image: require("@/assets/images/fun/gender_swap.webp"),
  },
];
