import React, { useMemo, useState } from 'react';
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, Eye, GripVertical, LayoutGrid, Plus, Star, Trash2, X } from 'lucide-react';
import { SAMPLE_IMAGES } from '../../data/samples';
import type { PortfolioDocument, Project, StoredAsset } from '../../types/portfolio';
import { processUploadedImageFile } from '../../utils/imagePipeline';
import { PortfolioImage } from '../templates/PortfolioImage';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { ImageFieldEditor } from './ImageFieldEditor';

interface SortableProjectCardProps {
  project: Project;
  isSelected: boolean;
  assetMap: Record<string, string>;
  onSelect: () => void;
  onToggleFeatured: () => void;
}

const SortableProjectCard: React.FC<SortableProjectCardProps> = ({
  project,
  isSelected,
  assetMap,
  onSelect,
  onToggleFeatured,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderColor: isSelected ? '#D94E28' : 'rgba(20, 20, 20, 0.16)',
    backgroundColor: '#FAF9F6',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex flex-col border transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b bg-[#18181B]" style={{ borderColor: 'rgba(20,20,20,0.12)' }}>
        <button
          type="button"
          onClick={onSelect}
          className="h-full w-full block text-left"
          aria-label={`Edit project ${project.title}`}
        >
          <PortfolioImage
            image={project.coverImage}
            assetMap={assetMap}
            className="h-full w-full"
            fallbackTitle={project.title}
          />
        </button>

        <div className="absolute top-2 left-2 flex items-center gap-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${project.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#18181B]/85 text-white hover:bg-[#18181B] cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleFeatured}
          aria-label={project.featured ? `Unfeature ${project.title}` : `Feature ${project.title}`}
          className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-[4px] transition-colors ${
            project.featured
              ? 'bg-[#D94E28] text-white'
              : 'bg-[#18181B]/75 text-[#A1A09A] hover:text-white'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${project.featured ? 'fill-current' : ''}`} />
        </button>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 flex-col justify-between p-4 text-left"
      >
        <div>
          <div className="flex items-baseline justify-between gap-2 text-xs text-[#5C5B57]">
            <span>{project.category || 'Case Study'}</span>
            <span className="tabular-nums" style={{ fontFamily: 'var(--wf-font-mono)' }}>
              {project.year}
            </span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-[#161618] tracking-tight">
            {project.title}
          </h3>
          <p className="mt-1 text-xs text-[#5C5B57] line-clamp-2">{project.summary}</p>
        </div>
        {project.tags.length > 0 && (
          <p className="mt-3 pt-2.5 border-t border-[#E5E2DA] text-[11px] text-[#5C5B57]" style={{ fontFamily: 'var(--wf-font-mono)' }}>
            {project.tags.slice(0, 4).join(' · ')}
          </p>
        )}
      </button>
    </div>
  );
};

interface ProjectsWorkspaceProps {
  portfolio: PortfolioDocument;
  selectedProjectId: string | null;
  assetMap: Record<string, string>;
  mobilePane?: 'list' | 'editor';
  onChangeMobilePane?: (pane: 'list' | 'editor') => void;
  onSelectProject: (id: string) => void;
  onAddProject: (project: Project) => void;
  onUpdateProject: (
    projectId: string,
    patch: Partial<Project>,
    options?: { debounce?: boolean }
  ) => void;
  onDeleteProject: (projectId: string) => void;
  onReorderProjects: (activeId: string, overId: string) => void;
  onRegisterAsset: (asset: StoredAsset) => Promise<void>;
}

export const ProjectsWorkspace: React.FC<ProjectsWorkspaceProps> = ({
  portfolio,
  selectedProjectId,
  assetMap,
  mobilePane = 'list',
  onChangeMobilePane,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onReorderProjects,
  onRegisterAsset,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'live'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [newTag, setNewTag] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const projects = portfolio.content.projects;
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (p.category) set.add(p.category);
    }
    return ['All', ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (categoryFilter === 'All') return projects;
    return projects.filter((p) => p.category === categoryFilter);
  }, [projects, categoryFilter]);

  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  const handleAddNewProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: 'Untitled Case Study',
      subtitle: 'Product & Systems Design',
      year: '2026',
      role: 'Lead Designer',
      category: 'Product Design',
      featured: false,
      summary: 'Concise overview of the challenge, execution, and measurable outcome.',
      caseStudy: [
        'Describe the problem context, architectural decisions, and craft details behind this project.',
      ],
      highlights: ['Shipped cleanly across web and mobile surfaces'],
      tags: ['React', 'TypeScript', 'Design System'],
      liveUrl: '',
      sourceUrl: '',
      coverImage: {
        src: SAMPLE_IMAGES.monolith,
        alt: 'New project cover image',
        focalPoint: { x: 50, y: 50 },
      },
      gallery: [],
    };
    onAddProject(newProj);
    onChangeMobilePane?.('editor');
    setConfirmDelete(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderProjects(String(active.id), String(over.id));
    }
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject) return;
    try {
      const { asset, assetRef } = await processUploadedImageFile(file, portfolio.id);
      await onRegisterAsset(asset);
      onUpdateProject(activeProject.id, {
        gallery: [
          ...activeProject.gallery,
          {
            src: assetRef,
            alt: file.name.replace(/\.[^.]+$/, ''),
            focalPoint: { x: 50, y: 50 },
            caption: '',
          },
        ],
      });
    } finally {
      e.target.value = '';
    }
  };

  const fieldClass =
    'w-full rounded-[4px] border px-3 py-2 text-xs outline-none focus:border-[#D94E28]';
  const fieldStyle: React.CSSProperties = {
    backgroundColor: 'var(--wf-chrome-input)',
    borderColor: 'var(--wf-chrome-border)',
    color: 'var(--wf-ink-primary)',
  };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left/Center Visual Project Library & Live Previewer */}
      <div
        className={`${
          mobilePane === 'editor' ? 'hidden lg:flex' : 'flex'
        } flex-1 flex-col min-w-0 overflow-hidden`}
        style={{ backgroundColor: 'var(--wf-stage-stone)' }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b px-3 sm:px-5 py-2.5 sm:py-3 shrink-0"
          style={{
            backgroundColor: '#FAF9F6',
            borderColor: 'rgba(20, 20, 20, 0.12)',
            color: '#161618',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center rounded-full border border-[#DDDAD2] bg-[#F3F1EC] p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#161618] text-[#F4F3EF]'
                    : 'text-[#5C5B57] hover:text-[#161618]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>
                  Grid<span className="hidden sm:inline"> View</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('live')}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  viewMode === 'live'
                    ? 'bg-[#161618] text-[#F4F3EF]'
                    : 'text-[#5C5B57] hover:text-[#161618]'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>
                  Live<span className="hidden sm:inline"> Preview</span>
                </span>
              </button>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter projects by category"
              className="min-w-0 max-w-[130px] sm:max-w-none rounded-[4px] border border-[#DDDAD2] bg-white px-2 sm:px-2.5 py-1.5 text-xs font-medium text-[#161618] outline-none focus:border-[#161618]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddNewProject}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#161618] px-3 sm:px-4 py-1.5 text-xs font-semibold text-[#F4F3EF] transition-opacity hover:opacity-85 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>
              Add<span className="hidden sm:inline"> Project</span>
            </span>
          </button>
        </div>

        <div className="wf-scroll flex-1 overflow-y-auto p-4 sm:p-6">
          {viewMode === 'grid' ? (
            projects.length === 0 ? (
              <div className="mx-auto max-w-md border border-[#DDDAD2] bg-[#FAF9F6] p-10 text-center text-[#161618]">
                <p className="text-base font-semibold">No projects yet</p>
                <p className="mt-1 text-xs text-[#5C5B57]">
                  Add your first case study to showcase your work across templates.
                </p>
                <button
                  type="button"
                  onClick={handleAddNewProject}
                  className="mt-4 rounded-full bg-[#161618] px-4 py-2 text-xs font-semibold text-[#F4F3EF]"
                >
                  + Add Project
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredProjects.map((p) => p.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
                    {filteredProjects.map((proj) => (
                      <SortableProjectCard
                        key={proj.id}
                        project={proj}
                        isSelected={activeProject?.id === proj.id}
                        assetMap={assetMap}
                        onSelect={() => {
                          onSelectProject(proj.id);
                          onChangeMobilePane?.('editor');
                          setConfirmDelete(false);
                        }}
                        onToggleFeatured={() =>
                          onUpdateProject(proj.id, { featured: !proj.featured })
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )
          ) : (
            <div className="mx-auto max-w-5xl border border-black/15 shadow-sm">
              <TemplateRenderer
                content={portfolio.content}
                presentation={{
                  ...portfolio.presentation,
                  sections: portfolio.presentation.sections.map((s) => ({
                    ...s,
                    visible: s.id === 'projects',
                  })),
                }}
                assetMap={assetMap}
                interactiveMode="preview"
                viewport="desktop"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Spacious Project Editor (540px wide on lg+, full pane on < lg when editing) */}
      <aside
        className={`${
          mobilePane === 'editor' ? 'flex' : 'hidden lg:flex'
        } h-full w-full lg:w-[540px] shrink-0 flex-col lg:border-l transition-[width] duration-200`}
        style={{
          backgroundColor: 'var(--wf-chrome-bg)',
          borderColor: 'var(--wf-chrome-border)',
          color: 'var(--wf-ink-primary)',
        }}
        aria-label="Project details editor"
      >
        {!activeProject ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <p className="text-xs" style={{ color: 'var(--wf-ink-secondary)' }}>
              Select or add a project to edit its case study details.
            </p>
          </div>
        ) : (
          <div className="wf-scroll flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between gap-3 border-b pb-3.5" style={{ borderColor: 'var(--wf-chrome-border)' }}>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onChangeMobilePane?.('list')}
                  className="lg:hidden mb-2 inline-flex items-center gap-1 rounded-[4px] border px-2 py-1 text-xs font-medium hover:bg-white/10"
                  style={{
                    borderColor: 'var(--wf-chrome-border)',
                    color: 'var(--wf-ink-secondary)',
                  }}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>All Projects</span>
                </button>
                <span className="block text-[11px] uppercase tracking-wider" style={{ fontFamily: 'var(--wf-font-mono)', color: 'var(--wf-ink-muted)' }}>
                  Editing Case Study
                </span>
                <h2 className="text-base font-semibold truncate">
                  {activeProject.title}
                </h2>
              </div>

              <label className="inline-flex items-center gap-2 text-xs cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={activeProject.featured}
                  onChange={(e) =>
                    onUpdateProject(activeProject.id, { featured: e.target.checked })
                  }
                  className="accent-[#D94E28]"
                />
                <span>Featured</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pe-title" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  Project Title
                </label>
                <input
                  id="pe-title"
                  type="text"
                  value={activeProject.title}
                  onChange={(e) =>
                    onUpdateProject(
                      activeProject.id,
                      { title: e.target.value },
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label htmlFor="pe-subtitle" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  Subtitle / Client
                </label>
                <input
                  id="pe-subtitle"
                  type="text"
                  value={activeProject.subtitle}
                  onChange={(e) =>
                    onUpdateProject(
                      activeProject.id,
                      { subtitle: e.target.value },
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="pe-year" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  Year
                </label>
                <input
                  id="pe-year"
                  type="text"
                  value={activeProject.year}
                  onChange={(e) =>
                    onUpdateProject(
                      activeProject.id,
                      { year: e.target.value },
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label htmlFor="pe-role" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  Your Role
                </label>
                <input
                  id="pe-role"
                  type="text"
                  value={activeProject.role}
                  onChange={(e) =>
                    onUpdateProject(
                      activeProject.id,
                      { role: e.target.value },
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label htmlFor="pe-category" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  Category
                </label>
                <input
                  id="pe-category"
                  type="text"
                  value={activeProject.category}
                  onChange={(e) =>
                    onUpdateProject(
                      activeProject.id,
                      { category: e.target.value },
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
            </div>

            <ImageFieldEditor
              label="Cover Image & Focal Point"
              portfolioId={portfolio.id}
              value={activeProject.coverImage}
              assetMap={assetMap}
              onRegisterAsset={onRegisterAsset}
              onChange={(coverImage) =>
                onUpdateProject(activeProject.id, { coverImage })
              }
            />

            <div>
              <label htmlFor="pe-summary" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Short Summary
              </label>
              <textarea
                id="pe-summary"
                rows={2}
                value={activeProject.summary}
                onChange={(e) =>
                  onUpdateProject(
                    activeProject.id,
                    { summary: e.target.value },
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            <div>
              <label htmlFor="pe-casestudy" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                Full Case Study Description (blank line separates paragraphs)
              </label>
              <textarea
                id="pe-casestudy"
                rows={4}
                value={activeProject.caseStudy.join('\n\n')}
                onChange={(e) =>
                  onUpdateProject(
                    activeProject.id,
                    {
                      caseStudy: e.target.value
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean),
                    },
                    { debounce: true }
                  )
                }
                className={fieldClass}
                style={fieldStyle}
              />
            </div>

            {/* Tech Tags */}
            <div className="space-y-2">
              <label htmlFor="pe-tag-input" className="block text-xs font-medium" style={{ color: 'var(--wf-ink-secondary)' }}>
                Technologies / Tools
              </label>
              <div className="flex gap-2">
                <input
                  id="pe-tag-input"
                  type="text"
                  value={newTag}
                  placeholder="Add tech tag (e.g. TypeScript)..."
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      e.preventDefault();
                      onUpdateProject(activeProject.id, {
                        tags: [...activeProject.tags, newTag.trim()],
                      });
                      setNewTag('');
                    }
                  }}
                  className={fieldClass}
                  style={fieldStyle}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newTag.trim()) return;
                    onUpdateProject(activeProject.id, {
                      tags: [...activeProject.tags, newTag.trim()],
                    });
                    setNewTag('');
                  }}
                  className="rounded-[4px] border px-3 text-xs font-medium hover:bg-white/10"
                  style={{ borderColor: 'var(--wf-chrome-border)' }}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-1 text-xs"
                    style={{
                      borderColor: 'var(--wf-chrome-border)',
                      backgroundColor: 'var(--wf-chrome-elevated)',
                    }}
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() =>
                        onUpdateProject(activeProject.id, {
                          tags: activeProject.tags.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#A1A09A] hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="pe-live" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  Live Site URL
                </label>
                <input
                  id="pe-live"
                  type="url"
                  placeholder="https://..."
                  value={activeProject.liveUrl}
                  onChange={(e) =>
                    onUpdateProject(
                      activeProject.id,
                      { liveUrl: e.target.value },
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label htmlFor="pe-source" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--wf-ink-secondary)' }}>
                  Source / Case Study URL
                </label>
                <input
                  id="pe-source"
                  type="url"
                  placeholder="https://..."
                  value={activeProject.sourceUrl}
                  onChange={(e) =>
                    onUpdateProject(
                      activeProject.id,
                      { sourceUrl: e.target.value },
                      { debounce: true }
                    )
                  }
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
            </div>

            {/* Secondary Gallery */}
            <div className="space-y-2.5 border-t pt-4" style={{ borderColor: 'var(--wf-chrome-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--wf-ink-secondary)' }}>
                  Secondary Gallery ({activeProject.gallery.length})
                </span>
                <label className="cursor-pointer rounded-[4px] border px-2.5 py-1 text-xs hover:bg-white/10" style={{ borderColor: 'var(--wf-chrome-border)' }}>
                  + Add Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddGalleryImage}
                    className="hidden"
                  />
                </label>
              </div>
              {activeProject.gallery.map((g, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-[4px] border p-2"
                  style={{
                    borderColor: 'var(--wf-chrome-border)',
                    backgroundColor: 'var(--wf-chrome-elevated)',
                  }}
                >
                  <div className="h-12 w-16 shrink-0 overflow-hidden border" style={{ borderColor: 'var(--wf-chrome-border)' }}>
                    <PortfolioImage image={g} assetMap={assetMap} className="h-full w-full" />
                  </div>
                  <input
                    type="text"
                    value={g.caption || ''}
                    placeholder="Image caption..."
                    onChange={(e) =>
                      onUpdateProject(
                        activeProject.id,
                        {
                          gallery: activeProject.gallery.map((item, i) =>
                            i === idx ? { ...item, caption: e.target.value } : item
                          ),
                        },
                        { debounce: true }
                      )
                    }
                    className={fieldClass}
                    style={fieldStyle}
                  />
                  <button
                    type="button"
                    aria-label="Remove gallery image"
                    onClick={() =>
                      onUpdateProject(activeProject.id, {
                        gallery: activeProject.gallery.filter((_, i) => i !== idx),
                      })
                    }
                    className="p-1 text-[#A1A09A] hover:text-[#D94E28]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Delete Project */}
            <div className="border-t pt-4 flex items-center justify-between" style={{ borderColor: 'var(--wf-chrome-border)' }}>
              {confirmDelete ? (
                <div className="flex items-center gap-2 w-full justify-between">
                  <span className="text-xs text-[#D94E28]">Delete this project permanently?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-[4px] border px-3 py-1.5 text-xs"
                      style={{ borderColor: 'var(--wf-chrome-border)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProject(activeProject.id);
                        setConfirmDelete(false);
                      }}
                      className="rounded-[4px] bg-[#D94E28] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#A1A09A] hover:text-[#D94E28]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Project</span>
                </button>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
