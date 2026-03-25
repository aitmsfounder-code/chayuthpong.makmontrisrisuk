import Phaser from 'phaser';
import { generateSpriteSheet } from '../../assets/generate-sprite';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Generate sprite sheet from canvas → convert to data URL → load as image
    const canvas = generateSpriteSheet();
    const dataUrl = canvas.toDataURL('image/png');
    this.load.spritesheet('player', dataUrl, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(): void {
    this.scene.start('MainScene');
  }
}
