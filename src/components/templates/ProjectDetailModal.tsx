import React, { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { Project } from '../../types/portfolio';
import { PortfolioImage } from './PortfolioImage';

interface ProjectDetailModalProps {
  project: Project | null;
  assetMap: Record<string, string>;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  assetMap,
  onClose,
}) => {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-8"
      style={{ backgroundColor: 'rgba(12, 12, 14, 0.72)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div
        className="wf-scroll relative max-h-[92vh] sm:max-h-[88vh] w-full max-w-4xl overflow-y-auto border"
        style={{
          backgroundColor: 'var(--tpl-bg)',
          color: 'var(--tpl-ink)',
          borderColor: 'var(--tpl-border)',
          fontFamily: 'var(--tpl-body-font)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4"
          style={{
            backgroundColor: 'var(--tpl-bg)',
            borderColor: 'var(--tpl-border)',
          }}
        >
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs min-w-0" style={{ color: 'var(--tpl-muted)' }}>
            <span style={{ fontFamily: 'var(--tpl-mono-font)' }} className="tabular-nums">
              {project.year}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{project.category}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{project.role}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project detail"
            className="flex h-8 w-8 shrink-0 items-center justify-center border transition-opacity hover:opacity-75"
            style={{ borderColor: 'var(--tpl-border)', color: 'var(--tpl-ink)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 sm:p-10">
          <h2
            className="tpl-balance text-3xl sm:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: 'var(--tpl-display-font)' }}
          >
            {project.title}
          </h2>
          {project.subtitle && (
            <p className="mt-2 text-base" style={{ color: 'var(--tpl-muted)' }}>
              {project.subtitle}
            </p>
          )}

          <div className="mt-6 aspect-[16/9] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
            <PortfolioImage
              image={project.coverImage}
              assetMap={assetMap}
              className="h-full w-full"
              fallbackTitle={project.title}
            />
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <p className="text-base leading-relaxed font-medium">{project.summary}</p>
              {project.caseStudy.map((para, idx) => (
                <p
                  key={idx}
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--tpl-muted)' }}
                >
                  {para}
                </p>
              ))}
            </div>

            <div className="space-y-6 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6" style={{ borderColor: 'var(--tpl-border)' }}>
              {project.highlights.length > 0 && (
                <div>
                  <h3
                    className="text-xs uppercase tracking-wider mb-3"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                  >
                    Outcomes
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {project.highlights.map((item, idx) => (
                      <li key={idx} className="leading-snug">
                        — {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.tags.length > 0 && (
                <div>
                  <h3
                    className="text-xs uppercase tracking-wider mb-2"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                  >
                    Stack & Scope
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                    {project.tags.join(' · ')}
                  </p>
                </div>
              )}

              {(project.liveUrl || project.sourceUrl) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-opacity hover:opacity-85"
                      style={{
                        backgroundColor: 'var(--tpl-accent)',
                        color: 'var(--tpl-accent-ink)',
                      }}
                    >
                      <span>Live Project</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {project.sourceUrl && (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 border px-4 py-2 text-xs font-medium transition-opacity hover:opacity-75"
                      style={{
                        borderColor: 'var(--tpl-border)',
                        color: 'var(--tpl-ink)',
                      }}
                    >
                      <span>Case Study / Source</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {project.gallery.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 border-t pt-8" style={{ borderColor: 'var(--tpl-border)' }}>
              {project.gallery.map((item, idx) => (
                <figure key={idx} className="space-y-2">
                  <div className="aspect-[4/3] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                    <PortfolioImage
                      image={item}
                      assetMap={assetMap}
                      className="h-full w-full"
                      fallbackTitle={item.caption || project.title}
                    />
                  </div>
                  {item.caption && (
                    <figcaption className="text-xs" style={{ color: 'var(--tpl-muted)' }}>
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
