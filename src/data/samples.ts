import type { PortfolioContent, PortfolioDocument, TemplateId } from '../types/portfolio';
import { createDefaultSectionsForTemplate, TEMPLATES } from './templates';

export const SAMPLE_IMAGES = {
  portrait: '/src/assets/images/portrait_creative_director_1795212407001.jpg',
  kuro: '/src/assets/images/project_kuro_identity_1795212406134.jpg',
  forma: '/src/assets/images/project_forma_system_1795212406226.jpg',
  meridian: '/src/assets/images/project_meridian_spatial_1795212406970.jpg',
  veloce: '/src/assets/images/project_veloce_mobile_1795212405850.jpg',
  monolith: '/src/assets/images/project_monolith_infra_1795212405890.jpg',
};

export function createSamplePortfolioContent(
  overrides?: Partial<{
    brandName: string;
    personName: string;
    roleTitle: string;
  }>,
  templateId: TemplateId = 'noir-collage'
): PortfolioContent {
  const personName = overrides?.personName?.trim() || 'Adaora Okafor';
  const brandName = overrides?.brandName?.trim() || personName;
  const roleTitle =
    overrides?.roleTitle?.trim() ||
    (templateId === 'monolith-grid'
      ? 'Staff Design Engineer & Systems Architect'
      : templateId === 'atelier-index'
        ? 'Principal Product Designer & Strategist'
        : 'UI/UX & Brand Creative Director');

  return {
    brandName,
    personName,
    roleTitle,
    location: 'London · Lagos · Remote',
    availability: 'Available for select Q1 commissions & advisory',
    navLinks: [
      { id: 'nav-home', label: 'Home', href: '#hero' },
      { id: 'nav-work', label: 'Work', href: '#projects' },
      { id: 'nav-exp', label: 'Experience', href: '#experience' },
      { id: 'nav-about', label: 'About', href: '#about' },
      { id: 'nav-contact', label: 'Contact', href: '#contact' },
    ],
    headerCtaLabel: 'Start a Project',
    headerCtaHref: '#contact',
    hero: {
      eyebrow:
        templateId === 'monolith-grid'
          ? 'Systems · Frontend Architecture · Developer Tools'
          : 'Brand Identity · Product Systems · Art Direction',
      headlinePrimary:
        templateId === 'monolith-grid'
          ? 'Resilient interfaces for complex systems'
          : templateId === 'atelier-index'
            ? 'Designing calm digital products & editorial systems'
            : 'UI/UX',
      headlineSecondary:
        templateId === 'noir-collage' ? 'BRAND' : '',
      headlineOutline:
        templateId === 'noir-collage' ? 'DESIGNER' : '',
      subheadline:
        templateId === 'monolith-grid'
          ? 'I architect high-throughput web applications, browser-native creative tools, and strict design systems built for longevity and zero-latency clarity.'
          : 'Independent designer and creative director shaping tactile brand identities, editorial web experiences, and multi-platform product ecosystems for ambitious studios.',
      primaryCtaLabel: 'View Selected Work',
      primaryCtaHref: '#projects',
      secondaryCtaLabel: 'Get in Touch',
      secondaryCtaHref: '#contact',
      portraitImage: {
        src: SAMPLE_IMAGES.portrait,
        alt: `${personName} studio portrait`,
        focalPoint: { x: 50, y: 28 },
      },
      collageImages: [
        {
          src: SAMPLE_IMAGES.kuro,
          alt: 'Arcane Archives Monograph & Stationery',
          focalPoint: { x: 50, y: 50 },
        },
        {
          src: SAMPLE_IMAGES.forma,
          alt: 'Forma Tactile Audio Hardware Interface',
          focalPoint: { x: 50, y: 50 },
        },
        {
          src: SAMPLE_IMAGES.portrait,
          alt: 'Studio Portrait',
          focalPoint: { x: 50, y: 24 },
        },
        {
          src: SAMPLE_IMAGES.meridian,
          alt: 'Meridian Contemporary Pavilion',
          focalPoint: { x: 52, y: 50 },
        },
        {
          src: SAMPLE_IMAGES.veloce,
          alt: 'Veloce Private Banking Mobile App',
          focalPoint: { x: 50, y: 50 },
        },
        {
          src: SAMPLE_IMAGES.monolith,
          alt: 'Monolith Compute Telemetry Hardware',
          focalPoint: { x: 50, y: 50 },
        },
      ],
    },
    projectsSection: {
      eyebrow: 'Selected Index',
      heading: 'Selected Work',
      intro: 'Recent commissions spanning brand identity, hardware-software interfaces, and high-scale web architecture.',
    },
    projects: [
      {
        id: 'proj-arcane-archives',
        title: 'Arcane Archives',
        subtitle: 'Editorial Monograph & Brand System',
        year: '2026',
        role: 'Creative Direction & Typography',
        category: 'Brand & Editorial',
        featured: true,
        summary:
          'Complete identity system, tactile blind-debossed monograph packaging, and digital archive storefront for an independent architectural publishing house.',
        caseStudy: [
          'Arcane Archives commissioned a unified visual language capable of bridging physical linen-bound books and a fast, searchable digital catalog.',
          'We established a strict Swiss typographic grid, custom duplex paper specifications, and a web reading room engineered with sub-50ms transitions and archival photography.',
        ],
        highlights: [
          '38% increase in direct collector edition pre-orders within 60 days',
          'Unified print and digital specimen library across 14 releases',
          'Custom keyboard-first exhibition index on the web catalog',
        ],
        tags: ['Brand System', 'Art Direction', 'Editorial Web', 'Print'],
        liveUrl: 'https://example.com/arcane-archives',
        sourceUrl: 'https://example.com/case-study/arcane',
        coverImage: {
          src: SAMPLE_IMAGES.kuro,
          alt: 'Arcane Archives embossed linen monograph book and black stationery',
          focalPoint: { x: 50, y: 48 },
        },
        gallery: [
          {
            src: SAMPLE_IMAGES.meridian,
            alt: 'Exhibition space installation',
            focalPoint: { x: 50, y: 50 },
            caption: 'Launch exhibition inside the Zurich pavilion',
          },
        ],
      },
      {
        id: 'proj-forma-dsp',
        title: 'Forma K-01 Controller',
        subtitle: 'Embedded UI & Companion Desktop Studio',
        year: '2025',
        role: 'Lead Product Designer',
        category: 'Product & Hardware',
        featured: true,
        summary:
          'Tactile desktop audio hardware interface and low-latency WebHID companion application for mastering engineers and sound designers.',
        caseStudy: [
          'Mastering studios needed direct rotary precision without diving through nested software menus during live sessions.',
          'I designed the physical anodized bezel typography alongside a real-time desktop calibration studio built with Canvas waveforms and deterministic preset snapshots.',
        ],
        highlights: [
          'Sub-4ms WebHID parameter sync between hardware encoders and UI',
          'Zero-modal workspace allowing uninterrupted audio auditioning',
          'Adopted by 420+ independent mastering suites worldwide',
        ],
        tags: ['Product Design', 'WebHID', 'TypeScript', 'Hardware UI'],
        liveUrl: 'https://example.com/forma-k01',
        sourceUrl: 'https://github.com/example/forma-studio',
        coverImage: {
          src: SAMPLE_IMAGES.forma,
          alt: 'Anodized aluminum Forma K-01 audio controller on travertine stone',
          focalPoint: { x: 50, y: 50 },
        },
        gallery: [],
      },
      {
        id: 'proj-meridian-pavilion',
        title: 'Meridian Foundation',
        subtitle: 'Spatial Archive & Ticketing Platform',
        year: '2025',
        role: 'Design Director & Frontend Lead',
        category: 'Digital Architecture',
        featured: false,
        summary:
          'Calm museum exhibition platform, curatorial essay reader, and timed-entry ticketing flow designed around architectural daylight and generous pacing.',
        caseStudy: [
          'Cultural institutions often struggle with cluttered ticketing funnels that clash with their physical architecture.',
          'We built an understated, WCAG AAA-compliant exhibition guide that mirrors the raw concrete and warm oak cadence of the Meridian galleries.',
        ],
        highlights: [
          'Mobile ticket checkout reduced from 7 steps to 2 inline sheets',
          '99 Lighthouse accessibility and performance score',
          'Multi-lingual curatorial footnotes synced to gallery rooms',
        ],
        tags: ['React', 'Design System', 'Accessibility', 'Editorial'],
        liveUrl: 'https://example.com/meridian',
        sourceUrl: '',
        coverImage: {
          src: SAMPLE_IMAGES.meridian,
          alt: 'Meridian Foundation concrete and oak exhibition hall',
          focalPoint: { x: 52, y: 50 },
        },
        gallery: [],
      },
      {
        id: 'proj-veloce-treasury',
        title: 'Veloce Private Ledger',
        subtitle: 'Multi-Currency Mobile Experience & Infra',
        year: '2024',
        role: 'Staff Product Engineer',
        category: 'Fintech & Systems',
        featured: true,
        summary:
          'High-trust mobile treasury app and real-time FX settlement monitor engineered for distributed creative agencies and international studios.',
        caseStudy: [
          'Founders operating across GBP, EUR, and USD needed instant reconciliation without spreadsheet exports or opaque conversion spreads.',
          'I led the visual language and client-side ledger architecture, pairing tabular monospace typography with deterministic offline-ready transaction caching.',
        ],
        highlights: [
          '$180M+ annualized cross-border volume processed cleanly',
          'Instant offline ledger search via IndexedDB indexing',
          'Zero visual regressions across 64 automated screen snapshots',
        ],
        tags: ['TypeScript', 'React', 'IndexedDB', 'Design Tokens'],
        liveUrl: 'https://example.com/veloce',
        sourceUrl: 'https://github.com/example/veloce-tokens',
        coverImage: {
          src: SAMPLE_IMAGES.veloce,
          alt: 'Matte black smartphone and steel pen on limestone',
          focalPoint: { x: 50, y: 50 },
        },
        gallery: [
          {
            src: SAMPLE_IMAGES.monolith,
            alt: 'Settlement node infrastructure',
            focalPoint: { x: 50, y: 50 },
            caption: 'Dedicated hardware telemetry cluster',
          },
        ],
      },
    ],
    experienceSection: {
      eyebrow: 'Background',
      heading: 'Experience & Capabilities',
    },
    experience: [
      {
        id: 'exp-1',
        role: 'Principal Creative Director & Design Engineer',
        company: 'Studio Okafor (Independent)',
        period: '2023 — Present',
        location: 'London / Remote',
        summary:
          'Partnering with cultural institutions, developer toolmakers, and hardware startups to ship cohesive brand systems and production web applications.',
      },
      {
        id: 'exp-2',
        role: 'Staff Product Designer, Design Systems',
        company: 'Monolith Cloud Infrastructure',
        period: '2020 — 2023',
        location: 'Berlin / London',
        summary:
          'Architected token pipelines, accessible React primitives, and high-density telemetry interfaces serving 140,000+ engineers daily.',
      },
      {
        id: 'exp-3',
        role: 'Senior UI/UX Designer',
        company: 'Kanso Digital Atelier',
        period: '2018 — 2020',
        location: 'Amsterdam',
        summary:
          'Led editorial web flagships, bespoke typography pairings, and interactive e-commerce commissions for European design houses.',
      },
    ],
    skills: [
      'Creative Direction',
      'Design Systems',
      'TypeScript & React',
      'Editorial Typography',
      'Brand Identity',
      'Interactive Prototyping',
      'WCAG Accessibility',
      'Static Web Architecture',
      'Frontend Performance',
      'Art Direction',
    ],
    about: {
      eyebrow: 'Practice',
      heading: 'Crafted at the intersection of editorial clarity and systems engineering.',
      paragraphs: [
        'Over the past eight years I have worked alongside founders, curators, and engineering teams to turn complex capabilities into calm, enduring digital work.',
        'Whether shaping a tactile print monograph or writing deterministic frontend state machines, I believe visual restraint, honest typography, and fast execution are inseparable.',
      ],
      image: {
        src: SAMPLE_IMAGES.portrait,
        alt: `${personName} in natural studio daylight`,
        focalPoint: { x: 50, y: 26 },
      },
    },
    contact: {
      eyebrow: 'Correspondence',
      heading: 'Let’s build something built to last.',
      intro:
        'Open to select product design leadership, brand direction, and design-engineering collaborations for 2026.',
      email: 'hello@adaoraokafor.studio',
      ctaLabel: 'Send an Inquiry',
      socials: [
        { id: 'soc-1', platform: 'LinkedIn', url: 'https://linkedin.com' },
        { id: 'soc-2', platform: 'GitHub', url: 'https://github.com' },
        { id: 'soc-3', platform: 'Instagram', url: 'https://instagram.com' },
        { id: 'soc-4', platform: 'Read.cv', url: 'https://read.cv' },
        { id: 'soc-5', platform: 'Behance', url: 'https://behance.net' },
      ],
    },
    footer: {
      copyright: `© 2026 ${personName}. All rights reserved.`,
      note: 'Crafted with Workfolio Studio — Static Export Edition.',
    },
  };
}

