import Phaser from 'phaser';
import { TouchState } from '../systems/TouchState';

const BTN_SIZE = 40;
const BTN_GAP = 6;
const MARGIN_X = 20;
const MARGIN_Y = 4;           // ใต้พื้นดิน (ground y=432, canvas h=480)
const ALPHA_IDLE = 0.35;
const ALPHA_PRESS = 0.65;
const BG_COLOR = 0x8B1A1A;   // แดงเข้ม Famicom D-pad
const BG_PRESS = 0xCC2222;   // แดงสว่างตอนกด
const ARROW_COLOR = 0xffffff;

export class TouchControlsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TouchControlsScene', active: false });
  }

  create(): void {
    // Fixed camera (ignore world scroll)
    this.cameras.main.setScroll(0, 0);

    const h = Number(this.game.config.height);

    // ── Left side: LEFT / RIGHT ──
    const leftX = MARGIN_X;
    const btnY = h - MARGIN_Y - BTN_SIZE;

    this.makeButton(leftX, btnY, 'left');
    this.makeButton(leftX + BTN_SIZE + BTN_GAP, btnY, 'right');

    // ── Right side: DOWN / UP (jump) ──
    const rightBaseX = Number(this.game.config.width) - MARGIN_X - BTN_SIZE;

    this.makeButton(rightBaseX - BTN_SIZE - BTN_GAP, btnY, 'down');
    this.makeButton(rightBaseX, btnY, 'up');
  }

  private makeButton(
    x: number, y: number,
    direction: 'left' | 'right' | 'up' | 'down',
  ): void {
    const gfx = this.add.graphics();

    // Background
    gfx.fillStyle(BG_COLOR, ALPHA_IDLE);
    gfx.fillRoundedRect(x, y, BTN_SIZE, BTN_SIZE, 6);
    gfx.lineStyle(2, BG_COLOR, ALPHA_IDLE + 0.15);
    gfx.strokeRoundedRect(x, y, BTN_SIZE, BTN_SIZE, 6);

    // Arrow icon
    this.drawArrow(gfx, x, y, direction);

    // Hit zone
    const zone = this.add.zone(x + BTN_SIZE / 2, y + BTN_SIZE / 2, BTN_SIZE + 12, BTN_SIZE + 12)
      .setInteractive();

    zone.on('pointerdown', () => {
      TouchState[direction] = true;
      gfx.clear();
      gfx.fillStyle(BG_PRESS, ALPHA_PRESS);
      gfx.fillRoundedRect(x, y, BTN_SIZE, BTN_SIZE, 6);
      gfx.lineStyle(2, 0xffffff, 0.4);
      gfx.strokeRoundedRect(x, y, BTN_SIZE, BTN_SIZE, 6);
      this.drawArrow(gfx, x, y, direction);
    });

    const release = () => {
      TouchState[direction] = false;
      gfx.clear();
      gfx.fillStyle(BG_COLOR, ALPHA_IDLE);
      gfx.fillRoundedRect(x, y, BTN_SIZE, BTN_SIZE, 6);
      gfx.lineStyle(2, BG_COLOR, ALPHA_IDLE + 0.15);
      gfx.strokeRoundedRect(x, y, BTN_SIZE, BTN_SIZE, 6);
      this.drawArrow(gfx, x, y, direction);
    };

    zone.on('pointerup', release);
    zone.on('pointerout', release);
  }

  private drawArrow(
    gfx: Phaser.GameObjects.Graphics,
    bx: number, by: number,
    dir: 'left' | 'right' | 'up' | 'down',
  ): void {
    const cx = bx + BTN_SIZE / 2;
    const cy = by + BTN_SIZE / 2;
    const s = 10; // arrow half-size

    gfx.fillStyle(ARROW_COLOR, 0.8);

    switch (dir) {
      case 'left':
        gfx.fillTriangle(cx - s, cy, cx + s * 0.6, cy - s, cx + s * 0.6, cy + s);
        break;
      case 'right':
        gfx.fillTriangle(cx + s, cy, cx - s * 0.6, cy - s, cx - s * 0.6, cy + s);
        break;
      case 'up':
        gfx.fillTriangle(cx, cy - s, cx - s, cy + s * 0.6, cx + s, cy + s * 0.6);
        break;
      case 'down':
        gfx.fillTriangle(cx, cy + s, cx - s, cy - s * 0.6, cx + s, cy - s * 0.6);
        break;
    }
  }
}
