// Web Speech API Narrator with Animated Audio Visualizer Waveform

class VibeSpeechEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.synth = window.speechSynthesis || null;
    this.isSpeaking = false;
    this.animId = null;
    this.wavePhase = 0;
  }

  setCanvas(canvasElement) {
    this.canvas = canvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  // Speak a persona's review text with distinct voice pitch and rate
  speak(text, personaType = 'lumi', onStart = null, onEnd = null) {
    if (!this.synth) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    // Cancel any previous speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose voice characteristics according to persona
    const voices = this.synth.getVoices();
    
    if (personaType === 'bob') {
      utterance.pitch = 0.85; // Deep, dry, sarcastic
      utterance.rate = 1.05;
      const maleVoice = voices.find(v => v.lang.startsWith('en') && /male|david|george|guy/i.test(v.name));
      if (maleVoice) utterance.voice = maleVoice;
    } else if (personaType === 'lumi') {
      utterance.pitch = 1.4; // Sweet, energetic, high pitch
      utterance.rate = 1.15;
      const femaleVoice = voices.find(v => v.lang.startsWith('en') && /female|zira|samantha|victoria|karen/i.test(v.name));
      if (femaleVoice) utterance.voice = femaleVoice;
    } else if (personaType === 'vance') {
      utterance.pitch = 1.0;
      utterance.rate = 0.95; // Stiff robotic pacing
    } else {
      utterance.pitch = 1.1;
      utterance.rate = 1.25; // Fast paced founder
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.startWaveformAnimation();
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.stopWaveformAnimation();
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.stopWaveformAnimation();
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.stopWaveformAnimation();
  }

  // Draw dancing audio visualizer waveform
  startWaveformAnimation() {
    if (this.animId) cancelAnimationFrame(this.animId);
    
    const drawWave = () => {
      if (!this.canvas || !this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const w = this.canvas.width = rect.width;
      const h = this.canvas.height = rect.height;

      this.ctx.clearRect(0, 0, w, h);

      const bars = 36;
      const barWidth = (w / bars) - 3;
      this.wavePhase += 0.08;

      for (let i = 0; i < bars; i++) {
        const x = i * (barWidth + 3);
        const dynamicFactor = Math.sin(this.wavePhase + i * 0.3) * 0.5 + 0.5;
        const noise = Math.sin(i * 1.5 + this.wavePhase * 2) * 0.25;
        const barHeight = Math.max(4, (h * 0.75) * (dynamicFactor + noise));
        const y = (h - barHeight) / 2;

        const grad = this.ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#ec4899'); // Neon Pink
        grad.addColorStop(0.5, '#a855f7'); // Purple
        grad.addColorStop(1, '#06b6d4'); // Cyan

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, barWidth, barHeight, 3);
        this.ctx.fill();
      }

      if (this.isSpeaking) {
        this.animId = requestAnimationFrame(drawWave);
      } else {
        this.drawIdleWaveform();
      }
    };

    this.animId = requestAnimationFrame(drawWave);
  }

  drawIdleWaveform() {
    if (!this.canvas || !this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    const bars = 36;
    const barWidth = (w / bars) - 3;
    for (let i = 0; i < bars; i++) {
      const x = i * (barWidth + 3);
      const barHeight = 4;
      const y = (h - barHeight) / 2;
      this.ctx.fillStyle = '#334155';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, barWidth, barHeight, 2);
      this.ctx.fill();
    }
  }

  stopWaveformAnimation() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.drawIdleWaveform();
  }
}

window.vibeSpeechEngine = new VibeSpeechEngine('vibeWaveformCanvas');
