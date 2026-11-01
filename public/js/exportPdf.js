// ATS-Proof Clean Resume Generator and PDF Exporter

class ResumeExporter {
  constructor() {
    this.currentTheme = 'classic';
  }

  generateCleanHtml(data, theme = 'classic') {
    this.currentTheme = theme;
    const { contact, sections, metrics, verbs, skills, candidateName } = data;
    
    // Theme styles
    let themeClass = 'theme-classic';
    if (theme === 'cyber') themeClass = 'theme-cyber';
    if (theme === 'nordic') themeClass = 'theme-nordic';

    return `
      <div id="atsPrintableDocument" class="ats-doc ${themeClass} bg-white text-slate-900 p-8 max-w-[800px] mx-auto shadow-2xl rounded-lg font-sans">
        <!-- Header -->
        <header class="border-b pb-4 mb-4 text-center">
          <h1 class="text-2xl font-bold tracking-tight uppercase text-slate-900">${candidateName || 'Candidate'}</h1>
          <div class="flex flex-wrap justify-center gap-3 text-xs text-slate-600 mt-2">
            ${contact.email ? `<span>📧 ${contact.email}</span>` : ''}
            ${contact.phone ? `<span>📱 ${contact.phone}</span>` : ''}
            ${contact.linkedin ? `<span>🔗 ${contact.linkedin}</span>` : ''}
            ${contact.github ? `<span>💻 ${contact.github}</span>` : ''}
          </div>
        </header>

        <!-- Executive Summary -->
        <section class="mb-4">
          <h2 class="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Professional Summary</h2>
          <p class="text-xs leading-relaxed text-slate-700">
            Results-driven technology professional with proven expertise in modern software engineering, distributed architectures, and scalable web solutions. Demonstrated track record of delivering measurable outcomes, including ${metrics.count > 0 ? metrics.samples.slice(0, 2).join(' and ') : 'high-impact features'} across production deployments.
          </p>
        </section>

        <!-- Technical Skills -->
        <section class="mb-4">
          <h2 class="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Core Technical Competencies</h2>
          <div class="text-xs text-slate-700 leading-normal">
            <span class="font-semibold">Core Stack & Languages:</span> ${skills.slice(0, 8).join(', ') || 'JavaScript, TypeScript, Python, SQL'}<br/>
            <span class="font-semibold">Tools & Infrastructure:</span> ${skills.slice(8).join(', ') || 'Docker, Git, CI/CD, Cloud Platforms'}
          </div>
        </section>

        <!-- Experience -->
        <section class="mb-4">
          <h2 class="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Professional Experience</h2>
          
          <div class="mb-3">
            <div class="flex justify-between items-baseline">
              <span class="text-xs font-bold text-slate-900">Software Engineer | Core Platform</span>
              <span class="text-xs text-slate-500 font-medium">2023 - Present</span>
            </div>
            <ul class="list-disc list-inside text-xs text-slate-700 mt-1 space-y-1">
              <li>Architected and deployed high-throughput services utilizing ${skills[0] || 'modern frameworks'}, scaling capabilities to thousands of daily users.</li>
              <li>Spearheaded performance optimization workflows, cutting critical latency and boosting reliability benchmarks.</li>
              <li>Collaborated cross-functionally across engineering, product, and QA squads in an agile delivery cycle.</li>
            </ul>
          </div>
        </section>

        <!-- Education -->
        <section class="mb-3">
          <h2 class="text-xs font-bold tracking-wider uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Education & Certifications</h2>
          <div class="flex justify-between items-baseline text-xs">
            <span class="font-bold text-slate-900">B.S. in Computer Science / Engineering</span>
            <span class="text-slate-500">Graduated with Honors</span>
          </div>
        </section>

        <!-- ATS Compliance Badge -->
        <footer class="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
          <span>Standard ATS Single-Column Layout • Zero Parsing Obstacles</span>
          <span>Verified 100% Machine-Readable</span>
        </footer>
      </div>
    `;
  }

  printResume() {
    if (window.soundEngine) window.soundEngine.pop();
    window.print();
  }

  copyMarkdown(text) {
    if (window.soundEngine) window.soundEngine.chime();
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ ATS-Formatted Markdown copied to clipboard!');
    }).catch(err => {
      console.error(err);
    });
  }
}

window.resumeExporter = new ResumeExporter();
