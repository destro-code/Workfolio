import JSZip from 'jszip';
import { getPalettePreset, getTypographyPairing } from '../data/templates';
import type { ImageAssetRef, PortfolioDocument, Project } from '../types/portfolio';
import { slugify } from './portfolioLogic';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function dataUrlToUint8Array(dataUrl: string): { bytes: Uint8Array; ext: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const mime = match[1];
  const base64 = match[2];
  const ext = mime.includes('webp')
    ? 'webp'
    : mime.includes('png')
      ? 'png'
      : mime.includes('svg')
        ? 'svg'
        : 'jpg';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return { bytes, ext };
}

export async function exportPortfolioToZip(
  doc: PortfolioDocument,
  assetMap: Record<string, string>
): Promise<{ filename: string; fileCount: number }> {
  const zip = new JSZip();
  const assetsFolder = zip.folder('assets');
  const resolvedPaths = new Map<string, string>();
  let assetCounter = 1;

  const collectImage = async (ref: ImageAssetRef): Promise<string> => {
    if (resolvedPaths.has(ref.src)) {
      return resolvedPaths.get(ref.src)!;
    }

    if (ref.src.startsWith('asset:')) {
      const id = ref.src.slice('asset:'.length);
      const dataUrl = assetMap[id];
      if (dataUrl) {
        const decoded = dataUrlToUint8Array(dataUrl);
        if (decoded && assetsFolder) {
          const fname = `media-${assetCounter++}.${decoded.ext}`;
          assetsFolder.file(fname, decoded.bytes);
          const rel = `./assets/${fname}`;
          resolvedPaths.set(ref.src, rel);
          return rel;
        }
      }
    } else if (ref.src.startsWith('/')) {
      try {
        const response = await fetch(ref.src);
        if (response.ok) {
          const buf = await response.arrayBuffer();
          const extMatch = /\.([a-zA-Z0-9]+)$/.exec(ref.src);
          const ext = extMatch ? extMatch[1] : 'jpg';
          const fname = `media-${assetCounter++}.${ext}`;
          assetsFolder?.file(fname, buf);
          const rel = `./assets/${fname}`;
          resolvedPaths.set(ref.src, rel);
          return rel;
        }
      } catch {
        // Fallback cleanly if fetch fails in offline test environment
      }
    }

    resolvedPaths.set(ref.src, ref.src);
    return ref.src;
  };

  // Pre-collect all images used across hero, about, and projects
  await collectImage(doc.content.hero.portraitImage);
  await collectImage(doc.content.about.image);
  for (const img of doc.content.hero.collageImages) {
    await collectImage(img);
  }
  for (const proj of doc.content.projects) {
    await collectImage(proj.coverImage);
    for (const g of proj.gallery) {
      await collectImage(g);
    }
  }

  const getPath = (ref: ImageAssetRef) => resolvedPaths.get(ref.src) || ref.src;
  const palette = getPalettePreset(doc.presentation.templateId, doc.presentation.paletteId);
  const typo = getTypographyPairing(doc.presentation.templateId, doc.presentation.typographyId);
  const densityPad =
    doc.presentation.density === 'compact'
      ? '3rem'
      : doc.presentation.density === 'spacious'
        ? '6.5rem'
        : '4.5rem';

  const cssContent = `/* Workfolio Static Export — ${escapeHtml(doc.name)} */
:root {
  --tpl-bg: ${palette.bg};
  --tpl-surface: ${palette.surface};
  --tpl-ink: ${palette.ink};
  --tpl-muted: ${palette.muted};
  --tpl-accent: ${palette.accent};
  --tpl-accent-ink: ${palette.accentInk};
  --tpl-border: ${palette.border};
  --tpl-hairline: ${palette.hairline};
  --tpl-display-font: ${typo.displayFont};
  --tpl-body-font: ${typo.bodyFont};
  --tpl-mono-font: ${typo.monoFont};
  --tpl-display-weight: ${typo.displayWeight};
  --tpl-display-tracking: ${typo.displayTracking};
  --tpl-section-pad: ${densityPad};
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; scroll-behavior: smooth; }
body {
  background-color: var(--tpl-bg);
  color: var(--tpl-ink);
  font-family: var(--tpl-body-font);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
${
  doc.presentation.templateId === 'noir-collage'
    ? `body {
  background-image: linear-gradient(to right, var(--tpl-hairline) 1px, transparent 1px);
  background-size: 16.6666% 100%;
}`
    : ''
}

a { color: inherit; text-decoration: none; }
img { display: block; width: 100%; height: 100%; object-fit: cover; }

.container { max-width: 1180px; margin: 0 auto; padding: 0 2rem; }
.site-header {
  display: flex; align-items: center; justify-content: space-between; gap: 2rem;
  padding: 1.35rem 2rem; border-bottom: 1px solid var(--tpl-border);
  ${doc.presentation.templateId === 'monolith-grid' ? 'background: var(--tpl-surface);' : ''}
}
.brand {
  font-family: var(--tpl-display-font); font-weight: 700; font-size: 1.125rem;
  letter-spacing: -0.02em; white-space: nowrap;
}
.nav-links { display: flex; align-items: center; gap: 1.75rem; font-size: 0.85rem; }
.nav-links a { color: var(--tpl-muted); transition: opacity 0.15s ease; }
.nav-links a:hover { opacity: 0.7; color: var(--tpl-ink); }
.header-cta {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.55rem 1rem; font-size: 0.75rem; font-weight: 600;
  background: var(--tpl-accent); color: var(--tpl-accent-ink);
  ${doc.presentation.templateId === 'noir-collage' ? 'border-radius: 9999px; background: transparent; color: var(--tpl-ink); border: 1px solid var(--tpl-border); text-transform: uppercase; letter-spacing: 0.14em;' : ''}
}

.section { padding: var(--tpl-section-pad) 0; border-top: 1px solid var(--tpl-border); }
.section-hero { border-top: none; padding: var(--tpl-section-pad) 0; }
.eyebrow {
  font-family: var(--tpl-mono-font); font-size: 0.72rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--tpl-muted); margin-bottom: 0.85rem; display: block;
}
.hero-grid { display: grid; grid-template-columns: 1.4fr 0.85fr; gap: 3rem; align-items: end; }
.hero-title {
  font-family: var(--tpl-display-font); font-weight: var(--tpl-display-weight);
  letter-spacing: var(--tpl-display-tracking); line-height: 0.96;
  font-size: clamp(2.8rem, 6.2vw, 5.4rem); margin: 0;
  ${doc.presentation.templateId === 'noir-collage' ? 'text-transform: uppercase;' : ''}
}
.hero-outline { color: transparent; -webkit-text-stroke: 1.5px var(--tpl-ink); display: block; }
.hero-lead { color: var(--tpl-muted); font-size: 1.05rem; max-width: 38rem; margin: 1.5rem 0 2rem; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.35rem;
  background: var(--tpl-accent); color: var(--tpl-accent-ink); font-size: 0.8rem; font-weight: 600;
}
.portrait-frame { aspect-ratio: 3 / 4; border: 1px solid var(--tpl-border); overflow: hidden; }

.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 2.5rem; }
.section-title {
  font-family: var(--tpl-display-font); font-weight: var(--tpl-display-weight);
  font-size: clamp(1.9rem, 3.6vw, 3rem); line-height: 1.04; margin: 0;
}
.projects-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem; }
.project-card {
  border: 1px solid var(--tpl-border); background: var(--tpl-surface);
  cursor: pointer; text-align: left; padding: 0; color: inherit; font: inherit;
  display: flex; flex-direction: column;
}
.project-thumb { aspect-ratio: 4 / 3; overflow: hidden; border-bottom: 1px solid var(--tpl-border); width: 100%; }
.project-body { padding: 1.25rem; }
.project-meta { font-family: var(--tpl-mono-font); font-size: 0.72rem; color: var(--tpl-muted); display: flex; justify-content: space-between; }
.project-title { font-family: var(--tpl-display-font); font-size: 1.35rem; margin: 0.5rem 0 0.35rem; }
.project-summary { font-size: 0.9rem; color: var(--tpl-muted); margin: 0; }

.exp-row {
  display: grid; grid-template-columns: 14rem 1fr; gap: 1.5rem;
  padding: 1.35rem 0; border-top: 1px solid var(--tpl-border);
}
.mono-meta { font-family: var(--tpl-mono-font); font-size: 0.78rem; color: var(--tpl-muted); }
.skills-line { font-size: 0.95rem; color: var(--tpl-ink); margin-top: 1rem; }

.about-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; align-items: center; }
.contact-box {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
  padding: 2.5rem; border: 1px solid var(--tpl-border); background: var(--tpl-surface);
}
.site-footer {
  border-top: 1px solid var(--tpl-border); padding: 1.75rem 2rem;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
  font-size: 0.8rem; color: var(--tpl-muted);
}
.social-links { display: flex; flex-wrap: wrap; gap: 1.25rem; }

/* Project detail modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(12,12,14,0.75);
  display: none; align-items: center; justify-content: center; padding: 1.5rem; z-index: 100;
}
.modal-backdrop.open { display: flex; }
.modal-panel {
  background: var(--tpl-bg); color: var(--tpl-ink); border: 1px solid var(--tpl-border);
  max-width: 860px; width: 100%; max-height: 88vh; overflow-y: auto; padding: 2rem;
}
.modal-close {
  float: right; border: 1px solid var(--tpl-border); background: transparent; color: var(--tpl-ink);
  padding: 0.35rem 0.75rem; cursor: pointer; font-family: var(--tpl-mono-font); font-size: 0.75rem;
}

@media (max-width: 820px) {
  .nav-links { display: none; }
  .hero-grid, .projects-grid, .exp-row, .about-grid, .contact-box, .section-head {
    grid-template-columns: 1fr; flex-direction: column; align-items: flex-start;
  }
}
`;

  const visibleSections = doc.presentation.sections.filter((s) => s.visible);
  const sectionsHtml = visibleSections
    .map((sec) => {
      switch (sec.id) {
        case 'header':
          return `<header class="site-header">
  <a href="#hero" class="brand">${escapeHtml(doc.content.brandName)}</a>
  <nav class="nav-links" aria-label="Primary">
    ${doc.content.navLinks
      .map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`)
      .join('')}
  </nav>
  <a href="${escapeHtml(doc.content.headerCtaHref)}" class="header-cta">${escapeHtml(
            doc.content.headerCtaLabel
          )}</a>
</header>`;

        case 'hero': {
          const portraitPath = getPath(doc.content.hero.portraitImage);
          const pos = `${doc.content.hero.portraitImage.focalPoint.x}% ${doc.content.hero.portraitImage.focalPoint.y}%`;
          return `<section id="hero" class="section-hero">
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">${escapeHtml(doc.content.hero.eyebrow)}</span>
      <h1 class="hero-title">
        ${escapeHtml(doc.content.hero.headlinePrimary)}
        ${doc.content.hero.headlineSecondary ? `<span> ${escapeHtml(doc.content.hero.headlineSecondary)}</span>` : ''}
        ${doc.content.hero.headlineOutline ? `<span class="hero-outline">${escapeHtml(doc.content.hero.headlineOutline)}</span>` : ''}
      </h1>
      <p class="hero-lead">${escapeHtml(doc.content.hero.subheadline)}</p>
      <a href="${escapeHtml(doc.content.hero.primaryCtaHref)}" class="btn-primary">${escapeHtml(
            doc.content.hero.primaryCtaLabel
          )}</a>
    </div>
    <div class="portrait-frame">
      <img src="${escapeHtml(portraitPath)}" alt="${escapeHtml(
            doc.content.hero.portraitImage.alt
          )}" style="object-position:${pos}" />
    </div>
  </div>
