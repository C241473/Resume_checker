// 6-Second Recruiter Glance & F-Pattern Eye-Tracking Heatmap Simulator

class HeatmapSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.animationId = null;
    this.isPlaying = false;
    this.fixationPoints = [];
    this.gazeCursor = { x: 50, y: 50, radius: 24, visible: false };

    // Standard cognitive F-pattern gaze path coordinates (normalized 0-1)
    this.gazePath = [
      { x: 0.15, y: 0.08, duration: 1.1, label: 'Reading Candidate Name & Title' },
      { x: 0.70, y: 0.08, duration: 0.7, label: 'Glancing at Links & Location' },
      { x: 0.20, y: 0.22, duration: 1.4, label: 'Deep Scan: Current Role & First Metric' },
      { x: 0.55, y: 0.25, duration: 0.9, label: 'Verifying Company & Dates' },
      { x: 0.18, y: 0.38, duration: 0.8, label: 'Scanning Second Job / Project' },
      { x: 0.22, y: 0.65, duration: 0.6, label: 'Quick Check: Education & Degree' },
      { x: 0.30, y: 0.85, duration: 0.7, label: 'Catching Core Tech Stack Keywords' },
      { x: 0.50, y: 0.95, duration: 0.5, label: 'Final Shortlist Verdict Decision' }
    ];
  }

  setCanvas(canvasElement) {
    this.canvas = canvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
    this.drawBaseResume();
  }

  // Draw simulated document layout representation on canvas
  drawBaseResume(resumeData = null) {
    if (!this.ctx || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Background document sheet
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, w, h);

    // Subtle page border
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(10, 10, w - 20, h - 20);

    // Draw stylized resume blocks
    // Header
    this.ctx.fillStyle = '#6366f1';
    this.ctx.fillRect(25, 25, w * 0.45, 12); // Name
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(25, 45, w * 0.3, 8); // Title
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(25, 58, w * 0.7, 6); // Contact

    // Section 1: Summary
    this.ctx.fillStyle = '#a855f7';
    this.ctx.fillRect(25, 80, w * 0.25, 8); // "SUMMARY"
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(25, 95, w - 50, 6);
    this.ctx.fillRect(25, 105, w - 80, 6);

    // Section 2: Experience
    this.ctx.fillStyle = '#06b6d4';
    this.ctx.fillRect(25, 130, w * 0.35, 8); // "EXPERIENCE"
    // Job 1
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(25, 146, w * 0.5, 7);
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(35, 160, w - 70, 6);
    this.ctx.fillRect(35, 172, w - 60, 6);
    this.ctx.fillRect(35, 184, w - 100, 6);
    // Job 2
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(25, 205, w * 0.45, 7);
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(35, 218, w - 70, 6);
    this.ctx.fillRect(35, 230, w - 90, 6);

    // Section 3: Education
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillRect(25, 255, w * 0.3, 8); // "EDUCATION"
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(25, 270, w * 0.6, 6);
    this.ctx.fillRect(25, 282, w * 0.4, 6);

    // Section 4: Skills
    this.ctx.fillStyle = '#f43f5e';
    this.ctx.fillRect(25, 305, w * 0.25, 8); // "SKILLS"
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(25, 320, w - 50, 6);
    this.ctx.fillRect(25, 332, w - 70, 6);

    // Draw accumulated heatmap
    this.drawHeatmapOverlay(w, h);

    // Draw active gaze cursor if animating
    if (this.gazeCursor.visible) {
      this.drawGazeCursor();
    }
  }

  // Draw heat radial points
  drawHeatmapOverlay(w, h) {
    if (!this.fixationPoints.length) return;

    this.fixationPoints.forEach(pt => {
      const grad = this.ctx.createRadialGradient(pt.x, pt.y, 4, pt.x, pt.y, pt.radius);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');   // Hot Red core
      grad.addColorStop(0.3, 'rgba(249, 115, 22, 0.4)'); // Orange
      grad.addColorStop(0.65, 'rgba(234, 179, 8, 0.25)'); // Yellow
      grad.addColorStop(0.85, 'rgba(56, 189, 248, 0.15)'); // Blue skimming
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');     // Transparent edge

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  // Draw glowing animated eye cursor
  drawGazeCursor() {
    const { x, y } = this.gazeCursor;
    // Outer ripple ring
    this.ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 22, 0, Math.PI * 2);
    this.ctx.stroke();

    // Inner bright center
    this.ctx.fillStyle = '#ec4899';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Eye icon label
    this.ctx.font = '10px sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('👀 Recruiter Eye', x + 15, y - 5);
  }

  // Run the 6-second animated simulation
  play(onUpdate = null, onFinish = null) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.fixationPoints = [];
    this.gazeCursor.visible = true;

    if (window.soundEngine) {
      window.soundEngine.pop();
    }

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const totalDuration = this.gazePath.reduce((acc, p) => acc + p.duration, 0) * 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / totalDuration);
      const currentSeconds = (elapsed / 1000).toFixed(1);

      // Determine current step in gaze path
      let accumulatedTime = 0;
      let activeIndex = 0;
      for (let i = 0; i < this.gazePath.length; i++) {
        const stepTime = this.gazePath[i].duration * 1000;
        if (elapsed <= accumulatedTime + stepTime || i === this.gazePath.length - 1) {
          activeIndex = i;
          break;
        }
        accumulatedTime += stepTime;
      }

      const activeStep = this.gazePath[activeIndex];
      const targetX = activeStep.x * w;
      const targetY = activeStep.y * h;

      // Smooth lerp cursor towards target
      this.gazeCursor.x += (targetX - this.gazeCursor.x) * 0.15;
      this.gazeCursor.y += (targetY - this.gazeCursor.y) * 0.15;

      // Add fixation heat at current position periodically
      if (Math.random() < 0.45) {
        this.fixationPoints.push({
          x: this.gazeCursor.x + (Math.random() * 10 - 5),
          y: this.gazeCursor.y + (Math.random() * 10 - 5),
          radius: 35 + Math.random() * 15
        });
      }

      // Redraw canvas
      this.drawBaseResume();

      // Callback to UI for countdown & status text
      if (onUpdate) {
        onUpdate({
          seconds: currentSeconds,
          label: activeStep.label,
          progress: Math.round(progress * 100)
        });
      }

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.isPlaying = false;
        this.gazeCursor.visible = false;
        this.drawBaseResume();
        if (window.soundEngine) {
          window.soundEngine.chime();
        }
        if (onFinish) onFinish();
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  // Stop simulation
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isPlaying = false;
    this.gazeCursor.visible = false;
  }
}

window.HeatmapSimulator = HeatmapSimulator;
