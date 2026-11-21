import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import {
  listAssetsForPortfolio,
  saveAssetRecord,
  savePortfolioRecord,
} from '../db/workfolioDb';
import type {
  Density,
  PortfolioContent,
  PortfolioDocument,
  Project,
  SectionId,
  StoredAsset,
  TemplateId,
} from '../types/portfolio';
import {
  addProjectToContent,
  deleteProjectFromContent,
  moveSectionByStep,
  reorderProjectsById,
  reorderSectionsById,
  setSectionLayoutVariant,
  switchTemplateSafely,
  toggleSectionVisibilityById,
  updateProjectInContent,
} from '../utils/portfolioLogic';

export type StudioMode = 'sections' | 'projects' | 'design';
export type ViewportSize = 'desktop' | 'tablet' | 'mobile';
export type StageMat = 'stone' | 'charcoal';
export type SaveStatus = 'saved' | 'saving' | 'error';

export interface PortfolioSnapshot {
  name: string;
  content: PortfolioContent;
  presentation: PortfolioDocument['presentation'];
}

export interface StudioPersistenceAdapter {
  savePortfolio: (doc: PortfolioDocument) => Promise<void>;
  saveAsset: (asset: StoredAsset) => Promise<void>;
  listAssets: (portfolioId: string) => Promise<StoredAsset[]>;
}

const defaultPersistence: StudioPersistenceAdapter = {
  savePortfolio: savePortfolioRecord,
  saveAsset: saveAssetRecord,
  listAssets: listAssetsForPortfolio,
};

const MAX_HISTORY = 40;

function takeSnapshot(doc: PortfolioDocument): PortfolioSnapshot {
  return structuredClone({
    name: doc.name,
    content: doc.content,
    presentation: doc.presentation,
  });
}

export interface StudioState {
  activePortfolio: PortfolioDocument | null;
  past: PortfolioSnapshot[];
  future: PortfolioSnapshot[];
  mode: StudioMode;
  selectedSectionId: SectionId;
  selectedProjectId: string | null;
  layoutStripOpen: boolean;
  hoveredLayoutVariant: string | null;
  viewport: ViewportSize;
  stageMat: StageMat;
  saveStatus: SaveStatus;
  assetUrls: Record<string, string>;

  loadPortfolio: (doc: PortfolioDocument) => Promise<void>;
  unloadPortfolio: () => void;
  setMode: (mode: StudioMode) => void;
  selectSection: (sectionId: SectionId) => void;
  selectProject: (projectId: string | null) => void;
  setLayoutStripOpen: (open: boolean) => void;
  setHoveredLayoutVariant: (variantId: string | null) => void;
  setViewport: (viewport: ViewportSize) => void;
  setStageMat: (mat: StageMat) => void;

  renamePortfolio: (name: string) => void;
  updateContent: (
    updater: (content: PortfolioContent) => PortfolioContent,
    options?: { debounce?: boolean }
  ) => void;

  reorderSections: (activeId: SectionId, overId: SectionId) => void;
  stepSection: (sectionId: SectionId, direction: 'up' | 'down') => void;
  toggleSectionVisibility: (sectionId: SectionId) => void;
  setSectionLayout: (sectionId: SectionId, layoutVariant: string) => void;

  addProject: (project: Project) => void;
  updateProject: (
    projectId: string,
    patch: Partial<Project>,
    options?: { debounce?: boolean }
  ) => void;
  deleteProject: (projectId: string) => void;
  reorderProjects: (activeId: string, overId: string) => void;

  updateTypography: (typographyId: string) => void;
  updatePalette: (paletteId: string) => void;
  updateDensity: (density: Density) => void;
  switchTemplate: (templateId: TemplateId) => void;

  registerAsset: (asset: StoredAsset) => Promise<void>;

  undo: () => void;
  redo: () => void;
  flushDebouncedSave: () => void;
}

