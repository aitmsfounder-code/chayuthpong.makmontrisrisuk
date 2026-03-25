import Phaser from 'phaser';
import type { ResumeZone } from '../data/resume-data';

const CHAMBER_W = 700;
const CHAMBER_H = 420;

/**
 * UndergroundChamber — overlay that shows detailed resume content
 * when the player "descends" into a building zone.
 *
 * Renders as a full-screen overlay on top of the game canvas.
 * Uses Phaser Graphics + Text (fixed to camera).
 */
export class UndergroundChamber {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible = false;
  private scrollY = 0;
  private maxScrollY = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0); // Fixed to camera
    this.container.setDepth(100);
    this.container.setAlpha(0);
    this.container.setVisible(false);
  }

  show(zone: ResumeZone): void {
    this.visible = true;
    this.scrollY = 0;
    this.buildChamber(zone);
    this.container.setVisible(true);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
    });
  }

  hide(): void {
    this.visible = false;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false);
        this.container.removeAll(true);
      },
    });
  }

  isVisible(): boolean {
    return this.visible;
  }

  /** Scroll content up/down with arrow keys */
  scroll(direction: number): void {
    if (!this.visible) return;
    this.scrollY = Phaser.Math.Clamp(this.scrollY + direction * 30, 0, this.maxScrollY);
    // Move content within container
    const content = this.container.getByName('content-group') as Phaser.GameObjects.Container;
    if (content) {
      content.y = 80 - this.scrollY;
    }
  }

  private buildChamber(zone: ResumeZone): void {
    this.container.removeAll(true);

    const cx = 400; // Center of 800px canvas
    const cy = 240; // Center of 480px canvas
    const left = cx - CHAMBER_W / 2;
    const top = cy - CHAMBER_H / 2;

    // Accent colors per zone
    const accentColors: Record<string, number> = {
      'education': 0x4a6fa5, 'experience-1': 0x6b4a8c, 'experience-2': 0x8c4a6b,
      'experience-3': 0x4a8c6b, 'experience-4': 0x8c6b4a, 'experience-5': 0x7a5a9c,
      'skills': 0x4a8c8c, 'certifications': 0x8c8c4a, 'contact': 0x6b8c4a,
    };
    const accent = accentColors[zone.id] ?? 0x3898d8;

    // ── Background overlay (darken everything) ──
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, 800, 480);
    this.container.add(overlay);

    // ── Chamber background (brick-style) ──
    const bg = this.scene.add.graphics();

    // Main chamber bg
    bg.fillStyle(0x1a1020, 0.95);
    bg.fillRect(left, top, CHAMBER_W, CHAMBER_H);

    // Brick pattern
    bg.fillStyle(0x2a2040, 0.6);
    for (let row = 0; row < CHAMBER_H / 12; row++) {
      for (let col = 0; col < CHAMBER_W / 20; col++) {
        const bx = left + col * 20 + (row % 2 === 0 ? 0 : 10);
        const by = top + row * 12;
        bg.fillRect(bx + 1, by + 1, 18, 10);
      }
    }

    // Border
    bg.lineStyle(3, accent, 1);
    bg.strokeRect(left, top, CHAMBER_W, CHAMBER_H);

    // Floor line
    bg.fillStyle(0x4a3a2a);
    bg.fillRect(left, top + CHAMBER_H - 8, CHAMBER_W, 8);

    this.container.add(bg);

    // ── Stairs icon (top-left) ──
    const stairs = this.scene.add.graphics();
    const sx = left + 15;
    const sy = top + 10;
    stairs.fillStyle(0x8b6914);
    for (let i = 0; i < 4; i++) {
      stairs.fillRect(sx + i * 8, sy + i * 6, 30 - i * 6, 6);
    }
    this.container.add(stairs);

    // ── Header ──
    const headerBg = this.scene.add.graphics();
    headerBg.fillStyle(accent, 0.8);
    headerBg.fillRect(left, top, CHAMBER_W, 40);
    this.container.add(headerBg);

    const heading = this.scene.add.text(cx, top + 8, `${zone.icon}  ${zone.content.heading}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    heading.setOrigin(0.5, 0);
    this.container.add(heading);

    if (zone.content.subtitle) {
      const subtitle = this.scene.add.text(cx, top + 26, zone.content.subtitle, {
        fontSize: '9px',
        color: '#cccccc',
        fontFamily: 'monospace',
      });
      subtitle.setOrigin(0.5, 0);
      this.container.add(subtitle);
    }

    // ── Content items ──
    const contentGroup = this.scene.add.container(0, 80);
    contentGroup.setName('content-group');

    let yPos = top;
    const contentLeft = left + 25;
    const contentWidth = CHAMBER_W - 50;

    for (const item of zone.content.items) {
      // Item title
      const titleText = this.scene.add.text(contentLeft, yPos, `▸ ${item.title}`, {
        fontSize: '13px',
        color: '#f8e878',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        wordWrap: { width: contentWidth },
      });
      contentGroup.add(titleText);
      yPos += titleText.height + 4;

      // Period
      if (item.period) {
        const periodText = this.scene.add.text(contentLeft + 14, yPos, item.period, {
          fontSize: '9px',
          color: '#' + accent.toString(16).padStart(6, '0'),
          fontFamily: 'monospace',
          fontStyle: 'bold',
        });
        contentGroup.add(periodText);
        yPos += periodText.height + 3;
      }

      // Subtitle
      if (item.subtitle) {
        const subText = this.scene.add.text(contentLeft + 14, yPos, item.subtitle, {
          fontSize: '10px',
          color: '#aaaaaa',
          fontFamily: 'monospace',
          fontStyle: 'italic',
          wordWrap: { width: contentWidth - 14 },
        });
        contentGroup.add(subText);
        yPos += subText.height + 3;
      }

      // Description
      if (item.description) {
        const descText = this.scene.add.text(contentLeft + 14, yPos, item.description, {
          fontSize: '10px',
          color: '#dddddd',
          fontFamily: 'monospace',
          wordWrap: { width: contentWidth - 14 },
        });
        contentGroup.add(descText);
        yPos += descText.height + 4;
      }

      // Tags
      if (item.tags && item.tags.length > 0) {
        let tagX = contentLeft + 14;
        for (const tag of item.tags) {
          const tagBg = this.scene.add.graphics();
          const tagW = tag.length * 7 + 10;
          tagBg.fillStyle(accent, 0.5);
          tagBg.fillRoundedRect(tagX, yPos, tagW, 14, 3);
          contentGroup.add(tagBg);

          const tagText = this.scene.add.text(tagX + 5, yPos + 1, tag, {
            fontSize: '8px',
            color: '#ffffff',
            fontFamily: 'monospace',
          });
          contentGroup.add(tagText);
          tagX += tagW + 5;

          if (tagX > contentLeft + contentWidth - 60) {
            tagX = contentLeft + 14;
            yPos += 18;
          }
        }
        yPos += 18;
      }

      // Bullets
      if (item.bullets) {
        for (const bullet of item.bullets) {
          const bulletText = this.scene.add.text(contentLeft + 14, yPos, `  ${bullet}`, {
            fontSize: '10px',
            color: '#cccccc',
            fontFamily: 'monospace',
            wordWrap: { width: contentWidth - 28 },
          });
          contentGroup.add(bulletText);
          yPos += bulletText.height + 3;
        }
      }

      yPos += 12; // Gap between items
    }

    // Calculate max scroll
    const totalContentHeight = yPos - top;
    const visibleHeight = CHAMBER_H - 80 - 30; // minus header and footer
    this.maxScrollY = Math.max(0, totalContentHeight - visibleHeight);

    this.container.add(contentGroup);

    // ── Footer: instructions ──
    const footer = this.scene.add.text(cx, top + CHAMBER_H - 18, '↑ กลับขึ้น' + (this.maxScrollY > 0 ? '  |  ↑↓ เลื่อนดู' : ''), {
      fontSize: '9px',
      color: '#888888',
      fontFamily: 'monospace',
    });
    footer.setOrigin(0.5, 0);
    this.container.add(footer);

    // Pulsing footer
    this.scene.tweens.add({
      targets: footer,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }
}
