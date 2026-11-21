import { useCallback, useEffect, useState } from 'react';
import { GalleryView } from './components/gallery/GalleryView';
import { FullScreenPreview } from './components/studio/FullScreenPreview';
import { StudioView } from './components/studio/StudioView';
import { createPortfolioDocument } from './data/samples';
import {
  deletePortfolioRecord,
  duplicatePortfolioRecord,
  listPortfolios,
  savePortfolioRecord,
  seedInitialPortfolioIfEmpty,
} from './db/workfolioDb';
import { useStudioStore } from './store/studioStore';
import type { PortfolioDocument, TemplateId } from './types/portfolio';

type AppView = 'gallery' | 'studio' | 'preview';

const ACTIVE_PORTFOLIO_KEY = 'workfolio_active_portfolio_id';

export default function App() {
  const [view, setView] = useState<AppView>('gallery');
  const [portfolios, setPortfolios] = useState<PortfolioDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortfolioIntoStudio = useStudioStore((s) => s.loadPortfolio);
  const unloadPortfolio = useStudioStore((s) => s.unloadPortfolio);
  const flushDebouncedSave = useStudioStore((s) => s.flushDebouncedSave);

  const refreshPortfolioList = useCallback(async () => {
    const list = await listPortfolios();
    setPortfolios(list);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const seeded = await seedInitialPortfolioIfEmpty();
        if (cancelled) return;
        setPortfolios(seeded);

        // Restore active studio session across browser reload if one was open
        const savedId = sessionStorage.getItem(ACTIVE_PORTFOLIO_KEY);
        if (savedId) {
          const match = seeded.find((p) => p.id === savedId);
          if (match) {
            await loadPortfolioIntoStudio(match);
            if (!cancelled) setView('studio');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPortfolioIntoStudio]);

  const handleOpenPortfolio = async (doc: PortfolioDocument) => {
    await loadPortfolioIntoStudio(doc);
    sessionStorage.setItem(ACTIVE_PORTFOLIO_KEY, doc.id);
    setView('studio');
  };

  const handleCreatePortfolio = async (params: {
    templateId: TemplateId;
    title: string;
    personName: string;
    roleTitle: string;
    populateSample: boolean;
  }) => {
    const id = `pf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newDoc = createPortfolioDocument({
      id,
      name: params.title,
      templateId: params.templateId,
      personName: params.personName,
      roleTitle: params.roleTitle,
      populateSample: params.populateSample,
    });
    await savePortfolioRecord(newDoc);
    await refreshPortfolioList();
    await loadPortfolioIntoStudio(newDoc);
    sessionStorage.setItem(ACTIVE_PORTFOLIO_KEY, newDoc.id);
    setView('studio');
  };

  const handleDuplicatePortfolio = async (id: string) => {
    await duplicatePortfolioRecord(id);
    await refreshPortfolioList();
  };

  const handleDeletePortfolio = async (id: string) => {
    await deletePortfolioRecord(id);
    if (sessionStorage.getItem(ACTIVE_PORTFOLIO_KEY) === id) {
      sessionStorage.removeItem(ACTIVE_PORTFOLIO_KEY);
    }
    await refreshPortfolioList();
  };

  const handleBackToGallery = async () => {
    flushDebouncedSave();
    sessionStorage.removeItem(ACTIVE_PORTFOLIO_KEY);
    await refreshPortfolioList();
    unloadPortfolio();
    setView('gallery');
  };

  if (loading) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ backgroundColor: 'var(--wf-gallery-bg)', color: 'var(--wf-gallery-ink)' }}
      >
        <div className="text-center space-y-2">
          <div className="text-sm font-bold tracking-[0.18em] uppercase">WORKFOLIO</div>
          <div className="text-xs" style={{ color: 'var(--wf-gallery-muted)' }}>
            Loading local workspace...
          </div>
        </div>
      </div>
    );
  }

  if (view === 'preview') {
    return <FullScreenPreview onBackToStudio={() => setView('studio')} />;
  }

  if (view === 'studio') {
    return (
      <StudioView
        onBackToGallery={handleBackToGallery}
        onEnterPreview={() => setView('preview')}
      />
    );
  }

  return (
    <GalleryView
      portfolios={portfolios}
      onOpenPortfolio={handleOpenPortfolio}
      onCreatePortfolio={handleCreatePortfolio}
      onDuplicatePortfolio={handleDuplicatePortfolio}
      onDeletePortfolio={handleDeletePortfolio}
    />
  );
}
