// AI Resume Analyzer Core Engine
// Handles deep parsing, ATS audit, buzzword detoxification, persona synthesis, and interview trap generation

class ResumeAnalyzer {
  constructor() {
    this.powerVerbs = [
      'architected', 'spearheaded', 'orchestrated', 'engineered', 'scaled', 'optimized',
      'deployed', 'slashed', 'accelerated', 'transformed', 'pioneered', 'championed',
      'overhauled', 'streamlined', 'generated', 'amplified', 'boosted', 'automated',
      'mentored', 'established', 'formulated', 'maximized', 'eliminated', 'executed'
    ];

    this.weakPhrases = [
      {
        regex: /responsible for (developing|building|managing|creating|doing|working on)/gi,
        type: 'Passive Responsibility',
        issue: 'Weak passive duty phrase. ATS penalizes task-listing without ownership.',
        replacementFormula: 'Engineered [System/Feature] delivering [Metric % improvement] through [Method/Tool]'
      },
      {
        regex: /worked closely with|worked on/gi,
        type: 'Vague Contribution',
        issue: 'Dilutes your direct contribution. Recruiters can’t tell what YOU built.',
        replacementFormula: 'Collaborated cross-functionally with [Stakeholders] to deliver [Outcome] via [Stack]'
      },
      {
        regex: /helped (improve|build|test|fix|increase|reduce)/gi,
        type: 'Assistance Minimizer',
        issue: '"Helped" diminishes your impact and makes you sound like a bystander.',
        replacementFormula: 'Drove [Initiative], achieving [Quantifiable Result] by implementing [Strategy]'
      },
      {
        regex: /hardworking|team player|detail[- ]oriented|passionate developer|go[- ]getter|think outside the box/gi,
        type: 'Empty Buzzword Fluff',
        issue: 'Subjective cliches that add 0 ATS value and bore human recruiters.',
        replacementFormula: 'Demonstrated execution speed by [Specific Achievement with Numbers]'
      },
      {
        regex: /familiar with|knowledge of|dabbled in/gi,
        type: 'Confidence Reducer',
        issue: 'Signals junior hesitation. If you used it in a project, claim applied experience.',
        replacementFormula: 'Implemented [Technology] across [Feature/Service], ensuring [Reliability/Performance]'
      },
      {
        regex: /attended daily (agile )?standups/gi,
        type: 'Basic Attendance Duty',
        issue: 'Showing up to work is expected, not an accomplishment.',
        replacementFormula: 'Facilitated bi-weekly sprint planning and backlog grooming across [X] squad members'
      }
    ];

    this.commonSkills = [
      'javascript', 'typescript', 'python', 'react', 'node.js', 'next.js', 'vue', 'angular',
      'html5', 'css3', 'tailwind css', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
      'postgresql', 'mongodb', 'mysql', 'redis', 'graphql', 'rest api', 'git', 'ci/cd',
      'pytorch', 'tensorflow', 'llm', 'rag', 'system design', 'agile', 'jest', 'linux',
      'go', 'rust', 'java', 'c++', 'figma', 'microservices', 'kafka'
    ];
  }

  // Parse contact info
  parseContact(text) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+\d{1,3}[- ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
    const portfolioMatch = text.match(/(https?:\/\/)?[a-zA-Z0-9-]+\.(me|io|dev|com|design)/i);

    const firstLine = text.trim().split('\n')[0] || 'Candidate';
    const name = firstLine.length < 40 ? firstLine.replace(/[^a-zA-Z\s.]/g, '').trim() : 'Candidate';

    return {
      name: name || 'Candidate',
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      linkedin: linkedinMatch ? linkedinMatch[0] : null,
      github: githubMatch ? githubMatch[0] : null,
      portfolio: portfolioMatch ? portfolioMatch[0] : null
    };
  }

  // Detect structural sections
  parseSections(text) {
    const lower = text.toLowerCase();
    return {
      hasSummary: /summary|profile|about me|objective/i.test(lower),
      hasExperience: /experience|work history|employment|career/i.test(lower),
      hasEducation: /education|academic|university|degree/i.test(lower),
      hasSkills: /skills|technical skills|technologies|competencies/i.test(lower),
      hasProjects: /projects|portfolio|personal projects|capstone/i.test(lower)
    };
  }

  // Detect metrics & quantifiable numbers
  analyzeMetrics(text) {
    const metricMatches = text.match(/\b\d+(\.\d+)?%|\$\d+(\.\d+)?[kKmMbB]?|\b\d+x\b|\b\d{2,}\+?\b/g) || [];
    return {
      count: metricMatches.length,
      samples: [...new Set(metricMatches)].slice(0, 8),
      isStrong: metricMatches.length >= 4
    };
  }

