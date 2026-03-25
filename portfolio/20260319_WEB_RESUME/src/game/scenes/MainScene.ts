import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EventTrigger } from '../entities/EventTrigger';
import { UndergroundChamber } from '../entities/UndergroundChamber';
import { RESUME_ZONES } from '../data/resume-data';
import { AudioManager } from '../systems/AudioManager';
import { EventBus } from '../systems/EventBus';
import { COSTUME_FORWARD, COSTUME_BACKWARD } from '../../assets/costume-config';

const WORLD_WIDTH = 4000;
const WORLD_HEIGHT = 480;
const GROUND_Y = WORLD_HEIGHT - 48;
const WARP_PIPE_X = 3700;

export class MainScene extends Phaser.Scene {
  private player!: Player;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private triggers: EventTrigger[] = [];
  private activeTrigger: EventTrigger | null = null;
  private isWarping = false;
  private audio: AudioManager;
  private audioStarted = false;

  // Underground system
  private underground!: UndergroundChamber;
  private isUnderground = false;

  constructor() {
    super({ key: 'MainScene' });
    this.audio = AudioManager.getInstance();
  }

  create(): void {
    // Sky gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e);
    bg.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Stars
    for (let i = 0; i < 120; i++) {
      const sx = Phaser.Math.Between(0, WORLD_WIDTH);
      const sy = Phaser.Math.Between(0, GROUND_Y - 60);
      const size = Phaser.Math.Between(1, 2);
      bg.fillStyle(0xf8f8f8, Phaser.Math.FloatBetween(0.3, 1));
      bg.fillRect(sx, sy, size, size);
    }

    // Ground platform
    this.ground = this.physics.add.staticGroup();
    const groundGfx = this.add.graphics();

    groundGfx.fillStyle(0x4a8c3f);
    groundGfx.fillRect(0, GROUND_Y, WORLD_WIDTH, 8);
    groundGfx.fillStyle(0x8b6914);
    groundGfx.fillRect(0, GROUND_Y + 8, WORLD_WIDTH, 40);
    groundGfx.fillStyle(0x7a5c12);
    for (let x = 0; x < WORLD_WIDTH; x += 16) {
      groundGfx.fillRect(x, GROUND_Y + 20, 8, 2);
    }

    const groundZone = this.add.zone(WORLD_WIDTH / 2, GROUND_Y + 24, WORLD_WIDTH, 48);
    this.physics.add.existing(groundZone, true);
    this.ground.add(groundZone);

    // Create resume zone buildings
    for (const zoneData of RESUME_ZONES) {
      const trigger = new EventTrigger(this, zoneData, GROUND_Y);
      this.triggers.push(trigger);
    }

    // Warp pipe
    this.createWarpPipe();

    // Player
    this.player = new Player(this, 100, GROUND_Y - 48);
    this.physics.add.collider(this.player.sprite, this.ground);

    // Underground chamber (overlay, created once)
    this.underground = new UndergroundChamber(this);

    // Camera
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);

