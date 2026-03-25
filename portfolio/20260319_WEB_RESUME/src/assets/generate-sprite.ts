/**
 * Pixel art character sprite sheet — 32x32 per frame.
 * ALL sprites draw feet at y=30-31 so they touch the ground.
 * Side views are CLEARLY asymmetric — whole body faces RIGHT.
 *
 * Per costume (24 frames):
 *   0-3:   Side idle FACING RIGHT
 *   4-9:   Side walk FACING RIGHT (swing animation)
 *   10-11: Front-facing idle
 *   12-13: Back-facing idle
 *   14-17: Side idle FACING LEFT (mirror)
 *   18-23: Side walk FACING LEFT (mirror)
 *
 * Total: 24 frames × 6 costumes = 144 frames
 */

import { COSTUMES, SKIN, type CostumeColors } from './costume-config';

export const FRAMES_PER_COSTUME = 24;

const FRAME_W = 32;
const FRAME_H = 32;
const BY = 6; // base Y offset — shifts everything down

type Px = [number, number, string];

function draw(ctx: CanvasRenderingContext2D, ox: number, px: Px[]) {
  for (const [x, y, c] of px) { ctx.fillStyle = c; ctx.fillRect(ox + x, y, 1, 1); }
}

function mirrorX(pixels: Px[]): Px[] {
  return pixels.map(([x, y, c]) => [FRAME_W - 1 - x, y, c]);
}

function fillRow(p: Px[], x1: number, x2: number, y: number, c: string) {
  for (let x = x1; x <= x2; x++) p.push([x, y, c]);
}

// ── Side-view FACING RIGHT ──────────────────────────────────────
// Walk params: aF/aB = arm swing (X-offset), lF/lB = leg swing (X-offset)
// Positive = forward (right), Negative = backward (left)

