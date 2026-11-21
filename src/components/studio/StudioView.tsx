import React, { useEffect, useState } from 'react';
import { LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { useStudioStore, type ViewportSize } from '../../store/studioStore';
import { exportPortfolioToZip } from '../../utils/exporter';
import { TemplateRenderer } from '../templates/TemplateRenderer';
import { DesignWorkspace } from './DesignWorkspace';
import { LayoutVariationStrip } from './LayoutVariationStrip';
import { ProjectsWorkspace } from './ProjectsWorkspace';
import { SectionsWorkspace } from './SectionsWorkspace';
import { StudioTopBar } from './StudioTopBar';

interface StudioViewProps {
  onBackToGallery: () => void;
  onEnterPreview: () => void;
}

const STAGE_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export const StudioView: React.FC<StudioViewProps> = ({
  onBackToGallery,
  onEnterPreview,
}) => {
  const activePortfolio = useStudioStore((s) => s.activePortfolio);
  const past = useStudioStore((s) => s.past);
  const future = useStudioStore((s) => s.future);
  const mode = useStudioStore((s) => s.mode);
  const selectedSectionId = useStudioStore((s) => s.selectedSectionId);
  const selectedProjectId = useStudioStore((s) => s.selectedProjectId);
  const layoutStripOpen = useStudioStore((s) => s.layoutStripOpen);
  const hoveredLayoutVariant = useStudioStore((s) => s.hoveredLayoutVariant);
  const viewport = useStudioStore((s) => s.viewport);
  const stageMat = useStudioStore((s) => s.stageMat);
  const saveStatus = useStudioStore((s) => s.saveStatus);
  const assetUrls = useStudioStore((s) => s.assetUrls);

  const setMode = useStudioStore((s) => s.setMode);
  const selectSection = useStudioStore((s) => s.selectSection);
  const selectProject = useStudioStore((s) => s.selectProject);
  const setLayoutStripOpen = useStudioStore((s) => s.setLayoutStripOpen);
  const setHoveredLayoutVariant = useStudioStore((s) => s.setHoveredLayoutVariant);
  const setViewport = useStudioStore((s) => s.setViewport);
  const setStageMat = useStudioStore((s) => s.setStageMat);
  const renamePortfolio = useStudioStore((s) => s.renamePortfolio);
  const updateContent = useStudioStore((s) => s.updateContent);
  const reorderSections = useStudioStore((s) => s.reorderSections);
  const stepSection = useStudioStore((s) => s.stepSection);
  const toggleSectionVisibility = useStudioStore((s) => s.toggleSectionVisibility);
  const setSectionLayout = useStudioStore((s) => s.setSectionLayout);
  const addProject = useStudioStore((s) => s.addProject);
  const updateProject = useStudioStore((s) => s.updateProject);
  const deleteProject = useStudioStore((s) => s.deleteProject);
  const reorderProjects = useStudioStore((s) => s.reorderProjects);
  const updateTypography = useStudioStore((s) => s.updateTypography);
  const updatePalette = useStudioStore((s) => s.updatePalette);
  const updateDensity = useStudioStore((s) => s.updateDensity);
  const switchTemplate = useStudioStore((s) => s.switchTemplate);
  const registerAsset = useStudioStore((s) => s.registerAsset);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);

  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<'canvas' | 'inspector'>('canvas');
  const [mobileProjectsPane, setMobileProjectsPane] = useState<'list' | 'editor'>('list');

  // Global keyboard shortcuts for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (isInput) return; // Let native input undo work while typing inside a field
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  if (!activePortfolio) return null;

  const activeSection =
    activePortfolio.presentation.sections.find((s) => s.id === selectedSectionId) ||
    activePortfolio.presentation.sections[0];

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportPortfolioToZip(activePortfolio, assetUrls);
      setToastMessage(`Exported ${res.filename} (${res.fileCount} files)`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setToastMessage('Export failed — please retry.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <StudioTopBar
        portfolioName={activePortfolio.name}
        saveStatus={saveStatus}
        mode={mode}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        viewport={viewport}
        stageMat={stageMat}
        exporting={exporting}
        mobilePane={mobilePane}
        mobileProjectsPane={mobileProjectsPane}
        onBackToGallery={onBackToGallery}
        onRename={renamePortfolio}
        onChangeMode={setMode}
        onChangeMobilePane={setMobilePane}
        onChangeMobileProjectsPane={setMobileProjectsPane}
        onUndo={undo}
        onRedo={redo}
        onChangeViewport={setViewport}
        onToggleStageMat={() =>
          setStageMat(stageMat === 'stone' ? 'charcoal' : 'stone')
        }
        onEnterPreview={onEnterPreview}
        onExportZip={handleExport}
      />

      {mode === 'projects' ? (
        <ProjectsWorkspace
          portfolio={activePortfolio}
          selectedProjectId={selectedProjectId}
          assetMap={assetUrls}
          mobilePane={mobileProjectsPane}
          onChangeMobilePane={setMobileProjectsPane}
          onSelectProject={selectProject}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
          onReorderProjects={reorderProjects}
          onRegisterAsset={registerAsset}
        />
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Proofing Stage + Optional Bottom Layout Variation Strip */}
          <div
            className={`${
              mobilePane === 'inspector' ? 'hidden lg:flex' : 'flex'
            } flex-1 flex-col min-w-0 overflow-hidden`}
          >
            <main
              className="wf-scroll flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 flex justify-center transition-colors duration-150"
              style={{
                backgroundColor:
                  stageMat === 'stone'
                    ? 'var(--wf-stage-stone)'
                    : 'var(--wf-stage-charcoal)',
              }}
              aria-label="Live portfolio proofing stage"
            >
              <div
                className="h-fit min-h-full transition-[width] duration-200"
                style={{
                  width: STAGE_WIDTHS[viewport],
                  maxWidth: viewport === 'desktop' ? '1280px' : '100%',
                  borderRadius: '0px',
                  border: '1px solid rgba(20, 20, 20, 0.16)',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <TemplateRenderer
                  content={activePortfolio.content}
                  presentation={activePortfolio.presentation}
                  assetMap={assetUrls}
                  interactiveMode={mode === 'sections' ? 'studio' : 'preview'}
                  viewport={viewport}
                  selectedSectionId={selectedSectionId}
                  onSelectSection={(secId) => selectSection(secId)}
                  onInlineUpdate={(updater) =>
                    updateContent(updater, { debounce: true })
                  }
                  previewVariantOverride={
                    mode === 'sections' && hoveredLayoutVariant
                      ? {
                          sectionId: selectedSectionId,
                          layoutVariant: hoveredLayoutVariant,
                        }
                      : null
                  }
                />
              </div>
            </main>

            {/* Mobile/Tablet Quick Selection Bar when inspecting Canvas */}
            {mode === 'sections' && (
              <div
                className="flex lg:hidden items-center justify-between gap-2 border-t px-3 py-2 shrink-0"
                style={{
                  backgroundColor: 'var(--wf-chrome-bg)',
                  borderColor: 'var(--wf-chrome-border)',
                  color: 'var(--wf-ink-primary)',
                }}
              >
                <span className="text-xs truncate">
                  <span style={{ color: 'var(--wf-ink-muted)' }}>Selected: </span>
                  <span className="font-semibold">{activeSection.label}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLayoutStripOpen(!layoutStripOpen)}
                    className={`inline-flex items-center gap-1 rounded-[4px] border px-2.5 py-1 text-xs font-medium ${
                      layoutStripOpen
                        ? 'border-[#D94E28] bg-[#D94E28]/15 text-white'
                        : 'border-[#2E2E35] text-[#F4F3EF]'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Layouts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobilePane('inspector')}
                    className="inline-flex items-center gap-1 rounded-[4px] px-2.5 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--wf-action-ivory)',
                      color: 'var(--wf-action-ivory-ink)',
                    }}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'sections' && (
              <LayoutVariationStrip
                open={layoutStripOpen}
                portfolio={activePortfolio}
                sectionId={selectedSectionId}
                assetMap={assetUrls}
                onHoverVariant={setHoveredLayoutVariant}
                onSelectVariant={(variantId) =>
                  setSectionLayout(selectedSectionId, variantId)
                }
                onClose={() => setLayoutStripOpen(false)}
              />
            )}
          </div>

          {mode === 'sections' && (
            <SectionsWorkspace
              className={mobilePane === 'inspector' ? 'flex' : 'hidden lg:flex'}
              portfolio={activePortfolio}
              selectedSectionId={selectedSectionId}
              layoutStripOpen={layoutStripOpen}
              assetMap={assetUrls}
              onSelectSection={selectSection}
              onReorderSections={reorderSections}
              onStepSection={stepSection}
              onToggleSectionVisibility={toggleSectionVisibility}
              onToggleLayoutStrip={() => {
                const next = !layoutStripOpen;
                setLayoutStripOpen(next);
                if (next && window.innerWidth < 1024) {
                  setMobilePane('canvas');
                }
              }}
              onUpdateContent={updateContent}
              onRegisterAsset={registerAsset}
              onSwitchToProjectsMode={() => setMode('projects')}
            />
          )}

          {mode === 'design' && (
            <DesignWorkspace
              className={mobilePane === 'inspector' ? 'flex' : 'hidden lg:flex'}
              portfolio={activePortfolio}
              onSwitchTemplate={switchTemplate}
              onSelectTypography={updateTypography}
              onSelectPalette={updatePalette}
              onSelectDensity={updateDensity}
            />
          )}
        </div>
      )}

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 text-xs font-medium shadow-lg whitespace-nowrap max-w-[calc(100vw-24px)] truncate"
          style={{
            backgroundColor: 'var(--wf-chrome-bg)',
            borderColor: 'var(--wf-chrome-border)',
            color: 'var(--wf-ink-primary)',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
