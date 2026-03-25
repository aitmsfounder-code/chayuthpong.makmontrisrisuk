/**
 * AudioManager — Famicom/NES-style chiptune audio system
 *
 * Pure Web Audio API synthesis. No external audio files.
 * BGM: D Mixolydian (D E F# G A B C D), ~130 BPM, 4 channels
 * SFX: walk, jump, zone-enter, zone-exit, warp
 */

// ── Note frequency helpers ──────────────────────────────────────────

/** MIDI note → frequency */
const midiToFreq = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);

// D Mixolydian: D E F# G A B C D
// MIDI reference: D3=50, E3=52, F#3=54, G3=55, A3=57, B3=59, C4=60, D4=62
const NOTE: Record<string, number> = {
  // Octave 2
  D2: midiToFreq(38),
  A2: midiToFreq(45),
  G2: midiToFreq(43),
  E2: midiToFreq(40),
  C3: midiToFreq(48),
  B2: midiToFreq(47),
  // Octave 3
  D3: midiToFreq(50),
  E3: midiToFreq(52),
  Fs3: midiToFreq(54),
  G3: midiToFreq(55),
  A3: midiToFreq(57),
  B3: midiToFreq(59),
  C4: midiToFreq(60),
  // Octave 4
  D4: midiToFreq(62),
  E4: midiToFreq(64),
  Fs4: midiToFreq(66),
  G4: midiToFreq(67),
  A4: midiToFreq(69),
  B4: midiToFreq(71),
  C5: midiToFreq(72),
  D5: midiToFreq(74),
};

// ── Types ───────────────────────────────────────────────────────────

type SFXName = 'walk' | 'jump' | 'zone-enter' | 'zone-exit' | 'warp';

interface NoteEvent {
  freq: number; // 0 = rest
  dur: number;  // in beats (1 = quarter note)
}

// ── AudioManager Singleton ──────────────────────────────────────────

export class AudioManager {
  private static instance: AudioManager | null = null;

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private bgmNodes: AudioNode[] = [];
  private bgmPlaying = false;
  private muted = false;
  private volume = 0.15;

  private lastWalkTime = 0;
  private readonly WALK_THROTTLE_MS = 200;

  // Whether AudioContext has been initialised via user gesture
  private initialised = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // ── Initialisation ──────────────────────────────────────────────

  /**
   * Call once on first user interaction (click / key).
   * Creates & resumes the AudioContext.
   */
  async init(): Promise<void> {
    if (this.initialised) return;

    this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Master → destination
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);

    // BGM bus
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.4;
    this.bgmGain.connect(this.masterGain);

    // SFX bus
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 2.5;
    this.sfxGain.connect(this.masterGain);