</section>`;
        }

        case 'projects': {
          return `<section id="projects" class="section">
  <div class="container">
    <div class="section-head">
      <div>
        <span class="eyebrow">${escapeHtml(doc.content.projectsSection.eyebrow)}</span>
        <h2 class="section-title">${escapeHtml(doc.content.projectsSection.heading)}</h2>
      </div>
      <p style="color:var(--tpl-muted);max-width:26rem;margin:0">${escapeHtml(
        doc.content.projectsSection.intro
      )}</p>
    </div>
    <div class="projects-grid">
      ${doc.content.projects
        .map((p, idx) => {
          const imgPath = getPath(p.coverImage);
          const pos = `${p.coverImage.focalPoint.x}% ${p.coverImage.focalPoint.y}%`;
          return `<button type="button" class="project-card" data-project-index="${idx}">
        <div class="project-thumb">
          <img src="${escapeHtml(imgPath)}" alt="${escapeHtml(
            p.coverImage.alt
          )}" style="object-position:${pos}" />
        </div>
        <div class="project-body">
          <div class="project-meta">
            <span>${escapeHtml(p.category)} · ${escapeHtml(p.role)}</span>
            <span>${escapeHtml(p.year)}</span>
          </div>
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          <p class="project-summary">${escapeHtml(p.summary)}</p>
        </div>
      </button>`;
        })
        .join('\n      ')}
    </div>
  </div>