export function createLeanPortfolioContent(
  overrides: {
    brandName: string;
    personName: string;
    roleTitle: string;
  },
  templateId: TemplateId
): PortfolioContent {
  const base = createSamplePortfolioContent(overrides, templateId);
  return {
    ...base,
    projects: base.projects.slice(0, 2),
    experience: base.experience.slice(0, 2),
    skills: base.skills.slice(0, 6),
    about: {
      ...base.about,
      paragraphs: [
        `I am ${overrides.personName}, a ${overrides.roleTitle} focused on thoughtful digital craft and reliable execution.`,
      ],
    },
  };
}

export function createPortfolioDocument(params: {
  id: string;
  name: string;
  templateId: TemplateId;
  personName: string;
  roleTitle: string;
  populateSample: boolean;
}): PortfolioDocument {
  const tpl = TEMPLATES[params.templateId];
  const now = Date.now();
  const content = params.populateSample
    ? createSamplePortfolioContent(
        {
          brandName: params.personName,
          personName: params.personName,
          roleTitle: params.roleTitle,
        },
        params.templateId
      )
    : createLeanPortfolioContent(
        {
          brandName: params.personName,
          personName: params.personName,
          roleTitle: params.roleTitle,
        },
        params.templateId
      );

  return {
    id: params.id,
    name: params.name.trim() || `${params.personName} Portfolio`,
    createdAt: now,
    updatedAt: now,
    content,
    presentation: {
      templateId: params.templateId,
      typographyId: tpl.defaultTypographyId,
      paletteId: tpl.defaultPaletteId,
      density: tpl.defaultDensity,
      sections: createDefaultSectionsForTemplate(params.templateId),
    },
  };
}
