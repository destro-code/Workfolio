import React, { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import type { SectionId } from '../../types/portfolio';
import { EditableText } from './EditableText';
import { PortfolioImage } from './PortfolioImage';
import { SectionShell } from './SectionShell';
import { getEffectiveVariant, type TemplateRendererProps } from './templateTypes';

export const AtelierIndexTemplate: React.FC<TemplateRendererProps> = ({
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
              className={`border-b ${isMobile ? 'px-5 py-4' : 'px-10 lg:px-16 py-6'}`}
              style={{ borderColor: 'var(--tpl-border)' }}
            >
              <div
                className={`mx-auto max-w-6xl flex items-center ${
                  variant === 'centered-masthead' && !isMobile
                    ? 'justify-between'
                    : 'justify-between gap-8'
                }`}
              >
                <a
                  href={interactiveMode === 'preview' ? '#hero' : undefined}
                  onClick={(e) => {
                    if (interactiveMode !== 'preview') e.preventDefault();
                  }}
                  className="text-xl tracking-tight whitespace-nowrap shrink-0"
                  style={{ fontFamily: 'var(--tpl-display-font)', fontWeight: 500 }}
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
                  <nav aria-label="Primary" className="flex items-center gap-7 text-sm">
                    {content.navLinks.slice(0, 5).map((link) => (
                      <a
                        key={link.id}
                        href={interactiveMode === 'preview' ? link.href : undefined}
                        onClick={(e) => {
                          if (interactiveMode !== 'preview') e.preventDefault();
                        }}
                        className="whitespace-nowrap transition-opacity hover:opacity-60"
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
                    className="text-sm font-medium underline underline-offset-4 whitespace-nowrap shrink-0 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--tpl-accent)' }}
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
                <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm" style={{ borderColor: 'var(--tpl-border)' }}>
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
            <section className={isMobile ? 'px-5 py-12' : 'px-10 lg:px-16 py-16 lg:py-24'}>
              <div className="mx-auto max-w-6xl">
                {variant === 'centered-monograph' ? (
                  <div className="text-center">
                    <p
                      className="text-xs tracking-[0.14em] uppercase mb-5"
                      style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                    >
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
                      className="mx-auto max-w-4xl tpl-balance"
                      style={{
                        fontFamily: 'var(--tpl-display-font)',
                        fontWeight: 'var(--tpl-display-weight, 500)',
                        fontSize: isMobile ? '2.5rem' : 'clamp(3rem, 5.2vw, 4.75rem)',
                        lineHeight: 1.05,
                        letterSpacing: 'var(--tpl-display-tracking, -0.025em)',
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
                    <p
                      className="mx-auto mt-6 max-w-2xl text-base leading-relaxed"
                      style={{ color: 'var(--tpl-muted)' }}
                    >
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
                    <div className="mt-10 aspect-[16/8] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                      <PortfolioImage
                        image={content.hero.collageImages[3] || content.hero.portraitImage}
                        assetMap={assetMap}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`grid gap-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-end'}`}>
                    <div className={isMobile ? '' : variant === 'split-portrait' ? 'col-span-6' : 'col-span-8'}>
                      <p
                        className="text-xs tracking-[0.12em] uppercase mb-5"
                        style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                      >
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
                        className="tpl-balance"
                        style={{
                          fontFamily: 'var(--tpl-display-font)',
                          fontWeight: 'var(--tpl-display-weight, 500)',
                          fontSize: isMobile ? '2.4rem' : 'clamp(2.9rem, 4.8vw, 4.4rem)',
                          lineHeight: 1.06,
                          letterSpacing: 'var(--tpl-display-tracking, -0.025em)',
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

                      <p
                        className="mt-6 max-w-xl text-base leading-relaxed"
                        style={{ color: 'var(--tpl-muted)' }}
                      >
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

                      <div className="mt-8 flex flex-wrap items-center gap-6">
                        <a
                          href={interactiveMode === 'preview' ? content.hero.primaryCtaHref : undefined}
                          onClick={(e) => {
                            if (interactiveMode !== 'preview') e.preventDefault();
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-medium tracking-wide transition-opacity hover:opacity-85"
                          style={{
                            backgroundColor: 'var(--tpl-accent)',
                            color: 'var(--tpl-accent-ink)',
                          }}
                        >
                          <span>{content.hero.primaryCtaLabel}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                        <span className="text-xs" style={{ color: 'var(--tpl-muted)' }}>
                          {content.availability}
                        </span>
                      </div>
                    </div>

                    <div className={isMobile ? '' : variant === 'split-portrait' ? 'col-span-6' : 'col-span-4'}>
                      <div className="aspect-[3/4] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                        <PortfolioImage
                          image={content.hero.portraitImage}
                          assetMap={assetMap}
                          className="h-full w-full"
                        />
                      </div>
                      <p className="mt-2.5 text-xs tabular-nums" style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}>
                        {content.personName} · {content.location}
                      </p>
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
              className={`border-t ${isMobile ? 'px-5 py-12' : 'px-10 lg:px-16'}`}
              style={{
                borderColor: 'var(--tpl-border)',
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div className="mx-auto max-w-6xl">
                <div className={`mb-12 flex ${isMobile ? 'flex-col gap-3' : 'items-baseline justify-between gap-8'}`}>
                  <div>
                    <span
                      className="block text-xs tracking-[0.14em] uppercase mb-2"
                      style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                    >
                      {content.projectsSection.eyebrow}
                    </span>
                    <h2
                      className="text-3xl sm:text-4xl tracking-tight"
                      style={{ fontFamily: 'var(--tpl-display-font)', fontWeight: 500 }}
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
                  <p className="max-w-md text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                    {content.projectsSection.intro}
                  </p>
                </div>

                {variant === 'numbered-index-list' ? (
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
                        className={`group grid w-full items-center gap-6 py-6 text-left transition-colors ${
                          isMobile ? 'grid-cols-1' : 'grid-cols-12'
                        }`}
                      >
                        <div className={isMobile ? '' : 'col-span-1'}>
                          <span
                            className="text-xs tabular-nums"
                            style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className={isMobile ? '' : 'col-span-5'}>
                          <h3
                            className="text-2xl tracking-tight group-hover:underline"
                            style={{ fontFamily: 'var(--tpl-display-font)', fontWeight: 500 }}
                          >
                            {proj.title}
                          </h3>
                          <p className="mt-1 text-xs" style={{ color: 'var(--tpl-muted)' }}>
                            {proj.subtitle}
                          </p>
                        </div>
                        <div className={isMobile ? '' : 'col-span-4'}>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                            {proj.role} · {proj.year}
                          </p>
                          <p className="mt-1 text-xs" style={{ color: 'var(--tpl-muted)' }}>
                            {proj.tags.slice(0, 3).join(' · ')}
                          </p>
                        </div>
                        <div className={isMobile ? '' : 'col-span-2'}>
                          <div className="aspect-[4/3] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                            <PortfolioImage image={proj.coverImage} assetMap={assetMap} className="h-full w-full" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={`grid gap-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {content.projects.map((proj, idx) => {
                      const isHeroPlate = variant === 'featured-plus-archive' && idx === 0 && !isMobile;
                      return (
                        <article
                          key={proj.id}
                          className={isHeroPlate ? 'col-span-2' : ''}
                        >
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
                            <div
                              className={`w-full overflow-hidden border ${
                                isHeroPlate ? 'aspect-[16/8]' : 'aspect-[4/3]'
                              }`}
                              style={{ borderColor: 'var(--tpl-border)' }}
                            >
                              <PortfolioImage
                                image={proj.coverImage}
                                assetMap={assetMap}
                                className="h-full w-full transition-transform duration-300 group-hover:scale-[1.015]"
                                fallbackTitle={proj.title}
                              />
                            </div>
                            <div className="mt-4 flex items-baseline justify-between gap-4 border-b pb-3" style={{ borderColor: 'var(--tpl-hairline)' }}>
                              <div className="flex items-baseline gap-3">
                                <span
                                  className="text-xs tabular-nums"
                                  style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                                >
                                  Fig. {String(idx + 1).padStart(2, '0')}
                                </span>
                                <h3
                                  className="text-xl tracking-tight group-hover:underline"
                                  style={{ fontFamily: 'var(--tpl-display-font)', fontWeight: 500 }}
                                >
                                  {proj.title}
                                </h3>
                              </div>
                              <span
                                className="text-xs tabular-nums"
                                style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                              >
                                {proj.year}
                              </span>
                            </div>
                            <p className="mt-2 text-xs" style={{ color: 'var(--tpl-muted)' }}>
                              {proj.role} · {proj.category}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                              {proj.summary}
                            </p>
                          </button>
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
              className={`border-t ${isMobile ? 'px-5 py-12' : 'px-10 lg:px-16'}`}
              style={{
                borderColor: 'var(--tpl-border)',
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div className={`mx-auto max-w-6xl grid gap-12 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
                <div className={isMobile ? '' : 'col-span-4'}>
                  <span
                    className="block text-xs uppercase tracking-[0.14em] mb-2"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                  >
                    {content.experienceSection.eyebrow}
                  </span>
                  <h2
                    className="text-3xl tracking-tight"
                    style={{ fontFamily: 'var(--tpl-display-font)', fontWeight: 500 }}
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

                  <div className="mt-8 border-t pt-5" style={{ borderColor: 'var(--tpl-border)' }}>
                    <h3
                      className="text-xs uppercase tracking-[0.12em] mb-3"
                      style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                    >
                      Core Capabilities
                    </h3>
                    <ul className="space-y-1.5 text-sm" style={{ color: 'var(--tpl-ink)' }}>
                      {content.skills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`${isMobile ? '' : 'col-span-8'} divide-y border-t`} style={{ borderColor: 'var(--tpl-border)' }}>
                  {content.experience.map((exp) => (
                    <div key={exp.id} className="py-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-medium">{exp.role}</h3>
                        <span
                          className="text-xs tabular-nums"
                          style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-muted)' }}
                        >
                          {exp.period}
                        </span>
                      </div>
                      <p className="mt-1 text-xs" style={{ color: 'var(--tpl-accent)' }}>
                        {exp.company} · {exp.location}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                        {exp.summary}
                      </p>
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
              className={`border-t ${isMobile ? 'px-5 py-12' : 'px-10 lg:px-16'}`}
              style={{
                borderColor: 'var(--tpl-border)',
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
              }}
            >
              <div className={`mx-auto max-w-6xl grid gap-12 ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-center'}`}>
                <div className={isMobile ? '' : 'col-span-7'}>
                  <span
                    className="block text-xs uppercase tracking-[0.14em] mb-3"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                  >
                    {content.about.eyebrow}
                  </span>
                  <h2
                    className="text-2xl sm:text-4xl tracking-tight tpl-balance"
                    style={{ fontFamily: 'var(--tpl-display-font)', fontWeight: 500 }}
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
                      <p key={idx} className="text-base leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
                {variant !== 'statement-full' && (
                  <div className={isMobile ? '' : 'col-span-5'}>
                    <div className="aspect-[4/5] w-full overflow-hidden border" style={{ borderColor: 'var(--tpl-border)' }}>
                      <PortfolioImage
                        image={content.about.image}
                        assetMap={assetMap}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                )}
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
              className={`border-t ${isMobile ? 'px-5 py-12' : 'px-10 lg:px-16'}`}
              style={{
                borderColor: 'var(--tpl-border)',
                paddingTop: isMobile ? undefined : 'var(--tpl-section-pad)',
                paddingBottom: isMobile ? undefined : 'var(--tpl-section-pad)',
                backgroundColor: 'var(--tpl-surface)',
              }}
            >
              <div className={`mx-auto max-w-6xl flex ${isMobile ? 'flex-col gap-6' : 'items-end justify-between gap-12'}`}>
                <div className="max-w-2xl">
                  <span
                    className="block text-xs uppercase tracking-[0.14em] mb-3"
                    style={{ fontFamily: 'var(--tpl-mono-font)', color: 'var(--tpl-accent)' }}
                  >
                    {content.contact.eyebrow}
                  </span>
                  <h2
                    className="text-3xl sm:text-5xl tracking-tight tpl-balance"
                    style={{ fontFamily: 'var(--tpl-display-font)', fontWeight: 500 }}
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
                  <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--tpl-muted)' }}>
                    {content.contact.intro}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                  <a
                    href={interactiveMode === 'preview' ? `mailto:${content.contact.email}` : undefined}
                    onClick={(e) => {
                      if (interactiveMode !== 'preview') e.preventDefault();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-medium tracking-wide"
                    style={{
                      backgroundColor: 'var(--tpl-accent)',
                      color: 'var(--tpl-accent-ink)',
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
              className={`border-t ${isMobile ? 'px-5 py-6' : 'px-10 lg:px-16 py-8'}`}
              style={{ borderColor: 'var(--tpl-border)' }}
            >
              <div className={`mx-auto max-w-6xl flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between gap-6'}`}>
                <span className="text-xs" style={{ color: 'var(--tpl-muted)' }}>
                  {content.footer.copyright}
                </span>
                <div className="flex flex-wrap items-center gap-5 text-xs" style={{ color: 'var(--tpl-muted)' }}>
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
