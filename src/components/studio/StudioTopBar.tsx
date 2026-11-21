import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Download,
  Eye,
  Monitor,
  Redo2,
  Smartphone,
  SunMoon,
  Tablet,
  Undo2,
} from 'lucide-react';
import type { SaveStatus, StageMat, StudioMode, ViewportSize } from '../../store/studioStore';

interface StudioTopBarProps {
  portfolioName: string;
  saveStatus: SaveStatus;
  mode: StudioMode;
  canUndo: boolean;
  canRedo: boolean;
  viewport: ViewportSize;
  stageMat: StageMat;
  exporting: boolean;
  mobilePane: 'canvas' | 'inspector';
  mobileProjectsPane: 'list' | 'editor';
  onBackToGallery: () => void;
  onRename: (name: string) => void;
  onChangeMode: (mode: StudioMode) => void;
  onChangeMobilePane: (pane: 'canvas' | 'inspector') => void;
  onChangeMobileProjectsPane: (pane: 'list' | 'editor') => void;
  onUndo: () => void;
  onRedo: () => void;
  onChangeViewport: (vp: ViewportSize) => void;
  onToggleStageMat: () => void;
  onEnterPreview: () => void;
  onExportZip: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  portfolioName,
  saveStatus,
  mode,
  canUndo,
  canRedo,
  viewport,
  stageMat,
  exporting,
  mobilePane,
  mobileProjectsPane,
  onBackToGallery,
  onRename,
  onChangeMode,
  onChangeMobilePane,
  onChangeMobileProjectsPane,
  onUndo,
  onRedo,
  onChangeViewport,
  onToggleStageMat,
  onEnterPreview,
  onExportZip,
}) => {
  const [nameDraft, setNameDraft] = useState(portfolioName);

  useEffect(() => {
    setNameDraft(portfolioName);
  }, [portfolioName]);

  const inspectorTabLabel = mode === 'design' ? 'Design' : 'Inspector';

  return (
    <div
      className="shrink-0"
      style={{
        backgroundColor: 'var(--wf-chrome-bg)',
        color: 'var(--wf-ink-primary)',
      }}
    >
      <header
        className="flex h-[52px] items-center justify-between gap-2 sm:gap-3 border-b px-2.5 sm:px-4"
        style={{ borderColor: 'var(--wf-chrome-border)' }}
      >
        {/* Left: Back + Editable Name + Save Status */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBackToGallery}
            aria-label="Back to Gallery"
            className="inline-flex h-8 items-center gap-1 rounded-[4px] border px-2 sm:px-2.5 text-xs font-medium transition-colors hover:bg-white/10 whitespace-nowrap shrink-0"
            style={{
              borderColor: 'var(--wf-chrome-border)',
              color: 'var(--wf-ink-secondary)',
            }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Gallery</span>
          </button>

          <input
            type="text"
            value={nameDraft}
            aria-label="Portfolio name"
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              if (nameDraft.trim() && nameDraft.trim() !== portfolioName) {
                onRename(nameDraft.trim());
              } else {
                setNameDraft(portfolioName);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="hidden md:block w-40 lg:w-56 truncate rounded-[4px] border border-transparent bg-transparent px-2 py-1 text-xs font-semibold outline-none transition-colors hover:border-[#2E2E35] focus:border-[#D94E28] focus:bg-[#222227]"
            style={{ color: 'var(--wf-ink-primary)' }}
          />

          <span
            className="hidden xl:inline-block text-[11px] whitespace-nowrap"
            style={{
              fontFamily: 'var(--wf-font-mono)',
              color: saveStatus === 'error' ? '#D94E28' : 'var(--wf-ink-muted)',
            }}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Save Error' : 'Saved'}
          </span>
        </div>

        {/* Center-Left: Stationary Primary Mode Spine */}
        <div
          className="flex items-center rounded-full border p-0.5 shrink-0"
          style={{
            backgroundColor: 'var(--wf-chrome-elevated)',
            borderColor: 'var(--wf-chrome-border)',
          }}
          role="tablist"
          aria-label="Studio workspace modes"
        >
          {(
            [
              { id: 'sections', label: 'Sections' },
              { id: 'projects', label: 'Projects' },
              { id: 'design', label: 'Design' },
            ] as const
          ).map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeMode(tab.id)}
                className={`rounded-full px-2.5 sm:px-3.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#F4F3EF] text-[#161618]'
                    : 'text-[#A1A09A] hover:text-[#F4F3EF]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Center-Right: Undo/Redo + Viewport + Mat Toggle (desktop >= lg) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo (Cmd/Ctrl+Z)"
              className="flex h-8 w-8 items-center justify-center rounded-[4px] border transition-colors hover:bg-white/10 disabled:opacity-35 disabled:pointer-events-none"
              style={{ borderColor: 'var(--wf-chrome-border)' }}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo (Cmd/Ctrl+Shift+Z)"
              className="flex h-8 w-8 items-center justify-center rounded-[4px] border transition-colors hover:bg-white/10 disabled:opacity-35 disabled:pointer-events-none"
              style={{ borderColor: 'var(--wf-chrome-border)' }}
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div
            className="flex items-center rounded-full border p-0.5"
            style={{
              backgroundColor: 'var(--wf-chrome-elevated)',
              borderColor: 'var(--wf-chrome-border)',
            }}
          >
            <button
              type="button"
              onClick={() => onChangeViewport('desktop')}
              aria-label="Desktop viewport"
              title="Desktop (1280px)"
              className={`flex h-6 w-7 items-center justify-center rounded-full transition-colors ${
                viewport === 'desktop' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeViewport('tablet')}
              aria-label="Tablet viewport"
              title="Tablet (768px)"
              className={`flex h-6 w-7 items-center justify-center rounded-full transition-colors ${
                viewport === 'tablet' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeViewport('mobile')}
              aria-label="Mobile viewport"
              title="Mobile (390px)"
              className={`flex h-6 w-7 items-center justify-center rounded-full transition-colors ${
                viewport === 'mobile' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleStageMat}
            aria-label={stageMat === 'stone' ? 'Switch to Charcoal Mat' : 'Switch to Stone Mat'}
            title={stageMat === 'stone' ? 'Stage: Stone Mat' : 'Stage: Charcoal Mat'}
            className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border px-2.5 text-xs transition-colors hover:bg-white/10 whitespace-nowrap"
            style={{
              borderColor: 'var(--wf-chrome-border)',
              color: 'var(--wf-ink-secondary)',
            }}
          >
            <SunMoon className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">
              {stageMat === 'stone' ? 'Stone Mat' : 'Charcoal Mat'}
            </span>
          </button>
        </div>

        {/* Right: Preview + Export .zip */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onEnterPreview}
            aria-label="Preview portfolio"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 sm:px-3 text-xs font-medium transition-colors hover:bg-white/10 whitespace-nowrap"
            style={{
              borderColor: 'var(--wf-chrome-border)',
              color: 'var(--wf-ink-primary)',
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          <button
            type="button"
            onClick={onExportZip}
            disabled={exporting}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
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
      </header>

      {/* Mobile & Tablet Compact Sub-Bar (< lg) */}
      <div
        className="flex lg:hidden h-[42px] items-center justify-between gap-2 border-b px-2.5 sm:px-4"
        style={{
          backgroundColor: 'var(--wf-chrome-elevated)',
          borderColor: 'var(--wf-chrome-border)',
        }}
      >
        {mode === 'projects' ? (
          <div
            className="flex items-center rounded-full border p-0.5"
            style={{
              backgroundColor: 'var(--wf-chrome-bg)',
              borderColor: 'var(--wf-chrome-border)',
            }}
            role="group"
            aria-label="Switch projects pane"
          >
            <button
              type="button"
              onClick={() => onChangeMobileProjectsPane('list')}
              className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                mobileProjectsPane === 'list'
                  ? 'bg-[#F4F3EF] text-[#161618]'
                  : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              Project List
            </button>
            <button
              type="button"
              onClick={() => onChangeMobileProjectsPane('editor')}
              className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                mobileProjectsPane === 'editor'
                  ? 'bg-[#F4F3EF] text-[#161618]'
                  : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              Case Editor
            </button>
          </div>
        ) : (
          <div
            className="flex items-center rounded-full border p-0.5"
            style={{
              backgroundColor: 'var(--wf-chrome-bg)',
              borderColor: 'var(--wf-chrome-border)',
            }}
            role="group"
            aria-label="Switch workspace view"
          >
            <button
              type="button"
              onClick={() => onChangeMobilePane('canvas')}
              className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                mobilePane === 'canvas'
                  ? 'bg-[#F4F3EF] text-[#161618]'
                  : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              Canvas
            </button>
            <button
              type="button"
              onClick={() => onChangeMobilePane('inspector')}
              className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
                mobilePane === 'inspector'
                  ? 'bg-[#F4F3EF] text-[#161618]'
                  : 'text-[#A1A09A] hover:text-white'
              }`}
            >
              {inspectorTabLabel}
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
            className="flex h-7 w-7 items-center justify-center rounded-[4px] border transition-colors hover:bg-white/10 disabled:opacity-35 disabled:pointer-events-none"
            style={{ borderColor: 'var(--wf-chrome-border)' }}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
            className="flex h-7 w-7 items-center justify-center rounded-[4px] border transition-colors hover:bg-white/10 disabled:opacity-35 disabled:pointer-events-none"
            style={{ borderColor: 'var(--wf-chrome-border)' }}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          {mode !== 'projects' && (
            <>
              <div
                className="hidden sm:flex items-center rounded-full border p-0.5"
                style={{
                  backgroundColor: 'var(--wf-chrome-bg)',
                  borderColor: 'var(--wf-chrome-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => onChangeViewport('desktop')}
                  aria-label="Desktop viewport"
                  className={`flex h-6 w-7 items-center justify-center rounded-full transition-colors ${
                    viewport === 'desktop' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A]'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeViewport('tablet')}
                  aria-label="Tablet viewport"
                  className={`flex h-6 w-7 items-center justify-center rounded-full transition-colors ${
                    viewport === 'tablet' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A]'
                  }`}
                >
                  <Tablet className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeViewport('mobile')}
                  aria-label="Mobile viewport"
                  className={`flex h-6 w-7 items-center justify-center rounded-full transition-colors ${
                    viewport === 'mobile' ? 'bg-[#F4F3EF] text-[#161618]' : 'text-[#A1A09A]'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={onToggleStageMat}
                aria-label={stageMat === 'stone' ? 'Switch to Charcoal Mat' : 'Switch to Stone Mat'}
                className="flex h-7 w-7 items-center justify-center rounded-[4px] border transition-colors hover:bg-white/10"
                style={{
                  borderColor: 'var(--wf-chrome-border)',
                  color: 'var(--wf-ink-secondary)',
                }}
              >
                <SunMoon className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
