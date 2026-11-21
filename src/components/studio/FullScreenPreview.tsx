import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useStudioStore, type ViewportSize } from '../../store/studioStore';
import { exportPortfolioToZip } from '../../utils/exporter';
import { TemplateRenderer } from '../templates/TemplateRenderer';

interface FullScreenPreviewProps {
  onBackToStudio: () => void;
}

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  onBackToStudio,
}) => {
  const activePortfolio = useStudioStore((s) => s.activePortfolio);
  const assetUrls = useStudioStore((s) => s.assetUrls);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBackToStudio();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBackToStudio]);

  if (!activePortfolio) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPortfolioToZip(activePortfolio, assetUrls);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--wf-stage-charcoal)' }}
    >
      {/* Floating minimal top pill bar */}
      <div className="pointer-events-none fixed top-3 inset-x-0 z-50 flex justify-center px-3">
        <div
          className="pointer-events-auto flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full border px-2 sm:px-3 py-1.5 shadow-xl"
          style={{
            backgroundColor: 'rgba(24, 24, 27, 0.94)',
            borderColor: 'var(--wf-chrome-border)',
            color: 'var(--wf-ink-primary)',
          }}
        >
          <button
            type="button"
            onClick={onBackToStudio}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium hover:bg-white/10 whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Studio</span>
          </button>

          <div className="h-4 w-px bg-[#2E2E35]" />

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              aria-label="Preview desktop"
              className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-1 text-xs font-medium ${
                viewport === 'desktop' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              aria-label="Preview tablet"
              className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-1 text-xs font-medium ${
                viewport === 'tablet' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              aria-label="Preview mobile"
              className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-1 text-xs font-medium ${
                viewport === 'mobile' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#2E2E35]" />

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1 text-xs font-semibold whitespace-nowrap"
            style={{
              backgroundColor: 'var(--wf-action-ivory)',
              color: 'var(--wf-action-ivory-ink)',
            }}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sm:hidden">{exporting ? '...' : 'Export'}</span>
            <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export .zip'}</span>
          </button>
        </div>
      </div>

      <div className="wf-scroll flex-1 overflow-y-auto flex justify-center pt-16 pb-8 px-2 sm:px-4">
        <div
          className="h-fit min-h-full transition-[width] duration-200"
          style={{
            width: VIEWPORT_WIDTHS[viewport],
            maxWidth: '100%',
            border: viewport === 'desktop' ? 'none' : '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <TemplateRenderer
            content={activePortfolio.content}
            presentation={activePortfolio.presentation}
            assetMap={assetUrls}
            interactiveMode="preview"
            viewport={viewport}
          />
        </div>
      </div>
    </div>
  );
};
