import { TEMPLATES } from '../data/templates';
import {
  PortfolioDocumentSchema,
  type PortfolioContent,
  type PortfolioDocument,
  type Project,
  type SectionConfig,
  type SectionId,
  type TemplateId,
} from '../types/portfolio';

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workfolio-site'
  );
}

export function validatePortfolioDocument(doc: unknown): PortfolioDocument {
  return PortfolioDocumentSchema.parse(doc);
}

/**
 * Switches a portfolio's active template while preserving 100% of user content
 * (projects, copy, images, experience, contact, section order & visibility).
 * Maps typographyId, paletteId, and section layoutVariant safely onto the target template.
 */
export function switchTemplateSafely(
  doc: PortfolioDocument,
  nextTemplateId: TemplateId
): PortfolioDocument {
  const targetTpl = TEMPLATES[nextTemplateId];

  const mappedSections: SectionConfig[] = doc.presentation.sections.map((section) => {
    const validVariants = targetTpl.sectionVariants[section.id];
    const hasMatch = validVariants.some((v) => v.id === section.layoutVariant);
    return {
      ...section,
      layoutVariant: hasMatch ? section.layoutVariant : validVariants[0].id,
    };
  });

  // Ensure Noir Collage always has secondary/outline words populated if user came from another template
  const nextHero = { ...doc.content.hero };
  if (
    nextTemplateId === 'noir-collage' &&
    !nextHero.headlineSecondary.trim() &&
    !nextHero.headlineOutline.trim()
  ) {
    const words = nextHero.headlinePrimary.trim().split(/\s+/);
    if (words.length >= 3) {
      nextHero.headlinePrimary = words.slice(0, Math.ceil(words.length / 3)).join(' ');
      nextHero.headlineSecondary = words
        .slice(Math.ceil(words.length / 3), Math.ceil((words.length * 2) / 3))
        .join(' ');
      nextHero.headlineOutline = words.slice(Math.ceil((words.length * 2) / 3)).join(' ');
    }
  }

  return {
    ...doc,
    updatedAt: Date.now(),
    content: {
      ...doc.content,
      hero: nextHero,
    },
    presentation: {
      ...doc.presentation,
      templateId: nextTemplateId,
      typographyId: targetTpl.defaultTypographyId,
      paletteId: targetTpl.defaultPaletteId,
      density: targetTpl.defaultDensity,
      sections: mappedSections,
    },
  };
}

export function reorderArrayItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function reorderSectionsById(
  sections: SectionConfig[],
  activeId: SectionId,
  overId: SectionId
): SectionConfig[] {
  const fromIndex = sections.findIndex((s) => s.id === activeId);
  const toIndex = sections.findIndex((s) => s.id === overId);
  return reorderArrayItems(sections, fromIndex, toIndex);
}

export function moveSectionByStep(
  sections: SectionConfig[],
  sectionId: SectionId,
  direction: 'up' | 'down'
): SectionConfig[] {
  const index = sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return sections;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  return reorderArrayItems(sections, index, targetIndex);
}

export function toggleSectionVisibilityById(
  sections: SectionConfig[],
  sectionId: SectionId
): SectionConfig[] {
  return sections.map((section) =>
    section.id === sectionId ? { ...section, visible: !section.visible } : section
  );
}

export function setSectionLayoutVariant(
  sections: SectionConfig[],
  sectionId: SectionId,
  layoutVariant: string
): SectionConfig[] {
  return sections.map((section) =>
    section.id === sectionId ? { ...section, layoutVariant } : section
  );
}

export function addProjectToContent(content: PortfolioContent, project: Project): PortfolioContent {
  return {
    ...content,
    projects: [project, ...content.projects],
  };
}

export function updateProjectInContent(
  content: PortfolioContent,
  projectId: string,
  patch: Partial<Project>
): PortfolioContent {
  return {
    ...content,
    projects: content.projects.map((p) => (p.id === projectId ? { ...p, ...patch } : p)),
  };
}

export function deleteProjectFromContent(
  content: PortfolioContent,
  projectId: string
): PortfolioContent {
  return {
    ...content,
    projects: content.projects.filter((p) => p.id !== projectId),
  };
}

export function reorderProjectsById(
  projects: Project[],
  activeId: string,
  overId: string
): Project[] {
  const fromIndex = projects.findIndex((p) => p.id === activeId);
  const toIndex = projects.findIndex((p) => p.id === overId);
  return reorderArrayItems(projects, fromIndex, toIndex);
}