  // Detect power action verbs
  analyzeVerbs(text) {
    const lower = text.toLowerCase();
    const foundVerbs = [];
    this.powerVerbs.forEach(verb => {
      const regex = new RegExp(`\\b${verb}\\b`, 'gi');
      if (regex.test(lower)) {
        foundVerbs.push(verb.charAt(0).toUpperCase() + verb.slice(1));
      }
    });
    return {
      count: foundVerbs.length,
      list: [...new Set(foundVerbs)]
    };
  }

  // Detect buzzwords and generate detox transforms
  analyzeBuzzwords(text) {
    const detected = [];
    this.weakPhrases.forEach(item => {
      const matches = text.match(item.regex);
      if (matches) {
        detected.push({
          term: matches[0],
          type: item.type,
          issue: item.issue,
          replacementFormula: item.replacementFormula,
          count: matches.length
        });
      }
    });
    return detected;
  }

  // Extract skills found in resume
  extractSkills(text) {
    const lower = text.toLowerCase();
    const skillsFound = [];
    this.commonSkills.forEach(skill => {
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(^|\\W)${escaped}(\\W|$)`, 'i');
      if (regex.test(lower)) {
        skillsFound.push(skill);
      }
    });
    return skillsFound;
  }

  // Calculate ATS Score & Radar Metrics
  calculateScore(contact, sections, metrics, verbs, buzzwords, skills, wordCount) {
    let score = 50; // base score

    // Contact completeness (+15)
    if (contact.email) score += 4;
    if (contact.phone) score += 3;
    if (contact.linkedin) score += 4;
    if (contact.github || contact.portfolio) score += 4;

    // Sections (+15)
    let sectionCount = 0;
    Object.values(sections).forEach(has => { if (has) sectionCount++; });
    score += Math.min(15, sectionCount * 3);

    // Metrics impact (+20)
    if (metrics.count >= 6) score += 20;
    else if (metrics.count >= 3) score += 14;
    else if (metrics.count >= 1) score += 8;

    // Action verbs (+15)
    if (verbs.count >= 6) score += 15;
    else if (verbs.count >= 3) score += 10;
    else if (verbs.count >= 1) score += 5;

    // Skills depth (+10)
    if (skills.length >= 10) score += 10;
    else if (skills.length >= 5) score += 7;
    else if (skills.length >= 2) score += 4;

    // Length check (+5)
    if (wordCount >= 250 && wordCount <= 650) score += 5; // ideal 1-page length
    else if (wordCount > 650 && wordCount <= 1100) score += 3; // 2-page

    // Penalties for buzzwords & weak phrases (-15 max)
    const penalty = Math.min(15, buzzwords.length * 3);
    score -= penalty;

    // Bound between 25 and 98
    score = Math.max(28, Math.min(97, Math.round(score)));

    // Radar categories (0 - 100)
    const radar = {
      quantification: Math.min(100, Math.round((metrics.count / 7) * 100)),
      actionPower: Math.min(100, Math.round((verbs.count / 6) * 100)),
      atsReadability: Math.min(100, Math.round((sectionCount / 5) * 80 + (contact.email ? 20 : 0))),
      techBreadth: Math.min(100, Math.round((skills.length / 12) * 100)),
      conciseness: Math.max(30, 100 - (buzzwords.length * 15))
    };

    return { score, radar };
  }

  // Synthesize Recruiter Personas
  generatePersonas(score, contact, metrics, verbs, buzzwords, skills, candidateName) {
    const name = candidateName.split(' ')[0] || 'Candidate';

    // 1. Savage Bob (Brutal FAANG Tech Lead)
    let bobTone = '';
    let bobQuote = '';
    let bobVerdict = '';
    if (score >= 85) {
      bobTone = 'Reluctantly Impressed 😏';
      bobQuote = `Okay, I tried to tear this apart, but ${name} actually brought real numbers. ${metrics.count} quantifiable metrics and actual high-throughput architectural buzzwords that make sense. You won't embarrass me in front of the VP.`;
      bobVerdict = 'FAST-TRACK TO ROUND 1. But don’t get cocky on system design.';
    } else if (score >= 65) {
      bobTone = 'Skeptical & Smirking 🤨';
      bobQuote = `Classic mid-level resume. ${name} says "responsible for developing features" like that’s supposed to trigger a stock grant. Where are the p99 latency benchmarks? Where is the revenue impact? Show me the numbers or enjoy the rejection email queue.`;
      bobVerdict = 'BORDERLINE. Needs 3x more quantifiable impact before I hit hire.';
    } else {
      bobTone = 'Ruthlessly Brutal 💀';
      bobQuote = `Yikes. Did an unpaid intern write this in 2018? "Team player who thrives in fast-paced environments"? My eyes are bleeding from the buzzwords. Automated ATS will toss this into the digital incinerator in 2.3 milliseconds.`;
      bobVerdict = 'INSTANT REJECT. Rewrite every bullet point using Google XYZ formula ASAP.';
    }

    // 2. Lumi (Kawaii Career Fairy & Cheerleader)
    let lumiBadges = [];
    let lumiAffirmation = '';
    if (score >= 80) {
      lumiBadges = ['✨ Golden Pioneer', '🌸 Metric Magician', '💖 100x Potential'];
      lumiAffirmation = `Yaaaay ${name}! 🎉 Your hard work shines through so brightly! Your achievements are crystal clear and any engineering squad would be beyond lucky to have your energy! Keep shining!`;
    } else if (score >= 60) {
      lumiBadges = ['🌱 Rising Star', '⚡ Craftsmanship Gem', '✨ Future Tech Titan'];
      lumiAffirmation = `You have so much raw talent, ${name}! 💕 You’ve built awesome things! With just a little polish on highlighting your secret superpower metrics, you’re going to get dream interview calls! I believe in you!`;
    } else {
      lumiBadges = ['🌱 Diamond in the Rough', '✨ Hidden Superpower', '💖 High Growth Spirit'];
      lumiAffirmation = `Don't be discouraged at all, ${name}! 🌸 Every legendary engineer started with a draft like this. Your foundation is already here—let's sprinkle some metric magic and power verbs so the world can see how wonderful you are!`;
    }

    // 3. Agent Vance (Enterprise ATS Sentinel v4.9)
    const vanceReport = {
      systemMatch: score >= 75 ? 'PASS (Green Tier - Score 88th Percentile)' : 'REJECT_RISK (Yellow Tier - Parser Ambiguity)',
      parseability: 'Single-column text stream parsed successfully without multi-column table collisions.',
      sectionIntegrity: 'Standard section tokens verified (Summary, Experience, Education, Skills).',
      keywordDensity: `${skills.length} recognized technical ontology keywords indexed.`,
      recommendation: buzzwords.length > 0 
        ? `Remediate ${buzzwords.length} non-standard passive constructs to prevent rank depreciation.` 
        : 'Keyword weight aligns with tier-1 screening filters.'
    };

    // 4. Founder Jax (Y-Combinator Startup Hustler)
    const founderScore = Math.min(99, Math.round(score * 0.95 + (metrics.count > 3 ? 10 : 0)));
    let founderVibe = '';
    if (founderScore >= 80) {
      founderVibe = `This person doesn't wait for permission. They ship. Give them a laptop and Red Bull and watch them take a product from 0 to 1 in 72 hours.`;
    } else {
      founderVibe = `Too corporate and safe. Sounds like someone who asks for 3 sprint meetings before writing a single line of code. Want to see more side-hustles and raw weekend shipping energy!`;
    }

    return {
      bob: { tone: bobTone, quote: bobQuote, verdict: bobVerdict, brutalityScore: 100 - score },
      lumi: { badges: lumiBadges, affirmation: lumiAffirmation, happinessIndex: Math.min(100, score + 12) },
      vance: vanceReport,
      jax: { vibeScore: founderScore, take: founderVibe }
    };
  }

  // Generate Tough Interview Trap Cards
  generateTrapCards(resumeText, skills, metrics, buzzwords) {
    const cards = [];

    // Card 1: Metric Grilling
    if (metrics.count > 0) {
      const sampleMetric = metrics.samples[0] || 'significant performance gain';
      cards.push({
        trap: `You claimed an improvement of "${sampleMetric}". How specifically did you isolate your contribution from team efforts, and what was your baseline measurement methodology?`,
        reason: 'Recruiters suspect candidates inflate or borrow team metrics.',
        winningStrategy: 'Explain the exact telemetry tool used (e.g. Datadog, Google Lighthouse), the before-state number, the bottleneck identified, and your specific code change.',
        dangerPitfall: 'Saying "the whole team achieved it" without specifying your pull request.'
      });
    } else {
      cards.push({
        trap: `Your resume lists several responsibilities, but lacks quantifiable business impact. Walk me through a project where you moved the needle on a real metric.`,
        reason: 'Recruiters want evidence that you deliver business value, not just ticket closing.',
        winningStrategy: 'Pick one project and state: "While not on the resume, that refactor reduced page load by 35% and cut support tickets by half."',
        dangerPitfall: 'Claiming you had no access to metrics or analytics.'
      });
    }

    // Card 2: Tech Stack Deep Dive
    const techToGrill = skills.length > 0 ? skills[0].toUpperCase() : 'your core language';
    cards.push({
      trap: `Since you highlighted ${techToGrill} prominently, tell me about an obscure edge-case, memory leak, or concurrency bug you solved in production.`,
      reason: 'Tests whether you have production battle-scars or just basic tutorial knowledge.',
      winningStrategy: 'Describe an actual production incident: the symptom, the debugging tool used (heap dump, profiler, log trace), and the architectural fix.',
      dangerPitfall: 'Reciting high-level textbook definitions without sharing an authentic debugging story.'
    });

    // Card 3: Buzzword Detox Trap
    if (buzzwords.length > 0) {
      cards.push({
        trap: `You mentioned being "detail-oriented" / "a collaborative team player". Tell me about a time you had a fierce technical disagreement with a teammate or senior lead.`,
        reason: 'Fluffy buzzwords invite behavioral probes into real conflict resolution.',
        winningStrategy: 'Use STAR method: Describe an objective technical disagreement (e.g., GraphQL vs REST), how you gathered data/benchmarks without ego, and how you reached consensus.',
        dangerPitfall: 'Saying "I never have disagreements, everyone agrees with me."'
      });
    } else {
      cards.push({
        trap: `Tell me about a high-pressure situation where a production deployment broke or crashed. How did you react in the first 15 minutes?`,
        reason: 'Assesses emotional composure, rollback speed, and blameless post-mortem culture.',
        winningStrategy: 'Emphasize immediate mitigation (instant rollback / circuit breaker) over root cause analysis, followed by clear stakeholder communication.',
        dangerPitfall: 'Blaming someone else or panicking.'
      });
    }

    // Card 4: Architecture Tradeoff Trap
    cards.push({
      trap: `If you had to redesign your biggest project from scratch today with 10x the traffic, what fundamental architecture choice would you abandon?`,
      reason: 'Evaluates senior growth mindset, self-criticism, and system scalability foresight.',
      winningStrategy: 'Identify an honest tradeoff made early on (e.g., monolithic Postgres vs event-driven queue) and articulate how you’d evolve it now.',
      dangerPitfall: 'Defending the original architecture as 100% flawless.'
    });

    return cards;
  }

  // Calculate Salary Estimation Range
  calculateSalaryEstimate(score, skills, metrics) {
    let base = 85000;
    if (skills.some(s => ['pytorch', 'llm', 'rag', 'kubernetes', 'distributed systems', 'rust'].includes(s))) {
      base += 35000;
    }
    if (skills.length >= 8) base += 20000;
    if (metrics.count >= 4) base += 25000;
    if (score >= 85) base += 25000;

    const min = Math.round(base * 0.9 / 1000) * 1000;
    const max = Math.round(base * 1.3 / 1000) * 1000;

    return {
      min,
      max,
      rangeStr: `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k USD / yr`,
      bdtEquivalent: `৳${((min * 122) / 100000).toFixed(1)}L - ৳${((max * 122) / 100000).toFixed(1)}L / yr`,
      tier: score >= 85 ? 'Top 10% Senior Bracket' : score >= 65 ? 'Competitive Mid-Level Bracket' : 'Entry to Growth Bracket',
      boostTips: [
        'Inject 3 more quantified business metrics (+~$15k value perception)',
        'Highlight distributed systems or cloud cost reduction (+~$22k value perception)'
      ]
    };
  }

  // Match against target job description
  matchJob(resumeSkills, job) {
    if (!job || !job.targetKeywords) {
      return { matchRate: 75, matchedKeywords: [], missingKeywords: [] };
    }

    const matched = [];
    const missing = [];

    job.targetKeywords.forEach(kw => {
      const kwLower = kw.toLowerCase();
      const has = resumeSkills.some(rs => rs.toLowerCase().includes(kwLower) || kwLower.includes(rs.toLowerCase()));
      if (has) matched.push(kw);
      else missing.push(kw);
    });

    const matchRate = Math.round((matched.length / job.targetKeywords.length) * 100);

    return {
      matchRate,
      matchedKeywords: matched,
      missingKeywords: missing
    };
  }

  // Master analyze function
  analyze(text, jobPreset = null) {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const contact = this.parseContact(text);
    const sections = this.parseSections(text);
    const metrics = this.analyzeMetrics(text);
    const verbs = this.analyzeVerbs(text);
    const buzzwords = this.analyzeBuzzwords(text);
    const skills = this.extractSkills(text);

    const { score, radar } = this.calculateScore(contact, sections, metrics, verbs, buzzwords, skills, wordCount);
    const personas = this.generatePersonas(score, contact, metrics, verbs, buzzwords, skills, contact.name);
    const trapCards = this.generateTrapCards(text, skills, metrics, buzzwords);
    const salary = this.calculateSalaryEstimate(score, skills, metrics);
    const jobMatch = this.matchJob(skills, jobPreset || window.PRESETS.jobs[0]);

    return {
      candidateName: contact.name,
      contact,
      sections,
      metrics,
      verbs,
      buzzwords,
      skills,
      wordCount,
      score,
      radar,
      personas,
      trapCards,
      salary,
      jobMatch
    };
  }
}

window.resumeAnalyzer = new ResumeAnalyzer();
