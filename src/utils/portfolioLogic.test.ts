import test from 'node:test';
import assert from 'node:assert/strict';
import { createPortfolioDocument, createSamplePortfolioContent } from '../data/samples';
import { PortfolioDocumentSchema, type Project } from '../types/portfolio';
import {
  addProjectToContent,
  deleteProjectFromContent,
  moveSectionByStep,
  reorderProjectsById,
  reorderSectionsById,
  setSectionLayoutVariant,
  slugify,
  switchTemplateSafely,
  toggleSectionVisibilityById,
  updateProjectInContent,
  validatePortfolioDocument,
} from './portfolioLogic';

test('Zod validation passes for seeded portfolio documents across all 3 templates', () => {
  for (const templateId of ['noir-collage', 'atelier-index', 'monolith-grid'] as const) {
    const doc = createPortfolioDocument({
      id: `pf-${templateId}`,
      name: `Test ${templateId}`,
      templateId,
      personName: 'Adaora Okafor',
      roleTitle: 'Product Designer',
      populateSample: true,
    });
    const parsed = validatePortfolioDocument(doc);
    assert.equal(parsed.presentation.templateId, templateId);
    assert.ok(parsed.content.projects.length >= 4);
  }
});

test('Zod validation rejects malformed portfolio payloads', () => {
  assert.throws(() => {
    PortfolioDocumentSchema.parse({ id: 'bad', name: '' });
  });
});

test('switchTemplateSafely preserves 100% of user copy, projects, and uploaded assets while remapping presentation tokens', () => {
  const doc = createPortfolioDocument({
    id: 'pf-switch',
    name: 'My Custom Portfolio',
    templateId: 'noir-collage',
    personName: 'Kenji Takahashi',
    roleTitle: 'Principal Systems Designer',
    populateSample: true,
  });

  // Customize hero headline, add custom asset ref, and add a custom project
  doc.content.hero.headlinePrimary = 'Bespoke Systems';
  doc.content.hero.portraitImage.src = 'asset:custom-portrait-123';
  const customProj: Project = {
    id: 'proj-custom-1',
    title: 'Custom Robotics Console',
    subtitle: 'Telemetry UI',
    year: '2026',
    role: 'Lead Engineer',
    category: 'Robotics',
    featured: true,
    summary: 'Real-time diagnostic workbench.',
    caseStudy: ['Built from scratch.'],
    highlights: ['60fps canvas'],
    tags: ['TypeScript', 'WebGL'],
    liveUrl: 'https://example.com',
    sourceUrl: 'https://github.com/example',
    coverImage: {
      src: 'asset:custom-cover-456',
      alt: 'Robotics UI',
      focalPoint: { x: 35, y: 65 },
    },
    gallery: [],
  };
  doc.content = addProjectToContent(doc.content, customProj);

  const switchedToAtelier = switchTemplateSafely(doc, 'atelier-index');
  assert.equal(switchedToAtelier.presentation.templateId, 'atelier-index');
  assert.equal(switchedToAtelier.presentation.typographyId, 'atelier-fraunces');
  assert.equal(switchedToAtelier.presentation.paletteId, 'atelier-parchment');
  assert.equal(switchedToAtelier.content.hero.headlinePrimary, 'Bespoke Systems');
  assert.equal(switchedToAtelier.content.hero.portraitImage.src, 'asset:custom-portrait-123');
  assert.equal(switchedToAtelier.content.projects[0].id, 'proj-custom-1');
  assert.equal(switchedToAtelier.content.projects[0].coverImage.src, 'asset:custom-cover-456');

  const switchedToMonolith = switchTemplateSafely(switchedToAtelier, 'monolith-grid');
  assert.equal(switchedToMonolith.presentation.templateId, 'monolith-grid');
  assert.equal(switchedToMonolith.content.projects.length, doc.content.projects.length);
  assert.equal(switchedToMonolith.content.personName, 'Kenji Takahashi');
});

test('Section reordering, stepping, visibility toggling, and layout variant updates', () => {
  const doc = createPortfolioDocument({
    id: 'pf-sec',
    name: 'Sections Test',
    templateId: 'atelier-index',
    personName: 'Adaora Okafor',
    roleTitle: 'Designer',
    populateSample: true,
  });

  const reordered = reorderSectionsById(doc.presentation.sections, 'about', 'hero');
  assert.equal(reordered[1].id, 'about');

  const stepped = moveSectionByStep(doc.presentation.sections, 'hero', 'down');
  assert.equal(stepped[1].id, 'projects');
  assert.equal(stepped[2].id, 'hero');

  const toggled = toggleSectionVisibilityById(doc.presentation.sections, 'experience');
  assert.equal(toggled.find((s) => s.id === 'experience')?.visible, false);

  const layoutUpdated = setSectionLayoutVariant(doc.presentation.sections, 'hero', 'centered-monograph');
  assert.equal(
    layoutUpdated.find((s) => s.id === 'hero')?.layoutVariant,
    'centered-monograph'
  );
});

test('Project CRUD and reordering preserve valid structure', () => {
  const content = createSamplePortfolioContent(undefined, 'monolith-grid');
  const initialCount = content.projects.length;

  const added = addProjectToContent(content, {
    id: 'proj-new',
    title: 'Zero-Copy Streamer',
    subtitle: 'Rust + WASM',
    year: '2026',
    role: 'Author',
    category: 'Systems',
    featured: false,
    summary: 'Browser binary parser.',
    caseStudy: ['Fast decoding.'],
    highlights: ['2GB/s throughput'],
    tags: ['Rust', 'WASM'],
    liveUrl: '',
    sourceUrl: '',
    coverImage: { src: '/src/assets/images/project_monolith_infra_1795212405890.jpg', alt: 'Chip', focalPoint: { x: 50, y: 50 } },
    gallery: [],
  });
  assert.equal(added.projects.length, initialCount + 1);
  assert.equal(added.projects[0].id, 'proj-new');

  const updated = updateProjectInContent(added, 'proj-new', { title: 'Updated Streamer', featured: true });
  assert.equal(updated.projects[0].title, 'Updated Streamer');
  assert.equal(updated.projects[0].featured, true);

  const reordered = reorderProjectsById(updated.projects, 'proj-new', updated.projects[2].id);
  assert.equal(reordered[2].id, 'proj-new');

  const deleted = deleteProjectFromContent(updated, 'proj-new');
  assert.equal(deleted.projects.length, initialCount);
  assert.equal(deleted.projects.some((p) => p.id === 'proj-new'), false);
});

test('slugify handles special characters cleanly', () => {
  assert.equal(slugify('Adaora Okafor — Portfolio 2026!'), 'adaora-okafor-portfolio-2026');
  assert.equal(slugify('   '), 'workfolio-site');
});