function sideBody(co: CostumeColors, ho = 0, aF = 0, aB = 0, lF = 0, lB = 0): Px[] {
  const p: Px[] = [];
  const y = BY + ho;
  const S = SKIN;

  // ── HEAD ──
  // Hair back
  fillRow(p, 13, 17, y + 3, co.hair);
  fillRow(p, 12, 18, y + 4, co.hair);
  fillRow(p, 12, 17, y + 5, co.hair);
  fillRow(p, 12, 16, y + 6, co.hair);
  // Hair top/front
  fillRow(p, 18, 23, y + 3, co.hair);
  fillRow(p, 19, 24, y + 4, co.hair);
  p.push([15, y + 4, co.hairHi]);

  // Long hair: extra rows hanging down past ears
  if (co.hasLongHair) {
    p.push([12, y + 7, co.hair]); p.push([13, y + 7, co.hair]);
    p.push([12, y + 8, co.hair]); p.push([13, y + 8, co.hair]);
    p.push([12, y + 9, co.hair]);
    p.push([13, y + 9, co.hairHi]);
    p.push([12, y + 10, co.hair]);
  }

  // Face (right side)
  fillRow(p, 18, 24, y + 5, S.skin);
  fillRow(p, 17, 25, y + 6, S.skin);
  fillRow(p, 17, 25, y + 7, S.skin);
  fillRow(p, 17, 25, y + 8, S.skin);
  fillRow(p, 17, 24, y + 9, S.skin);
  fillRow(p, 18, 23, y + 10, S.skinSh);
  // Ear (hidden by long hair if applicable, but skin shows through)
  if (!co.hasLongHair) {
    p.push([16, y + 7, S.skinSh]); p.push([16, y + 8, S.skinSh]);
  }

  // Eye (single, profile)
  p.push([22, y + 7, S.eyeW]); p.push([23, y + 7, S.eye]); p.push([24, y + 7, S.eye]);
  // Glasses
  fillRow(p, 21, 25, y + 6, S.glass);
  p.push([21, y + 7, S.glass]); p.push([25, y + 7, S.glass]);
  fillRow(p, 21, 25, y + 8, S.glass);
  // Glasses arm
  p.push([20, y + 7, S.glassBr]); p.push([19, y + 7, S.glassBr]); p.push([18, y + 7, S.glassBr]);
  // Nose
  p.push([25, y + 8, S.skinSh]);
  // Mouth
  p.push([22, y + 9, S.skinSh]); p.push([23, y + 9, S.skinSh]);

  // ── NECK ──
  p.push([19, y + 11, S.skin]); p.push([20, y + 11, S.skin]); p.push([21, y + 11, S.skin]);

  // ── BODY ──
  // Back arm — X swings with aB offset
  const backArmX1 = 13 + aB;
  const backArmX2 = 14 + aB;
  for (let i = 0; i < 6; i++) {
    const ay = y + 13 + i;
    if (backArmX1 >= 9 && backArmX2 <= 18) {
      p.push([backArmX1, ay, co.shirtSh]); p.push([backArmX2, ay, co.shirtSh]);
    }
  }
  // Back hand
  if (backArmX1 >= 9 && backArmX2 <= 18) {
    p.push([backArmX1, y + 19, S.skinSh]); p.push([backArmX2, y + 19, S.skinSh]);
  }

  // Shirt torso (x=15..23)
  for (let row = y + 12; row <= y + 18; row++) {
    for (let x = 15; x <= 23; x++) {
      p.push([x, row, row >= y + 16 ? co.shirtSh : (x >= 21 ? co.shirtHi : co.shirt)]);
    }
  }

  // Collar/detail at neckline
  if (co.hasBlazer) {
    // Blazer lapel — V shape
    p.push([17, y + 12, co.collar ?? S.white]); p.push([18, y + 12, co.collar ?? S.white]);
    p.push([20, y + 12, co.collar ?? S.white]); p.push([21, y + 12, co.collar ?? S.white]);
    p.push([18, y + 13, co.collar ?? S.white]); p.push([20, y + 13, co.collar ?? S.white]);
    // Darker lapel edges
    p.push([15, y + 12, co.shirtHi]); p.push([15, y + 13, co.shirtHi]);
    p.push([23, y + 12, co.shirtHi]); p.push([23, y + 13, co.shirtHi]);
  } else if (co.collar) {
    // Dress shirt collar
    p.push([18, y + 12, co.collar]); p.push([19, y + 12, co.collar]);
    p.push([20, y + 12, co.collar]); p.push([21, y + 12, co.collar]);
  } else {
    // Casual: simple collar dots
    p.push([21, y + 12, S.white]); p.push([22, y + 12, S.white]);
  }

  // Tie (if applicable)
  if (co.hasTie) {
    const tc = co.tieColor ?? '#b83030';
    p.push([19, y + 12, tc]); p.push([19, y + 13, tc]);
    p.push([19, y + 14, tc]); p.push([19, y + 15, tc]);
    p.push([19, y + 16, tc]);
    // Tie knot wider
    p.push([18, y + 12, tc]); p.push([20, y + 12, tc]);
  }

  // Front arm — X swings with aF offset
  const frontArmX1 = 24 + aF;
  const frontArmX2 = 25 + aF;
  for (let i = 0; i < 6; i++) {
    const ay = y + 13 + i;
    if (frontArmX1 >= 20 && frontArmX2 <= 29) {
      p.push([frontArmX1, ay, co.shirt]); p.push([frontArmX2, ay, co.shirt]);
    }
  }
  // Front hand
  if (frontArmX1 >= 20 && frontArmX2 <= 29) {
    p.push([frontArmX1, y + 19, S.skin]); p.push([frontArmX2, y + 19, S.skin]);
  }

  // ── LEGS — X swings with lF/lB offset ──
  // Back leg
  const blX1 = 15 + lB;
  const blX2 = 18 + lB;
  for (let i = 0; i < 4; i++) {
    const ly = y + 19 + i;
    if (blX1 >= 11 && blX2 <= 22) {
      fillRow(p, blX1, blX2, ly, i >= 2 ? co.pantsSh : co.pants);
    }
  }
  // Crotch bridge
  p.push([19, y + 19, co.pants]); p.push([19, y + 20, co.pants]);

  // Front leg
  const flX1 = 20 + lF;
  const flX2 = 23 + lF;
  for (let i = 0; i < 4; i++) {
    const ly = y + 19 + i;
    if (flX1 >= 16 && flX2 <= 27) {
      fillRow(p, flX1, flX2, ly, i >= 2 ? co.pantsSh : co.pants);
    }
  }

  // ── SHOES — feet always at ground level (no Y shift) ──
  // Back shoe
  const bsX1 = 14 + lB;
  const bsX2 = 18 + lB;
  if (bsX1 >= 10 && bsX2 <= 22) {
    fillRow(p, bsX1, bsX2, y + 23, co.shoes);
    fillRow(p, bsX1, bsX2, y + 24, co.sole);
  }
  // Front shoe (wider)
  const fsX1 = 19 + lF;
  const fsX2 = 25 + lF;
  if (fsX1 >= 15 && fsX2 <= 29) {
    fillRow(p, fsX1, fsX2, y + 23, co.shoes);
    fillRow(p, fsX1, fsX2, y + 24, co.sole);
  }

  return p;
}

// ── Front-facing (looking at camera) ────────────────────────────

