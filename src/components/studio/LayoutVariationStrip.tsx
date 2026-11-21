import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import type { PortfolioDocument, PresentationSettings, SectionId } from '../../types/portfolio';
import { setSectionLayoutVariant } from '../../utils/portfolioLogic';
import { TemplateRenderer } from '../templates/TemplateRenderer';

interface LayoutVariationStripProps {
  open: boolean;
  portfolio: PortfolioDocument;
  sectionId: SectionId;
  assetMap: Record<string, string>;
  onHoverVariant: (variantId: string | null) => void;
  onSelectVariant: (variantId: string) => void;
  onClose: () => void;
}

export const LayoutVariationStrip: React.FC<LayoutVariationStripProps> = ({
  open,
  portfolio,
  sectionId,
  assetMap,
  onHoverVariant,
  onSelectVariant,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const tpl = TEMPLATES[portfolio.presentation.templateId];
  const variants = tpl.sectionVariants[sectionId] || [];
  const activeConfig = portfolio.presentation.sections.find((s) => s.id === sectionId);
  const currentVariant = activeConfig?.layoutVariant;

  return (
    <div
      className="h-[216px] shrink-0 border-t flex flex-col"
      style={{
        backgroundColor: 'var(--wf-chrome-bg)',
        borderColor: 'var(--wf-chrome-border)',
        color: 'var(--wf-ink-primary)',
      }}
      role="region"
      aria-label={`Layout variants for ${activeConfig?.label || sectionId}`}
    >
      <div
        className="flex items-center justify-between border-b px-3 sm:px-4 py-2 gap-2"
        style={{ borderColor: 'var(--wf-chrome-border)' }}
      >
        <div className="flex items-center gap-2 text-xs min-w-0">
          <span className="font-semibold truncate">{activeConfig?.label} Layouts</span>
          <span className="hidden sm:inline truncate" style={{ color: 'var(--wf-ink-muted)' }}>
            — Rendered with your live content
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close layout strip"
          className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-1 text-xs hover:bg-white/10 shrink-0"
          style={{
            borderColor: 'var(--wf-chrome-border)',
            color: 'var(--wf-ink-secondary)',
          }}
        >
          <X className="h-3.5 w-3.5" />
          <span>Close</span>
        </button>
      </div>

      <div className="wf-scroll flex-1 overflow-x-auto px-3 sm:px-4 py-3 flex items-stretch gap-3 sm:gap-3.5">
        {variants.map((variant) => {
          const isCurrent = variant.id === currentVariant;
          // Isolate ONLY the target section so the card previews that exact section with user's real data
          const isolatedSections = setSectionLayoutVariant(
            portfolio.presentation.sections,
            sectionId,
            variant.id
          ).map((s) => ({
            ...s,
            visible: s.id === sectionId,
          }));
          const previewPresentation: PresentationSettings = {
            ...portfolio.presentation,
            sections: isolatedSections,
          };

          return (
            <button
              key={variant.id}
              type="button"
              onMouseEnter={() => onHoverVariant(variant.id)}
              onMouseLeave={() => onHoverVariant(null)}
              onClick={() => onSelectVariant(variant.id)}
              className="group relative flex w-[260px] sm:w-[280px] shrink-0 flex-col overflow-hidden rounded-[4px] border text-left transition-colors"
              style={{
                borderColor: isCurrent ? '#D94E28' : 'var(--wf-chrome-border)',
                backgroundColor: 'var(--wf-chrome-elevated)',
              }}
            >
              <div className="relative h-[118px] w-full overflow-hidden border-b bg-[#141414]" style={{ borderColor: 'var(--wf-chrome-border)' }}>
                <div
                  className="pointer-events-none absolute top-0 left-0 origin-top-left"
                  style={{
                    width: '1240px',
                    transform: 'scale(0.225)',
                  }}
                  aria-hidden="true"
                >
                  <TemplateRenderer
                    content={portfolio.content}
                    presentation={previewPresentation}
                    assetMap={assetMap}
                    interactiveMode="gallery-thumb"
                    viewport="desktop"
                  />
                </div>
                {isCurrent && (
                  <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#D94E28] text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>

              <div className="px-3 py-2">
                <div className="text-xs font-semibold truncate">{variant.name}</div>
                <div className="text-[11px] truncate" style={{ color: 'var(--wf-ink-secondary)' }}>
                  {variant.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
