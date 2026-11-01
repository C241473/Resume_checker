// AI Resume Analyzer Pro Main Application Controller

let currentAnalysis = null;
let radarChartInstance = null;
let heatmapInstance = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Lucide icons initialization
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Setup Heatmap Canvas
  const heatmapCanvas = document.getElementById('heatmapCanvas');
  if (heatmapCanvas && window.HeatmapSimulator) {
    heatmapInstance = new window.HeatmapSimulator('heatmapCanvas');
    heatmapInstance.resize();
    window.addEventListener('resize', () => {
      if (heatmapInstance) heatmapInstance.resize();
    });
  }

  // Setup Vibe Speech Canvas
  const vibeCanvas = document.getElementById('vibeWaveformCanvas');
  if (vibeCanvas && window.vibeSpeechEngine) {
    window.vibeSpeechEngine.setCanvas(vibeCanvas);
    window.vibeSpeechEngine.drawIdleWaveform();
  }

  // Setup Event Listeners
  initEventListeners();

  // Load first demo preset by default
  loadPresetResume('fullstack-junior');
});

// Event Listeners Setup
function initEventListeners() {
  // Preset demo buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const presetId = e.currentTarget.getAttribute('data-preset');
      loadPresetResume(presetId);
    });
  });

  // Target Job Selector
  const jobSelect = document.getElementById('targetJobSelect');
  if (jobSelect) {
    jobSelect.addEventListener('change', (e) => {
      if (window.soundEngine) window.soundEngine.pop();
      runAnalysis();
    });
  }

  // Main Analyze Button
  const analyzeBtn = document.getElementById('runAnalyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.chime();
      runAnalysis();
    });
  }

  // File Upload & Drag-and-Drop
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('resumeFileInput');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('border-purple-500', 'bg-purple-950/20');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-purple-500', 'bg-purple-950/20');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });
  }

  // Tab Navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = e.currentTarget.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Persona Selection Buttons
  document.querySelectorAll('.persona-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const persona = e.currentTarget.getAttribute('data-persona');
      switchPersona(persona);
    });
  });

  // 6-Second Glance Simulation Play Button
  const playHeatmapBtn = document.getElementById('playHeatmapBtn');
  if (playHeatmapBtn) {
    playHeatmapBtn.addEventListener('click', () => {
      startHeatmapSimulation();
    });
  }

  // Vibe Check Audio Play/Stop Button
  const vibePlayBtn = document.getElementById('vibeAudioPlayBtn');
  if (vibePlayBtn) {
    vibePlayBtn.addEventListener('click', () => {
      toggleVibeAudio();
    });
  }

  // Sound Toggle Mute Button
  const soundMuteBtn = document.getElementById('soundToggleBtn');
  if (soundMuteBtn) {
    soundMuteBtn.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      soundMuteBtn.innerHTML = isMuted 
        ? `<i data-lucide="volume-x" class="w-4 h-4 text-slate-400"></i>` 
        : `<i data-lucide="volume-2" class="w-4 h-4 text-purple-400"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }
}

// Handle File Upload (TXT or PDF parsing via PDF.js)
async function handleFileUpload(file) {
  const uploadStatus = document.getElementById('uploadStatusText');
  if (uploadStatus) uploadStatus.textContent = `Reading ${file.name}...`;

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      if (!window.pdfjsLib) {
        alert('PDF parser is still loading. Please try again in 2 seconds.');
        return;
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      document.getElementById('resumeTextInput').value = fullText;
      if (uploadStatus) uploadStatus.textContent = `Loaded ${file.name} (${pdf.numPages} pages)`;
      if (window.soundEngine) window.soundEngine.chime();
      runAnalysis();
    } catch (err) {
      console.error(err);
      alert('Could not parse PDF text directly. You can paste the text manually into the editor.');
    }
  } else {
    // Plain text or markdown
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('resumeTextInput').value = e.target.result;
      if (uploadStatus) uploadStatus.textContent = `Loaded ${file.name}`;
      if (window.soundEngine) window.soundEngine.chime();
      runAnalysis();
    };
    reader.readAsText(file);
  }
}

// Load a preset demo resume
function loadPresetResume(presetId) {
  const preset = window.PRESETS.resumes.find(r => r.id === presetId);
  if (!preset) return;

  const textarea = document.getElementById('resumeTextInput');
  if (textarea) {
    textarea.value = preset.text;
  }

  // Update active preset button style
  document.querySelectorAll('.preset-btn').forEach(btn => {
    if (btn.getAttribute('data-preset') === presetId) {
      btn.classList.add('border-purple-500', 'bg-purple-900/30', 'text-white');
      btn.classList.remove('border-slate-800', 'text-slate-400');
    } else {
      btn.classList.remove('border-purple-500', 'bg-purple-900/30', 'text-white');
      btn.classList.add('border-slate-800', 'text-slate-400');
    }
  });

  if (window.soundEngine) window.soundEngine.pop();
  runAnalysis();
}

// Run Analysis Pipeline
function runAnalysis() {
  const resumeText = document.getElementById('resumeTextInput').value;
  if (!resumeText.trim()) {
    alert('Please paste or upload a resume to analyze.');
    return;
  }

  const selectedJobId = document.getElementById('targetJobSelect').value;
  const targetJob = window.PRESETS.jobs.find(j => j.id === selectedJobId);

  // Execute Analysis Engine
  currentAnalysis = window.resumeAnalyzer.analyze(resumeText, targetJob);

  // Render all views
  renderOverview(currentAnalysis);
  renderPersonas(currentAnalysis);
  renderDetoxifier(currentAnalysis);
  renderTrapCards(currentAnalysis);
  renderSalary(currentAnalysis);
  renderJobGap(currentAnalysis);
  renderATSExporter(currentAnalysis);

  // Draw Heatmap initial state
  if (heatmapInstance) {
    heatmapInstance.drawBaseResume();
  }

  // Confetti celebration if score >= 82
  if (currentAnalysis.score >= 82 && window.confetti) {
    window.confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (window.soundEngine) window.soundEngine.fanfare();
  }
}

// Render Executive Overview & Score
function renderOverview(data) {
  // Score text & circle
  const scoreEl = document.getElementById('atsScoreValue');
  const scoreCircle = document.getElementById('atsGaugeCircle');
  const verdictEl = document.getElementById('atsVerdictText');
  const candidateNameEl = document.getElementById('candidateHeaderName');

  if (candidateNameEl) candidateNameEl.textContent = data.candidateName;

  if (scoreEl) {
    // Animate score number
    let curr = 0;
    const interval = setInterval(() => {
      curr += 2;
      if (curr >= data.score) {
        curr = data.score;
        clearInterval(interval);
      }
      scoreEl.textContent = curr;
    }, 20);
  }

  // Update Circular Gauge
  if (scoreCircle) {
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // ~283
    const offset = circumference - (data.score / 100) * circumference;
    scoreCircle.style.strokeDashoffset = offset;

    if (data.score >= 80) scoreCircle.style.stroke = '#10b981'; // green
    else if (data.score >= 60) scoreCircle.style.stroke = '#06b6d4'; // cyan
    else scoreCircle.style.stroke = '#f43f5e'; // red
  }

  // Verdict text
  if (verdictEl) {
    if (data.score >= 80) {
      verdictEl.innerHTML = `<span class="text-emerald-400 font-semibold">Tier 1: Top 10% ATS Shortlist</span> — High probability of interview callbacks.`;
    } else if (data.score >= 65) {
      verdictEl.innerHTML = `<span class="text-cyan-400 font-semibold">Tier 2: Competitive Contender</span> — Good structure, but needs metric quantification.`;
    } else {
      verdictEl.innerHTML = `<span class="text-rose-400 font-semibold">Tier 3: ATS Attrition Risk</span> — Likely to get filtered out by enterprise scanners.`;
    }
  }

  // Key stats counters
  const metricsCountEl = document.getElementById('statMetricsCount');
  const verbsCountEl = document.getElementById('statVerbsCount');
  const buzzwordsCountEl = document.getElementById('statBuzzwordsCount');
  const skillsCountEl = document.getElementById('statSkillsCount');

  if (metricsCountEl) metricsCountEl.textContent = data.metrics.count;
  if (verbsCountEl) verbsCountEl.textContent = data.verbs.count;
  if (buzzwordsCountEl) buzzwordsCountEl.textContent = data.buzzwords.length;
  if (skillsCountEl) skillsCountEl.textContent = data.skills.length;

  // Render Radar Chart
  renderRadarChart(data.radar);
}

// Render Interactive Radar Chart using Chart.js
function renderRadarChart(radarData) {
  const ctx = document.getElementById('skillsRadarChart');
  if (!ctx) return;

  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Quantified Impact', 'Action Power', 'ATS Readability', 'Tech Breadth', 'Conciseness'],
      datasets: [{
        label: 'Candidate Strength',
        data: [
          radarData.quantification,
          radarData.actionPower,
          radarData.atsReadability,
          radarData.techBreadth,
          radarData.conciseness
        ],
        backgroundColor: 'rgba(168, 85, 247, 0.25)',
        borderColor: '#a855f7',
        borderWidth: 2,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          pointLabels: {
            color: '#cbd5e1',
            font: { size: 11, family: 'Plus Jakarta Sans', weight: '500' }
          },
          ticks: { display: false, min: 0, max: 100 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// Render Recruiter Personas Reviews
function renderPersonas(data) {
  const { bob, lumi, vance, jax } = data.personas;

  // Savage Bob
  const bobTone = document.getElementById('bobToneBadge');
  const bobQuote = document.getElementById('bobQuoteText');
  const bobVerdict = document.getElementById('bobVerdictText');
  const bobBrutality = document.getElementById('bobBrutalityScore');

  if (bobTone) bobTone.textContent = bob.tone;
  if (bobQuote) bobQuote.textContent = `"${bob.quote}"`;
  if (bobVerdict) bobVerdict.textContent = bob.verdict;
  if (bobBrutality) bobBrutality.textContent = `${bob.brutalityScore}% Brutality`;

  // Lumi Cheerleader Fairy
  const lumiAffirmation = document.getElementById('lumiAffirmationText');
  const lumiBadgesContainer = document.getElementById('lumiBadgesContainer');
  const lumiHappiness = document.getElementById('lumiHappinessScore');

  if (lumiAffirmation) lumiAffirmation.textContent = lumi.affirmation;
  if (lumiHappiness) lumiHappiness.textContent = `${lumi.happinessIndex}% Joy`;
  if (lumiBadgesContainer) {
    lumiBadgesContainer.innerHTML = lumi.badges.map(b => `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-300 border border-pink-500/20 shadow-sm">
        ${b}
      </span>
    `).join('');
  }

  // Agent Vance (ATS Sentinel)
  const vanceMatch = document.getElementById('vanceMatchStatus');
  const vanceParseability = document.getElementById('vanceParseability');
  const vanceIntegrity = document.getElementById('vanceIntegrity');
  const vanceRecommendation = document.getElementById('vanceRecommendation');

  if (vanceMatch) vanceMatch.textContent = vance.systemMatch;
  if (vanceParseability) vanceParseability.textContent = vance.parseability;
  if (vanceIntegrity) vanceIntegrity.textContent = vance.sectionIntegrity;
  if (vanceRecommendation) vanceRecommendation.textContent = vance.recommendation;

  // Founder Jax
  const jaxScore = document.getElementById('jaxVibeScore');
  const jaxTake = document.getElementById('jaxTakeText');
  if (jaxScore) jaxScore.textContent = `${jax.vibeScore}/100`;
  if (jaxTake) jaxTake.textContent = `"${jax.take}"`;
}

// Switch between Persona Sub-tabs
function switchPersona(persona) {
  if (window.soundEngine) {
    if (persona === 'bob') window.soundEngine.roast();
    else window.soundEngine.pop();
  }

  document.querySelectorAll('.persona-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-persona') === persona) {
      btn.classList.add('border-purple-500', 'bg-purple-950/40', 'text-white');
      btn.classList.remove('border-slate-800', 'text-slate-400');
    } else {
      btn.classList.remove('border-purple-500', 'bg-purple-950/40', 'text-white');
      btn.classList.add('border-slate-800', 'text-slate-400');
    }
  });

  document.querySelectorAll('.persona-card-view').forEach(card => {
    if (card.id === `persona-${persona}`) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// Render Buzzword Detoxifier
function renderDetoxifier(data) {
  const container = document.getElementById('detoxifierContainer');
  if (!container) return;

  if (data.buzzwords.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
        <div class="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 text-2xl">
          ✨
        </div>
        <h4 class="text-lg font-bold text-emerald-300">Clean Resume Detected!</h4>
        <p class="text-sm text-slate-400 mt-1">Zero low-impact buzzwords found. Your phrasing demonstrates direct ownership and active leadership.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.buzzwords.map((item, idx) => `
    <div class="glass-panel p-5 rounded-xl border border-rose-500/20 hover:border-rose-500/40 transition-all">
      <div class="flex items-center justify-between mb-2">
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
          🚨 Toxic Phrase: "${item.term}" (${item.count}x)
        </span>
        <span class="text-xs text-slate-500">${item.type}</span>
      </div>
      <p class="text-xs text-slate-400 mb-3">${item.issue}</p>

      <div class="bg-purple-950/30 border border-purple-500/20 rounded-lg p-3">
        <div class="flex items-center gap-2 text-xs font-semibold text-purple-300 mb-1">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i> Google XYZ Formula Detox:
        </div>
        <p class="text-xs font-mono-code text-cyan-300">${item.replacementFormula}</p>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

// Render Recruiter Interview Trap Cards
function renderTrapCards(data) {
  const container = document.getElementById('trapCardsContainer');
  if (!container) return;

  container.innerHTML = data.trapCards.map((card, idx) => `
    <div class="flip-card" onclick="flipTrapCard(this)">
      <div class="flip-card-inner">
        <!-- Front -->
        <div class="flip-card-front glass-panel p-6 border border-amber-500/20 hover:border-amber-500/40 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <i data-lucide="alert-triangle" class="w-4 h-4"></i> Recruiter Trap Card #${idx + 1}
              </span>
              <span class="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">Click to Reveal Winning Defense</span>
            </div>
            <h4 class="text-sm font-semibold text-slate-100 leading-snug">
              "${card.trap}"
            </h4>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Hidden Intent: ${card.reason}</span>
            <i data-lucide="rotate-cw" class="w-4 h-4 text-purple-400 animate-spin-slow"></i>
          </div>
        </div>

        <!-- Back -->
        <div class="flip-card-back glass-panel p-6 border border-emerald-500/30 bg-slate-900/95 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <i data-lucide="shield-check" class="w-4 h-4"></i> Winning STAR Strategy
              </span>
              <span class="text-[10px] text-slate-400">Click to flip back</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              ${card.winningStrategy}
            </p>
          </div>
          <div class="bg-rose-950/30 border border-rose-500/20 rounded-lg p-2.5 text-[11px] text-rose-300">
            <span class="font-bold text-rose-400">⚠️ Fatal Pitfall to Avoid:</span> ${card.dangerPitfall}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function flipTrapCard(cardEl) {
  if (window.soundEngine) window.soundEngine.pop();
  cardEl.classList.toggle('flipped');
}

// Render Salary Gauge
function renderSalary(data) {
  const rangeEl = document.getElementById('salaryRangeDisplay');
  const bdtEl = document.getElementById('salaryBdtDisplay');
  const tierEl = document.getElementById('salaryTierBadge');
  const tipsEl = document.getElementById('salaryBoostTips');

  if (rangeEl) rangeEl.textContent = data.salary.rangeStr;
  if (bdtEl) bdtEl.textContent = data.salary.bdtEquivalent;
  if (tierEl) tierEl.textContent = data.salary.tier;
  if (tipsEl) {
    tipsEl.innerHTML = data.salary.boostTips.map(tip => `
      <li class="flex items-center gap-2 text-xs text-slate-300">
        <i data-lucide="trending-up" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>
        <span>${tip}</span>
      </li>
    `).join('');
  }
  if (window.lucide) window.lucide.createIcons();
}

// Render Job Gap Analysis
function renderJobGap(data) {
  const matchRateEl = document.getElementById('jobMatchRateText');
  const matchedListEl = document.getElementById('matchedKeywordsList');
  const missingListEl = document.getElementById('missingKeywordsList');

  if (matchRateEl) matchRateEl.textContent = `${data.jobMatch.matchRate}%`;

  if (matchedListEl) {
    matchedListEl.innerHTML = data.jobMatch.matchedKeywords.map(kw => `
      <span class="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
        ✓ ${kw}
      </span>
    `).join('') || '<span class="text-xs text-slate-500">None detected</span>';
  }

  if (missingListEl) {
    missingListEl.innerHTML = data.jobMatch.missingKeywords.map(kw => `
      <span class="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs cursor-pointer hover:bg-rose-500/20 transition-all" title="Click to view placement tip" onclick="showKeywordTip('${kw}')">
        + ${kw}
      </span>
    `).join('') || '<span class="text-xs text-emerald-400">All target keywords present!</span>';
  }
}

function showKeywordTip(keyword) {
  if (window.soundEngine) window.soundEngine.pop();
  alert(`💡 Placement Tip for "${keyword}":\nAdd a bullet point under your most recent project showing how you utilized ${keyword} to solve a bottleneck or scale performance.`);
}

// Render ATS Clean Resume Exporter View
function renderATSExporter(data) {
  const previewContainer = document.getElementById('atsExportPreviewContainer');
  if (previewContainer && window.resumeExporter) {
    previewContainer.innerHTML = window.resumeExporter.generateCleanHtml(data, 'classic');
  }
}

// Start 6-Second Heatmap Simulation
function startHeatmapSimulation() {
  if (!heatmapInstance) return;

  const statusLabel = document.getElementById('heatmapStatusLabel');
  const countdown = document.getElementById('heatmapCountdown');
  const playBtn = document.getElementById('playHeatmapBtn');

  if (playBtn) playBtn.disabled = true;

  heatmapInstance.play(
    (update) => {
      if (statusLabel) statusLabel.textContent = update.label;
      if (countdown) countdown.textContent = `${update.seconds}s / 6.2s`;
    },
    () => {
      if (statusLabel) statusLabel.textContent = 'Screening Complete: Recruiter Shortlist Verdict Made!';
      if (playBtn) playBtn.disabled = false;
    }
  );
}

// Toggle Vibe Audio Review
function toggleVibeAudio() {
  if (!window.vibeSpeechEngine || !currentAnalysis) return;

  const btn = document.getElementById('vibeAudioPlayBtn');

  if (window.vibeSpeechEngine.isSpeaking) {
    window.vibeSpeechEngine.stop();
    if (btn) btn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> Listen to AI Voice Verdict`;
  } else {
    // Generate text from active persona or Lumi/Bob
    const activePersonaTab = document.querySelector('.persona-tab-btn.border-purple-500');
    const pType = activePersonaTab ? activePersonaTab.getAttribute('data-persona') : 'lumi';

    let speechText = '';
    if (pType === 'bob') {
      speechText = `Savage Bob here. ${currentAnalysis.personas.bob.quote} Final verdict: ${currentAnalysis.personas.bob.verdict}`;
    } else if (pType === 'lumi') {
      speechText = `Hello! Career fairy Lumi here! ${currentAnalysis.personas.lumi.affirmation}`;
    } else if (pType === 'vance') {
      speechText = `Agent Vance ATS system report. ${currentAnalysis.personas.vance.systemMatch}. ${currentAnalysis.personas.vance.recommendation}`;
    } else {
      speechText = `Founder Jax vibe check. ${currentAnalysis.personas.jax.take}`;
    }

    window.vibeSpeechEngine.speak(
      speechText,
      pType,
      () => {
        if (btn) btn.innerHTML = `<i data-lucide="square" class="w-4 h-4"></i> Stop Narration`;
        if (window.lucide) window.lucide.createIcons();
      },
      () => {
        if (btn) btn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> Listen to AI Voice Verdict`;
        if (window.lucide) window.lucide.createIcons();
      }
    );
  }

  if (window.lucide) window.lucide.createIcons();
}

// Switch between Main Tabs
function switchTab(tabId) {
  if (window.soundEngine) window.soundEngine.tab();

  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('border-b-2', 'border-purple-500', 'text-purple-300');
      btn.classList.remove('text-slate-400');
    } else {
      btn.classList.remove('border-b-2', 'border-purple-500', 'text-purple-300');
      btn.classList.add('text-slate-400');
    }
  });

  document.querySelectorAll('.tab-content-panel').forEach(panel => {
    if (panel.id === `tab-${tabId}`) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  // Re-render radar or heatmap if their tab was opened
  if (tabId === 'overview' && radarChartInstance) {
    radarChartInstance.resize();
  }
  if (tabId === 'heatmap' && heatmapInstance) {
    setTimeout(() => heatmapInstance.resize(), 50);
  }
}
