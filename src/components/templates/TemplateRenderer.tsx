import React, { useEffect, useRef, useState } from 'react';
import { getPalettePreset, getTypographyPairing } from '../../data/templates';
import type { ViewportSize } from '../../store/studioStore';
import type { Project } from '../../types/portfolio';
import { AtelierIndexTemplate } from './AtelierIndexTemplate';
import { MonolithGridTemplate } from './MonolithGridTemplate';
import { NoirCollageTemplate } from './NoirCollageTemplate';
import { ProjectDetailModal } from './ProjectDetailModal';
import type { TemplateRendererProps } from './templateTypes';

const DENSITY_PADDING: Record<'compact' | 'balanced' | 'spacious', string> = {
  compact: '3rem',
  balanced: '4.5rem',
  spacious: '6.5rem',
};

function resolveEffectiveViewport(
  requested: ViewportSize,
  containerWidth: number | null,
  interactiveMode: TemplateRendererProps['interactiveMode']
): ViewportSize {
  if (interactiveMode === 'gallery-thumb') return requested;
  if (requested === 'mobile') return 'mobile';
  if (containerWidth === null) return requested;
  if (containerWidth < 640) return 'mobile';
  if (containerWidth < 960) return 'tablet';
  return requested;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = (props) => {
  const { presentation, assetMap, interactiveMode, viewport } = props;
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (interactiveMode === 'gallery-thumb') return;
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      setContainerWidth(el.getBoundingClientRect().width);
    };
    updateWidth();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [interactiveMode]);

  const effectiveViewport = resolveEffectiveViewport(
    viewport,
    containerWidth,
    interactiveMode
  );

  const palette = getPalettePreset(presentation.templateId, presentation.paletteId);
  const typo = getTypographyPairing(presentation.templateId, presentation.typographyId);

  const cssVars: React.CSSProperties = {
    ['--tpl-bg' as string]: palette.bg,
    ['--tpl-surface' as string]: palette.surface,
    ['--tpl-ink' as string]: palette.ink,
    ['--tpl-muted' as string]: palette.muted,
    ['--tpl-accent' as string]: palette.accent,
    ['--tpl-accent-ink' as string]: palette.accentInk,
    ['--tpl-border' as string]: palette.border,
    ['--tpl-hairline' as string]: palette.hairline,
    ['--tpl-display-font' as string]: typo.displayFont,
    ['--tpl-body-font' as string]: typo.bodyFont,
    ['--tpl-mono-font' as string]: typo.monoFont,
    ['--tpl-display-weight' as string]: typo.displayWeight,
    ['--tpl-display-tracking' as string]: typo.displayTracking,
    ['--tpl-section-pad' as string]: DENSITY_PADDING[presentation.density],
  };

  const handleOpenProject = (proj: Project) => {
    if (props.onOpenProject) {
      props.onOpenProject(proj);
    } else if (interactiveMode === 'preview') {
      setActiveProject(proj);
    }
  };

  const mergedProps: TemplateRendererProps = {
    ...props,
    viewport: effectiveViewport,
    onOpenProject: handleOpenProject,
  };

  return (
    <div ref={containerRef} style={cssVars} className="min-h-full w-full">
      {presentation.templateId === 'noir-collage' && (
        <NoirCollageTemplate {...mergedProps} />
      )}
      {presentation.templateId === 'atelier-index' && (
        <AtelierIndexTemplate {...mergedProps} />
      )}
      {presentation.templateId === 'monolith-grid' && (
        <MonolithGridTemplate {...mergedProps} />
      )}

      {interactiveMode === 'preview' && !props.onOpenProject && (
        <ProjectDetailModal
          project={activeProject}
          assetMap={assetMap}
          onClose={() => setActiveProject(null)}
        />
      )}
    </div>
  );
};
