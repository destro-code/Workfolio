import Dexie, { type Table } from 'dexie';
import { createPortfolioDocument } from '../data/samples';
import { PortfolioDocumentSchema, type PortfolioDocument, type StoredAsset } from '../types/portfolio';

class WorkfolioDatabase extends Dexie {
  portfolios!: Table<PortfolioDocument, string>;
  assets!: Table<StoredAsset, string>;

  constructor() {
    super('WorkfolioStudioDB');
    this.version(1).stores({
      portfolios: 'id, updatedAt, createdAt, name',
      assets: 'id, portfolioId, createdAt',
    });
  }
}

export const db = new WorkfolioDatabase();

export async function listPortfolios(): Promise<PortfolioDocument[]> {
  const all = await db.portfolios.orderBy('updatedAt').reverse().toArray();
  return all;
}

export async function getPortfolioById(id: string): Promise<PortfolioDocument | undefined> {
  return db.portfolios.get(id);
}

export async function savePortfolioRecord(doc: PortfolioDocument): Promise<void> {
  const validated = PortfolioDocumentSchema.parse(doc);
  await db.portfolios.put(validated);
}

export async function deletePortfolioRecord(id: string): Promise<void> {
  await db.transaction('rw', db.portfolios, db.assets, async () => {
    await db.portfolios.delete(id);
    await db.assets.where('portfolioId').equals(id).delete();
  });
}

export async function duplicatePortfolioRecord(id: string): Promise<PortfolioDocument | null> {
  const existing = await db.portfolios.get(id);
  if (!existing) return null;

  const newId = `pf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = Date.now();
  const existingAssets = await db.assets.where('portfolioId').equals(id).toArray();

  // Remap asset references so duplicated portfolio owns independent copies
  const assetIdMap = new Map<string, string>();
  const clonedAssets: StoredAsset[] = existingAssets.map((asset) => {
    const clonedId = `ast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    assetIdMap.set(`asset:${asset.id}`, `asset:${clonedId}`);
    return {
      ...asset,
      id: clonedId,
      portfolioId: newId,
      createdAt: now,
    };
  });

  const remapSrc = (src: string) => assetIdMap.get(src) ?? src;

  const clonedDoc: PortfolioDocument = {
    ...existing,
    id: newId,
    name: `${existing.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
    content: {
      ...existing.content,
      hero: {
        ...existing.content.hero,
        portraitImage: {
          ...existing.content.hero.portraitImage,
          src: remapSrc(existing.content.hero.portraitImage.src),
        },
        collageImages: existing.content.hero.collageImages.map((img) => ({
          ...img,
          src: remapSrc(img.src),
        })),
      },
      about: {
        ...existing.content.about,
        image: {
          ...existing.content.about.image,
          src: remapSrc(existing.content.about.image.src),
        },
      },
      projects: existing.content.projects.map((p) => ({
        ...p,
        coverImage: { ...p.coverImage, src: remapSrc(p.coverImage.src) },
        gallery: p.gallery.map((g) => ({ ...g, src: remapSrc(g.src) })),
      })),
    },
  };

  await db.transaction('rw', db.portfolios, db.assets, async () => {
    await db.portfolios.put(clonedDoc);
    if (clonedAssets.length > 0) {
      await db.assets.bulkPut(clonedAssets);
    }
  });

  return clonedDoc;
}

export async function saveAssetRecord(asset: StoredAsset): Promise<void> {
  await db.assets.put(asset);
}

export async function listAssetsForPortfolio(portfolioId: string): Promise<StoredAsset[]> {
  return db.assets.where('portfolioId').equals(portfolioId).toArray();
}

export async function seedInitialPortfolioIfEmpty(): Promise<PortfolioDocument[]> {
  const existing = await listPortfolios();
  if (existing.length > 0) return existing;

  const starter = createPortfolioDocument({
    id: 'pf-starter-okafor',
    name: 'Adaora Okafor — Creative Direction',
    templateId: 'noir-collage',
    personName: 'Adaora Okafor',
    roleTitle: 'UI/UX & Brand Creative Director',
    populateSample: true,
  });
  await savePortfolioRecord(starter);
  return [starter];
}
