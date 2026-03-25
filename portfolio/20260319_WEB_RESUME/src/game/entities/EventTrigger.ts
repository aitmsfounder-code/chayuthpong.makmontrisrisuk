import Phaser from 'phaser';
import { EventBus } from '../systems/EventBus';
import type { ResumeZone, InfoCard } from '../data/resume-data';

// Sky occupies from y=0 to GROUND_Y (~432). 80% of that = ~345px
const SKY_TOP = 10;
const CARD_HEIGHT = 300; // ~80% of sky
const CARD_WIDTH = 350;

export class EventTrigger {
  private zone: Phaser.GameObjects.Zone;
  private label: Phaser.GameObjects.Text;
  private icon: Phaser.GameObjects.Text;
  private isActive = false;
  private building: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;
  private worldX: number;

  // InfoCard elements
  private cardBg: Phaser.GameObjects.Graphics | null = null;
  private cardTexts: Phaser.GameObjects.Text[] = [];

  constructor(
    scene: Phaser.Scene,
    zoneData: ResumeZone,
    groundY: number,
  ) {
    this.scene = scene;
    const { worldX, title, icon, id, infoCard } = zoneData;
    this.worldX = worldX;
    const buildingWidth = 80;
    const buildingHeight = Phaser.Math.Between(80, 130);
    const buildingY = groundY - buildingHeight;

    // Draw building
    this.building = scene.add.graphics();
    this.drawBuilding(worldX - buildingWidth / 2, buildingY, buildingWidth, buildingHeight, id);

    // Icon on building
    this.icon = scene.add.text(worldX, buildingY - 16, icon, { fontSize: '20px' });
    this.icon.setOrigin(0.5);

    // Label under building
    this.label = scene.add.text(worldX, groundY + 8, title, {
      fontSize: '8px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 },
    });
    this.label.setOrigin(0.5, 0);

    // Create info card (hidden)
    if (infoCard) {
      this.createInfoCard(infoCard, id);
    }

    // Trigger zone
    this.zone = scene.add.zone(worldX, groundY - buildingHeight / 2, buildingWidth + 40, buildingHeight + 40);
    scene.physics.add.existing(this.zone, true);
    (this.zone as unknown as { zoneData: ResumeZone }).zoneData = zoneData;
  }

  private createInfoCard(card: InfoCard, id: string): void {
    const cx = this.worldX;
    const left = cx - CARD_WIDTH / 2;

    // Colors per zone
    const accentColors: Record<string, number> = {
      'education': 0x4a6fa5, 'experience-1': 0x6b4a8c, 'experience-2': 0x8c4a6b,
      'experience-3': 0x4a8c6b, 'experience-4': 0x8c6b4a, 'experience-5': 0x7a5a9c,
      'skills': 0x4a8c8c, 'certifications': 0x8c8c4a, 'contact': 0x6b8c4a,
    };
    const accent = accentColors[id] ?? 0x3898d8;

    // Background
    this.cardBg = this.scene.add.graphics();
    const g = this.cardBg;

    // Main card background
    g.fillStyle(0x0c0c24, 0.92);
    g.fillRect(left, SKY_TOP, CARD_WIDTH, CARD_HEIGHT);

    // Border
    g.lineStyle(3, accent, 1);
    g.strokeRect(left, SKY_TOP, CARD_WIDTH, CARD_HEIGHT);

    // Accent top bar
    g.fillStyle(accent, 0.9);
    g.fillRect(left, SKY_TOP, CARD_WIDTH, 6);

    // Section dividers
    const sections = [SKY_TOP + 75, SKY_TOP + 150, SKY_TOP + 225];
    for (const sy of sections) {
      g.lineStyle(1, accent, 0.4);
      g.lineBetween(left + 20, sy, left + CARD_WIDTH - 20, sy);
    }

    // Use custom labels if provided, otherwise defaults
    const defaultLabels = ['📅 PERIOD', '🏢 COMPANY', '💼 POSITION', '🏷 DIVISION'];
    const sectionLabels = card.labels ?? defaultLabels;
    const sectionValues = [card.period, card.company, card.position, card.division];
    const sectionTops = [SKY_TOP + 10, SKY_TOP + 85, SKY_TOP + 160, SKY_TOP + 235];

    for (let i = 0; i < 4; i++) {
      // Section label
      const labelText = this.scene.add.text(cx, sectionTops[i], sectionLabels[i], {
        fontSize: '10px',
        color: '#' + accent.toString(16).padStart(6, '0'),
        fontFamily: 'monospace',
        fontStyle: 'bold',
        letterSpacing: 2,
      });
      labelText.setOrigin(0.5, 0);
      labelText.setAlpha(0);
      labelText.setDepth(21);
      this.cardTexts.push(labelText);

      // Auto-size font: shrink if text is too long to fit in one line
      const value = sectionValues[i];
      let fontSize = 16;
      const maxWidth = CARD_WIDTH - 40;
      // Estimate: monospace char width ≈ fontSize * 0.6
      while (value.length * fontSize * 0.6 > maxWidth && fontSize > 9) {
        fontSize--;
      }

      const valueText = this.scene.add.text(cx, sectionTops[i] + 20, value, {
        fontSize: `${fontSize}px`,
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        align: 'center',
      });
      valueText.setOrigin(0.5, 0);
      valueText.setAlpha(0);
      valueText.setDepth(21);
      this.cardTexts.push(valueText);
    }

    g.setAlpha(0);
    g.setDepth(20);
  }

