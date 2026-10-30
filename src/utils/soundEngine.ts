// src/utils/soundEngine.ts

/**
 * Cinematic Historical Sound Engine (Hệ Thống Âm Thanh Điện Ảnh Đậm Chất Lịch Sử)
 * Thiết kế âm thanh đa tầng (Multi-layered Audio Synthesis), loại bỏ hoàn toàn các tiếng bíp đơn điệu.
 */
class ChronoSoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * 1. Tiếng Màn Trập Máy Ảnh Cơ Lịch Sử + Ngân Vang Ký Ức (Authentic Mechanical Camera Shutter & Shimmer)
   * Phát mỗi khi lật sang một bức ảnh lịch sử kèm vệt sáng quét qua
   */
  public playCameraShutter() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tầng 1: Tiếng "Tách" kim loại đanh gọn của lá màn trập thứ nhất (First Curtain Trip)
    const bufferSize = Math.floor(ctx.sampleRate * 0.038);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3600, now);
    noiseFilter.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);

    // Tầng 2: Tiếng "Xoạch" cơ khí của gương lật máy cơ dội lại sau 45ms (Mirror Box Slap)
    const mirrorOsc = ctx.createOscillator();
    const mirrorGain = ctx.createGain();
    mirrorOsc.type = 'triangle';
    mirrorOsc.frequency.setValueAtTime(540, now + 0.045);
    mirrorOsc.frequency.exponentialRampToValueAtTime(120, now + 0.09);

    mirrorGain.gain.setValueAtTime(0.001, now);
    mirrorGain.gain.setValueAtTime(0.4, now + 0.045);
    mirrorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    mirrorOsc.connect(mirrorGain);
    mirrorGain.connect(ctx.destination);
    mirrorOsc.start(now + 0.045);
    mirrorOsc.stop(now + 0.1);

    // Tầng 3: Tiếng chuông gió / thủy tinh ngân vang vệt sáng ký ức lịch sử (Historical Memory Chime)
    const chimeFreqs = [1174.66, 1760.0]; // D6, A6 hợp âm sáng
    chimeFreqs.forEach((freq, i) => {
      if (!ctx) return;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, now + 0.02 + i * 0.02);
      chimeOsc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 0.45);

      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.03 + i * 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(now + 0.02 + i * 0.02);
      chimeOsc.stop(now + 0.48);
    });
  }

  /**
   * 2. Tiếng Bừng Sáng & Cỗ Máy Thời Gian Khởi Động (Time Surge & Light Ignition)
   * Tiếng rền trầm vũ trụ + nhịp bánh răng tăng tốc dồn dập + luồng sáng bùng nổ phủ trắng màn hình
   */
  public playIgnition(duration: number = 2.4) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tầng 1: Tiếng rền trầm tần số thấp tăng dần (Sub-bass Time Warp Swell)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subOsc.type = 'sawtooth';
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(140, now);
    subFilter.frequency.exponentialRampToValueAtTime(1200, now + duration);

    subOsc.frequency.setValueAtTime(45, now);
    subOsc.frequency.exponentialRampToValueAtTime(180, now + duration);

    subGain.gain.setValueAtTime(0.02, now);
    subGain.gain.linearRampToValueAtTime(0.32, now + duration * 0.65);
    subGain.gain.linearRampToValueAtTime(0.55, now + duration);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + duration + 0.1);

    // Tầng 2: Tiếng bánh răng cơ khí tích tắc tăng tốc dồn dập (Accelerating Chrono Cogs)
    const tickCount = 28;
    for (let i = 0; i < tickCount; i++) {
      // Nhịp ngày càng sát nhau khi sắp bùng sáng
      const tickProgress = Math.pow(i / tickCount, 1.8);
      const tickTime = now + tickProgress * (duration * 0.9);

      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tickOsc.type = 'triangle';
      tickOsc.frequency.setValueAtTime(600 + i * 40, tickTime);
      tickOsc.frequency.exponentialRampToValueAtTime(180, tickTime + 0.025);

      tickGain.gain.setValueAtTime(0.1 + (i / tickCount) * 0.2, tickTime);
      tickGain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.025);

      tickOsc.connect(tickGain);
      tickGain.connect(ctx.destination);
      tickOsc.start(tickTime);
      tickOsc.stop(tickTime + 0.03);
    }

    // Tầng 3: Luồng sáng bùng nổ phủ trắng màn hình ở 0.8s cuối (Whiteout Light Burst)
    const whiteoutTime = now + duration * 0.58;
    const whiteoutDuration = duration * 0.42;

    const chimeNotes = [440, 554.37, 659.25, 880, 1108.73]; // Hợp âm A trưởng thiêng liêng
    chimeNotes.forEach((freq, idx) => {
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, whiteoutTime + idx * 0.04);

      gain.gain.setValueAtTime(0.001, whiteoutTime);
      gain.gain.linearRampToValueAtTime(0.18, whiteoutTime + whiteoutDuration * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, whiteoutTime + whiteoutDuration + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(whiteoutTime + idx * 0.04);
      osc.stop(whiteoutTime + whiteoutDuration + 0.5);
    });
  }

  /**
   * 3. Tiếng Bùng Nổ Điểm Kỳ Dị & Chuyển Sang Sân Khấu Vinh Danh (Singularity Shockwave Boom)
   */
  public playSingularityBurst() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tiếng chuông đồng thiêng liêng rền vang (Ancient Bronze Gong Resonance)
    const gongOsc = ctx.createOscillator();
    const gongGain = ctx.createGain();
    gongOsc.type = 'sine';
    gongOsc.frequency.setValueAtTime(329.63, now); // E4
    gongOsc.frequency.exponentialRampToValueAtTime(164.81, now + 1.2);

    gongGain.gain.setValueAtTime(0.42, now);
    gongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    gongOsc.connect(gongGain);
    gongGain.connect(ctx.destination);
    gongOsc.start(now);
    gongOsc.stop(now + 1.5);

    // Tiếng sóng xung kích trầm rền lan tỏa (Deep Shockwave)
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(110, now);
    boomOsc.frequency.exponentialRampToValueAtTime(30, now + 0.9);

    boomGain.gain.setValueAtTime(0.55, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(now);
    boomOsc.stop(now + 1.0);
  }

  /**
   * 4. Khúc Khải Hoàn Vinh Danh Học Sinh (Heroic Celebration Fanfare)
   * Thay thế 4 tiếng bíp rẻ tiền bằng khúc nhạc kèn đồng chiến thắng kết hợp chuông ngân
   */
  public playStudentRevealFanfare() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tiết tấu khải hoàn: 4 nốt rộn rã dẫn vào hợp âm dài chiến thắng (D4 -> F#4 -> A4 -> D5)
    const melody = [
      { f: 293.66, t: 0.0, d: 0.16 }, // D4
      { f: 369.99, t: 0.14, d: 0.16 }, // F#4
      { f: 440.0, t: 0.28, d: 0.18 }, // A4
      { f: 587.33, t: 0.44, d: 1.2 }, // D5 (ngân dài hào hùng)
    ];

    melody.forEach((note) => {
      if (!ctx) return;
      const startTime = now + note.t;

      // Kèn đồng chính (Brass Horn): Sawtooth qua filter ấm
      const brassOsc = ctx.createOscillator();
      const brassFilter = ctx.createBiquadFilter();
      const brassGain = ctx.createGain();

      brassOsc.type = 'sawtooth';
      brassOsc.frequency.setValueAtTime(note.f, startTime);

      brassFilter.type = 'lowpass';
      brassFilter.frequency.setValueAtTime(note.f * 3.2, startTime);

      brassGain.gain.setValueAtTime(0.001, startTime);
      brassGain.gain.linearRampToValueAtTime(0.24, startTime + 0.03);
      brassGain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

      brassOsc.connect(brassFilter);
      brassFilter.connect(brassGain);
      brassGain.connect(ctx.destination);
      brassOsc.start(startTime);
      brassOsc.stop(startTime + note.d + 0.05);

      // Chuông ngân lung linh ăn mừng (Celebration Glockenspiel Chime)
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(note.f * 2, startTime);

      chimeGain.gain.setValueAtTime(0.001, startTime);
      chimeGain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d * 0.85);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(startTime);
      chimeOsc.stop(startTime + note.d);
    });
  }

  /**
   * 5. Tiếng Bấm Nút Cơ Khí Đồng Hồ Quả Quýt (Antique Pocket Watch Click)
   */
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tiếng chốt nắp đồng hồ bật mở đanh gọn
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.028);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Tương thích ngược
   */
  public playClockTick() {
    this.playClick();
  }
}

export const soundEngine = new ChronoSoundEngine();
export const sound = soundEngine;
