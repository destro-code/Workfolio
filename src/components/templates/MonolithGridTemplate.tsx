import React, { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import type { SectionId } from '../../types/portfolio';
import { EditableText } from './EditableText';
import { PortfolioImage } from './PortfolioImage';
import { SectionShell } from './SectionShell';
import { getEffectiveVariant, type TemplateRendererProps } from './templateTypes';

export const MonolithGridTemplate: React.FC<TemplateRendererProps> = ({
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
              className="border-b"
              style={{
                borderColor: 'var(--tpl-border)',
                backgroundColor: 'var(--tpl-surface)',
              }}
            >
              <div
                className={`mx-auto max-w-6xl flex items-center justify-between gap-6 ${
                  isMobile ? 'px-5 py-3.5' : 'px-8 py-4'
                }`}
              >
                <a
                  href={interactiveMode === 'preview' ? '#hero' : undefined}
                  onClick={(e) => {
                    if (interactiveMode !== 'preview') e.preventDefault();
                  }}
                  className="text-sm font-bold tracking-tight whitespace-nowrap shrink-0"
                  style={{ fontFamily: 'var(--tpl-display-font)' }}
                >
                  <EditableText
                    value={content.brandName}
                    canEdit={canEditSection('header')}
                    onCommit={(val) =>
                      onInlineUpdate?.((c) => ({ ...c, brandName: val }))
                    }
                  />
                </a>

                {!isMobile ? (
                  <nav aria-label="Primary" className="flex items-center gap-6 text-xs font-medium">
                    {content.navLinks.slice(0, 5).map((link) => (
                      <a
                        key={link.id}
                        href={interactiveMode === 'preview' ? link.href : undefined}
                        onClick={(e) => {
                          if (interactiveMode !== 'preview') e.preventDefault();
                        }}
                        className="whitespace-nowrap transition-opacity hover:opacity-70"
                        style={{ color: 'var(--tpl-muted)' }}
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-opacity hover:opacity-85"
                    style={{
                      backgroundColor: 'var(--tpl-accent)',
                      color: 'var(--tpl-accent-ink)',
                      fontFamily: 'var(--tpl-mono-font)',
                    }}
                  >
                    <EditableText
                      value={content.headerCtaLabel}
                      canEdit={canEditSection('header')}
                      onCommit={(val) =>
                        onInlineUpdate?.((c) => ({ ...c, headerCtaLabel: val }))
                      }
                    />
                  </a>
                )}
              </div>

              {isMobile && mobileMenuOpen && (
                <div className="border-t px-5 py-3 flex flex-col gap-2.5 text-xs" style={{ borderColor: 'var(--tpl-border)' }}>
                  {content.navLinks.map((link) => (
                    <a
                      key={link.id}
                      href={interactiveMode === 'preview' ? link.href : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </header>
          </SectionShell>
        );
      }

      case 'hero': {
        const headlineText = [
          content.hero.headlinePrimary,
          content.hero.headlineSecondary,
          content.hero.headlineOutline,
        ]
          .filter(Boolean)
          .join(' ');

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
            <section className={isMobile ? 'px-5 py-10' : 'px-8 py-14'}>
              <div
                className="mx-auto max-w-6xl border"
                style={{
                  borderColor: 'var(--tpl-border)',
                  backgroundColor: 'var(--tpl-surface)',
                }}
              >
                {variant === 'terminal-minimal' ? (
                  <div className={isMobile ? 'p-6' : 'p-10 lg:p-12'}>
                    <div
                      className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-xs"
                      style={{ borderColor: 'var(--tpl-hairline)', fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                    >
                      <span>
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
                      </span>
                      <span>{content.location}</span>
                    </div>
                    <h1
                      className="max-w-4xl tpl-balance"
                      style={{
                        fontFamily: 'var(--tpl-display-font)',
                        fontWeight: 'var(--tpl-display-weight, 700)',
                        fontSize: isMobile ? '2rem' : 'clamp(2.5rem, 4.4vw, 3.8rem)',
                        lineHeight: 1.06,
                        letterSpacing: 'var(--tpl-display-tracking, -0.03em)',
                      }}
                    >
                      <EditableText
                        value={headlineText}
                        canEdit={canEditSection('hero')}
                        onCommit={(val) =>
                          onInlineUpdate?.((c) => ({
                            ...c,
                            hero: {
                              ...c.hero,
                              headlinePrimary: val,
                              headlineSecondary: '',
                              headlineOutline: '',
                            },
                          }))
                        }
                      />
                    </h1>
                    <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                      <EditableText
                        multiline
                        value={content.hero.subheadline}
                        canEdit={canEditSection('hero')}
                        onCommit={(val) =>
                          onInlineUpdate?.((c) => ({
                            ...c,
                            hero: { ...c.hero, subheadline: val },
                          }))
                        }
                      />
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <a
                        href={interactiveMode === 'preview' ? content.hero.primaryCtaHref : undefined}
                        onClick={(e) => {
                          if (interactiveMode !== 'preview') e.preventDefault();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold"
                        style={{
                          backgroundColor: 'var(--tpl-accent)',
                          color: 'var(--tpl-accent-ink)',
                        }}
                      >
                        <span>{content.hero.primaryCtaLabel}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                      <span className="text-xs" style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}>
                        {content.availability}
                      </span>
                    </div>
                  </div>
                ) : variant === 'wide-banner' ? (
                  <div>
                    <div className={isMobile ? 'p-6' : 'p-10'}>
                      <p className="text-xs mb-3" style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}>
                        {content.hero.eyebrow}
                      </p>
                      <h1
                        className="max-w-4xl tpl-balance"
                        style={{
                          fontFamily: 'var(--tpl-display-font)',
                          fontSize: isMobile ? '2rem' : 'clamp(2.4rem, 4vw, 3.5rem)',
                          lineHeight: 1.08,
                        }}
                      >
                        <EditableText
                          value={headlineText}
                          canEdit={canEditSection('hero')}
                          onCommit={(val) =>
                            onInlineUpdate?.((c) => ({
                              ...c,
                              hero: {
                                ...c.hero,
                                headlinePrimary: val,
                                headlineSecondary: '',
                                headlineOutline: '',
                              },
                            }))
                          }
                        />
                      </h1>
                    </div>
                    <div className="aspect-[16/6] w-full border-t overflow-hidden" style={{ borderColor: 'var(--tpl-border)' }}>
                      <PortfolioImage
                        image={content.hero.collageImages[5] || content.hero.portraitImage}
                        assetMap={assetMap}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`grid ${isMobile ? 'grid-cols-1 divide-y' : 'grid-cols-12 divide-x'}`} style={{ borderColor: 'var(--tpl-border)' }}>
                    <div className={`${isMobile ? 'p-6' : 'col-span-8 p-10'} flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center justify-between gap-4 mb-5">
                          <span className="text-xs font-medium" style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}>
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
                          </span>
                        </div>
                        <h1
                          className="tpl-balance"
                          style={{
                            fontFamily: 'var(--tpl-display-font)',
                            fontWeight: 'var(--tpl-display-weight, 700)',
                            fontSize: isMobile ? '2rem' : 'clamp(2.35rem, 4vw, 3.4rem)',
                            lineHeight: 1.08,
                            letterSpacing: 'var(--tpl-display-tracking, -0.03em)',
                          }}
                        >
                          <EditableText
                            value={headlineText}
                            canEdit={canEditSection('hero')}
                            onCommit={(val) =>
                              onInlineUpdate?.((c) => ({
                                ...c,
                                hero: {
                                  ...c.hero,
                                  headlinePrimary: val,
                                  headlineSecondary: '',
                                  headlineOutline: '',
                                },
                              }))
                            }
                          />
                        </h1>
                        <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                          <EditableText
                            multiline
                            value={content.hero.subheadline}
                            canEdit={canEditSection('hero')}
                            onCommit={(val) =>
                              onInlineUpdate?.((c) => ({
                                ...c,
                                hero: { ...c.hero, subheadline: val },
                              }))
                            }
                          />
                        </p>
                      </div>

                      <div className="mt-8 flex flex-wrap items-center gap-4 border-t pt-6" style={{ borderColor: 'var(--tpl-hairline)' }}>
                        <a
                          href={interactiveMode === 'preview' ? content.hero.primaryCtaHref : undefined}
                          onClick={(e) => {
                            if (interactiveMode !== 'preview') e.preventDefault();
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold"
                          style={{
                            backgroundColor: 'var(--tpl-accent)',
                            color: 'var(--tpl-accent-ink)',
                          }}
                        >
                          <span>{content.hero.primaryCtaLabel}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={interactiveMode === 'preview' ? content.hero.secondaryCtaHref : undefined}
                          onClick={(e) => {
                            if (interactiveMode !== 'preview') e.preventDefault();
                          }}
                          className="inline-flex items-center border px-4 py-2.5 text-xs font-medium"
                          style={{ borderColor: 'var(--tpl-border)' }}
                        >
                          {content.hero.secondaryCtaLabel}
                        </a>
                      </div>
                    </div>

                    <div className={isMobile ? 'p-5' : 'col-span-4 flex flex-col justify-between p-5'} style={{ borderColor: 'var(--tpl-border)' }}>
                      <div className="aspect-[4/5] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                        <PortfolioImage
                          image={content.hero.portraitImage}
                          assetMap={assetMap}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="mt-4 pt-3 border-t text-xs space-y-1" style={{ borderColor: 'var(--tpl-hairline)', fontFamily: 'var(--tpl-mono-font)' }}>
                        <div className="font-medium">{content.personName}</div>
                        <div style={{ color: 'var(--tpl-muted)' }}>{content.roleTitle}</div>
                        <div style={{ color: 'var(--tpl-muted)' }}>{content.location}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
              className={isMobile ? 'px-5 py-10' : 'px-8'}
              style={{
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span
                      className="block text-xs uppercase tracking-[0.12em] mb-1.5"
                      style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                    >
                      {content.projectsSection.eyebrow}
                    </span>
                    <h2
                      className="text-2xl sm:text-3xl font-bold tracking-tight"
                      style={{ fontFamily: 'var(--tpl-display-font)' }}
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
                  <p className="max-w-md text-xs sm:text-sm" style={{ color: 'var(--tpl-muted)' }}>
                    {content.projectsSection.intro}
                  </p>
                </div>

                {variant === 'compact-tech-rows' ? (
                  <div className="border divide-y" style={{ borderColor: 'var(--tpl-border)', backgroundColor: 'var(--tpl-surface)' }}>
                    {content.projects.map((proj, idx) => (
                      <div
                        key={proj.id}
                        className={`grid items-center gap-4 p-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}
                        style={{ borderColor: 'var(--tpl-border)' }}
                      >
                        <div className={isMobile ? '' : 'col-span-4'}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs tabular-nums" style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                if (interactiveMode === 'preview' && onOpenProject) {
                                  e.stopPropagation();
                                  onOpenProject(proj);
                                }
                              }}
                              className="text-base font-semibold hover:underline text-left"
                            >
                              {proj.title}
                            </button>
                          </div>
                          <p className="mt-1 text-xs" style={{ color: 'var(--tpl-muted)' }}>
                            {proj.subtitle}
                          </p>
                        </div>
                        <div className={isMobile ? '' : 'col-span-5'}>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                            {proj.summary}
                          </p>
                        </div>
                        <div className={`${isMobile ? '' : 'col-span-3 flex flex-col items-end'} gap-1 text-xs`} style={{ fontFamily: 'var(--tpl-mono-font)' }}>
                          <span style={{ color: 'var(--tpl-muted)' }}>{proj.tags.slice(0, 3).join(' / ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`grid border ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}
                    style={{
                      borderColor: 'var(--tpl-border)',
                      backgroundColor: 'var(--tpl-border)',
                      gap: '1px',
                    }}
                  >
                    {content.projects.map((proj, idx) => {
                      const isSplitLead = variant === 'case-study-split' && idx === 0 && !isMobile;
                      return (
                        <article
                          key={proj.id}
                          className={`flex flex-col justify-between p-6 ${isSplitLead ? 'col-span-2' : ''}`}
                          style={{ backgroundColor: 'var(--tpl-surface)' }}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-3 text-xs mb-4" style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}>
                              <span>{proj.category}</span>
                              <span className="tabular-nums">{proj.year}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                if (interactiveMode === 'preview' && onOpenProject) {
                                  e.stopPropagation();
                                  onOpenProject(proj);
                                }
                              }}
                              className="group block w-full text-left"
                            >
                              <div className={`w-full overflow-hidden border mb-5 ${isSplitLead ? 'aspect-[16/7]' : 'aspect-[16/10]'}`} style={{ borderColor: 'var(--tpl-border)' }}>
                                <PortfolioImage
                                  image={proj.coverImage}
                                  assetMap={assetMap}
                                  className="h-full w-full transition-transform duration-200 group-hover:scale-[1.02]"
                                  fallbackTitle={proj.title}
                                />
                              </div>
                              <h3 className="text-lg font-bold tracking-tight group-hover:underline" style={{ fontFamily: 'var(--tpl-display-font)' }}>
                                {proj.title}
                              </h3>
                              <p className="mt-1 text-xs font-medium" style={{ color: 'var(--tpl-accent)' }}>
                                {proj.role}
                              </p>
                              <p className="mt-2.5 text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                                {proj.summary}
                              </p>
                            </button>
                          </div>

                          <div className="mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--tpl-hairline)' }}>
                            <span style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}>
                              {proj.tags.slice(0, 4).join(' · ')}
                            </span>
                            {interactiveMode === 'preview' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenProject?.(proj);
                                }}
                                className="inline-flex items-center gap-1 font-medium hover:underline"
                                style={{ color: 'var(--tpl-accent)' }}
                              >
                                <span>Inspect Spec</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
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
              className={isMobile ? 'px-5 py-10' : 'px-8'}
              style={{
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div className={`mx-auto max-w-6xl grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
                <div
                  className={`${isMobile ? 'p-6' : 'col-span-8 p-8'} border`}
                  style={{ borderColor: 'var(--tpl-border)', backgroundColor: 'var(--tpl-surface)' }}
                >
                  <span
                    className="block text-xs uppercase tracking-[0.12em] mb-1.5"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                  >
                    {content.experienceSection.eyebrow}
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight mb-6" style={{ fontFamily: 'var(--tpl-display-font)' }}>
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

                  <div className="divide-y" style={{ borderColor: 'var(--tpl-hairline)' }}>
                    {content.experience.map((exp) => (
                      <div key={exp.id} className={`py-4 grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
                        <div className={isMobile ? '' : 'col-span-4'}>
                          <div className="text-xs tabular-nums" style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}>
                            {exp.period}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--tpl-muted)' }}>
                            {exp.company}
                          </div>
                        </div>
                        <div className={isMobile ? '' : 'col-span-8'}>
                          <h3 className="text-sm font-semibold">{exp.role}</h3>
                          <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                            {exp.summary}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`${isMobile ? 'p-6' : 'col-span-4 p-8'} border`}
                  style={{ borderColor: 'var(--tpl-border)', backgroundColor: 'var(--tpl-surface)' }}
                >
                  <h3
                    className="text-xs uppercase tracking-[0.12em] mb-4"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                  >
                    Technical Stack
                  </h3>
                  <div className="divide-y" style={{ borderColor: 'var(--tpl-hairline)' }}>
                    {content.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="py-2 text-xs flex items-center justify-between"
                        style={{ fontFamily: 'var(--tpl-mono-font)' }}
                      >
                        <span>{skill}</span>
                        <span className="tabular-nums" style={{ color: 'var(--tpl-muted)' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                  </div>
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
              className={isMobile ? 'px-5 py-10' : 'px-8'}
              style={{
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div
                className={`mx-auto max-w-6xl border ${isMobile ? 'p-6' : 'p-10'}`}
                style={{ borderColor: 'var(--tpl-border)', backgroundColor: 'var(--tpl-surface)' }}
              >
                <span
                  className="block text-xs uppercase tracking-[0.12em] mb-2"
                  style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                >
                  {content.about.eyebrow}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight max-w-3xl tpl-balance" style={{ fontFamily: 'var(--tpl-display-font)' }}>
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
                <div className={`mt-6 grid gap-6 ${isMobile || variant === 'statement-full' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {content.about.paragraphs.map((p, idx) => (
                    <p key={idx} className="text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
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
              className={isMobile ? 'px-5 py-10' : 'px-8'}
              style={{
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div
                className={`mx-auto max-w-6xl border ${isMobile ? 'p-6' : 'p-10'} flex ${
                  isMobile ? 'flex-col gap-6' : 'items-center justify-between gap-8'
                }`}
                style={{ borderColor: 'var(--tpl-border)', backgroundColor: 'var(--tpl-surface)' }}
              >
                <div className="max-w-xl">
                  <span
                    className="block text-xs uppercase tracking-[0.12em] mb-2"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                  >
                    {content.contact.eyebrow}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight tpl-balance" style={{ fontFamily: 'var(--tpl-display-font)' }}>
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
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                    {content.contact.intro}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
                  <a
                    href={interactiveMode === 'preview' ? `mailto:${content.contact.email}` : undefined}
                    onClick={(e) => {
                      if (interactiveMode !== 'preview') e.preventDefault();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--tpl-accent)',
                      color: 'var(--tpl-accent-ink)',
                      fontFamily: 'var(--tpl-mono-font)',
                    }}
                  >
                    <span>{content.contact.ctaLabel}</span>
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
              className="border-t"
              style={{ borderColor: 'var(--tpl-border)', backgroundColor: 'var(--tpl-surface)' }}
            >
              <div
                className={`mx-auto max-w-6xl flex ${
                  isMobile ? 'flex-col gap-3 px-5 py-5' : 'items-center justify-between px-8 py-5'
                } text-xs`}
                style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
              >
                <span>{content.footer.copyright}</span>
                <div className="flex flex-wrap gap-4">
                  {content.contact.socials.map((soc) => (
                    <a
                      key={soc.id}
                      href={interactiveMode === 'preview' ? soc.url : undefined}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (interactiveMode !== 'preview') e.preventDefault();
                      }}
                      className="hover:underline"
                    >
                      {soc.platform}
                    </a>
                  ))}
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
      className="min-h-full w-full"
      style={{
        backgroundColor: 'var(--tpl-bg)',
        color: 'var(--tpl-ink)',
        fontFamily: 'var(--tpl-body-font)',
      }}
    >
      {visibleSections.map((sec, idx) =>
        renderSection(sec.id, String(idx + 1).padStart(2, '0'), sec.label)
      )}
    </div>
  );
};