function frontBody(co: CostumeColors, ho = 0): Px[] {
  const p: Px[] = [];
  const y = BY + ho;
  const S = SKIN;

  // Hair
  fillRow(p, 11, 21, y + 3, co.hair);
  fillRow(p, 10, 22, y + 4, co.hair);
  fillRow(p, 10, 22, y + 5, co.hair);
  p.push([10, y + 6, co.hair]); p.push([22, y + 6, co.hair]);
  p.push([13, y + 4, co.hairHi]); p.push([19, y + 4, co.hairHi]);

  // Long hair sides
  if (co.hasLongHair) {
    for (let row = y + 7; row <= y + 10; row++) {
      p.push([9, row, co.hair]); p.push([23, row, co.hair]);
    }
    p.push([9, y + 11, co.hair]); p.push([23, y + 11, co.hair]);
  }

  // Face
  fillRow(p, 11, 21, y + 6, S.skin);
  fillRow(p, 10, 22, y + 7, S.skin);
  fillRow(p, 10, 22, y + 8, S.skin);
  fillRow(p, 10, 22, y + 9, S.skin);
  fillRow(p, 11, 21, y + 10, S.skinSh);

  // Eyes
  p.push([12, y + 8, S.eyeW]); p.push([13, y + 8, S.eye]); p.push([14, y + 8, S.eye]);
  p.push([18, y + 8, S.eye]); p.push([19, y + 8, S.eye]); p.push([20, y + 8, S.eyeW]);
  // Glasses
  fillRow(p, 11, 15, y + 7, S.glass); fillRow(p, 11, 15, y + 9, S.glass);
  p.push([11, y + 8, S.glass]); p.push([15, y + 8, S.glass]);
  p.push([16, y + 8, S.glassBr]);
  fillRow(p, 17, 21, y + 7, S.glass); fillRow(p, 17, 21, y + 9, S.glass);
  p.push([17, y + 8, S.glass]); p.push([21, y + 8, S.glass]);
  // Smile
  fillRow(p, 14, 18, y + 10, S.skinSh);

  // Neck
  fillRow(p, 15, 17, y + 11, S.skin);

  // Shirt
  for (let row = y + 12; row <= y + 18; row++)
    fillRow(p, 10, 22, row, row >= y + 16 ? co.shirtSh : co.shirt);

  // Collar / blazer detail
  if (co.hasBlazer) {
    fillRow(p, 13, 14, y + 12, co.collar ?? S.white);
    fillRow(p, 18, 19, y + 12, co.collar ?? S.white);
    p.push([14, y + 13, co.collar ?? S.white]); p.push([18, y + 13, co.collar ?? S.white]);
  } else if (co.collar) {
    fillRow(p, 14, 18, y + 12, co.collar);
  } else {
    fillRow(p, 15, 17, y + 12, S.white);
  }

  // Tie
  if (co.hasTie) {
    const tc = co.tieColor ?? '#b83030';
    p.push([16, y + 12, tc]); p.push([16, y + 13, tc]);
    p.push([16, y + 14, tc]); p.push([16, y + 15, tc]);
    p.push([16, y + 16, tc]);
    p.push([15, y + 12, tc]); p.push([17, y + 12, tc]);
  }

  // Arms
  for (let row = y + 13; row <= y + 18; row++) { p.push([9, row, co.shirt]); p.push([23, row, co.shirt]); }
  p.push([9, y + 19, S.skin]); p.push([23, y + 19, S.skin]);

  // Pants
  for (let row = y + 19; row <= y + 22; row++) {
    fillRow(p, 11, 15, row, row >= y + 21 ? co.pantsSh : co.pants);
    fillRow(p, 17, 21, row, row >= y + 21 ? co.pantsSh : co.pants);
  }
  p.push([16, y + 19, co.pants]); p.push([16, y + 20, co.pants]);

  // Shoes
  fillRow(p, 10, 15, y + 23, co.shoes); fillRow(p, 10, 15, y + 24, co.sole);
  fillRow(p, 17, 22, y + 23, co.shoes); fillRow(p, 17, 22, y + 24, co.sole);

  return p;
}

// ── Back-facing (looking away) ──────────────────────────────────