export function createStudioStore(persistence: StudioPersistenceAdapter = defaultPersistence) {
  let typingBaseSnapshot: PortfolioSnapshot | null = null;
  let typingTimer: ReturnType<typeof setTimeout> | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  const schedulePersist = (doc: PortfolioDocument, set: (partial: Partial<StudioState>) => void) => {
    set({ saveStatus: 'saving' });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await persistence.savePortfolio(doc);
        set({ saveStatus: 'saved' });
      } catch {
        set({ saveStatus: 'error' });
      }
    }, 180);
  };

  const commitDebouncedTyping = (
    get: () => StudioState,
    set: (partial: Partial<StudioState>) => void
  ) => {
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    if (typingBaseSnapshot) {
      const base = typingBaseSnapshot;
      typingBaseSnapshot = null;
      const past = [...get().past, base].slice(-MAX_HISTORY);
      set({ past, future: [] });
    }
  };

  return createStore<StudioState>((set, get) => ({
    activePortfolio: null,
    past: [],
    future: [],
    mode: 'sections',
    selectedSectionId: 'hero',
    selectedProjectId: null,
    layoutStripOpen: false,
    hoveredLayoutVariant: null,
    viewport: 'desktop',
    stageMat: 'stone',
    saveStatus: 'saved',
    assetUrls: {},

    loadPortfolio: async (doc) => {
      if (typingTimer) clearTimeout(typingTimer);
      if (saveTimer) clearTimeout(saveTimer);
      typingBaseSnapshot = null;

      const assets = await persistence.listAssets(doc.id);
      const assetMap: Record<string, string> = {};
      for (const a of assets) {
        assetMap[a.id] = a.dataUrl;
      }

      set({
        activePortfolio: structuredClone(doc),
        past: [],
        future: [],
        mode: 'sections',
        selectedSectionId: 'hero',
        selectedProjectId: doc.content.projects[0]?.id ?? null,
        layoutStripOpen: false,
        hoveredLayoutVariant: null,
        saveStatus: 'saved',
        assetUrls: assetMap,
      });
    },

    unloadPortfolio: () => {
      if (typingTimer) clearTimeout(typingTimer);
      if (saveTimer) clearTimeout(saveTimer);
      typingBaseSnapshot = null;
      set({
        activePortfolio: null,
        past: [],
        future: [],
        layoutStripOpen: false,
        hoveredLayoutVariant: null,
      });
    },

    setMode: (mode) => {
      commitDebouncedTyping(get, set);
      set({
        mode,
        layoutStripOpen: mode === 'sections' ? get().layoutStripOpen : false,
        hoveredLayoutVariant: null,
      });
    },

    selectSection: (sectionId) => {
      set({
        selectedSectionId: sectionId,
        hoveredLayoutVariant: null,
      });
    },

    selectProject: (projectId) => {
      set({ selectedProjectId: projectId });
    },

    setLayoutStripOpen: (open) => {
      set({ layoutStripOpen: open, hoveredLayoutVariant: null });
    },

    setHoveredLayoutVariant: (variantId) => {
      set({ hoveredLayoutVariant: variantId });
    },

    setViewport: (viewport) => set({ viewport }),
    setStageMat: (stageMat) => set({ stageMat }),

    renamePortfolio: (name) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const next: PortfolioDocument = {
        ...current,
        name: name.trim() || current.name,
        updatedAt: Date.now(),
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    updateContent: (updater, options) => {
      const current = get().activePortfolio;
      if (!current) return;

      const useDebounce = options?.debounce ?? false;
      if (useDebounce) {
        if (!typingBaseSnapshot) {
          typingBaseSnapshot = takeSnapshot(current);
        }
        const next: PortfolioDocument = {
          ...current,
          updatedAt: Date.now(),
          content: updater(current.content),
        };
        set({ activePortfolio: next });

        if (typingTimer) clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          commitDebouncedTyping(get, set);
        }, 600);
        schedulePersist(next, set);
      } else {
        commitDebouncedTyping(get, set);
        const prevSnap = takeSnapshot(current);
        const next: PortfolioDocument = {
          ...current,
          updatedAt: Date.now(),
          content: updater(current.content),
        };
        set({
          activePortfolio: next,
          past: [...get().past, prevSnap].slice(-MAX_HISTORY),
          future: [],
        });
        schedulePersist(next, set);
      }
    },

    reorderSections: (activeId, overId) => {
      const current = get().activePortfolio;
      if (!current || activeId === overId) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const nextSections = reorderSectionsById(current.presentation.sections, activeId, overId);
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        presentation: { ...current.presentation, sections: nextSections },
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    stepSection: (sectionId, direction) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const nextSections = moveSectionByStep(current.presentation.sections, sectionId, direction);
      if (nextSections === current.presentation.sections) return;
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        presentation: { ...current.presentation, sections: nextSections },
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    toggleSectionVisibility: (sectionId) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const nextSections = toggleSectionVisibilityById(current.presentation.sections, sectionId);
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        presentation: { ...current.presentation, sections: nextSections },
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    setSectionLayout: (sectionId, layoutVariant) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const nextSections = setSectionLayoutVariant(
        current.presentation.sections,
        sectionId,
        layoutVariant
      );
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        presentation: { ...current.presentation, sections: nextSections },
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
        hoveredLayoutVariant: null,
      });
      schedulePersist(next, set);
    },

    addProject: (project) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        content: addProjectToContent(current.content, project),
      };
      set({
        activePortfolio: next,
        selectedProjectId: project.id,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    updateProject: (projectId, patch, options) => {
      get().updateContent(
        (content) => updateProjectInContent(content, projectId, patch),
        options
      );
    },

    deleteProject: (projectId) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const nextContent = deleteProjectFromContent(current.content, projectId);
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        content: nextContent,
      };
      const nextSelected =
        get().selectedProjectId === projectId
          ? nextContent.projects[0]?.id ?? null
          : get().selectedProjectId;
      set({
        activePortfolio: next,
        selectedProjectId: nextSelected,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    reorderProjects: (activeId, overId) => {
      const current = get().activePortfolio;
      if (!current || activeId === overId) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const nextProjects = reorderProjectsById(current.content.projects, activeId, overId);
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        content: { ...current.content, projects: nextProjects },
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    updateTypography: (typographyId) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        presentation: { ...current.presentation, typographyId },
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    updatePalette: (paletteId) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        presentation: { ...current.presentation, paletteId },
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    updateDensity: (density) => {
      const current = get().activePortfolio;
      if (!current) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const next: PortfolioDocument = {
        ...current,
        updatedAt: Date.now(),
        presentation: { ...current.presentation, density },
      };
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    switchTemplate: (templateId) => {
      const current = get().activePortfolio;
      if (!current || current.presentation.templateId === templateId) return;
      commitDebouncedTyping(get, set);
      const prevSnap = takeSnapshot(current);
      const next = switchTemplateSafely(current, templateId);
      set({
        activePortfolio: next,
        past: [...get().past, prevSnap].slice(-MAX_HISTORY),
        future: [],
      });
      schedulePersist(next, set);
    },

    registerAsset: async (asset) => {
      await persistence.saveAsset(asset);
      set({
        assetUrls: {
          ...get().assetUrls,
          [asset.id]: asset.dataUrl,
        },
      });
    },

    undo: () => {
      commitDebouncedTyping(get, set);
      const { activePortfolio, past, future } = get();
      if (!activePortfolio || past.length === 0) return;
      const previous = past[past.length - 1];
      const currentSnap = takeSnapshot(activePortfolio);
      const restored: PortfolioDocument = {
        ...activePortfolio,
        name: previous.name,
        content: structuredClone(previous.content),
        presentation: structuredClone(previous.presentation),
        updatedAt: Date.now(),
      };
      set({
        activePortfolio: restored,
        past: past.slice(0, -1),
        future: [currentSnap, ...future].slice(0, MAX_HISTORY),
      });
      schedulePersist(restored, set);
    },

    redo: () => {
      commitDebouncedTyping(get, set);
      const { activePortfolio, past, future } = get();
      if (!activePortfolio || future.length === 0) return;
      const nextSnap = future[0];
      const currentSnap = takeSnapshot(activePortfolio);
      const restored: PortfolioDocument = {
        ...activePortfolio,
        name: nextSnap.name,
        content: structuredClone(nextSnap.content),
        presentation: structuredClone(nextSnap.presentation),
        updatedAt: Date.now(),
      };
      set({
        activePortfolio: restored,
        past: [...past, currentSnap].slice(-MAX_HISTORY),
        future: future.slice(1),
      });
      schedulePersist(restored, set);
    },

    flushDebouncedSave: () => {
      commitDebouncedTyping(get, set);
    },
  }));
}

export const studioStore = createStudioStore();

export function useStudioStore<T>(selector: (state: StudioState) => T): T {
  return useStore(studioStore, selector);
}
