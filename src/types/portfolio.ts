import { z } from 'zod';

export const TemplateIdSchema = z.enum(['noir-collage', 'atelier-index', 'monolith-grid']);
export type TemplateId = z.infer<typeof TemplateIdSchema>;

export const SectionIdSchema = z.enum([
  'header',
  'hero',
  'projects',
  'experience',
  'about',
  'contact',
  'footer',
]);
export type SectionId = z.infer<typeof SectionIdSchema>;

export const DensitySchema = z.enum(['compact', 'balanced', 'spacious']);
export type Density = z.infer<typeof DensitySchema>;

export const FocalPointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});
export type FocalPoint = z.infer<typeof FocalPointSchema>;

export const ImageAssetRefSchema = z.object({
  src: z.string().min(1),
  alt: z.string(),
  focalPoint: FocalPointSchema,
  caption: z.string().optional(),
});
export type ImageAssetRef = z.infer<typeof ImageAssetRefSchema>;

export const NavLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
});
export type NavLink = z.infer<typeof NavLinkSchema>;

export const SocialLinkSchema = z.object({
  id: z.string(),
  platform: z.string(),
  url: z.string(),
});
export type SocialLink = z.infer<typeof SocialLinkSchema>;

export const ExperienceEntrySchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  period: z.string(),
  location: z.string(),
  summary: z.string(),
});
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Project title is required'),
  subtitle: z.string(),
  year: z.string(),
  role: z.string(),
  category: z.string(),
  featured: z.boolean(),
  summary: z.string(),
  caseStudy: z.array(z.string()),
  highlights: z.array(z.string()),
  tags: z.array(z.string()),
  liveUrl: z.string(),
  sourceUrl: z.string(),
  coverImage: ImageAssetRefSchema,
  gallery: z.array(ImageAssetRefSchema),
});
export type Project = z.infer<typeof ProjectSchema>;

export const SectionConfigSchema = z.object({
  id: SectionIdSchema,
  label: z.string(),
  visible: z.boolean(),
  layoutVariant: z.string(),
});
export type SectionConfig = z.infer<typeof SectionConfigSchema>;

export const PortfolioContentSchema = z.object({
  brandName: z.string().min(1),
  personName: z.string().min(1),
  roleTitle: z.string(),
  location: z.string(),
  availability: z.string(),
  navLinks: z.array(NavLinkSchema),
  headerCtaLabel: z.string(),
  headerCtaHref: z.string(),
  hero: z.object({
    eyebrow: z.string(),
    headlinePrimary: z.string(),
    headlineSecondary: z.string(),
    headlineOutline: z.string(),
    subheadline: z.string(),
    primaryCtaLabel: z.string(),
    primaryCtaHref: z.string(),
    secondaryCtaLabel: z.string(),
    secondaryCtaHref: z.string(),
    portraitImage: ImageAssetRefSchema,
    collageImages: z.array(ImageAssetRefSchema),
  }),
  projectsSection: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    intro: z.string(),
  }),
  projects: z.array(ProjectSchema),
  experienceSection: z.object({
    eyebrow: z.string(),
    heading: z.string(),
  }),
  experience: z.array(ExperienceEntrySchema),
  skills: z.array(z.string()),
  about: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    paragraphs: z.array(z.string()),
    image: ImageAssetRefSchema,
  }),
  contact: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    intro: z.string(),
    email: z.string(),
    ctaLabel: z.string(),
    socials: z.array(SocialLinkSchema),
  }),
  footer: z.object({
    copyright: z.string(),
    note: z.string(),
  }),
});
export type PortfolioContent = z.infer<typeof PortfolioContentSchema>;

export const PresentationSettingsSchema = z.object({
  templateId: TemplateIdSchema,
  typographyId: z.string(),
  paletteId: z.string(),
  density: DensitySchema,
  sections: z.array(SectionConfigSchema),
});
export type PresentationSettings = z.infer<typeof PresentationSettingsSchema>;

export const PortfolioDocumentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  updatedAt: z.number(),
  createdAt: z.number(),
  content: PortfolioContentSchema,
  presentation: PresentationSettingsSchema,
});
export type PortfolioDocument = z.infer<typeof PortfolioDocumentSchema>;

export interface StoredAsset {
  id: string;
  portfolioId: string;
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
  filename: string;
  createdAt: number;
}