    // World bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Instructions
    const instrText = this.add.text(100, GROUND_Y - 120, '← → เดิน  |  ↑ กระโดด  |  ↓ ดูรายละเอียด\nเดินเข้าตึกเพื่อดู Resume', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
    });
    instrText.setAlpha(0.7);
    this.tweens.add({ targets: instrText, alpha: 0, delay: 5000, duration: 1000 });

    // Audio on first interaction
    const startAudio = async () => {
      if (this.audioStarted) return;
      this.audioStarted = true;
      await this.audio.init();
      this.audio.playBGM();
      this.input.off('pointerdown', startAudio);
      this.input.keyboard?.off('keydown', startAudio);
    };
    this.input.on('pointerdown', startAudio);
    this.input.keyboard?.on('keydown', startAudio);

    // ── Listen for underground requests from Player ──
    EventBus.on('player-request-underground', () => this.enterUnderground());
    EventBus.on('player-request-surface', () => this.exitUnderground());
  }

  // ── Underground transitions ──

  private enterUnderground(): void {
    if (this.isUnderground || !this.activeTrigger) return;
    this.isUnderground = true;

    // Get zone data from active trigger
    const zoneData = this.activeTrigger.getZoneData();

    // Hide info card
    this.activeTrigger.deactivate();

    // Lock player
    this.player.setUnderground(true);
    this.player.sprite.setVisible(false);

    // Show underground chamber
    this.underground.show(zoneData);

    // SFX
    this.audio.playSFX('warp');

    // Emit for React UI
    EventBus.emit('underground-entered', zoneData);
  }

  private exitUnderground(): void {
    if (!this.isUnderground) return;
    this.isUnderground = false;

    // Hide chamber
    this.underground.hide();

    // Unlock player
    this.player.setUnderground(false);
    this.player.sprite.setVisible(true);

    // Re-activate trigger if still in zone
    if (this.activeTrigger) {
      this.activeTrigger.activate();
    }

    // SFX
    this.audio.playSFX('zone-enter');

    // Emit for React UI
    EventBus.emit('underground-exited');
  }

  private createWarpPipe(): void {
    const pipeW = 48;
    const pipeH = 64;
    const pipeX = WARP_PIPE_X;
    const pipeY = GROUND_Y - pipeH;

    const g = this.add.graphics();
    g.fillStyle(0x2d8c2d);
    g.fillRect(pipeX - pipeW / 2 + 4, pipeY + 16, pipeW - 8, pipeH - 16);
    g.fillStyle(0x3dac3d);
    g.fillRect(pipeX - pipeW / 2, pipeY, pipeW, 18);
    g.fillStyle(0x5dcc5d);
    g.fillRect(pipeX - pipeW / 2 + 2, pipeY + 2, 6, 14);
    g.fillRect(pipeX - pipeW / 2 + 6, pipeY + 18, 4, pipeH - 20);
    g.fillStyle(0x1d6c1d);
    g.fillRect(pipeX + pipeW / 2 - 8, pipeY + 2, 6, 14);
    g.fillRect(pipeX + pipeW / 2 - 10, pipeY + 18, 4, pipeH - 20);
    g.fillStyle(0x0a2a0a);
    g.fillRect(pipeX - 8, pipeY + 3, 16, 12);

    const arrowText = this.add.text(pipeX, pipeY - 20, '↓ WARP', {
      fontSize: '8px', color: '#3dac3d', fontFamily: 'monospace', fontStyle: 'bold',
    });
    arrowText.setOrigin(0.5);
    this.tweens.add({ targets: arrowText, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
  }

  private warpPlayer(): void {
    if (this.isWarping || this.isUnderground) return;
    this.isWarping = true;

    this.tweens.add({
      targets: this.player.sprite,
      scaleX: 0, scaleY: 0, alpha: 0,
      duration: 400, ease: 'Power2',
      onComplete: () => {
        this.player.sprite.setPosition(100, GROUND_Y - 48);
        this.player.sprite.setVelocity(0, 0);

        // Fix: set scale immediately so physics body syncs correctly
        this.player.sprite.setScale(3);
        const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.updateFromGameObject();
        }

        if (this.activeTrigger) {
          this.activeTrigger.deactivate();
          this.activeTrigger = null;
        }
        // Reset to initial costume (student)
        this.player.setCostume(0);
        // Tween only alpha (scale already set) to avoid physics desync
        this.tweens.add({
          targets: this.player.sprite,
          alpha: 1,
          duration: 400, ease: 'Back.easeOut',
          onComplete: () => { this.isWarping = false; },
        });
      },
    });
  }

  update(): void {
    if (this.isWarping) return;

    // When underground, only update player (for UP key detection)
    if (this.isUnderground) {
      this.player.update();
      return;
    }

    this.player.update();

    // Check trigger zones
    const playerX = this.player.sprite.x;
    let foundTrigger: EventTrigger | null = null;

    for (const trigger of this.triggers) {
      const zone = trigger.getZone();
      const zoneLeft = zone.x - zone.width / 2;
      const zoneRight = zone.x + zone.width / 2;
      if (playerX >= zoneLeft && playerX <= zoneRight) {
        foundTrigger = trigger;
        break;
      }
    }

    if (foundTrigger !== this.activeTrigger) {
      if (this.activeTrigger) {
        // Check costume change when EXITING a zone
        const exitZone = this.activeTrigger.getZoneData();
        const zoneX = exitZone.worldX;
        if (playerX > zoneX) {
          // Exiting RIGHT → upgrade costume
          const next = COSTUME_FORWARD[exitZone.id];
          if (next !== undefined) this.player.setCostume(next);
        } else {
          // Exiting LEFT → downgrade costume
          const prev = COSTUME_BACKWARD[exitZone.id];
          if (prev !== undefined) this.player.setCostume(prev);
        }
        this.activeTrigger.deactivate();
        this.audio.playSFX('zone-exit');
      }
      if (foundTrigger) {
        foundTrigger.activate();
        this.audio.playSFX('zone-enter');
      }
      this.activeTrigger = foundTrigger;
    }

    this.player.setInZone(!!foundTrigger);

    // Check warp pipe
    if (playerX >= WARP_PIPE_X - 30 && playerX <= WARP_PIPE_X + 30) {
      this.audio.playSFX('warp');
      this.warpPlayer();
    }
  }
}
