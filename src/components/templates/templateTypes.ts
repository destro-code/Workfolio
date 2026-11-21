import type {
  PortfolioContent,
  PresentationSettings,
  Project,
  SectionId,
} from '../../types/portfolio';
import type { ViewportSize } from '../../store/studioStore';

export interface TemplateRendererProps {
  content: PortfolioContent;
  presentation: PresentationSettings;
  assetMap: Record<string, string>;
  interactiveMode: 'gallery-thumb' | 'studio' | 'preview';
  viewport: ViewportSize;
  selectedSectionId?: SectionId;
  onSelectSection?: (id: SectionId) => void;
  onInlineUpdate?: (updater: (c: PortfolioContent) => PortfolioContent) => void;
  onOpenProject?: (project: Project) => void;
  previewVariantOverride?: { sectionId: SectionId; layoutVariant: string } | null;
}

export function getEffectiveVariant(
  presentation: PresentationSettings,
  sectionId: SectionId,
  override?: { sectionId: SectionId; layoutVariant: string } | null
): string {
  if (override && override.sectionId === sectionId) {
    return override.layoutVariant;
  }
  return (
    presentation.sections.find((s) => s.id === sectionId)?.layoutVariant || ''
  );
}
