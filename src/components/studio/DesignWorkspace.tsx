import React from 'react';
import { Check } from 'lucide-react';
import { TEMPLATE_LIST, TEMPLATES } from '../../data/templates';
import type { Density, PortfolioDocument, TemplateId } from '../../types/portfolio';

interface DesignWorkspaceProps {
  portfolio: PortfolioDocument;
  className?: string;
  onSwitchTemplate: (id: TemplateId) => void;
  onSelectTypography: (id: string) => void;
  onSelectPalette: (id: string) => void;
  onSelectDensity: (density: Density) => void;
}

export const DesignWorkspace: React.FC<DesignWorkspaceProps> = ({
  portfolio,
  className = '',
  onSwitchTemplate,
  onSelectTypography,
  onSelectPalette,
  onSelectDensity,
}) => {
  const { templateId, typographyId, paletteId, density } = portfolio.presentation;
  const activeTemplate = TEMPLATES[templateId];

  return (
    <aside
      className={`wf-scroll flex h-full w-full lg:w-[360px] shrink-0 flex-col overflow-y-auto lg:border-l p-4 space-y-6 ${className}`}
      style={{
        backgroundColor: 'var(--wf-chrome-bg)',
        borderColor: 'var(--wf-chrome-border)',
        color: 'var(--wf-ink-primary)',
      }}
      aria-label="Design system inspector"
    >
      {/* Template Switcher */}
      <section className="space-y-2.5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--wf-ink-secondary)' }}>
            Active Template
          </h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--wf-ink-muted)' }}>
            Switching preserves all projects, copy, and uploaded images.
          </p>
        </div>

        <div className="space-y-2">
          {TEMPLATE_LIST.map((tpl) => {
            const isCurrent = tpl.id === templateId;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onSwitchTemplate(tpl.id)}
                className="flex w-full items-start justify-between gap-3 rounded-[4px] border p-3 text-left transition-colors"
                style={{
                  borderColor: isCurrent ? '#D94E28' : 'var(--wf-chrome-border)',
                  backgroundColor: isCurrent
                    ? 'rgba(217, 78, 40, 0.12)'
                    : 'var(--wf-chrome-elevated)',
                }}
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold">{tpl.name}</div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--wf-ink-secondary)' }}>
                    {tpl.audienceFit}
                  </div>
                </div>
                <span
                  className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0 ${
                    isCurrent
                      ? 'bg-[#D94E28] text-white'
                      : 'border border-[#2E2E35] text-[#A1A09A]'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Active</span>
                    </>
                  ) : (
                    <span>Switch</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Typography Pairings */}
      <section className="space-y-2.5 border-t pt-5" style={{ borderColor: 'var(--wf-chrome-border)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--wf-ink-secondary)' }}>
          Typography Pairing
        </h2>

        <div className="space-y-2">
          {activeTemplate.typographyPairings.map((pair) => {
            const isActive = pair.id === typographyId;
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => onSelectTypography(pair.id)}
                className="w-full rounded-[4px] border p-3 text-left transition-colors"
                style={{
                  borderColor: isActive ? '#D94E28' : 'var(--wf-chrome-border)',
                  backgroundColor: isActive
                    ? 'rgba(217, 78, 40, 0.12)'
                    : 'var(--wf-chrome-elevated)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-base leading-tight"
                    style={{ fontFamily: pair.displayFont, fontWeight: 600 }}
                  >
                    Aa Bb — {pair.name}
                  </span>
                  {isActive && <Check className="h-3.5 w-3.5 text-[#D94E28] shrink-0" />}
                </div>
                <p
                  className="mt-1 text-[11px]"
                  style={{ fontFamily: pair.bodyFont, color: 'var(--wf-ink-secondary)' }}
                >
                  {pair.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Color Palettes */}
      <section className="space-y-2.5 border-t pt-5" style={{ borderColor: 'var(--wf-chrome-border)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--wf-ink-secondary)' }}>
          Color Palette
        </h2>

        <div className="grid grid-cols-1 gap-2">
          {activeTemplate.palettes.map((pal) => {
            const isActive = pal.id === paletteId;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => onSelectPalette(pal.id)}
                className="flex items-center justify-between gap-3 rounded-[4px] border p-2.5 text-left transition-colors"
                style={{
                  borderColor: isActive ? '#D94E28' : 'var(--wf-chrome-border)',
                  backgroundColor: isActive
                    ? 'rgba(217, 78, 40, 0.12)'
                    : 'var(--wf-chrome-elevated)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-12 overflow-hidden rounded-[2px] border border-white/15">
                    <span className="flex-1" style={{ backgroundColor: pal.bg }} />
                    <span className="flex-1" style={{ backgroundColor: pal.ink }} />
                    <span className="flex-1" style={{ backgroundColor: pal.accent }} />
                  </div>
                  <span className="text-xs font-medium">{pal.name}</span>
                </div>
                {isActive && <Check className="h-3.5 w-3.5 text-[#D94E28]" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Layout Density */}
      <section className="space-y-2.5 border-t pt-5" style={{ borderColor: 'var(--wf-chrome-border)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--wf-ink-secondary)' }}>
          Layout Density
        </h2>

        <div
          className="grid grid-cols-3 gap-1 rounded-[4px] border p-1"
          style={{
            backgroundColor: 'var(--wf-chrome-elevated)',
            borderColor: 'var(--wf-chrome-border)',
          }}
        >
          {(['compact', 'balanced', 'spacious'] as const).map((level) => {
            const active = density === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => onSelectDensity(level)}
                className={`rounded-[3px] py-1.5 text-xs font-medium capitalize transition-colors ${
                  active
                    ? 'bg-[#F4F3EF] text-[#161618]'
                    : 'text-[#A1A09A] hover:text-white'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
};