  private showCard(): void {
    if (this.cardBg) {
      this.scene.tweens.add({ targets: this.cardBg, alpha: 1, duration: 300, ease: 'Power2' });
    }
    this.cardTexts.forEach((t, i) => {
      this.scene.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 80 + i * 60, ease: 'Power2' });
    });
  }

  private hideCard(): void {
    if (this.cardBg) {
      this.scene.tweens.add({ targets: this.cardBg, alpha: 0, duration: 200 });
    }
    this.cardTexts.forEach((t) => {
      this.scene.tweens.add({ targets: t, alpha: 0, duration: 150 });
    });
  }

  private drawBuilding(x: number, y: number, w: number, h: number, id: string): void {
    const g = this.building;
    const colors: Record<string, number> = {
      'education': 0x4a6fa5, 'experience-1': 0x6b4a8c, 'experience-2': 0x8c4a6b,
      'experience-3': 0x4a8c6b, 'experience-4': 0x8c6b4a, 'experience-5': 0x7a5a9c,
      'skills': 0x4a8c8c, 'certifications': 0x8c8c4a, 'contact': 0x6b8c4a,
    };
    const color = colors[id] ?? 0x555577;

    g.fillStyle(color);
    g.fillRect(x, y, w, h);
    g.lineStyle(1, 0xffffff, 0.3);
    g.strokeRect(x, y, w, h);

    // Windows
    g.fillStyle(0xf8e878, 0.7);
    const gap = 14;
    const cols = Math.floor((w - 16) / gap);
    const rows = Math.floor((h - 20) / gap);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.3) g.fillRect(x + 10 + col * gap, y + 10 + row * gap, 8, 8);
      }
    }

    // Door
    g.fillStyle(0x3a3a5a);
    g.fillRect(x + w / 2 - 8, y + h - 20, 16, 20);
  }

  getZone(): Phaser.GameObjects.Zone { return this.zone; }

  getZoneData(): ResumeZone {
    return (this.zone as unknown as { zoneData: ResumeZone }).zoneData;
  }

  activate(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.label.setStyle({ backgroundColor: '#3898d8cc' });
    this.showCard();
    const zoneData = (this.zone as unknown as { zoneData: ResumeZone }).zoneData;
    EventBus.emit('zone-entered', zoneData);
  }

  deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.label.setStyle({ backgroundColor: '#00000088' });
    this.hideCard();
    EventBus.emit('zone-exited');
  }
}
