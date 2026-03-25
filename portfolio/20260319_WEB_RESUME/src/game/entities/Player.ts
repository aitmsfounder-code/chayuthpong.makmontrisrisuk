import Phaser from 'phaser';
import { AudioManager } from '../systems/AudioManager';
import { EventBus } from '../systems/EventBus';
import { TouchState } from '../systems/TouchState';
import { FRAMES_PER_COSTUME } from '../../assets/generate-sprite';

const SPEED = 160;
const JUMP_VELOCITY = -330;

export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private inZone = false;
  private isUnderground = false;
  private audio: AudioManager;
  private downJustPressed = false;
  private upJustPressed = false;
  private lastDirection: 'left' | 'right' = 'right';
  private costumeIndex = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setScale(3);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.1);
    this.sprite.setSize(16, 22);
    this.sprite.setOffset(8, 10);

    this.createAnimations(0);
    this.sprite.play('idle-front');

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.audio = AudioManager.getInstance();
  }

  /** Create/recreate all animations for a given costume index */
  private createAnimations(costumeIdx: number): void {
    const scene = this.scene;
    const anims = scene.anims;
    const base = costumeIdx * FRAMES_PER_COSTUME;

    // Remove existing animations (safe if they don't exist)
    const keys = ['idle', 'walk', 'idle-front', 'idle-back', 'idle-left', 'walk-left'];
    for (const key of keys) {
      if (anims.exists(key)) anims.remove(key);
    }

    // Side idle RIGHT (frames base+0..3)
    anims.create({
      key: 'idle',
      frames: anims.generateFrameNumbers('player', { start: base, end: base + 3 }),
      frameRate: 4, repeat: -1,
    });

    // Side walk RIGHT (frames base+4..9)
    anims.create({
      key: 'walk',
      frames: anims.generateFrameNumbers('player', { start: base + 4, end: base + 9 }),
      frameRate: 10, repeat: -1,
    });

    // Front-facing idle (frames base+10..11)
    anims.create({
      key: 'idle-front',
      frames: anims.generateFrameNumbers('player', { start: base + 10, end: base + 11 }),
      frameRate: 3, repeat: -1,
    });

    // Back-facing idle (frames base+12..13)
    anims.create({
      key: 'idle-back',
      frames: anims.generateFrameNumbers('player', { start: base + 12, end: base + 13 }),
      frameRate: 3, repeat: -1,
    });

    // Side idle LEFT (frames base+14..17)
    anims.create({
      key: 'idle-left',
      frames: anims.generateFrameNumbers('player', { start: base + 14, end: base + 17 }),
      frameRate: 4, repeat: -1,
    });

    // Side walk LEFT (frames base+18..23)
    anims.create({
      key: 'walk-left',
      frames: anims.generateFrameNumbers('player', { start: base + 18, end: base + 23 }),
      frameRate: 10, repeat: -1,
    });
  }

  setCostume(index: number): void {
    if (index === this.costumeIndex) return;
    this.costumeIndex = index;
    // Remember current animation key
    const currentKey = this.sprite.anims.currentAnim?.key ?? 'idle-front';
    this.createAnimations(index);
    // Resume same animation with new costume frames
    this.sprite.play(currentKey, true);
  }

  getCostumeIndex(): number {
    return this.costumeIndex;
  }

  setInZone(value: boolean): void {
    this.inZone = value;
  }

  setUnderground(value: boolean): void {
    this.isUnderground = value;
  }

  getIsUnderground(): boolean {
    return this.isUnderground;
  }

  update(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    // ── Underground mode: lock horizontal, only UP to exit ──
    if (this.isUnderground) {
      this.sprite.setVelocityX(0);
      this.sprite.setVelocityY(0);
      this.sprite.play('idle-front', true);

      if ((this.cursors.up.isDown || TouchState.up) && !this.upJustPressed) {
        this.upJustPressed = true;
        EventBus.emit('player-request-surface');
      }
      if (!this.cursors.up.isDown && !TouchState.up) {
        this.upJustPressed = false;
      }
      return;
    }

    // ── Surface mode: normal movement ──

    if (this.cursors.left.isDown || TouchState.left) {
      this.sprite.setVelocityX(-SPEED);
      this.sprite.setFlipX(false);
      this.lastDirection = 'left';
      if (onGround) {
        this.sprite.play('walk-left', true);
        this.audio.playSFX('walk');
      }
    } else if (this.cursors.right.isDown || TouchState.right) {
      this.sprite.setVelocityX(SPEED);
      this.sprite.setFlipX(false);
      this.lastDirection = 'right';
      if (onGround) {
        this.sprite.play('walk', true);
        this.audio.playSFX('walk');
      }
    } else {
      this.sprite.setVelocityX(0);
      if (onGround) {
        if (this.inZone) {
          this.sprite.play('idle-back', true);
        } else {
          this.sprite.play(this.lastDirection === 'left' ? 'idle-left' : 'idle', true);
        }
      }
    }

    // Jump
    if ((this.cursors.up.isDown || this.cursors.space?.isDown || TouchState.up) && onGround) {
      this.sprite.setVelocityY(JUMP_VELOCITY);
      this.audio.playSFX('jump');
    }

    // DOWN in zone → request underground (one-shot)
    if ((this.cursors.down.isDown || TouchState.down) && this.inZone && onGround && !this.downJustPressed) {
      this.downJustPressed = true;
      EventBus.emit('player-request-underground');
    }
    if (!this.cursors.down.isDown && !TouchState.down) {
      this.downJustPressed = false;
    }
  }
}
