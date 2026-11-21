import test from 'node:test';
import assert from 'node:assert/strict';
import { createPortfolioDocument } from '../data/samples';
import { createStudioStore, type StudioPersistenceAdapter } from './studioStore';

function createMemoryPersistence(): {
  adapter: StudioPersistenceAdapter;
  savedCount: () => number;
} {
  let saves = 0;
  return {
    adapter: {
      savePortfolio: async () => {
        saves += 1;
      },
      saveAsset: async () => {},
      listAssets: async () => [],
    },
    savedCount: () => saves,
  };
}

test('Zustand store tracks undo/redo across structural mutations and template switches', async () => {
  const { adapter } = createMemoryPersistence();
  const store = createStudioStore(adapter);

  const doc = createPortfolioDocument({
    id: 'pf-undo-test',
    name: 'Undo Portfolio',
    templateId: 'noir-collage',
    personName: 'Adaora Okafor',
    roleTitle: 'Creative Director',
    populateSample: true,
  });

  await store.getState().loadPortfolio(doc);
  assert.equal(store.getState().past.length, 0);
  assert.equal(store.getState().future.length, 0);

  // Mutation 1: Edit hero headline immediately (non-debounced)
  store.getState().updateContent((c) => ({
    ...c,
    hero: { ...c.hero, headlinePrimary: 'CRAFTED' },
  }));
  assert.equal(store.getState().activePortfolio?.content.hero.headlinePrimary, 'CRAFTED');
  assert.equal(store.getState().past.length, 1);

  // Mutation 2: Switch template to atelier-index
  store.getState().switchTemplate('atelier-index');
  assert.equal(store.getState().activePortfolio?.presentation.templateId, 'atelier-index');
  assert.equal(store.getState().activePortfolio?.content.hero.headlinePrimary, 'CRAFTED');
  assert.equal(store.getState().past.length, 2);

  // Undo template switch
  store.getState().undo();
  assert.equal(store.getState().activePortfolio?.presentation.templateId, 'noir-collage');
  assert.equal(store.getState().activePortfolio?.content.hero.headlinePrimary, 'CRAFTED');
  assert.equal(store.getState().future.length, 1);

  // Undo headline edit
  store.getState().undo();
  assert.equal(store.getState().activePortfolio?.content.hero.headlinePrimary, 'UI/UX');
  assert.equal(store.getState().past.length, 0);
  assert.equal(store.getState().future.length, 2);

  // Redo headline edit & template switch
  store.getState().redo();
  assert.equal(store.getState().activePortfolio?.content.hero.headlinePrimary, 'CRAFTED');
  store.getState().redo();
  assert.equal(store.getState().activePortfolio?.presentation.templateId, 'atelier-index');
});

test('Debounced typing commits single clean undo step when flushed', async () => {
  const { adapter } = createMemoryPersistence();
  const store = createStudioStore(adapter);

  const doc = createPortfolioDocument({
    id: 'pf-debounce-test',
    name: 'Debounce Test',
    templateId: 'atelier-index',
    personName: 'Adaora Okafor',
    roleTitle: 'Product Designer',
    populateSample: true,
  });

  await store.getState().loadPortfolio(doc);
  const original = doc.content.hero.headlinePrimary;

  // Simulate rapid keystrokes
  store.getState().updateContent(
    (c) => ({ ...c, hero: { ...c.hero, headlinePrimary: 'A' } }),
    { debounce: true }
  );
  store.getState().updateContent(
    (c) => ({ ...c, hero: { ...c.hero, headlinePrimary: 'AB' } }),
    { debounce: true }
  );
  store.getState().updateContent(
    (c) => ({ ...c, hero: { ...c.hero, headlinePrimary: 'ABC' } }),
    { debounce: true }
  );

  // Flush typing burst (e.g. on blur or undo)
  store.getState().undo();
  assert.equal(store.getState().activePortfolio?.content.hero.headlinePrimary, original);
  store.getState().redo();
  assert.equal(store.getState().activePortfolio?.content.hero.headlinePrimary, 'ABC');
  store.getState().unloadPortfolio();
});
