/**
 * Costume configurations for the character's career evolution.
 * Each costume represents a stage of professional growth.
 */

export interface CostumeColors {
  hair: string;
  hairHi: string;
  shirt: string;
  shirtSh: string;
  shirtHi: string;
  pants: string;
  pantsSh: string;
  shoes: string;
  sole: string;
  hasLongHair: boolean;
  hasTie: boolean;
  hasBlazer: boolean;
  /** Collar detail color (for dress shirts / blazers) */
  collar?: string;
  /** Tie color */
  tieColor?: string;
}

// Shared skin/face colors (same person, different outfits)
export const SKIN = {
  skin: '#f8b878',
  skinSh: '#d89048',
  eye: '#181018',
  eyeW: '#f8f8f8',
  glass: '#282838',
  glassBr: '#383848',
  white: '#f8f8f8',
};

export const COSTUMES: CostumeColors[] = [
  // ── 0: นักศึกษา ผมยาว เซอร์ ──
  // Polo สีครีม + กางเกงผ้าสีฟ้าอ่อน + รองเท้าผ้าใบขาว
  {
    hair: '#302830', hairHi: '#484058',
    shirt: '#e8e0d0', shirtSh: '#c8b898', shirtHi: '#f8f0e0',
    pants: '#6888a8', pantsSh: '#506878',
    shoes: '#e8e8e8', sole: '#b0b0b0',
    hasLongHair: true, hasTie: false, hasBlazer: false,
  },

  // ── 1: แนวร๊อค — เสื้อยืดดำ + ยีนส์เดฟ + ผมยาว ──
  {
    hair: '#302830', hairHi: '#484058',
    shirt: '#282828', shirtSh: '#181818', shirtHi: '#404040',
    pants: '#3858a8', pantsSh: '#284080',
    shoes: '#503828', sole: '#382010',
    hasLongHair: true, hasTie: false, hasBlazer: false,
  },

  // ── 2: ร๊อค ผมสั้น (เหมือนชุด 1 แต่ตัดผม) ──
  {
    hair: '#302830', hairHi: '#484058',
    shirt: '#282828', shirtSh: '#181818', shirtHi: '#404040',
    pants: '#3858a8', pantsSh: '#284080',
    shoes: '#503828', sole: '#382010',
    hasLongHair: false, hasTie: false, hasBlazer: false,
  },

  // ── 3: หนุ่มออฟฟิศ — เสื้อเชิ้ตขาว + กางเกงสแล็คเทา ──
  {
    hair: '#302830', hairHi: '#484058',
    shirt: '#d0d8e8', shirtSh: '#a0b0c8', shirtHi: '#e8f0ff',
    pants: '#404858', pantsSh: '#303840',
    shoes: '#382818', sole: '#281808',
    hasLongHair: false, hasTie: false, hasBlazer: false,
    collar: '#e0e8f0',
  },

  // ── 4: สูทไม่มีเน็กไท ──
  {
    hair: '#302830', hairHi: '#484058',
    shirt: '#384058', shirtSh: '#283040', shirtHi: '#485068',
    pants: '#384058', pantsSh: '#283040',
    shoes: '#281808', sole: '#180800',
    hasLongHair: false, hasTie: false, hasBlazer: true,
    collar: '#c8d0e0',
  },

  // ── 5: สูทมีเน็กไท ──
  {
    hair: '#302830', hairHi: '#484058',
    shirt: '#384058', shirtSh: '#283040', shirtHi: '#485068',
    pants: '#384058', pantsSh: '#283040',
    shoes: '#281808', sole: '#180800',
    hasLongHair: false, hasTie: true, hasBlazer: true,
    collar: '#c8d0e0',
    tieColor: '#b83030',
  },
];

/** Map: when player EXITS this zone going RIGHT → upgrade costume */
export const COSTUME_FORWARD: Record<string, number> = {
  'education': 1,      // ผ่าน Education → ชุดร๊อค
  'experience-1': 2,   // ผ่าน Agility (2011) → ร๊อค ผมสั้น
  'experience-2': 3,   // ผ่าน TRUE → ออฟฟิศ
  'experience-3': 4,   // ผ่าน Agility (2018) → สูทไม่มีไท
  'experience-4': 5,   // ผ่าน DSV → สูทมีเน็กไท
};

/** Map: when player EXITS this zone going LEFT → downgrade costume */
export const COSTUME_BACKWARD: Record<string, number> = {
  'education': 0,      // ย้อนกลับผ่าน Education → กลับเป็นนักศึกษา
  'experience-1': 1,   // ย้อนกลับผ่าน Agility (2011) → ร๊อค ผมยาว
  'experience-2': 2,   // ย้อนกลับผ่าน TRUE → ร๊อค ผมสั้น
  'experience-3': 3,   // ย้อนกลับผ่าน Agility (2018) → ออฟฟิศ
  'experience-4': 4,   // ย้อนกลับผ่าน DSV → สูทไม่มีไท
};