function backBody(co: CostumeColors, ho = 0): Px[] {
  const p: Px[] = [];
  const y = BY + ho;
  const S = SKIN;

  // Hair (full back of head)
  fillRow(p, 11, 21, y + 3, co.hair);
  fillRow(p, 10, 22, y + 4, co.hair);
  for (let row = y + 5; row <= y + 8; row++) fillRow(p, 10, 22, row, co.hair);
  fillRow(p, 11, 21, y + 9, co.hair);
  fillRow(p, 12, 20, y + 10, co.hair);
  p.push([13, y + 5, co.hairHi]); p.push([19, y + 5, co.hairHi]);

  // Long hair down the back
  if (co.hasLongHair) {
    fillRow(p, 12, 20, y + 10, co.hair);
    fillRow(p, 13, 19, y + 11, co.hair);
    fillRow(p, 14, 18, y + 12, co.hair);
    p.push([15, y + 13, co.hairHi]); p.push([16, y + 13, co.hair]); p.push([17, y + 13, co.hairHi]);
  }

  // Neck
  if (!co.hasLongHair) {
    fillRow(p, 15, 17, y + 11, S.skin);
  }

  // Shirt
  for (let row = y + 12; row <= y + 18; row++)
    fillRow(p, 10, 22, row, row >= y + 16 ? co.shirtSh : co.shirt);
  p.push([16, y + 13, co.shirtSh]); p.push([16, y + 14, co.shirtSh]); p.push([16, y + 15, co.shirtSh]);

  // Blazer back seam
  if (co.hasBlazer) {
    for (let row = y + 12; row <= y + 18; row++) {
      p.push([10, row, co.shirtHi]); p.push([22, row, co.shirtHi]);
    }
  }

  // Arms
  for (let row = y + 13; row <= y + 18; row++) { p.push([9, row, co.shirtSh]); p.push([23, row, co.shirtSh]); }
  p.push([9, y + 19, S.skinSh]); p.push([23, y + 19, S.skinSh]);

  // Pants
  for (let row = y + 19; row <= y + 22; row++) {
    fillRow(p, 11, 15, row, row >= y + 21 ? co.pantsSh : co.pants);
    fillRow(p, 17, 21, row, row >= y + 21 ? co.pantsSh : co.pants);
  }
  p.push([16, y + 19, co.pants]); p.push([16, y + 20, co.pants]);

  // Shoes
  fillRow(p, 10, 15, y + 23, co.shoes); fillRow(p, 10, 15, y + 24, co.sole);
  fillRow(p, 17, 22, y + 23, co.shoes); fillRow(p, 17, 22, y + 24, co.sole);

  return p;
}

// ── Sprite Sheet Generation ─────────────────────────────────────

export function generateSpriteSheet(): HTMLCanvasElement {
  const totalCostumes = COSTUMES.length;
  const totalFrames = FRAMES_PER_COSTUME * totalCostumes;

  const canvas = document.createElement('canvas');
  canvas.width = FRAME_W * totalFrames;
  canvas.height = FRAME_H;
  const ctx = canvas.getContext('2d')!;

  // Walk cycle: [aF, aB, lF, lB] — horizontal swing offsets
  // Arms swing OPPOSITE to legs (natural gait)
  const wk: [number, number, number, number][] = [
    [0, 0, 0, 0],       // neutral
    [1, -1, -1, 1],     // front arm fwd, back arm back; front leg back, back leg fwd
    [2, -2, -2, 2],     // extreme
    [0, 0, 0, 0],       // neutral
    [-1, 1, 1, -1],     // reverse
    [-2, 2, 2, -2],     // extreme reverse
  ];

  for (let c = 0; c < totalCostumes; c++) {
    const co = COSTUMES[c];
    const base = c * FRAMES_PER_COSTUME;

    // Side idle RIGHT (frames base+0..3)
    for (let i = 0; i < 4; i++)
      draw(ctx, (base + i) * FRAME_W, sideBody(co, i >= 2 ? -1 : 0));

    // Side walk RIGHT (frames base+4..9)
    for (let i = 0; i < 6; i++) {
      const [af, ab, lf, lb] = wk[i];
      draw(ctx, (base + 4 + i) * FRAME_W, sideBody(co, 0, af, ab, lf, lb));
    }

    // Front idle (frames base+10..11)
    draw(ctx, (base + 10) * FRAME_W, frontBody(co, 0));
    draw(ctx, (base + 11) * FRAME_W, frontBody(co, -1));

    // Back idle (frames base+12..13)
    draw(ctx, (base + 12) * FRAME_W, backBody(co, 0));
    draw(ctx, (base + 13) * FRAME_W, backBody(co, -1));

    // Side idle LEFT (frames base+14..17) — mirror
    for (let i = 0; i < 4; i++)
      draw(ctx, (base + 14 + i) * FRAME_W, mirrorX(sideBody(co, i >= 2 ? -1 : 0)));

    // Side walk LEFT (frames base+18..23) — mirror
    for (let i = 0; i < 6; i++) {
      const [af, ab, lf, lb] = wk[i];
      draw(ctx, (base + 18 + i) * FRAME_W, mirrorX(sideBody(co, 0, af, ab, lf, lb)));
    }
  }

  return canvas;
}
