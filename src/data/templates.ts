import type { Density, SectionConfig, SectionId, TemplateId } from '../types/portfolio';

export interface TypographyPairing {
  id: string;
  name: string;
  description: string;
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  displayWeight: string;
  displayTracking: string;
}

export interface PalettePreset {
  id: string;
  name: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  border: string;
  hairline: string;
}

export interface LayoutVariantOption {
  id: string;
  name: string;
  description: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: 'Creative & Brand' | 'Editorial & Product' | 'Developer & Technical';
  audienceFit: string;
  tagline: string;
  defaultTypographyId: string;
  defaultPaletteId: string;
  defaultDensity: Density;
  typographyPairings: TypographyPairing[];
  palettes: PalettePreset[];
  sectionVariants: Record<SectionId, LayoutVariantOption[]>;
}

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  'noir-collage': {
    id: 'noir-collage',
    name: 'Noir Collage',
    category: 'Creative & Brand',
    audienceFit: 'Creative Directors · Brand & UI Designers',
    tagline:
      'High-contrast condensed display type paired with wireframe outlines, architectural grid hairlines, and sharp editorial collage plates.',
    defaultTypographyId: 'noir-oswald',
    defaultPaletteId: 'noir-obsidian',
    defaultDensity: 'balanced',
    typographyPairings: [
      {
        id: 'noir-oswald',
        name: 'Condensed Grotesk + Crisp Sans',
        description: 'Bold condensed display paired with sharp micro-uppercase UI sans.',
        displayFont: "'Oswald', sans-serif",
        bodyFont: "'Plus Jakarta Sans', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '700',
        displayTracking: '-0.02em',
      },
      {
        id: 'noir-antonio',
        name: 'Architectural Tall + DM Sans',
        description: 'Sculpted tall condensed proportions with neutral humanist prose.',
        displayFont: "'Antonio', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '700',
        displayTracking: '-0.025em',
      },
      {
        id: 'noir-editorial',
        name: 'Display Serif + Grotesk',
        description: 'High-fashion editorial serif headlines paired with clean sans body.',
        displayFont: "'Playfair Display', serif",
        bodyFont: "'Plus Jakarta Sans', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '600',
        displayTracking: '-0.02em',
      },
      {
        id: 'noir-tech',
        name: 'Geometric Neo-Grotesk + Mono',
        description: 'Sharp geometric display headlines with monospace exhibition indices.',
        displayFont: "'Space Grotesk', sans-serif",
        bodyFont: "'Inter', sans-serif",
        monoFont: "'JetBrains Mono', monospace",
        displayWeight: '700',
        displayTracking: '-0.03em',
      },
    ],
    palettes: [
      {
        id: 'noir-obsidian',
        name: 'Matte Obsidian',
        bg: '#141414',
        surface: '#1C1C1E',
        ink: '#F5F5F3',
        muted: '#9D9C96',
        accent: '#F5F5F3',
        accentInk: '#141414',
        border: 'rgba(245, 245, 243, 0.16)',
        hairline: 'rgba(255, 255, 255, 0.065)',
      },
      {
        id: 'noir-espresso',
        name: 'Roasted Umber',
        bg: '#171412',
        surface: '#211D1A',
        ink: '#F4EFE8',
        muted: '#A69D93',
        accent: '#E2A856',
        accentInk: '#171412',
        border: 'rgba(244, 239, 232, 0.16)',
        hairline: 'rgba(244, 239, 232, 0.065)',
      },
      {
        id: 'noir-vermilion',
        name: 'Gallery Charcoal + Vermilion',
        bg: '#111214',
        surface: '#1A1C1F',
        ink: '#F4F4F2',
        muted: '#93979E',
        accent: '#D94E28',
        accentInk: '#FFFFFF',
        border: 'rgba(244, 244, 242, 0.15)',
        hairline: 'rgba(244, 244, 242, 0.06)',
      },
      {
        id: 'noir-bone',
        name: 'Inverted Bone Print',
        bg: '#ECE9E2',
        surface: '#E2DED5',
        ink: '#141414',
        muted: '#5E5C56',
        accent: '#141414',
        accentInk: '#ECE9E2',
        border: 'rgba(20, 20, 20, 0.16)',
        hairline: 'rgba(20, 20, 20, 0.07)',
      },
    ],
    sectionVariants: {
      header: [
        { id: 'center-nav-pill', name: 'Centered Links + Pill CTA', description: 'Logo mark left, centered uppercase nav, right pill action.' },
        { id: 'minimal-split', name: 'Minimal Split', description: 'Compact wordmark and inline anchor links.' },
        { id: 'editorial-bar', name: 'Column Aligned Bar', description: 'Hairline-framed top navigation bar.' },
      ],
      hero: [
        { id: 'collage-spread', name: 'Collage Spread', description: 'Solid + wireframe condensed display layered with crisp collage plates.' },
        { id: 'split-monolith', name: 'Split Monolith', description: 'Bold condensed statement left, framed editorial portrait right.' },
        { id: 'centered-stack', name: 'Centered Stack', description: 'Focused typographic manifesto with wide photographic band below.' },
      ],
      projects: [
        { id: 'asymmetric-collage', name: 'Asymmetric Collage Grid', description: 'Alternating large featured plates and offset studio frames.' },
        { id: 'two-col-plates', name: '2-Column Large Plates', description: 'Uniform museum-scale two-column photographic plates.' },
        { id: 'editorial-row-index', name: 'Editorial Row Index', description: 'High-contrast numbered list with hover plate previews.' },
      ],
      experience: [
        { id: 'timeline-columns', name: 'Columnar Ledger', description: 'Chronological studio ledger aligned to architectural hairlines.' },
        { id: 'split-bio-skills', name: 'Ledger + Capability Grid', description: 'Roles paired beside unboxed discipline index.' },
        { id: 'compact-archive', name: 'Compact Archive', description: 'Tight tabular rows for concise career scan.' },
      ],
      about: [
        { id: 'asymmetric-portrait', name: 'Asymmetric Portrait + Bio', description: 'Tall documentary portrait alongside editorial statement.' },
        { id: 'statement-full', name: 'Full-Width Manifesto', description: 'Large editorial prose lead with inline availability details.' },
        { id: 'two-col-notes', name: 'Dual Column Studio Notes', description: 'Balanced narrative columns with subtle border rules.' },
      ],
      contact: [
        { id: 'bold-invite', name: 'Bold Display Invite', description: 'Condensed oversized email invitation with social strip.' },
        { id: 'split-inquiry', name: 'Split Inquiry Band', description: 'Direct contact CTA left, social directory right.' },
        { id: 'minimal-direct', name: 'Minimal Direct Strip', description: 'Restrained single-row contact callout.' },
      ],
      footer: [
        { id: 'signature-bar', name: 'Socials + Signature', description: 'Micro-uppercase social links left, editorial signature right.' },
        { id: 'centered-colophon', name: 'Centered Colophon', description: 'Quiet centered copyright and archive note.' },
        { id: 'ruled-baseline', name: 'Ruled Baseline', description: 'Clean three-part baseline aligned with grid columns.' },
      ],
    },
  },

  'atelier-index': {
    id: 'atelier-index',
    name: 'Atelier Index',
    category: 'Editorial & Product',
    audienceFit: 'Product Designers · Design Strategists · Art Directors',
    tagline:
      'Warm gallery parchment, expressive editorial serif typography, museum-catalog whitespace, and numbered case-study indices.',
    defaultTypographyId: 'atelier-fraunces',
    defaultPaletteId: 'atelier-parchment',
    defaultDensity: 'spacious',
    typographyPairings: [
      {
        id: 'atelier-fraunces',
        name: 'Fraunces Serif + Plus Jakarta',
        description: 'Soft optical editorial serif paired with crisp humanist sans.',
        displayFont: "'Fraunces', Georgia, serif",
        bodyFont: "'Plus Jakarta Sans', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '500',
        displayTracking: '-0.025em',
      },
      {
        id: 'atelier-playfair',
        name: 'Playfair + DM Sans',
        description: 'High-contrast magazine serif with calm neutral body typography.',
        displayFont: "'Playfair Display', Georgia, serif",
        bodyFont: "'DM Sans', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '500',
        displayTracking: '-0.02em',
      },
      {
        id: 'atelier-cormorant',
        name: 'Cormorant Monograph + Inter',
        description: 'Fine literary serif proportions with crisp technical captions.',
        displayFont: "'Cormorant Garamond', Georgia, serif",
        bodyFont: "'Inter', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '600',
        displayTracking: '-0.015em',
      },
      {
        id: 'atelier-instrument',
        name: 'Instrument Serif + Sans',
        description: 'Narrow tall editorial serif paired with clean modern sans.',
        displayFont: "'Instrument Serif', Georgia, serif",
        bodyFont: "'Plus Jakarta Sans', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '400',
        displayTracking: '-0.01em',
      },
    ],
    palettes: [
      {
        id: 'atelier-parchment',
        name: 'Gallery Parchment',
        bg: '#FAF8F3',
        surface: '#F2EFE7',
        ink: '#171716',
        muted: '#66635C',
        accent: '#9C4221',
        accentInk: '#FAF8F3',
        border: 'rgba(23, 23, 22, 0.14)',
        hairline: 'rgba(23, 23, 22, 0.08)',
      },
      {
        id: 'atelier-forest',
        name: 'Botanical Paper + Forest',
        bg: '#F6F6F2',
        surface: '#ECECE5',
        ink: '#141B17',
        muted: '#57615A',
        accent: '#1E4631',
        accentInk: '#F6F6F2',
        border: 'rgba(20, 27, 23, 0.14)',
        hairline: 'rgba(20, 27, 23, 0.08)',
      },
      {
        id: 'atelier-chalk',
        name: 'Studio Chalk + Ink',
        bg: '#FFFFFF',
        surface: '#F5F5F4',
        ink: '#111111',
        muted: '#6B6B6B',
        accent: '#111111',
        accentInk: '#FFFFFF',
        border: 'rgba(17, 17, 17, 0.12)',
        hairline: 'rgba(17, 17, 17, 0.07)',
      },
      {
        id: 'atelier-night',
        name: 'Nocturne Monograph',
        bg: '#181715',
        surface: '#22201D',
        ink: '#F3EFE6',
        muted: '#A39C90',
        accent: '#D8B47C',
        accentInk: '#181715',
        border: 'rgba(243, 239, 230, 0.14)',
        hairline: 'rgba(243, 239, 230, 0.08)',
      },
    ],
    sectionVariants: {
      header: [
        { id: 'monograph-header', name: 'Monograph Top Rule', description: 'Editorial serif wordmark with fine bottom hairline.' },
        { id: 'minimal-split', name: 'Minimal Split', description: 'Clean inline wordmark and subtle underlined links.' },
        { id: 'centered-masthead', name: 'Centered Masthead', description: 'Centered gallery masthead with flanking navigation.' },
      ],
      hero: [
        { id: 'editorial-left', name: 'Editorial Left Statement', description: 'Expansive serif headline left, tall framed portrait right.' },
        { id: 'centered-monograph', name: 'Centered Monograph', description: 'Balanced centered serif lead with wide gallery plate below.' },
        { id: 'split-portrait', name: 'Split Portrait', description: 'Asymmetric 50/50 split with full-bleed studio portrait.' },
      ],
      projects: [
        { id: 'two-up-gallery', name: '2-Up Gallery', description: 'Museum-spaced two-column framed plates with figure numbers.' },
        { id: 'numbered-index-list', name: 'Numbered Index List', description: 'Catalog rows with 01–04 tabular indices and thumbnails.' },
        { id: 'featured-plus-archive', name: 'Featured + Archive', description: 'Hero case study spread above a refined 3-column archive.' },
      ],
      experience: [
        { id: 'asymmetric-ledger', name: 'Asymmetric Spread', description: 'Sticky discipline index left, chronological appointments right.' },
        { id: 'timeline-columns', name: 'Editorial Rows', description: 'Full-width ruled rows with tabular dates.' },
        { id: 'compact-archive', name: 'Two-Column Directory', description: 'Experience paired cleanly alongside core capabilities.' },
      ],
      about: [
        { id: 'asymmetric-portrait', name: 'Monograph Bio + Portrait', description: 'Editorial narrative paired with quiet studio photograph.' },
        { id: 'statement-full', name: 'Centered Essay', description: 'Focused long-form bio with generous lateral margins.' },
        { id: 'two-col-notes', name: 'Practice & Philosophy', description: 'Two-column editorial bio spread.' },
      ],
      contact: [
        { id: 'editorial-invite', name: 'Editorial Invitation', description: 'Serif call-to-action with direct email and social links.' },
        { id: 'split-inquiry', name: 'Split Correspondence', description: 'Availability summary left, direct correspondence links right.' },
        { id: 'minimal-direct', name: 'Quiet Colophon CTA', description: 'Restrained hairline-framed inquiry block.' },
      ],
      footer: [
        { id: 'ruled-baseline', name: 'Catalog Baseline', description: 'Quiet gallery footer with copyright and location.' },
        { id: 'centered-colophon', name: 'Centered Colophon', description: 'Centered editorial colophon.' },
        { id: 'signature-bar', name: 'Links + Copyright', description: 'Social links paired with portfolio colophon.' },
      ],
    },
  },

  'monolith-grid': {
    id: 'monolith-grid',
    name: 'Monolith Grid',
    category: 'Developer & Technical',
    audienceFit: 'Staff Engineers · Technical Founders · Design Engineers',
    tagline:
      'Exposed structural border grid, sharp geometric sans, monospace technical metadata, and architecture-forward project specifications.',
    defaultTypographyId: 'monolith-jakarta',
    defaultPaletteId: 'monolith-slate-light',
    defaultDensity: 'compact',
    typographyPairings: [
      {
        id: 'monolith-jakarta',
        name: 'Plus Jakarta + JetBrains Mono',
        description: 'Crisp geometric engineering headings paired with precision code mono.',
        displayFont: "'Plus Jakarta Sans', sans-serif",
        bodyFont: "'Plus Jakarta Sans', sans-serif",
        monoFont: "'JetBrains Mono', monospace",
        displayWeight: '700',
        displayTracking: '-0.03em',
      },
      {
        id: 'monolith-space',
        name: 'Space Grotesk + IBM Plex Mono',
        description: 'Technical grotesk display paired with classic IBM monospace.',
        displayFont: "'Space Grotesk', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '700',
        displayTracking: '-0.025em',
      },
      {
        id: 'monolith-dm',
        name: 'DM Sans + JetBrains Mono',
        description: 'Clean functional humanist sans with crisp stack tags.',
        displayFont: "'DM Sans', sans-serif",
        bodyFont: "'Inter', sans-serif",
        monoFont: "'JetBrains Mono', monospace",
        displayWeight: '700',
        displayTracking: '-0.02em',
      },
      {
        id: 'monolith-editorial',
        name: 'Newsreader + IBM Plex Mono',
        description: 'Research-paper serif headings paired with technical monospace.',
        displayFont: "'Newsreader', Georgia, serif",
        bodyFont: "'Plus Jakarta Sans', sans-serif",
        monoFont: "'IBM Plex Mono', monospace",
        displayWeight: '500',
        displayTracking: '-0.02em',
      },
    ],
    palettes: [
      {
        id: 'monolith-slate-light',
        name: 'Architectural Slate',
        bg: '#F4F5F7',
        surface: '#FFFFFF',
        ink: '#111318',
        muted: '#5A616E',
        accent: '#1D4ED8',
        accentInk: '#FFFFFF',
        border: '#DDE1E8',
        hairline: '#E6E9EF',
      },
      {
        id: 'monolith-graphite-dark',
        name: 'Dark Graphite + Emerald',
        bg: '#101216',
        surface: '#171A20',
        ink: '#F1F3F6',
        muted: '#8F97A6',
        accent: '#10B981',
        accentInk: '#06281E',
        border: '#262B35',
        hairline: '#1F242D',
      },
      {
        id: 'monolith-amber-dark',
        name: 'Terminal Slate + Amber',
        bg: '#121316',
        surface: '#191B20',
        ink: '#F2F2EF',
        muted: '#94969C',
        accent: '#E59524',
        accentInk: '#121316',
        border: '#2B2E36',
        hairline: '#22252C',
      },
      {
        id: 'monolith-paper',
        name: 'Blueprint White + Cobalt',
        bg: '#FFFFFF',
        surface: '#F7F8FA',
        ink: '#0E1116',
        muted: '#596373',
        accent: '#0F172A',
        accentInk: '#FFFFFF',
        border: '#D8DEE6',
        hairline: '#EAECEF',
      },
    ],
    sectionVariants: {
      header: [
        { id: 'grid-header', name: 'Structural Grid Bar', description: 'Crisp bordered top bar with monospace action link.' },
        { id: 'minimal-split', name: 'Minimal Split', description: 'Clean wordmark, section links, and primary button.' },
        { id: 'compact-spec', name: 'Compact Engineering Nav', description: 'Tight utility header with inline availability note.' },
      ],
      hero: [
        { id: 'tech-overview-portrait', name: 'Technical Overview + Portrait', description: 'Sharp summary & capability highlights paired with crisp portrait cell.' },
        { id: 'terminal-minimal', name: 'Terminal Minimal', description: 'Full-width specification header with clean action buttons.' },
        { id: 'wide-banner', name: 'Wide Architectural Banner', description: 'Large engineering statement over full-width visual plate.' },
      ],
      projects: [
        { id: 'structured-spec-grid', name: 'Structured Spec Grid', description: 'Bordered two-column technical cards with stack metadata & links.' },
        { id: 'compact-tech-rows', name: 'Compact Technical Rows', description: 'Scannable engineering specification rows with live/source actions.' },
        { id: 'case-study-split', name: 'Case Study Split', description: 'Large architectural lead project above secondary spec grid.' },
      ],
      experience: [
        { id: 'tabular-timeline', name: 'Tabular Timeline', description: 'Monospace date columns aligned with role & impact summaries.' },
        { id: 'skills-matrix', name: 'Timeline + Skills Matrix', description: 'Experience ledger beside categorized capability matrix.' },
        { id: 'compact-archive', name: 'Compact Spec Table', description: 'High-signal condensed work history table.' },
      ],
      about: [
        { id: 'architecture-bio', name: 'Engineering Profile + Matrix', description: 'Technical background paired with core stack matrix.' },
        { id: 'statement-full', name: 'Full-Width Overview', description: 'Focused engineering principles and background.' },
        { id: 'asymmetric-portrait', name: 'Profile + Studio Frame', description: 'Bio columns beside framed workspace portrait.' },
      ],
      contact: [
        { id: 'spec-contact', name: 'Structured Contact Cell', description: 'Grid-bordered contact block with direct mailto and profiles.' },
        { id: 'split-inquiry', name: 'Split Inquiry Band', description: 'Availability status left, direct engineering channels right.' },
        { id: 'minimal-direct', name: 'Minimal Direct Strip', description: 'Single-row technical contact callout.' },
      ],
      footer: [
        { id: 'ruled-baseline', name: 'Grid Baseline', description: 'Structural footer cell with copyright and source links.' },
        { id: 'centered-colophon', name: 'Centered Colophon', description: 'Clean centered footer note.' },
        { id: 'signature-bar', name: 'Links + Metadata', description: 'Profile links left, build timestamp/copyright right.' },
      ],
    },
  },
};

