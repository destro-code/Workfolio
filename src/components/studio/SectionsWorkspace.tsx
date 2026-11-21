import React, { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  LayoutGrid,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import type {
  ExperienceEntry,
  PortfolioContent,
  PortfolioDocument,
  SectionConfig,
  SectionId,
  StoredAsset,
} from '../../types/portfolio';
import { ImageFieldEditor } from './ImageFieldEditor';

interface SortableSectionItemProps {
  section: SectionConfig;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onStep: (dir: 'up' | 'down') => void;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  index,
  total,
  isSelected,
  onSelect,
  onToggleVisibility,
  onStep,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isSelected ? 'rgba(217, 78, 40, 0.14)' : 'transparent',
    borderColor: isSelected ? '#D94E28' : 'var(--wf-chrome-border)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded-[4px] border px-2 py-1 transition-colors"
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${section.label}`}
          className="cursor-grab p-0.5 text-[#6F6E69] hover:text-[#F4F3EF] active:cursor-grabbing shrink-0"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onSelect}
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
        >
          <span
            className="text-[11px] tabular-nums shrink-0"
            style={{
              fontFamily: 'var(--wf-font-mono)',
              color: isSelected ? '#D94E28' : 'var(--wf-ink-muted)',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className={`truncate text-xs font-medium ${
              section.visible ? 'text-[#F4F3EF]' : 'text-[#6F6E69] line-through'
            }`}
          >
            {section.label}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onStep('up')}
          disabled={index === 0}
          aria-label={`Move ${section.label} up`}
          className="p-1 text-[#A1A09A] hover:text-white disabled:opacity-25"
        >
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => onStep('down')}
          disabled={index === total - 1}
          aria-label={`Move ${section.label} down`}
          className="p-1 text-[#A1A09A] hover:text-white disabled:opacity-25"
        >
          <ArrowDown className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={section.visible ? `Hide ${section.label}` : `Show ${section.label}`}
          className="p-1 text-[#A1A09A] hover:text-white"
        >
          {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-[#6F6E69]" />}
        </button>
      </div>
    </div>
  );
};

interface SectionsWorkspaceProps {
  portfolio: PortfolioDocument;
  selectedSectionId: SectionId;
  layoutStripOpen: boolean;
  assetMap: Record<string, string>;
  className?: string;
  onSelectSection: (id: SectionId) => void;
  onReorderSections: (activeId: SectionId, overId: SectionId) => void;
  onStepSection: (id: SectionId, dir: 'up' | 'down') => void;
  onToggleSectionVisibility: (id: SectionId) => void;
  onToggleLayoutStrip: () => void;
  onUpdateContent: (
    updater: (c: PortfolioContent) => PortfolioContent,
    options?: { debounce?: boolean }
  ) => void;
  onRegisterAsset: (asset: StoredAsset) => Promise<void>;
  onSwitchToProjectsMode: () => void;
}

export const SectionsWorkspace: React.FC<SectionsWorkspaceProps> = ({
  portfolio,
  selectedSectionId,
  layoutStripOpen,
  assetMap,
  className = '',
  onSelectSection,
  onReorderSections,
  onStepSection,
  onToggleSectionVisibility,
  onToggleLayoutStrip,
  onUpdateContent,
  onRegisterAsset,
  onSwitchToProjectsMode,
}) => {
  const [newSkill, setNewSkill] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const tpl = TEMPLATES[portfolio.presentation.templateId];
  const sections = portfolio.presentation.sections;
  const activeSection = sections.find((s) => s.id === selectedSectionId) || sections[0];
  const variants = tpl.sectionVariants[activeSection.id] || [];
  const activeVariantObj =
    variants.find((v) => v.id === activeSection.layoutVariant) || variants[0];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderSections(active.id as SectionId, over.id as SectionId);
    }
  };

  const fieldClass =
    'w-full rounded-[4px] border px-2.5 py-2 text-xs outline-none focus:border-[#D94E28]';
  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--wf-chrome-input)',
    borderColor: 'var(--wf-chrome-border)',
    color: 'var(--wf-ink-primary)',
  };

  return (
    <aside
      className={`flex h-full w-full lg:w-[360px] shrink-0 flex-col lg:border-l ${className}`}
      style={{
        backgroundColor: 'var(--wf-chrome-bg)',
        borderColor: 'var(--wf-chrome-border)',
        color: 'var(--wf-ink-primary)',
      }}
      aria-label="Sections outline and inspector"
    >
      {/* Upper Zone (~39% on desktop, compact fixed height on mobile/tablet): Pinned Page Sections Outline */}
      <div
        className="flex h-[235px] sm:h-[260px] lg:h-[39%] lg:min-h-[266px] shrink-0 flex-col border-b p-3"
        style={{
          borderColor: 'var(--wf-chrome-border)',
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--wf-ink-secondary)' }}>
            Page Sections
          </h2>
          <span
            className="text-[11px] tabular-nums"
            style={{ fontFamily: 'var(--wf-font-mono)', color: 'var(--wf-ink-muted)' }}
          >
            {sections.filter((s) => s.visible).length}/{sections.length} visible
          </span>
        </div>

        <div className="wf-scroll flex-1 overflow-y-auto space-y-1 pr-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((sec, idx) => (
                <SortableSectionItem
                  key={sec.id}
                  section={sec}
                  index={idx}
                  total={sections.length}
                  isSelected={sec.id === activeSection.id}
                  onSelect={() => onSelectSection(sec.id)}
                  onToggleVisibility={() => onToggleSectionVisibility(sec.id)}
                  onStep={(dir) => onStepSection(sec.id, dir)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Lower Zone (~65%): Selected Section Inspector */}
      <div className="wf-scroll flex-1 overflow-y-auto p-4 space-y-5">
        {/* Layout Switch Trigger */}
        <div
          className="rounded-[4px] border p-3 flex items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--wf-chrome-elevated)',
            borderColor: 'var(--wf-chrome-border)',
          }}
        >
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--wf-ink-muted)' }}>
              {activeSection.label} Layout
            </div>
            <div className="text-xs font-semibold truncate mt-0.5">
              {activeVariantObj?.name || activeSection.layoutVariant}
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleLayoutStrip}
            className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              layoutStripOpen
                ? 'border-[#D94E28] bg-[#D94E28]/15 text-white'
                : 'border-[#2E2E35] bg-[#222227] text-[#F4F3EF] hover:bg-white/10'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Change Layout</span>
          </button>
        </div>

        {/* Section-Specific Content Fields */}
        {activeSection.id === 'header' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="hdr-brand" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Brand / Wordmark
              </label>
              <input
                id="hdr-brand"
                type="text"
                value={portfolio.content.brandName}
                onChange={(e) =>
                  onUpdateContent((c) => ({ ...c, brandName: e.target.value }), { debounce: true })
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="hdr-cta" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Header Action Label
              </label>
              <input
                id="hdr-cta"
                type="text"
                value={portfolio.content.headerCtaLabel}
                onChange={(e) =>
                  onUpdateContent((c) => ({ ...c, headerCtaLabel: e.target.value }), { debounce: true })
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="hdr-loc" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Location Label
              </label>
              <input
                id="hdr-loc"
                type="text"
                value={portfolio.content.location}
                onChange={(e) =>
                  onUpdateContent((c) => ({ ...c, location: e.target.value }), { debounce: true })
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          </div>
        )}

        {activeSection.id === 'hero' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="hero-eyebrow" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Eyebrow / Discipline Line
              </label>
              <input
                id="hero-eyebrow"
                type="text"
                value={portfolio.content.hero.eyebrow}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({ ...c, hero: { ...c.hero, eyebrow: e.target.value } }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="hero-h1" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Primary Headline
              </label>
              <input
                id="hero-h1"
                type="text"
                value={portfolio.content.hero.headlinePrimary}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({ ...c, hero: { ...c.hero, headlinePrimary: e.target.value } }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            {portfolio.presentation.templateId === 'noir-collage' && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="hero-h2" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                    Second Line
                  </label>
                  <input
                    id="hero-h2"
                    type="text"
                    value={portfolio.content.hero.headlineSecondary}
                    onChange={(e) =>
                      onUpdateContent(
                        (c) => ({ ...c, hero: { ...c.hero, headlineSecondary: e.target.value } }),
                        { debounce: true }
                      )
                    }
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label htmlFor="hero-h3" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                    Wireframe Line
                  </label>
                  <input
                    id="hero-h3"
                    type="text"
                    value={portfolio.content.hero.headlineOutline}
                    onChange={(e) =>
                      onUpdateContent(
                        (c) => ({ ...c, hero: { ...c.hero, headlineOutline: e.target.value } }),
                        { debounce: true }
                      )
                    }
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="hero-sub" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Intro Copy
              </label>
              <textarea
                id="hero-sub"
                rows={4}
                value={portfolio.content.hero.subheadline}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({ ...c, hero: { ...c.hero, subheadline: e.target.value } }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="hero-cta-lbl" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  CTA Label
                </label>
                <input
                  id="hero-cta-lbl"
                  type="text"
                  value={portfolio.content.hero.primaryCtaLabel}
                  onChange={(e) =>
                    onUpdateContent(
                      (c) => ({ ...c, hero: { ...c.hero, primaryCtaLabel: e.target.value } }),
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label htmlFor="hero-cta-url" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  CTA Target
                </label>
                <input
                  id="hero-cta-url"
                  type="text"
                  value={portfolio.content.hero.primaryCtaHref}
                  onChange={(e) =>
                    onUpdateContent(
                      (c) => ({ ...c, hero: { ...c.hero, primaryCtaHref: e.target.value } }),
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
            </div>

            <ImageFieldEditor
              label="Hero Portrait / Lead Visual"
              portfolioId={portfolio.id}
              value={portfolio.content.hero.portraitImage}
              assetMap={assetMap}
              onRegisterAsset={onRegisterAsset}
              onChange={(img) =>
                onUpdateContent((c) => ({
                  ...c,
                  hero: { ...c.hero, portraitImage: img },
                }))
              }
            />
          </div>
        )}

        {activeSection.id === 'projects' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="proj-sec-eyebrow" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Section Eyebrow
              </label>
              <input
                id="proj-sec-eyebrow"
                type="text"
                value={portfolio.content.projectsSection.eyebrow}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({
                      ...c,
                      projectsSection: { ...c.projectsSection, eyebrow: e.target.value },
                    }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="proj-sec-head" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Section Heading
              </label>
              <input
                id="proj-sec-head"
                type="text"
                value={portfolio.content.projectsSection.heading}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({
                      ...c,
                      projectsSection: { ...c.projectsSection, heading: e.target.value },
                    }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="proj-sec-intro" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Section Intro
              </label>
              <textarea
                id="proj-sec-intro"
                rows={3}
                value={portfolio.content.projectsSection.intro}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({
                      ...c,
                      projectsSection: { ...c.projectsSection, intro: e.target.value },
                    }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div className="border-t pt-4" style={{ borderColor: 'var(--wf-chrome-border)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--wf-ink-secondary)' }}>
                Manage individual case studies, cover imagery, focal points, and ordering inside the dedicated Projects Manager.
              </p>
              <button
                type="button"
                onClick={onSwitchToProjectsMode}
                className="w-full rounded-full py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--wf-action-ivory)',
                  color: 'var(--wf-action-ivory-ink)',
                }}
              >
                Open Projects Manager ({portfolio.content.projects.length})
              </button>
            </div>
          </div>
        )}

        {activeSection.id === 'experience' && (
          <div className="space-y-5">
            <div>
              <label htmlFor="exp-heading" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Section Heading
              </label>
              <input
                id="exp-heading"
                type="text"
                value={portfolio.content.experienceSection.heading}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({
                      ...c,
                      experienceSection: { ...c.experienceSection, heading: e.target.value },
                    }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Roles ({portfolio.content.experience.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    const newRole: ExperienceEntry = {
                      id: `exp-${Date.now()}`,
                      role: 'Lead Designer',
                      company: 'New Studio',
                      period: '2026 — Present',
                      location: 'Remote',
                      summary: 'Leading product direction and frontend architecture.',
                    };
                    onUpdateContent((c) => ({
                      ...c,
                      experience: [newRole, ...c.experience],
                    }));
                  }}
                  className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-1 text-xs hover:bg-white/10"
                  style={{ borderColor: 'var(--wf-chrome-border)' }}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Role</span>
                </button>
              </div>

              {portfolio.content.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-[4px] border p-3 space-y-2"
                  style={{
                    borderColor: 'var(--wf-chrome-border)',
                    backgroundColor: 'var(--wf-chrome-elevated)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={exp.role}
                      aria-label="Role title"
                      onChange={(e) =>
                        onUpdateContent(
                          (c) => ({
                            ...c,
                            experience: c.experience.map((item) =>
                              item.id === exp.id ? { ...item, role: e.target.value } : item
                            ),
                          }),
                          { debounce: true }
                        )
                      }
                      className={fieldClass}
                      style={fieldStyle}
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${exp.role}`}
                      onClick={() =>
                        onUpdateContent((c) => ({
                          ...c,
                          experience: c.experience.filter((item) => item.id !== exp.id),
                        }))
                      }
                      className="p-1.5 text-[#A1A09A] hover:text-[#D94E28]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.company}
                      placeholder="Company"
                      aria-label="Company"
                      onChange={(e) =>
                        onUpdateContent(
                          (c) => ({
                            ...c,
                            experience: c.experience.map((item) =>
                              item.id === exp.id ? { ...item, company: e.target.value } : item
                            ),
                          }),
                          { debounce: true }
                        )
                      }
                      className={fieldClass}
                      style={fieldStyle}
                    />
                    <input
                      type="text"
                      value={exp.period}
                      placeholder="Period"
                      aria-label="Period"
                      onChange={(e) =>
                        onUpdateContent(
                          (c) => ({
                            ...c,
                            experience: c.experience.map((item) =>
                              item.id === exp.id ? { ...item, period: e.target.value } : item
                            ),
                          }),
                          { debounce: true }
                        )
                      }
                      className={fieldClass}
                      style={fieldStyle}
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={exp.summary}
                    aria-label="Role summary"
                    onChange={(e) =>
                      onUpdateContent(
                        (c) => ({
                          ...c,
                          experience: c.experience.map((item) =>
                            item.id === exp.id ? { ...item, summary: e.target.value } : item
                          ),
                        }),
                        { debounce: true }
                      )
                    }
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>
              ))}
            </div>

            {/* Skills Tag Manager */}
            <div className="space-y-2.5 border-t pt-4" style={{ borderColor: 'var(--wf-chrome-border)' }}>
              <label htmlFor="add-skill-input" className="block text-xs font-semibold">
                Skills & Disciplines
              </label>
              <div className="flex gap-2">
                <input
                  id="add-skill-input"
                  type="text"
                  value={newSkill}
                  placeholder="Add discipline..."
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSkill.trim()) {
                      e.preventDefault();
                      onUpdateContent((c) => ({
                        ...c,
                        skills: [...c.skills, newSkill.trim()],
                      }));
                      setNewSkill('');
                    }
                  }}
                  className={fieldClass}
                  style={fieldStyle}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newSkill.trim()) return;
                    onUpdateContent((c) => ({
                      ...c,
                      skills: [...c.skills, newSkill.trim()],
                    }));
                    setNewSkill('');
                  }}
                  className="rounded-[4px] border px-3 text-xs font-medium hover:bg-white/10"
                  style={{ borderColor: 'var(--wf-chrome-border)' }}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {portfolio.content.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-1 text-xs"
                    style={{
                      borderColor: 'var(--wf-chrome-border)',
                      backgroundColor: 'var(--wf-chrome-elevated)',
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() =>
                        onUpdateContent((c) => ({
                          ...c,
                          skills: c.skills.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-[#A1A09A] hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection.id === 'about' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="about-heading" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                About Heading
              </label>
              <input
                id="about-heading"
                type="text"
                value={portfolio.content.about.heading}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({ ...c, about: { ...c.about, heading: e.target.value } }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="about-bio" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Biography Paragraphs (blank line separates paragraphs)
              </label>
              <textarea
                id="about-bio"
                rows={6}
                value={portfolio.content.about.paragraphs.join('\n\n')}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({
                      ...c,
                      about: {
                        ...c.about,
                        paragraphs: e.target.value
                          .split(/\n\s*\n/)
                          .map((p) => p.trim())
                          .filter(Boolean),
                      },
                    }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <ImageFieldEditor
              label="About Studio Image"
              portfolioId={portfolio.id}
              value={portfolio.content.about.image}
              assetMap={assetMap}
              onRegisterAsset={onRegisterAsset}
              onChange={(img) =>
                onUpdateContent((c) => ({
                  ...c,
                  about: { ...c.about, image: img },
                }))
              }
            />
          </div>
        )}

        {activeSection.id === 'contact' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="contact-heading" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Contact Headline
              </label>
              <input
                id="contact-heading"
                type="text"
                value={portfolio.content.contact.heading}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({ ...c, contact: { ...c.contact, heading: e.target.value } }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Direct Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={portfolio.content.contact.email}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({ ...c, contact: { ...c.contact, email: e.target.value } }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="contact-intro" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Availability Note
              </label>
              <textarea
                id="contact-intro"
                rows={3}
                value={portfolio.content.contact.intro}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({ ...c, contact: { ...c.contact, intro: e.target.value } }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--wf-chrome-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Social Links</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateContent((c) => ({
                      ...c,
                      contact: {
                        ...c.contact,
                        socials: [
                          ...c.contact.socials,
                          { id: `soc-${Date.now()}`, platform: 'Website', url: 'https://' },
                        ],
                      },
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-1 text-xs hover:bg-white/10"
                  style={{ borderColor: 'var(--wf-chrome-border)' }}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Link</span>
                </button>
              </div>
              {portfolio.content.contact.socials.map((soc) => (
                <div key={soc.id} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={soc.platform}
                    aria-label="Social platform"
                    onChange={(e) =>
                      onUpdateContent(
                        (c) => ({
                          ...c,
                          contact: {
                            ...c.contact,
                            socials: c.contact.socials.map((s) =>
                              s.id === soc.id ? { ...s, platform: e.target.value } : s
                            ),
                          },
                        }),
                        { debounce: true }
                      )
                    }
                    className={`${fieldClass} w-24 sm:w-28 shrink-0`}
                    style={fieldStyle}
                  />
                  <input
                    type="url"
                    value={soc.url}
                    aria-label="Social URL"
                    onChange={(e) =>
                      onUpdateContent(
                        (c) => ({
                          ...c,
                          contact: {
                            ...c.contact,
                            socials: c.contact.socials.map((s) =>
                              s.id === soc.id ? { ...s, url: e.target.value } : s
                            ),
                          },
                        }),
                        { debounce: true }
                      )
                    }
                    className={fieldClass}
                    style={fieldStyle}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${soc.platform}`}
                    onClick={() =>
                      onUpdateContent((c) => ({
                        ...c,
                        contact: {
                          ...c.contact,
                          socials: c.contact.socials.filter((s) => s.id !== soc.id),
                        },
                      }))
                    }
                    className="p-1.5 text-[#A1A09A] hover:text-[#D94E28]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection.id === 'footer' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="ftr-copy" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Copyright Line
              </label>
              <input
                id="ftr-copy"
                type="text"
                value={portfolio.content.footer.copyright}
                onChange={(e) =>
                  onUpdateContent(
                    (c) => ({ ...c, footer: { ...c.footer, copyright: e.target.value } }),
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