</section>`;
        }

        case 'experience':
          return `<section id="experience" class="section">
  <div class="container">
    <span class="eyebrow">${escapeHtml(doc.content.experienceSection.eyebrow)}</span>
    <h2 class="section-title" style="margin-bottom:2rem">${escapeHtml(
      doc.content.experienceSection.heading
    )}</h2>
    ${doc.content.experience
      .map(
        (exp) => `<div class="exp-row">
      <div class="mono-meta">
        <div>${escapeHtml(exp.period)}</div>
        <div>${escapeHtml(exp.location)}</div>
      </div>
      <div>
        <h3 style="margin:0;font-size:1.05rem">${escapeHtml(exp.role)}</h3>
        <div style="font-size:0.85rem;color:var(--tpl-muted);margin:0.2rem 0 0.6rem">${escapeHtml(
          exp.company
        )}</div>
        <p style="margin:0;color:var(--tpl-muted);font-size:0.92rem">${escapeHtml(
          exp.summary
        )}</p>
      </div>
    </div>`
      )
      .join('\n    ')}
    <div class="skills-line"><strong>Disciplines:</strong> ${escapeHtml(
      doc.content.skills.join(' · ')
    )}</div>
  </div>
</section>`;

        case 'about': {
          const aboutImg = getPath(doc.content.about.image);
          const pos = `${doc.content.about.image.focalPoint.x}% ${doc.content.about.image.focalPoint.y}%`;
          return `<section id="about" class="section">
  <div class="container about-grid">
    <div>
      <span class="eyebrow">${escapeHtml(doc.content.about.eyebrow)}</span>
      <h2 class="section-title" style="margin-bottom:1.25rem">${escapeHtml(
        doc.content.about.heading
      )}</h2>
      ${doc.content.about.paragraphs
        .map((p) => `<p style="color:var(--tpl-muted)">${escapeHtml(p)}</p>`)
        .join('\n      ')}
    </div>
    <div class="portrait-frame">
      <img src="${escapeHtml(aboutImg)}" alt="${escapeHtml(
            doc.content.about.image.alt
          )}" style="object-position:${pos}" />
    </div>
  </div>