export const TEMPLATE_LIST: TemplateDefinition[] = [
  TEMPLATES['noir-collage'],
  TEMPLATES['atelier-index'],
  TEMPLATES['monolith-grid'],
];

export function createDefaultSectionsForTemplate(templateId: TemplateId): SectionConfig[] {
  const tpl = TEMPLATES[templateId];
  return [
    { id: 'header', label: 'Header', visible: true, layoutVariant: tpl.sectionVariants.header[0].id },
    { id: 'hero', label: 'Hero', visible: true, layoutVariant: tpl.sectionVariants.hero[0].id },
    { id: 'projects', label: 'Selected Work', visible: true, layoutVariant: tpl.sectionVariants.projects[0].id },
    { id: 'experience', label: 'Experience & Skills', visible: true, layoutVariant: tpl.sectionVariants.experience[0].id },
    { id: 'about', label: 'About', visible: true, layoutVariant: tpl.sectionVariants.about[0].id },
    { id: 'contact', label: 'Contact', visible: true, layoutVariant: tpl.sectionVariants.contact[0].id },
    { id: 'footer', label: 'Footer', visible: true, layoutVariant: tpl.sectionVariants.footer[0].id },
  ];
}

export function getTypographyPairing(templateId: TemplateId, typographyId: string): TypographyPairing {
  const tpl = TEMPLATES[templateId];
  return tpl.typographyPairings.find((t) => t.id === typographyId) ?? tpl.typographyPairings[0];
}

export function getPalettePreset(templateId: TemplateId, paletteId: string): PalettePreset {
  const tpl = TEMPLATES[templateId];
  return tpl.palettes.find((p) => p.id === paletteId) ?? tpl.palettes[0];
}
