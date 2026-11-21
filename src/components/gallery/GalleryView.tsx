import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Copy, Eye, Search, Trash2 } from 'lucide-react';
import { createSamplePortfolioContent } from '../../data/samples';
import { createDefaultSectionsForTemplate, TEMPLATE_LIST, TEMPLATES } from '../../data/templates';
import type { PortfolioContent, PortfolioDocument, PresentationSettings, TemplateId } from '../../types/portfolio';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { CreatePortfolioModal } from './CreatePortfolioModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';

interface GalleryViewProps {
  portfolios: PortfolioDocument[];
  onOpenPortfolio: (doc: PortfolioDocument) => void;
  onCreatePortfolio: (params: {
    templateId: TemplateId;
    title: string;
    personName: string;
    roleTitle: string;
    populateSample: boolean;
  }) => Promise<void>;
  onDuplicatePortfolio: (id: string) => Promise<void>;
  onDeletePortfolio: (id: string) => Promise<void>;
}

const CATEGORIES = [
  'All',
  'Creative & Brand',
  'Editorial & Product',
  'Developer & Technical',
] as const;

interface ScaledTemplateThumbProps {
  templateName: string;
  content: PortfolioContent;
  presentation: PresentationSettings;
  onPreview: () => void;
}

const ScaledTemplateThumb: React.FC<ScaledTemplateThumbProps> = ({
  templateName,
  content,
  presentation,
  onPreview,
}) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.305);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setScale(w / 1280);
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 0) {
        setScale(entry.contentRect.width / 1280);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative aspect-[16/11] w-full overflow-hidden border-b bg-[#18181B]"
      style={{ borderColor: 'var(--wf-gallery-border)' }}
    >
      <div
        className="pointer-events-none absolute top-0 left-0 origin-top-left"
        style={{
          width: '1280px',
          height: '880px',
          transform: `scale(${scale})`,
        }}
        aria-hidden="true"
      >
        <TemplateRenderer
          content={content}
          presentation={presentation}
          assetMap={{}}
          interactiveMode="gallery-thumb"
          viewport="desktop"
        />
      </div>

      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${templateName} live`}
        className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 bg-black/15"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#161618] px-3 py-1.5 text-xs font-medium text-[#F4F3EF]">
          <Eye className="h-3.5 w-3.5" />
          <span>Live Preview</span>
        </span>
      </button>
    </div>
  );
};

export const GalleryView: React.FC<GalleryViewProps> = ({
  portfolios,
  onOpenPortfolio,
  onCreatePortfolio,
  onDuplicatePortfolio,
  onDeletePortfolio,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'portfolios'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<(typeof CATEGORIES)[number]>('All');
  const [previewTemplateId, setPreviewTemplateId] = useState<TemplateId | null>(null);
  const [createTemplateId, setCreateTemplateId] = useState<TemplateId | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TEMPLATE_LIST.filter((tpl) => {
      const matchesCat = categoryFilter === 'All' || tpl.category === categoryFilter;
      const matchesSearch =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.audienceFit.toLowerCase().includes(q) ||
        tpl.tagline.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, categoryFilter]);

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(ts));
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: 'var(--wf-gallery-bg)',
        color: 'var(--wf-gallery-ink)',
      }}
    >
      {/* Top Bar Contract: 3 clean zones */}
      <header
        className="border-b"
        style={{ borderColor: 'var(--wf-gallery-border)', backgroundColor: 'var(--wf-gallery-surface)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2.5 sm:gap-8 px-4 sm:px-6 py-3 sm:py-4">
          <span
            className="text-sm sm:text-base font-bold tracking-[0.12em] sm:tracking-[0.16em] uppercase whitespace-nowrap shrink-0"
            style={{ fontFamily: 'var(--wf-font-sans)' }}
          >
            WORKFOLIO
          </span>

          <nav aria-label="Gallery sections" className="flex items-center gap-3.5 sm:gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`text-xs sm:text-sm font-medium whitespace-nowrap pb-0.5 transition-colors ${
                activeTab === 'templates'
                  ? 'border-b-2 border-[#161618] text-[#161618]'
                  : 'text-[#5C5B57] hover:text-[#161618]'
              }`}
            >
              Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('portfolios')}
              className={`text-xs sm:text-sm font-medium whitespace-nowrap pb-0.5 transition-colors tabular-nums ${
                activeTab === 'portfolios'
                  ? 'border-b-2 border-[#161618] text-[#161618]'
                  : 'text-[#5C5B57] hover:text-[#161618]'
              }`}
            >
              <span className="sm:hidden">Saved ({portfolios.length})</span>
              <span className="hidden sm:inline">My Portfolios ({portfolios.length})</span>
            </button>
          </nav>

          <div className="shrink-0">
            {portfolios.length > 0 ? (
              <button
                type="button"
                onClick={() => onOpenPortfolio(portfolios[0])}
                className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold transition-opacity hover:opacity-85 whitespace-nowrap"
                style={{ backgroundColor: '#161618', color: '#F4F3EF' }}
              >
                <span className="sm:hidden">Resume</span>
                <span className="hidden sm:inline">Resume Last Project</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCreateTemplateId('noir-collage')}
                className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold transition-opacity hover:opacity-85 whitespace-nowrap"
                style={{ backgroundColor: '#161618', color: '#F4F3EF' }}
              >
                <span className="sm:hidden">New</span>
                <span className="hidden sm:inline">New Portfolio</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        {activeTab === 'templates' ? (
          <div>
            {/* Editorial intro & controls */}
            <div className="grid gap-6 sm:gap-8 border-b pb-8 sm:pb-10 lg:grid-cols-12 lg:items-end" style={{ borderColor: 'var(--wf-gallery-border)' }}>
              <div className="lg:col-span-7">
                <p
                  className="text-xs uppercase tracking-[0.14em] mb-2.5 sm:mb-3"
                  style={{ fontFamily: 'var(--wf-font-mono)', color: 'var(--wf-gallery-muted)' }}
                >
                  Portfolio Creation Studio
                </p>
                <h1
                  className="tpl-balance text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.06]"
                  style={{ fontFamily: 'var(--wf-font-editorial)' }}
                >
                  Curated website architecture you customize and own.
                </h1>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C5B57]" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates or disciplines..."
                    aria-label="Search templates"
                    className="w-full rounded-[4px] border pl-9 pr-3 py-2 text-sm outline-none focus:border-[#161618]"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'var(--wf-gallery-border)',
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter templates by discipline">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                        categoryFilter === cat
                          ? 'bg-[#161618] text-[#F4F3EF]'
                          : 'border border-[#DDDAD2] bg-[#FAF9F6] text-[#5C5B57] hover:text-[#161618]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live-rendered template exhibition grid */}
            {filteredTemplates.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-base font-medium">No templates match “{searchQuery}”.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                  }}
                  className="mt-4 rounded-full border px-4 py-2 text-xs font-semibold"
                  style={{ borderColor: '#161618' }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="mt-8 sm:mt-12 grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10">
                {filteredTemplates.map((tpl, idx) => {
                  const sampleContent = createSamplePortfolioContent(undefined, tpl.id);
                  const presentation: PresentationSettings = {
                    templateId: tpl.id,
                    typographyId: tpl.defaultTypographyId,
                    paletteId: tpl.defaultPaletteId,
                    density: tpl.defaultDensity,
                    sections: createDefaultSectionsForTemplate(tpl.id),
                  };

                  return (
                    <article
                      key={tpl.id}
                      className="flex min-w-0 flex-col border"
                      style={{
                        borderColor: 'var(--wf-gallery-border)',
                        backgroundColor: 'var(--wf-gallery-surface)',
                      }}
                    >
                      <ScaledTemplateThumb
                        templateName={tpl.name}
                        content={sampleContent}
                        presentation={presentation}
                        onPreview={() => setPreviewTemplateId(tpl.id)}
                      />

                      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className="text-xs tabular-nums"
                              style={{ fontFamily: 'var(--wf-font-mono)', color: 'var(--wf-gallery-muted)' }}
                            >
                              {String(idx + 1).padStart(2, '0')} · {tpl.category}
                            </span>
                          </div>
                          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                            {tpl.name}
                          </h2>
                          <p className="mt-1 text-xs font-medium" style={{ color: 'var(--wf-gallery-muted)' }}>
                            {tpl.audienceFit}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--wf-gallery-muted)' }}>
                            {tpl.tagline}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center gap-3 border-t pt-5" style={{ borderColor: 'var(--wf-gallery-border)' }}>
                          <button
                            type="button"
                            onClick={() => setCreateTemplateId(tpl.id)}
                            className="flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-85 whitespace-nowrap"
                            style={{ backgroundColor: '#161618', color: '#F4F3EF' }}
                          >
                            Use Template
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewTemplateId(tpl.id)}
                            className="rounded-full border px-4 py-2 text-xs font-semibold transition-colors hover:bg-black/5 whitespace-nowrap"
                            style={{ borderColor: 'var(--wf-gallery-border)' }}
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-8" style={{ borderColor: 'var(--wf-gallery-border)' }}>
              <div>
                <p
                  className="text-xs uppercase tracking-[0.14em] mb-2"
                  style={{ fontFamily: 'var(--wf-font-mono)', color: 'var(--wf-gallery-muted)' }}
                >
                  Local IndexedDB Workspace
                </p>
                <h1
                  className="text-3xl sm:text-4xl font-semibold tracking-tight"
                  style={{ fontFamily: 'var(--wf-font-editorial)' }}
                >
                  My Portfolios
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className="rounded-full px-4 py-2 text-xs font-semibold"
                style={{ backgroundColor: '#161618', color: '#F4F3EF' }}
              >
                + New from Template
              </button>
            </div>

            {portfolios.length === 0 ? (
              <div className="py-16 text-center border mt-8" style={{ borderColor: 'var(--wf-gallery-border)', backgroundColor: 'var(--wf-gallery-surface)' }}>
                <p className="text-base font-medium">No saved portfolios yet.</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--wf-gallery-muted)' }}>
                  Choose a curated template to launch your first portfolio workspace.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('templates')}
                  className="mt-5 rounded-full px-5 py-2 text-xs font-semibold"
                  style={{ backgroundColor: '#161618', color: '#F4F3EF' }}
                >
                  Browse Templates
                </button>
              </div>
            ) : (
              <div className="mt-8 divide-y border" style={{ borderColor: 'var(--wf-gallery-border)', backgroundColor: 'var(--wf-gallery-surface)' }}>
                {portfolios.map((pf) => {
                  const tpl = TEMPLATES[pf.presentation.templateId];
                  const isConfirming = confirmDeleteId === pf.id;
                  return (
                    <div
                      key={pf.id}
                      className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                      style={{ borderColor: 'var(--wf-gallery-border)' }}
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--wf-gallery-muted)' }}>
                          <span style={{ fontFamily: 'var(--wf-font-mono)' }}>{tpl.name}</span>
                          <span aria-hidden="true">·</span>
                          <span>{pf.content.projects.length} projects</span>
                          <span aria-hidden="true">·</span>
                          <span>Updated {formatDate(pf.updatedAt)}</span>
                        </div>
                        <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
                          {pf.name}
                        </h2>
                        <p className="mt-0.5 text-sm" style={{ color: 'var(--wf-gallery-muted)' }}>
                          {pf.content.personName} — {pf.content.roleTitle}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenPortfolio(pf)}
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-85"
                          style={{ backgroundColor: '#161618', color: '#F4F3EF' }}
                        >
                          <span>Open in Studio</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicatePortfolio(pf.id)}
                          aria-label={`Duplicate ${pf.name}`}
                          className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium hover:bg-black/5"
                          style={{ borderColor: 'var(--wf-gallery-border)' }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Duplicate</span>
                        </button>

                        {isConfirming ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                await onDeletePortfolio(pf.id);
                                setConfirmDeleteId(null);
                              }}
                              className="rounded-full bg-[#D94E28] px-3.5 py-2 text-xs font-semibold text-white"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-full border px-3 py-2 text-xs font-medium"
                              style={{ borderColor: 'var(--wf-gallery-border)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(pf.id)}
                            aria-label={`Delete ${pf.name}`}
                            className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium text-[#9C2F14] hover:bg-black/5"
                            style={{ borderColor: 'var(--wf-gallery-border)' }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <TemplatePreviewModal
        templateId={previewTemplateId}
        onClose={() => setPreviewTemplateId(null)}
        onUseTemplate={(tplId) => {
          setPreviewTemplateId(null);
          setCreateTemplateId(tplId);
        }}
      />

      <CreatePortfolioModal
        templateId={createTemplateId}
        onClose={() => setCreateTemplateId(null)}
        onCreate={async (params) => {
          await onCreatePortfolio(params);
          setCreateTemplateId(null);
        }}
      />
    </div>
  );
};
