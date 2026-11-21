import React, { useEffect, useState } from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';
import { createSamplePortfolioContent } from '../../data/samples';
import { createDefaultSectionsForTemplate, TEMPLATES } from '../../data/templates';
import type { ViewportSize } from '../../store/studioStore';
import type { PresentationSettings, TemplateId } from '../../types/portfolio';
import { TemplateRenderer } from '../templates/TemplateRenderer';

interface TemplatePreviewModalProps {
  templateId: TemplateId | null;
  onClose: () => void;
  onUseTemplate: (templateId: TemplateId) => void;
}

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  templateId,
  onClose,
  onUseTemplate,
}) => {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  useEffect(() => {
    if (!templateId) return;
    setViewport('desktop');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [templateId, onClose]);

  if (!templateId) return null;

  const tpl = TEMPLATES[templateId];
  const sampleContent = createSamplePortfolioContent(undefined, templateId);
  const presentation: PresentationSettings = {
    templateId,
    typographyId: tpl.defaultTypographyId,
    paletteId: tpl.defaultPaletteId,
    density: tpl.defaultDensity,
    sections: createDefaultSectionsForTemplate(templateId),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--wf-chrome-bg)', color: 'var(--wf-ink-primary)' }}
      role="dialog"
      aria-modal="true"
      aria-label={`${tpl.name} template preview`}
    >
      <div
        className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-5"
        style={{ borderColor: 'var(--wf-chrome-border)' }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xs sm:text-sm font-semibold truncate">{tpl.name}</span>
          <span className="hidden md:inline text-xs truncate" style={{ color: 'var(--wf-ink-secondary)' }}>
            · {tpl.audienceFit}
          </span>
        </div>

        <div
          className="flex items-center gap-0.5 sm:gap-1 rounded-full p-0.5 border shrink-0"
          style={{
            backgroundColor: 'var(--wf-chrome-elevated)',
            borderColor: 'var(--wf-chrome-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            aria-label="Preview desktop viewport"
            className={`inline-flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-xs font-medium transition-colors ${
              viewport === 'desktop' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            aria-label="Preview tablet viewport"
            className={`inline-flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-xs font-medium transition-colors ${
              viewport === 'tablet' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
            }`}
          >
            <Tablet className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            aria-label="Preview mobile viewport"
            className={`inline-flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1 text-xs font-medium transition-colors ${
              viewport === 'mobile' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onUseTemplate(templateId)}
            className="rounded-full px-3 sm:px-4 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{
              backgroundColor: 'var(--wf-action-ivory)',
              color: 'var(--wf-action-ivory-ink)',
            }}
          >
            <span className="sm:hidden">Use</span>
            <span className="hidden sm:inline">Use This Template</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-8 w-8 items-center justify-center rounded border transition-colors hover:bg-white/10"
            style={{ borderColor: 'var(--wf-chrome-border)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="wf-scroll flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center"
        style={{ backgroundColor: 'var(--wf-stage-stone)' }}
      >
        <div
          className="h-fit min-h-full transition-all duration-200"
          style={{
            width: VIEWPORT_WIDTHS[viewport],
            maxWidth: '100%',
            border: '1px solid rgba(20, 20, 20, 0.16)',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
          }}
        >
          <TemplateRenderer
            content={sampleContent}
            presentation={presentation}
            assetMap={{}}
            interactiveMode="preview"
            viewport={viewport}
          />
        </div>
      </div>
    </div>
  );
};