</section>`;
        }

        case 'contact':
          return `<section id="contact" class="section">
  <div class="container">
    <div class="contact-box">
      <div>
        <span class="eyebrow">${escapeHtml(doc.content.contact.eyebrow)}</span>
        <h2 class="section-title" style="margin-bottom:0.75rem">${escapeHtml(
          doc.content.contact.heading
        )}</h2>
        <p style="color:var(--tpl-muted);max-width:34rem;margin:0">${escapeHtml(
          doc.content.contact.intro
        )}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.65rem;align-items:flex-end">
        <a href="mailto:${escapeHtml(doc.content.contact.email)}" class="btn-primary">${escapeHtml(
            doc.content.contact.ctaLabel
          )}</a>
        <span class="mono-meta">${escapeHtml(doc.content.contact.email)}</span>
      </div>
    </div>
  </div>
</section>`;

        case 'footer':
          return `<footer class="site-footer">
  <span>${escapeHtml(doc.content.footer.copyright)}</span>
  <div class="social-links">
    ${doc.content.contact.socials
      .map(
        (s) =>
          `<a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer">${escapeHtml(
            s.platform
          )}</a>`
      )
      .join('')}
  </div>
</footer>`;
      }
    })
    .join('\n\n');

  const serializedProjects: Array<Project & { resolvedCover: string }> = doc.content.projects.map(
    (p) => ({
      ...p,
      resolvedCover: getPath(p.coverImage),
    })
  );

  const scriptJs = `const PROJECTS = ${JSON.stringify(serializedProjects)};
