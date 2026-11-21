import React, { useState } from 'react';
import { ArrowUpRight, Menu, Play, X } from 'lucide-react';
import type { SectionId } from '../../types/portfolio';
import { EditableText } from './EditableText';
import { PortfolioImage } from './PortfolioImage';
import { SectionShell } from './SectionShell';
import { getEffectiveVariant, type TemplateRendererProps } from './templateTypes';

export const NoirCollageTemplate: React.FC<TemplateRendererProps> = ({
  content,
  presentation,
  assetMap,
  interactiveMode,
  viewport,
  selectedSectionId,
  onSelectSection,
  onInlineUpdate,
  onOpenProject,
  previewVariantOverride,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';
  const isStudio = interactiveMode === 'studio';

  const canEditSection = (id: SectionId) =>
    isStudio && selectedSectionId === id && Boolean(onInlineUpdate);

  const visibleSections = presentation.sections.filter((s) => s.visible);

  const renderSection = (sectionId: SectionId, indexNum: string, label: string) => {
    const variant = getEffectiveVariant(presentation, sectionId, previewVariantOverride);

    switch (sectionId) {
      case 'header': {
        return (
          <SectionShell
            key={sectionId}
            sectionId="header"
            indexNumber={indexNum}
            label={label}
            interactiveMode={interactiveMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
          >
            <header
              className={`relative z-20 flex items-center justify-between ${
                isMobile ? 'px-5 py-4' : 'px-8 lg:px-12 py-5'
              } ${variant === 'editorial-bar' ? 'border-b' : ''}`}
              style={{ borderColor: 'var(--tpl-border)' }}
            >
              {/* Custom layered geometric mark */}
              <div className="flex items-center gap-3 shrink-0">
                <svg
                  width="34"
                  height="24"
                  viewBox="0 0 34 24"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
                  <circle cx="16" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                  <circle cx="20" cy="12" r="9.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.4" />
                  <line x1="18" y1="8.5" x2="18" y2="15.5" stroke="currentColor" strokeWidth="1.6" />
                  <line x1="22" y1="8.5" x2="22" y2="15.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {variant === 'minimal-split' && (
                  <EditableText
                    value={content.brandName}
                    canEdit={canEditSection('header')}
                    onCommit={(val) =>
                      onInlineUpdate?.((c) => ({ ...c, brandName: val }))
                    }
                    className="text-xs font-semibold uppercase tracking-[0.18em] whitespace-nowrap"
                  />
                )}
              </div>

              {!isMobile ? (
                <nav
                  aria-label="Primary"
                  className={`flex items-center ${isTablet ? 'gap-5' : 'gap-8'} text-[11px] font-medium uppercase tracking-[0.16em]`}
                >
                  {content.navLinks.slice(0, 5).map((link) => (
                    <a
                      key={link.id}
                      href={interactiveMode === 'preview' ? link.href : undefined}
                      onClick={(e) => {
                        if (interactiveMode !== 'preview') e.preventDefault();
                      }}
                      className="whitespace-nowrap transition-opacity hover:opacity-65"
                      style={{ color: 'var(--tpl-ink)' }}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              ) : (
                <button
                  type="button"
                  aria-label="Toggle navigation menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen((v) => !v);
                  }}
                  className="flex h-9 w-9 items-center justify-center border"
                  style={{ borderColor: 'var(--tpl-border)' }}
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
              )}

              {!isMobile && (
                <a
                  href={interactiveMode === 'preview' ? content.headerCtaHref : undefined}
                  onClick={(e) => {
                    if (interactiveMode !== 'preview') e.preventDefault();
                  }}
                  className={`inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] whitespace-nowrap shrink-0 transition-opacity hover:opacity-80 ${
                    variant === 'center-nav-pill'
                      ? 'rounded-full border px-4 py-2'
                      : 'border px-3.5 py-1.5'
                  }`}
                  style={{
                    borderColor: 'var(--tpl-border)',
                    color: 'var(--tpl-ink)',
                  }}
                >
                  <EditableText
                    value={content.headerCtaLabel}
                    canEdit={canEditSection('header')}
                    onCommit={(val) =>
                      onInlineUpdate?.((c) => ({ ...c, headerCtaLabel: val }))
                    }
                  />
                  <Play className="h-2.5 w-2.5 fill-current" />
                </a>
              )}
            </header>

            {isMobile && mobileMenuOpen && (
              <div
                className="border-b px-5 py-4 flex flex-col gap-3 text-xs uppercase tracking-[0.16em]"
                style={{
                  borderColor: 'var(--tpl-border)',
                  backgroundColor: 'var(--tpl-surface)',
                }}
              >
                {content.navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={interactiveMode === 'preview' ? link.href : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </SectionShell>
        );
      }

      case 'hero': {
        const line1 = content.hero.headlinePrimary || 'UI/UX';
        const line2 = content.hero.headlineSecondary || '';
        const line3 = content.hero.headlineOutline || '';
        const collage = content.hero.collageImages;

        return (
          <SectionShell
            key={sectionId}
            sectionId="hero"
            indexNumber={indexNum}
            label={label}
            interactiveMode={interactiveMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
          >
            <section
              className={`relative ${isMobile ? 'px-5 pt-8 pb-12' : 'px-8 lg:px-12 pt-10 pb-16'}`}
            >
              {variant === 'collage-spread' && (
                <div>
                  <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--tpl-muted)' }}>
                    <EditableText
                      value={content.hero.eyebrow}
                      canEdit={canEditSection('hero')}
                      onCommit={(val) =>
                        onInlineUpdate?.((c) => ({
                          ...c,
                          hero: { ...c.hero, eyebrow: val },
                        }))
                      }
                    />
                    {!isMobile && <span>{content.location}</span>}
                  </div>

                  {/* Architectural Collage Spread Typography + Tucked Visual Plates */}
                  <div className="relative py-4">
                    {!isMobile && collage.length >= 4 && (
                      <>
                        {/* Top-left floating studio card */}
                        <div
                          className="pointer-events-none absolute top-2 left-[14%] z-10 w-[13%] aspect-[4/3] overflow-hidden border shadow-lg"
                          style={{ borderColor: 'var(--tpl-border)', transform: 'rotate(-4deg)' }}
                        >
                          <PortfolioImage
                            image={collage[1]}
                            assetMap={assetMap}
                            className="h-full w-full"
                          />
                        </div>
                        {/* Top-right staggered card */}
                        <div
                          className="pointer-events-none absolute top-0 right-[12%] z-10 w-[15%] aspect-[4/3] overflow-hidden border shadow-lg"
                          style={{ borderColor: 'var(--tpl-border)' }}
                        >
                          <PortfolioImage
                            image={collage[3]}
                            assetMap={assetMap}
                            className="h-full w-full"
                          />
                        </div>
                      </>
                    )}

                    <div
                      className="relative z-0 uppercase select-none"
                      style={{
                        fontFamily: 'var(--tpl-display-font)',
                        fontWeight: 'var(--tpl-display-weight, 700)',
                        letterSpacing: 'var(--tpl-display-tracking, -0.02em)',
                        lineHeight: 0.88,
                      }}
                    >
                      <div
                        className="relative break-words"
                        style={{
                          fontSize: isMobile
                            ? 'clamp(2.4rem, 11vw, 3.5rem)'
                            : isTablet
                              ? '5.2rem'
                              : 'clamp(4.8rem, 10.5vw, 8.8rem)',
                        }}
                      >
                        <EditableText
                          as="h1"
                          value={line1}
                          canEdit={canEditSection('hero')}
                          onCommit={(val) =>
                            onInlineUpdate?.((c) => ({
                              ...c,
                              hero: { ...c.hero, headlinePrimary: val },
                            }))
                          }
                          className="block"
                        />
                      </div>

                      {line2 && (
                        <div
                          className={`relative break-words ${isMobile ? 'pl-6' : 'text-right pr-2'}`}
                          style={{
                            fontSize: isMobile
                              ? 'clamp(2.4rem, 11vw, 3.5rem)'
                              : isTablet
                                ? '5.2rem'
                                : 'clamp(4.8rem, 10.5vw, 8.8rem)',
                          }}
                        >
                          <EditableText
                            as="div"
                            value={line2}
                            canEdit={canEditSection('hero')}
                            onCommit={(val) =>
                              onInlineUpdate?.((c) => ({
                                ...c,
                                hero: { ...c.hero, headlineSecondary: val },
                              }))
                            }
                            className="inline-block"
                          />
                        </div>
                      )}

                      {line3 && (
                        <div
                          className={`relative break-words ${isMobile ? '' : 'pl-[16%]'}`}
                          style={{
                            fontSize: isMobile
                              ? 'clamp(2.3rem, 10.5vw, 3.4rem)'
                              : isTablet
                                ? '5rem'
                                : 'clamp(4.6rem, 10vw, 8.5rem)',
                          }}
                        >
                          <EditableText
                            as="div"
                            value={line3}
                            canEdit={canEditSection('hero')}
                            onCommit={(val) =>
                              onInlineUpdate?.((c) => ({
                                ...c,
                                hero: { ...c.hero, headlineOutline: val },
                              }))
                            }
                            className="tpl-noir-stroke inline-block"
                          />
                        </div>
                      )}
                    </div>

                    {/* Mid & lower collage plates overlapping cleanly on desktop/tablet */}
                    {!isMobile && collage.length >= 4 && (
                      <>
                        <div
                          className="pointer-events-none absolute top-[38%] left-[34%] z-10 w-[13%] aspect-[3/4] overflow-hidden border shadow-xl"
                          style={{ borderColor: 'var(--tpl-border)' }}
                        >
                          <PortfolioImage
                            image={collage[2]}
                            assetMap={assetMap}
                            className="h-full w-full"
                          />
                        </div>
                        <div
                          className="pointer-events-none absolute bottom-[12%] right-[14%] z-10 w-[14%] aspect-[4/3] overflow-hidden border shadow-xl"
                          style={{ borderColor: 'var(--tpl-border)' }}
                        >
                          <PortfolioImage
                            image={collage[0]}
                            assetMap={assetMap}
                            className="h-full w-full"
                          />
                        </div>
                        <div
                          className="pointer-events-none absolute bottom-[4%] left-[52%] z-10 w-[12%] aspect-square overflow-hidden border shadow-xl"
                          style={{ borderColor: 'var(--tpl-border)' }}
                        >
                          <PortfolioImage
                            image={collage[4] || collage[0]}
                            assetMap={assetMap}
                            className="h-full w-full"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile collage strip */}
                  {isMobile && collage.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {collage.slice(0, 3).map((img, i) => (
                        <div key={i} className="aspect-[4/3] overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                          <PortfolioImage image={img} assetMap={assetMap} className="h-full w-full" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lower lead + CTA row */}
                  <div
                    className={`mt-10 grid gap-6 border-t pt-6 ${
                      isMobile ? 'grid-cols-1' : 'grid-cols-12 items-end'
                    }`}
                    style={{ borderColor: 'var(--tpl-border)' }}
                  >
                    <div className={isMobile ? '' : 'col-span-7'}>
                      <EditableText
                        as="p"
                        multiline
                        value={content.hero.subheadline}
                        canEdit={canEditSection('hero')}
                        onCommit={(val) =>
                          onInlineUpdate?.((c) => ({
                            ...c,
                            hero: { ...c.hero, subheadline: val },
                          }))
                        }
                        className="text-sm sm:text-base leading-relaxed max-w-xl"
                        style={{ color: 'var(--tpl-muted)' }}
                      />
                    </div>
                    <div className={`${isMobile ? '' : 'col-span-5 flex justify-end'} flex flex-wrap gap-3`}>
                      <a
                        href={interactiveMode === 'preview' ? content.hero.primaryCtaHref : undefined}
                        onClick={(e) => {
                          if (interactiveMode !== 'preview') e.preventDefault();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-85"
                        style={{
                          backgroundColor: 'var(--tpl-accent)',
                          color: 'var(--tpl-accent-ink)',
                        }}
                      >
                        <EditableText
                          value={content.hero.primaryCtaLabel}
                          canEdit={canEditSection('hero')}
                          onCommit={(val) =>
                            onInlineUpdate?.((c) => ({
                              ...c,
                              hero: { ...c.hero, primaryCtaLabel: val },
                            }))
                          }
                        />
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {variant === 'split-monolith' && (
                <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-stretch'}`}>
                  <div className={`${isMobile ? '' : 'col-span-7'} flex flex-col justify-between py-2`}>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: 'var(--tpl-muted)' }}>
                        <EditableText
                          value={content.hero.eyebrow}
                          canEdit={canEditSection('hero')}
                          onCommit={(val) =>
                            onInlineUpdate?.((c) => ({
                              ...c,
                              hero: { ...c.hero, eyebrow: val },
                            }))
                          }
                        />
                      </p>
                      <h1
                        className="uppercase tpl-balance"
                        style={{
                          fontFamily: 'var(--tpl-display-font)',
                          fontSize: isMobile ? '3rem' : 'clamp(3.6rem, 6.2vw, 5.8rem)',
                          lineHeight: 0.92,
                          fontWeight: 'var(--tpl-display-weight, 700)',
                        }}
                      >
                        <EditableText
                          value={line1}
                          canEdit={canEditSection('hero')}
                          onCommit={(val) =>
                            onInlineUpdate?.((c) => ({
                              ...c,
                              hero: { ...c.hero, headlinePrimary: val },
                            }))
                          }
                        />{' '}
                        {line2 && (
                          <EditableText
                            value={line2}
                            canEdit={canEditSection('hero')}
                            onCommit={(val) =>
                              onInlineUpdate?.((c) => ({
                                ...c,
                                hero: { ...c.hero, headlineSecondary: val },
                              }))
                            }
                          />
                        )}{' '}
                        {line3 && (
                          <span className="tpl-noir-stroke">
                            <EditableText
                              value={line3}
                              canEdit={canEditSection('hero')}
                              onCommit={(val) =>
                                onInlineUpdate?.((c) => ({
                                  ...c,
                                  hero: { ...c.hero, headlineOutline: val },
                                }))
                              }
                            />
                          </span>
                        )}
                      </h1>
                    </div>

                    <div className="mt-8 space-y-6">
                      <EditableText
                        as="p"
                        multiline
                        value={content.hero.subheadline}
                        canEdit={canEditSection('hero')}
                        onCommit={(val) =>
                          onInlineUpdate?.((c) => ({
                            ...c,
                            hero: { ...c.hero, subheadline: val },
                          }))
                        }
                        className="text-sm sm:text-base leading-relaxed max-w-lg"
                        style={{ color: 'var(--tpl-muted)' }}
                      />
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={interactiveMode === 'preview' ? content.hero.primaryCtaHref : undefined}
                          onClick={(e) => {
                            if (interactiveMode !== 'preview') e.preventDefault();
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em]"
                          style={{
                            backgroundColor: 'var(--tpl-accent)',
                            color: 'var(--tpl-accent-ink)',
                          }}
                        >
                          {content.hero.primaryCtaLabel}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className={`${isMobile ? 'aspect-[4/3]' : 'col-span-5 min-h-[380px]'} overflow-hidden border`} style={{ borderColor: 'var(--tpl-border)' }}>
                    <PortfolioImage
                      image={content.hero.portraitImage}
                      assetMap={assetMap}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}

              {variant === 'centered-stack' && (
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--tpl-muted)' }}>
                    {content.hero.eyebrow}
                  </p>
                  <h1
                    className="mx-auto max-w-4xl uppercase tpl-balance"
                    style={{
                      fontFamily: 'var(--tpl-display-font)',
                      fontSize: isMobile ? '3rem' : 'clamp(4rem, 8vw, 6.8rem)',
                      lineHeight: 0.9,
                    }}
                  >
                    <EditableText
                      value={line1}
                      canEdit={canEditSection('hero')}
                      onCommit={(val) =>
                        onInlineUpdate?.((c) => ({
                          ...c,
                          hero: { ...c.hero, headlinePrimary: val },
                        }))
                      }
                    />{' '}
                    {line2}{' '}
                    {line3 && <span className="tpl-noir-stroke">{line3}</span>}
                  </h1>
                  <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                    {content.hero.subheadline}
                  </p>
                  <div className="mt-8 aspect-[16/7] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                    <PortfolioImage
                      image={content.hero.collageImages[3] || content.hero.portraitImage}
                      assetMap={assetMap}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              )}
            </section>
          </SectionShell>
        );
      }

      case 'projects': {
        return (
          <SectionShell
            key={sectionId}
            sectionId="projects"
            indexNumber={indexNum}
            label={label}
            interactiveMode={interactiveMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
          >
            <section
              className={`border-t ${isMobile ? 'px-5 py-12' : 'px-8 lg:px-12'}`}
              style={{
                borderColor: 'var(--tpl-border)',
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div className={`mb-10 flex ${isMobile ? 'flex-col gap-3' : 'items-end justify-between gap-6'}`}>
                <div>
                  <span
                    className="block text-[11px] uppercase tracking-[0.18em] mb-2"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                  >
                    {content.projectsSection.eyebrow}
                  </span>
                  <h2
                    className="uppercase tracking-tight"
                    style={{
                      fontFamily: 'var(--tpl-display-font)',
                      fontSize: isMobile ? '2.25rem' : '3.25rem',
                      lineHeight: 0.95,
                    }}
                  >
                    <EditableText
                      value={content.projectsSection.heading}
                      canEdit={canEditSection('projects')}
                      onCommit={(val) =>
                        onInlineUpdate?.((c) => ({
                          ...c,
                          projectsSection: { ...c.projectsSection, heading: val },
                        }))
                      }
                    />
                  </h2>
                </div>
                <p className="max-w-sm text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                  <EditableText
                    value={content.projectsSection.intro}
                    canEdit={canEditSection('projects')}
                    onCommit={(val) =>
                      onInlineUpdate?.((c) => ({
                        ...c,
                        projectsSection: { ...c.projectsSection, intro: val },
                      }))
                    }
                  />
                </p>
              </div>

              {variant === 'editorial-row-index' ? (
                <div className="divide-y border-y" style={{ borderColor: 'var(--tpl-border)' }}>
                  {content.projects.map((proj, idx) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={(e) => {
                        if (interactiveMode === 'preview' && onOpenProject) {
                          e.stopPropagation();
                          onOpenProject(proj);
                        }
                      }}
                      className="group grid w-full grid-cols-12 items-center gap-4 py-5 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <span
                        className="col-span-2 sm:col-span-1 text-xs tabular-nums"
                        style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="col-span-10 sm:col-span-5">
                        <h3 className="text-lg sm:text-xl font-semibold tracking-tight group-hover:underline">
                          {proj.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--tpl-muted)' }}>
                          {proj.subtitle}
                        </p>
                      </div>
                      {!isMobile && (
                        <div className="col-span-4 text-xs" style={{ color: 'var(--tpl-muted)' }}>
                          {proj.role} · {proj.year}
                        </div>
                      )}
                      {!isMobile && (
                        <div className="col-span-2 flex justify-end">
                          <div className="h-14 w-24 overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                            <PortfolioImage image={proj.coverImage} assetMap={assetMap} className="h-full w-full" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
                  {content.projects.map((proj, idx) => {
                    const spanClass =
                      isMobile
                        ? ''
                        : variant === 'asymmetric-collage'
                          ? idx % 3 === 0
                            ? 'col-span-7'
                            : 'col-span-5'
                          : 'col-span-6';
                    return (
                      <article
                        key={proj.id}
                        className={`${spanClass} group flex flex-col`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            if (interactiveMode === 'preview' && onOpenProject) {
                              e.stopPropagation();
                              onOpenProject(proj);
                            }
                          }}
                          className="text-left focus:outline-none"
                        >
                          <div
                            className={`w-full overflow-hidden border ${
                              variant === 'asymmetric-collage' && idx % 3 === 0 && !isMobile
                                ? 'aspect-[16/10]'
                                : 'aspect-[4/3]'
                            }`}
                            style={{ borderColor: 'var(--tpl-border)' }}
                          >
                            <PortfolioImage
                              image={proj.coverImage}
                              assetMap={assetMap}
                              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
                              fallbackTitle={proj.title}
                            />
                          </div>
                          <div className="mt-4 flex items-baseline justify-between gap-4">
                            <h3 className="text-lg font-semibold tracking-tight group-hover:underline">
                              {proj.title}
                            </h3>
                            <span
                              className="text-[11px] tabular-nums shrink-0"
                              style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                            >
                              {proj.year}
                            </span>
                          </div>
                          <p className="mt-1 text-xs" style={{ color: 'var(--tpl-muted)' }}>
                            {proj.category} · {proj.role}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--tpl-muted)' }}>
                            {proj.summary}
                          </p>
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </SectionShell>
        );
      }

      case 'experience': {
        return (
          <SectionShell
            key={sectionId}
            sectionId="experience"
            indexNumber={indexNum}
            label={label}
            interactiveMode={interactiveMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
          >
            <section
              className={`border-t ${isMobile ? 'px-5 py-12' : 'px-8 lg:px-12'}`}
              style={{
                borderColor: 'var(--tpl-border)',
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div className={`grid gap-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
                <div className={isMobile ? '' : 'col-span-4'}>
                  <span
                    className="block text-[11px] uppercase tracking-[0.18em] mb-2"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                  >
                    {content.experienceSection.eyebrow}
                  </span>
                  <h2
                    className="uppercase"
                    style={{
                      fontFamily: 'var(--tpl-display-font)',
                      fontSize: isMobile ? '2rem' : '2.75rem',
                      lineHeight: 0.96,
                    }}
                  >
                    <EditableText
                      value={content.experienceSection.heading}
                      canEdit={canEditSection('experience')}
                      onCommit={(val) =>
                        onInlineUpdate?.((c) => ({
                          ...c,
                          experienceSection: { ...c.experienceSection, heading: val },
                        }))
                      }
                    />
                  </h2>

                  {variant !== 'compact-archive' && (
                    <div className="mt-8">
                      <h3
                        className="text-[11px] uppercase tracking-[0.16em] mb-3"
                        style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                      >
                        Disciplines
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--tpl-ink)' }}>
                        {content.skills.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`${isMobile ? '' : 'col-span-8'} divide-y border-t`} style={{ borderColor: 'var(--tpl-border)' }}>
                  {content.experience.map((exp) => (
                    <div key={exp.id} className={`py-5 grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
                      <div className={isMobile ? '' : 'col-span-4'}>
                        <div
                          className="text-xs tabular-nums"
                          style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                        >
                          {exp.period}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--tpl-muted)' }}>
                          {exp.location}
                        </div>
                      </div>
                      <div className={isMobile ? '' : 'col-span-8'}>
                        <h3 className="text-base font-semibold">{exp.role}</h3>
                        <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--tpl-muted)' }}>
                          {exp.company}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                          {exp.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </SectionShell>
        );
      }

      case 'about': {
        return (
          <SectionShell
            key={sectionId}
            sectionId="about"
            indexNumber={indexNum}
            label={label}
            interactiveMode={interactiveMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
          >
            <section
              className={`border-t ${isMobile ? 'px-5 py-12' : 'px-8 lg:px-12'}`}
              style={{
                borderColor: 'var(--tpl-border)',
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              {variant === 'statement-full' ? (
                <div className="max-w-4xl">
                  <span
                    className="block text-[11px] uppercase tracking-[0.18em] mb-3"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                  >
                    {content.about.eyebrow}
                  </span>
                  <h2
                    className="text-2xl sm:text-4xl font-semibold tracking-tight tpl-balance"
                    style={{ fontFamily: 'var(--tpl-display-font)' }}
                  >
                    <EditableText
                      value={content.about.heading}
                      canEdit={canEditSection('about')}
                      onCommit={(val) =>
                        onInlineUpdate?.((c) => ({
                          ...c,
                          about: { ...c.about, heading: val },
                        }))
                      }
                    />
                  </h2>
                  <div className="mt-6 space-y-4">
                    {content.about.paragraphs.map((p, idx) => (
                      <p key={idx} className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`grid gap-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-center'}`}>
                  <div className={isMobile ? '' : 'col-span-5'}>
                    <div className="aspect-[3/4] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                      <PortfolioImage
                        image={content.about.image}
                        assetMap={assetMap}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                  <div className={isMobile ? '' : 'col-span-7'}>
                    <span
                      className="block text-[11px] uppercase tracking-[0.18em] mb-3"
                      style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                    >
                      {content.about.eyebrow}
                    </span>
                    <h2
                      className="text-2xl sm:text-3xl font-semibold tracking-tight tpl-balance"
                      style={{ fontFamily: 'var(--tpl-display-font)' }}
                    >
                      <EditableText
                        value={content.about.heading}
                        canEdit={canEditSection('about')}
                        onCommit={(val) =>
                          onInlineUpdate?.((c) => ({
                            ...c,
                            about: { ...c.about, heading: val },
                          }))
                        }
                      />
                    </h2>
                    <div className="mt-5 space-y-4">
                      {content.about.paragraphs.map((p, idx) => (
                        <p key={idx} className="text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </SectionShell>
        );
      }

      case 'contact': {
        return (
          <SectionShell
            key={sectionId}
            sectionId="contact"
            indexNumber={indexNum}
            label={label}
            interactiveMode={interactiveMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
          >
            <section
              className={`border-t ${isMobile ? 'px-5 py-12' : 'px-8 lg:px-12'}`}
              style={{
                borderColor: 'var(--tpl-border)',
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-end'}`}>
                <div className={isMobile ? '' : 'col-span-8'}>
                  <span
                    className="block text-[11px] uppercase tracking-[0.18em] mb-2"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                  >
                    {content.contact.eyebrow}
                  </span>
                  <h2
                    className="uppercase tpl-balance"
                    style={{
                      fontFamily: 'var(--tpl-display-font)',
                      fontSize: isMobile ? '2.4rem' : '3.75rem',
                      lineHeight: 0.94,
                    }}
                  >
                    <EditableText
                      value={content.contact.heading}
                      canEdit={canEditSection('contact')}
                      onCommit={(val) =>
                        onInlineUpdate?.((c) => ({
                          ...c,
                          contact: { ...c.contact, heading: val },
                        }))
                      }
                    />
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                    {content.contact.intro}
                  </p>
                </div>
                <div className={`${isMobile ? '' : 'col-span-4 flex flex-col items-end'} gap-3`}>
                  <a
                    href={interactiveMode === 'preview' ? `mailto:${content.contact.email}` : undefined}
                    onClick={(e) => {
                      if (interactiveMode !== 'preview') e.preventDefault();
                    }}
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
                    style={{
                      borderColor: 'var(--tpl-ink)',
                      color: 'var(--tpl-ink)',
                    }}
                  >
                    {content.contact.ctaLabel}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  <span className="text-xs" style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}>
                    {content.contact.email}
                  </span>
                </div>
              </div>
            </section>
          </SectionShell>
        );
      }

      case 'footer': {
        return (
          <SectionShell
            key={sectionId}
            sectionId="footer"
            indexNumber={indexNum}
            label={label}
            interactiveMode={interactiveMode}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
          >
            <footer
              className={`border-t ${isMobile ? 'px-5 py-6' : 'px-8 lg:px-12 py-7'}`}
              style={{ borderColor: 'var(--tpl-border)' }}
            >
              <div className={`flex ${isMobile ? 'flex-col gap-5' : 'items-center justify-between gap-6'}`}>
                <div className="flex flex-wrap items-center gap-5 text-[11px] font-medium uppercase tracking-[0.16em]">
                  {content.contact.socials.map((soc) => (
                    <a
                      key={soc.id}
                      href={interactiveMode === 'preview' ? soc.url : undefined}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (interactiveMode !== 'preview') e.preventDefault();
                      }}
                      className="hover:opacity-65 transition-opacity"
                    >
                      {soc.platform}
                    </a>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--tpl-muted)' }}>
                  <span>{content.footer.copyright}</span>
                </div>
              </div>
            </footer>
          </SectionShell>
        );
      }
    }
  };

  return (
    <div
      className="relative min-h-full w-full overflow-x-hidden"
      style={{
        backgroundColor: 'var(--tpl-bg)',
        color: 'var(--tpl-ink)',
        fontFamily: 'var(--tpl-body-font)',
        backgroundImage:
          'linear-gradient(to right, var(--tpl-hairline) 1px, transparent 1px)',
        backgroundSize: isMobile ? '33.333% 100%' : '16.6666% 100%',
      }}
    >
      {visibleSections.map((sec, idx) =>
        renderSection(sec.id, String(idx + 1).padStart(2, '0'), sec.label)
      )}
    </div>
  );
};