    this.initialised = true;
  }

  // ── Public API ──────────────────────────────────────────────────

  playBGM(): void {
    if (!this.ctx || this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.scheduleBGMLoop();
  }

  stopBGM(): void {
    this.bgmPlaying = false;
    for (const n of this.bgmNodes) {
      try { (n as OscillatorNode).stop?.(); } catch { /* already stopped */ }
    }
    this.bgmNodes = [];
  }

  playSFX(name: SFXName): void {
    if (!this.ctx || !this.initialised) return;

    // Walk throttle
    if (name === 'walk') {
      const now = performance.now();
      if (now - this.lastWalkTime < this.WALK_THROTTLE_MS) return;
      this.lastWalkTime = now;
    }

    switch (name) {
      case 'walk':   this.sfxWalk();      break;
      case 'jump':   this.sfxJump();      break;
      case 'zone-enter': this.sfxZoneEnter(); break;
      case 'zone-exit':  this.sfxZoneExit();  break;
      case 'warp':   this.sfxWarp();      break;
    }
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  isReady(): boolean {
    return this.initialised;
  }

  destroy(): void {
    this.stopBGM();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialised = false;
    AudioManager.instance = null;
  }

  // ── BGM Composition ─────────────────────────────────────────────
  //
  //  D Mixolydian, ~130 BPM, 16 bars
  //  Channels: square melody, square harmony, triangle bass, noise drums
  //

  private get BPM(): number { return 130; }
  private get beatSec(): number { return 60 / this.BPM; }

  /**
   * Schedule one full loop of BGM, then re-schedule if still playing.
   */
  private scheduleBGMLoop(): void {
    if (!this.ctx || !this.bgmPlaying) return;

    const now = this.ctx.currentTime + 0.05; // tiny offset to avoid clicks

    const loopBars = 16;
    const beatsPerBar = 4;
    const totalBeats = loopBars * beatsPerBar;
    const loopDuration = totalBeats * this.beatSec;

    // Schedule all four channels
    this.scheduleMelody(now);
    this.scheduleHarmony(now);
    this.scheduleBass(now);
    this.scheduleDrums(now, totalBeats);

    // Re-schedule next loop slightly before current one ends
    const nextLoopDelay = (loopDuration - 0.1) * 1000;
    setTimeout(() => {
      if (this.bgmPlaying) this.scheduleBGMLoop();
    }, nextLoopDelay);
  }

  // ── Melody (Square wave, channel 1) ─────────────────────────────
  //
  // A catchy 8-bar phrase played twice (= 16 bars).
  // D Mixolydian flavour — uses the flat-7th (C natural) for colour.
  //

  private getMelodyPhrase(): NoteEvent[] {
    const q = 1;   // quarter
    const e = 0.5; // eighth
    const h = 2;   // half
    const dt = 1.5; // dotted quarter

    // 8-bar melody phrase
    return [
      // Bar 1: opening motif
      { freq: NOTE.D4, dur: e }, { freq: NOTE.Fs4, dur: e },
      { freq: NOTE.A4, dur: q }, { freq: NOTE.G4, dur: q },
      { freq: NOTE.Fs4, dur: q },
      // Bar 2
      { freq: NOTE.E4, dur: e }, { freq: NOTE.D4, dur: e },
      { freq: NOTE.E4, dur: q }, { freq: NOTE.Fs4, dur: h },
      // Bar 3: ascending run
      { freq: NOTE.D4, dur: e }, { freq: NOTE.E4, dur: e },
      { freq: NOTE.Fs4, dur: e }, { freq: NOTE.G4, dur: e },
      { freq: NOTE.A4, dur: q }, { freq: NOTE.B4, dur: q },
      // Bar 4: resolve down with Mixolydian C
      { freq: NOTE.A4, dur: q }, { freq: NOTE.G4, dur: q },
      { freq: NOTE.Fs4, dur: q }, { freq: NOTE.E4, dur: q },
      // Bar 5: repeat motif variation
      { freq: NOTE.D4, dur: e }, { freq: NOTE.Fs4, dur: e },
      { freq: NOTE.A4, dur: q }, { freq: NOTE.B4, dur: q },
      { freq: NOTE.A4, dur: q },
      // Bar 6: descend with C natural (flat 7th)
      { freq: NOTE.G4, dur: q }, { freq: NOTE.Fs4, dur: e },
      { freq: NOTE.E4, dur: e }, { freq: NOTE.D4, dur: q },
      { freq: NOTE.C5, dur: q },
      // Bar 7: playful syncopation
      { freq: NOTE.B4, dur: e }, { freq: NOTE.A4, dur: dt },
      { freq: NOTE.G4, dur: e }, { freq: NOTE.Fs4, dur: dt },
      // Bar 8: ending phrase — resolve to D
      { freq: NOTE.E4, dur: q }, { freq: NOTE.Fs4, dur: q },
      { freq: NOTE.D4, dur: h },
    ];
  }

  private scheduleMelody(startTime: number): void {
    const phrase = this.getMelodyPhrase();
    // Play phrase twice for 16 bars
    const allNotes = [...phrase, ...phrase];
    this.scheduleSquareChannel(allNotes, startTime, 0.35, 'square');
  }

  // ── Harmony (Square wave, channel 2) ────────────────────────────
  //
  // Simpler counter-melody — mostly thirds/fifths below the melody.
  //

  private getHarmonyPhrase(): NoteEvent[] {
    const q = 1;
    const h = 2;

    return [
      // Bar 1-2: sustained chords
      { freq: NOTE.Fs3, dur: h }, { freq: NOTE.A3, dur: h },
      { freq: NOTE.D3, dur: h }, { freq: NOTE.Fs3, dur: h },
      // Bar 3-4
      { freq: NOTE.D3, dur: q }, { freq: NOTE.E3, dur: q },
      { freq: NOTE.Fs3, dur: q }, { freq: NOTE.G3, dur: q },
      { freq: NOTE.Fs3, dur: h }, { freq: NOTE.E3, dur: h },
      // Bar 5-6
      { freq: NOTE.Fs3, dur: h }, { freq: NOTE.A3, dur: h },
      { freq: NOTE.G3, dur: h }, { freq: NOTE.E3, dur: h },
      // Bar 7-8
      { freq: NOTE.G3, dur: q }, { freq: NOTE.Fs3, dur: q },
      { freq: NOTE.E3, dur: q }, { freq: NOTE.D3, dur: q },
      { freq: NOTE.E3, dur: q }, { freq: NOTE.Fs3, dur: q },
      { freq: NOTE.D3, dur: h },
    ];
  }

  private scheduleHarmony(startTime: number): void {
    const phrase = this.getHarmonyPhrase();
    const allNotes = [...phrase, ...phrase];
    this.scheduleSquareChannel(allNotes, startTime, 0.2, 'square');
  }

  // ── Bass (Triangle wave, channel 3) ─────────────────────────────
  //
  // Root–fifth pattern, 1 bar each, repeating.
  //

  private getBassPattern(): NoteEvent[] {
    const q = 1;

    // 4-bar bass loop (repeated 4x = 16 bars)
    return [
      // Bar 1: D
      { freq: NOTE.D2, dur: q }, { freq: NOTE.D2, dur: q },
      { freq: NOTE.A2, dur: q }, { freq: NOTE.D2, dur: q },
      // Bar 2: G
      { freq: NOTE.G2, dur: q }, { freq: NOTE.G2, dur: q },
      { freq: NOTE.D3, dur: q }, { freq: NOTE.G2, dur: q },
      // Bar 3: A
      { freq: NOTE.A2, dur: q }, { freq: NOTE.A2, dur: q },
      { freq: NOTE.E3, dur: q }, { freq: NOTE.A2, dur: q },
      // Bar 4: D → C (Mixolydian colour)
      { freq: NOTE.D2, dur: q }, { freq: NOTE.A2, dur: q },
      { freq: NOTE.C3, dur: q }, { freq: NOTE.D2, dur: q },
    ];
  }

  private scheduleBass(startTime: number): void {
    const pattern = this.getBassPattern();
    // Repeat 4x for 16 bars
    const allNotes = [...pattern, ...pattern, ...pattern, ...pattern];
    this.scheduleTriangleChannel(allNotes, startTime, 0.45);
  }

  // ── Drums (Noise channel) ───────────────────────────────────────
  //
  // Simple kick-snare with hi-hat.
  // 1 beat = 1 quarter note. Each bar = 4 beats.
  //

  private scheduleDrums(startTime: number, totalBeats: number): void {
    if (!this.ctx || !this.bgmGain) return;

    for (let beat = 0; beat < totalBeats; beat++) {
      const t = startTime + beat * this.beatSec;
      const beatInBar = beat % 4;

      // Kick on beats 0, 2
      if (beatInBar === 0 || beatInBar === 2) {
        this.scheduleNoiseHit(t, 0.06, 80, 0.3);  // short, low-pass → kick
      }

      // Snare on beats 1, 3
      if (beatInBar === 1 || beatInBar === 3) {
        this.scheduleNoiseHit(t, 0.08, 3000, 0.15); // longer, high-pass → snare
      }

      // Hi-hat on every eighth note
      this.scheduleNoiseHit(t, 0.03, 8000, 0.06);
      this.scheduleNoiseHit(t + this.beatSec / 2, 0.025, 8000, 0.04);
    }
  }

  // ── Channel schedulers ──────────────────────────────────────────

  private scheduleSquareChannel(
    notes: NoteEvent[],
    startTime: number,
    volume: number,
    type: OscillatorType,
  ): void {
    if (!this.ctx || !this.bgmGain) return;

    let t = startTime;

    for (const { freq, dur } of notes) {
      const durSec = dur * this.beatSec;

      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        // NES-style envelope: quick attack, sustain, short release
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.01);
        gain.gain.setValueAtTime(volume, t + durSec - 0.02);
        gain.gain.linearRampToValueAtTime(0, t + durSec);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + durSec);
        this.bgmNodes.push(osc);
      }

      t += durSec;
    }
  }

  private scheduleTriangleChannel(
    notes: NoteEvent[],
    startTime: number,
    volume: number,
  ): void {
    if (!this.ctx || !this.bgmGain) return;

    let t = startTime;

    for (const { freq, dur } of notes) {
      const durSec = dur * this.beatSec;

      if (freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        // Triangle is softer — gentle envelope
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume, t + 0.005);
        gain.gain.setValueAtTime(volume * 0.8, t + durSec - 0.01);
        gain.gain.linearRampToValueAtTime(0, t + durSec);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + durSec);
        this.bgmNodes.push(osc);
      }

      t += durSec;
    }
  }

  private scheduleNoiseHit(
    time: number,
    duration: number,
    filterFreq: number,
    volume: number,
  ): void {
    if (!this.ctx || !this.bgmGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // White noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterFreq < 500 ? 'lowpass' : 'highpass';
    filter.frequency.value = filterFreq;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    source.start(time);
    source.stop(time + duration);
    this.bgmNodes.push(source);
  }

  // ── Sound Effects ───────────────────────────────────────────────

  /** Walk tick — short square blip */
  private sfxWalk(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(330, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /** Jump — rising pitch sweep */
  private sfxJump(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Start at E4, sweep up to B5 — different from classic Mario
    osc.frequency.setValueAtTime(NOTE.E4, t);
    osc.frequency.exponentialRampToValueAtTime(NOTE.B4 * 2, t + 0.15);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Zone enter — ascending 3-note arpeggio (D-F#-A) */
  private sfxZoneEnter(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [NOTE.D4, NOTE.Fs4, NOTE.A4];
    const noteLen = 0.1;

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.value = freq;

      const start = t + i * noteLen;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.01);
      gain.gain.setValueAtTime(0.2, start + noteLen - 0.02);
      gain.gain.linearRampToValueAtTime(0, start + noteLen + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + noteLen + 0.05);
    });
  }

  /** Zone exit — descending 2-note chime (A-D) */
  private sfxZoneExit(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [NOTE.A4, NOTE.D4];
    const noteLen = 0.12;

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const start = t + i * noteLen;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + noteLen + 0.1);
    });
  }

  /** Warp — descending pitch sweep with vibrato */
  private sfxWarp(): void {
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Main oscillator — descending sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(NOTE.D5, t);
    osc.frequency.exponentialRampToValueAtTime(NOTE.D2, t + 0.6);

    // Vibrato LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 12; // vibrato speed
    lfoGain.gain.value = 30;  // vibrato depth in Hz

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.65);
    lfo.start(t);
    lfo.stop(t + 0.65);
  }
}