const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.getElementById('modal-close');

document.querySelectorAll('[data-project-index]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const idx = Number(btn.getAttribute('data-project-index'));
    const p = PROJECTS[idx];
    if (!p || !modal || !modalBody) return;
    modalBody.innerHTML = \`
      <div class="mono-meta" style="margin-bottom:0.5rem">\${p.year} · \${p.category} · \${p.role}</div>
      <h2 style="font-family:var(--tpl-display-font);font-size:2rem;margin:0 0 0.5rem">\${p.title}</h2>
      <p style="color:var(--tpl-muted);margin:0 0 1.25rem">\${p.subtitle}</p>
      <div style="aspect-ratio:16/9;overflow:hidden;border:1px solid var(--tpl-border);margin-bottom:1.5rem">
        <img src="\${p.resolvedCover}" alt="\${p.title}" style="object-position:\${p.coverImage.focalPoint.x}% \${p.coverImage.focalPoint.y}%" />
      </div>
      <p style="font-weight:500">\${p.summary}</p>
      \${p.caseStudy.map((para) => \`<p style="color:var(--tpl-muted)">\${para}</p>\`).join('')}
      <p class="mono-meta" style="margin-top:1rem">\${p.tags.join(' · ')}</p>
    \`;
    modal.classList.add('open');
  });
});

if (closeBtn && modal) {
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('open');
  });
}
`;

  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(doc.content.personName)} — ${escapeHtml(doc.content.roleTitle)}</title>
  <meta name="description" content="${escapeHtml(doc.content.hero.subheadline)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;700&family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500;700&family=Fraunces:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Newsreader:wght@400;500&family=Oswald:wght@500;700&family=Playfair+Display:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
${sectionsHtml}

<div id="project-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Project details">
  <div class="modal-panel">
    <button type="button" id="modal-close" class="modal-close">Close [Esc]</button>
    <div id="modal-body"></div>
  </div>
</div>

<script src="./script.js"></script>
</body>
</html>
`;

  const readmeTxt = `WORKFOLIO STATIC PORTFOLIO EXPORT
==================================
Portfolio: ${doc.name}
Owner: ${doc.content.personName}
Template: ${doc.presentation.templateId}

INCLUDED FILES
- index.html : Semantic standalone HTML
- styles.css : Compiled CSS variables and responsive layout rules
- script.js  : Interactive project case-study modal
- assets/    : Local images bundled offline

HOW TO DEPLOY
1. Netlify / Vercel / Cloudflare Pages:
   Drag and drop this extracted folder into your dashboard, or deploy via CLI.
2. GitHub Pages:
   Push these files to a repository branch and enable GitHub Pages on root (/).
3. Local preview:
   Run "npx serve ." inside this folder.
`;

  zip.file('index.html', indexHtml);
  zip.file('styles.css', cssContent);
  zip.file('script.js', scriptJs);
  zip.file('README.txt', readmeTxt);

  const blob = await zip.generateAsync({ type: 'blob' });
  const zipName = `${slugify(doc.name)}-workfolio.zip`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = zipName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  return {
    filename: zipName,
    fileCount: Object.keys(zip.files).length,
  };
}
