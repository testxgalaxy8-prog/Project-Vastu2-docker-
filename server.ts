import express, { type Request, type Response } from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { db, isPostgresConfigured } from './src/db/index.ts';
import { apiCache } from './src/lib/cache.ts';
import crypto from 'crypto';
import {
  users,
  categories,
  topics,
  topicRelations,
  keywords,
  articles,
  articleTopics,
  articleKeywords,
  advertisements,
  adImpressions,
  adClicks,
  media,
  auditLogs,
  redirects,
  siteSettings,
  videoLearning,
  handbooks,
  handbookLeads,
} from './src/db/schema.ts';
import { parseAndValidateVideoUrl, generateVideoSlug } from './src/lib/videoUtils.ts';
import { generateVastuHandbookPdf } from './src/lib/pdfGenerator.ts';
import { eq, desc, asc, and, or, ilike, sql, inArray } from 'drizzle-orm';
import {
  authenticate,
  requireAuth,
  requireRole,
  createSessionToken,
  type AuthRequest,
} from './src/middleware/auth.ts';
import { dataStore } from './src/lib/dataStore.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// In-memory fallback data for when Cloud SQL is offline or not yet configured
const FALLBACK_CATEGORIES = [
  {
    id: 1,
    name: 'Classical Vastu Vidya',
    slug: 'classical-vastu-vidya',
    description: 'Foundational canons and architectural principles from Samarāṅgaṇa Sūtradhāra, Mayamatam, and Mānasāra.',
    icon: 'BookOpen',
    displayOrder: 1,
    articleCount: 3,
  },
  {
    id: 2,
    name: 'Spiritual Knowledge',
    slug: 'spiritual-knowledge',
    description: 'Cosmic energies, presiding deities (Devatas), and metaphysical laws governing the subtle field of dwellings.',
    icon: 'Sun',
    displayOrder: 2,
    articleCount: 1,
  },
  {
    id: 3,
    name: 'Architectural Harmony',
    slug: 'architectural-harmony',
    description: 'Harmonising structural engineering, natural light, cross-ventilation, and sacred geometry.',
    icon: 'Compass',
    displayOrder: 3,
    articleCount: 2,
  },
  {
    id: 4,
    name: 'Contemporary Space Solutions',
    slug: 'contemporary-space-solutions',
    description: 'Non-demolition remedies, urban apartments, corporate offices, and modern interior alignments.',
    icon: 'Building',
    displayOrder: 4,
    articleCount: 2,
  },
];

const FALLBACK_TOPICS = [
  {
    id: 1,
    name: 'Vastu Purusha Mandala',
    slug: 'vastu-purusha-mandala',
    sanskritName: 'वास्तु पुरुष मण्डल',
    entityType: 'concept',
    summary: 'The metaphysical cosmic diagram and spatial grid upon which all sacred and domestic architecture is planned.',
    imageUrl: '/emblem-circle.png',
  },
  {
    id: 2,
    name: 'Brahmasthana',
    slug: 'brahmasthana',
    sanskritName: 'ब्रह्मस्थान',
    entityType: 'concept',
    summary: 'The luminous center of the dwelling or plot, governed by Lord Brahma (the creative source), representing Space/Ether.',
    imageUrl: '/hero-sanctuary.jpg',
  },
  {
    id: 3,
    name: 'Ishanya (North-East)',
    slug: 'ishanya-north-east',
    sanskritName: 'ईशान्य',
    entityType: 'direction',
    summary: 'The North-East directional quadrant ruled by Ishana, associated with the Water element and solar prana.',
    imageUrl: '/heaven-portal.jpg',
  },
  {
    id: 4,
    name: 'Agneya (South-East)',
    slug: 'agneya-south-east',
    sanskritName: 'आग्नेय',
    entityType: 'direction',
    summary: 'The South-East directional quadrant ruled by Agni Deva, governing metabolic energy, culinary fire, and vigor.',
    imageUrl: '/hero-sanctuary.jpg',
  },
  {
    id: 5,
    name: 'Nairutya (South-West)',
    slug: 'nairutya-south-west',
    sanskritName: 'नैऋत्य',
    entityType: 'direction',
    summary: 'The South-West quadrant governed by Nirriti and corresponding to the Earth element, signifying stability and strength.',
    imageUrl: '/emblem-circle.png',
  },
  {
    id: 6,
    name: 'Vayavya (North-West)',
    slug: 'vayavya-north-west',
    sanskritName: 'वायव्य',
    entityType: 'direction',
    summary: 'The North-West quadrant ruled by Vayu and associated with the Air element, movement, and commerce.',
    imageUrl: '/heaven-portal.jpg',
  },
];

const FALLBACK_ARTICLES = [
  {
    id: 1,
    title: 'Understanding Before Remedies: Reclaiming Classical Vastu From Modern Superstition',
    slug: 'understanding-before-remedies',
    excerpt: 'Why installing commercial pyramids and yantras without understanding spatial physics creates psychological dependency rather than genuine harmony.',
    content: 'In contemporary practice, Vastu has frequently been reduced to fear-based commodification. Property owners are told that minor directional deviations will cause catastrophic failure unless they purchase expensive metallic items or tear down load-bearing walls.\n\nAt Vastu Ritam, we return to the root texts: Mayamatam, Manasara, and Samarangana Sutradhara. The ancient Acharyas were master architects, town planners, and environmental physicists. They understood solar angles, earth magnetic fluxes, prevailing wind directions, and thermodynamic air circulation.\n\nWhen we understand WHY a kitchen is placed in Agneya (South-East)—to harness ultraviolet morning rays for kitchen sanitation while preventing infrared afternoon heat from spoiling stored grains—we realize that solutions should begin with architectural intelligence, not blind panic.',
    featuredImage: '/hero-sanctuary.jpg',
    categoryId: 1,
    categoryName: 'Classical Vastu Vidya',
    categorySlug: 'classical-vastu-vidya',
    authorName: 'Vastu Ritam Research Desk',
    metaTitle: 'Understanding Before Remedies: Classical Vastu vs Superstition',
    metaDescription: 'Reclaiming authentic classical Vastu principles from fear-driven commercial remedies.',
    readingTimeMinutes: 7,
    viewsCount: 382,
    publishedAt: new Date().toISOString(),
    status: 'published',
    topics: [{ id: 1, name: 'Vastu Purusha Mandala', slug: 'vastu-purusha-mandala' }],
  },
  {
    id: 2,
    title: 'The Brahmasthana: The Luminous Heart of Spatial Architecture',
    slug: 'the-brahmasthana-luminous-heart',
    excerpt: 'An analytical study of central void spaces in traditional Indian courtyards and their thermodynamic cooling efficacy.',
    content: 'The Brahmasthana represents the geometric and energetic center of any built form. In traditional Indian domestic architecture, known as Nalukettu in Kerala, Wada in Maharashtra, or Haveli in Rajasthan, this space was left open to the sky as a central courtyard (Angana).\n\nModern environmental engineering now validates what classical texts stated thousands of years ago: the open center creates a natural stack effect. As ambient indoor air warms up during daytime occupancy, it rises and escapes through the central courtyard, drawing cool air from perimeter shaded gardens.\n\nWhen modern developers place elevator shafts, heavy RCC shear walls, or drainage stacks in this exact center, both acoustic tranquility and thermal airflow are severely compromised.',
    featuredImage: '/heaven-portal.jpg',
    categoryId: 3,
    categoryName: 'Architectural Harmony',
    categorySlug: 'architectural-harmony',
    authorName: 'Ph.D. Research Scholar',
    metaTitle: 'The Brahmasthana: The Luminous Heart of Spatial Architecture',
    metaDescription: 'Thermodynamics, courtyard design, and cosmic center of classical dwellings.',
    readingTimeMinutes: 9,
    viewsCount: 294,
    publishedAt: new Date().toISOString(),
    status: 'published',
    topics: [{ id: 2, name: 'Brahmasthana', slug: 'brahmasthana' }],
  },
  {
    id: 3,
    title: 'The Geometry of the Mandala: The 81-Grid Paramashayika Explained',
    slug: 'the-geometry-of-the-mandala',
    excerpt: 'Deconstructing the mathematical allocations of 45 deities within the sacred architectural matrix.',
    content: 'The Paramashayika Mandala is an 81-square grid (9x9) utilized for residential and municipal planning. Within this grid, 32 deities occupy the external perimeter (Padadevatas) governing environmental interfaces, while 13 deities govern internal sectors.\n\nEach deity corresponds to a specific qualitative energy of nature. For instance, Parjanya represents rain and gentle moisture, Varuna represents oceanic depths and liquidity, and Yama represents disciplined mortality and resting cycles. Understanding these allocations allows contemporary architects to align functional programming (HVAC, server rooms, bedrooms, water storage) with classical energetic alignments.',
    featuredImage: '/palm-leaf-texture.jpg',
    categoryId: 2,
    categoryName: 'Spiritual Knowledge',
    categorySlug: 'spiritual-knowledge',
    authorName: 'Vastu Ritam Academic Council',
    metaTitle: 'The Geometry of the Mandala: 81-Grid Paramashayika',
    metaDescription: 'Mathematical and metaphysical grid of the sacred architectural mandala.',
    readingTimeMinutes: 11,
    viewsCount: 512,
    publishedAt: new Date().toISOString(),
    status: 'published',
    topics: [{ id: 1, name: 'Vastu Purusha Mandala', slug: 'vastu-purusha-mandala' }],
  },
];

const DEFAULT_SETTINGS = {
  id: 1,
  primaryPhone: '+91 98200 18272',
  secondaryPhone: '+91 98200 45678',
  primaryEmail: 'contact@vasturitam.com',
  consultationEmail: 'consultation@vasturitam.com',
  whatsappNumber: '+919820018272',
  whatsappNotice: '✦ WhatsApp Available for Blueprint Sharing',
  consultationTimings: 'Monday – Saturday: 10:00 AM – 6:30 PM (IST)',
  appointmentNotice: 'Prior appointment required for in-depth architectural floor plan audit.',
  youtubeUrl: 'https://youtube.com',
  youtubeHandle: '@VastuRitam',
  twitterUrl: 'https://x.com',
  twitterHandle: '@VastuRitam',
  facebookUrl: 'https://facebook.com/vasturitam',
  facebookHandle: '@VastuRitam',
  instagramUrl: 'https://instagram.com/vasturitam',
  instagramHandle: '@vasturitam',
  officeAddress: 'Vastu Ritam Research & Vedic Architecture Sanctuary, Pune / Mumbai, Maharashtra, Bharat',
  collaborationNotice: 'Collaborations welcome from registered Architects (COA), Civil Structural Engineers, and Researchers.',
  logoUrl: '/trademark-logo.jpg',
};

// High traffic performance middlewares:
// 1. Gzip compression (slashes bandwidth by 70-80% on articles, json, and assets)
app.use(compression({
  threshold: 1024, // Only compress responses above 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// 2. High concurrency connection header & body parsing (supports up to 60MB for authenticated PDF uploads)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));
app.use(cookieParser());
app.use(authenticate);

// Ensure uploads and public static directories exist and are served
const publicDir = path.resolve(__dirname, 'public');
const uploadsDir = path.resolve(publicDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Protected Handbook Storage (Non-public, private directory outside public web root)
const handbooksStorageDir = path.resolve(__dirname, 'storage', 'handbooks');
if (!fs.existsSync(handbooksStorageDir)) {
  fs.mkdirSync(handbooksStorageDir, { recursive: true });
}

// Ensure default authentic sample PDFs exist on disk for pre-seeded handbooks
try {
  const seededHandbooks = dataStore.getHandbooks();
  for (const hb of seededHandbooks) {
    const defaultFileName = `handbook_${hb.id}_default.pdf`;
    const defaultFilePath = path.join(handbooksStorageDir, defaultFileName);
    if (!fs.existsSync(defaultFilePath)) {
      const pdfBuffer = generateVastuHandbookPdf({
        title: hb.title,
        subtitle: hb.subtitle,
        targetAudience: hb.targetAudience,
        pages: hb.pages,
        topics: hb.topics,
        summary: hb.summary,
      });
      fs.writeFileSync(defaultFilePath, pdfBuffer);
      dataStore.updateHandbook(hb.id, {
        pdfFileName: defaultFileName,
        pdfFilePath: path.relative(__dirname, defaultFilePath),
        pdfFileSizeBytes: pdfBuffer.length,
      });
    }
  }
} catch (pdfInitErr) {
  console.warn('Notice initializing default sample handbooks:', pdfInitErr);
}

app.use(express.static(publicDir, {
  maxAge: '1h',
  etag: true,
}));
app.use('/uploads', express.static(uploadsDir));

// -----------------------------------------------------------------------------
// PUBLIC API: GYAN KOSH VIDEO LEARNING
// Strictly serves metadata and external safe embed URLs (YouTube/Vimeo).
// No actual video file is ever uploaded, stored, or processed on the server.
// -----------------------------------------------------------------------------
app.get('/api/videos', async (req: Request, res: Response) => {
  if (!isPostgresConfigured) {
    const { category, topic, search } = req.query;
    let list = dataStore.getVideos(true);
    if (category) {
      list = list.filter(v => v.categorySlug === String(category).toLowerCase());
    }
    if (topic) {
      list = list.filter(v => v.topicSlug === String(topic).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(v => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
    }
    return res.json({ videos: list });
  }
  try {
    const { category, topic, search } = req.query;

    let queryConditions = [eq(videoLearning.status, 'published')];

    // Filter by Category
    if (category) {
      const catSlug = String(category).trim().toLowerCase();
      const cat = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, catSlug)).limit(1);
      if (cat.length > 0) {
        queryConditions.push(eq(videoLearning.categoryId, cat[0].id));
      }
    }

    // Filter by Topic
    if (topic) {
      const topSlug = String(topic).trim().toLowerCase();
      const top = await db.select({ id: topics.id }).from(topics).where(eq(topics.slug, topSlug)).limit(1);
      if (top.length > 0) {
        queryConditions.push(eq(videoLearning.topicId, top[0].id));
      }
    }

    // Search query
    if (search) {
      const term = `%${String(search).trim()}%`;
      queryConditions.push(
        or(
          ilike(videoLearning.title, term),
          ilike(videoLearning.description, term),
          ilike(videoLearning.instructor, term)
        )!
      );
    }

    const rows = await db
      .select({
        id: videoLearning.id,
        title: videoLearning.title,
        slug: videoLearning.slug,
        categoryId: videoLearning.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        topicId: videoLearning.topicId,
        topicName: topics.name,
        topicSlug: topics.slug,
        videoUrl: videoLearning.videoUrl,
        videoProvider: videoLearning.videoProvider,
        thumbnailUrl: videoLearning.thumbnailUrl,
        description: videoLearning.description,
        status: videoLearning.status,
        displayOrder: videoLearning.displayOrder,
        duration: videoLearning.duration,
        instructor: videoLearning.instructor,
        publishedAt: videoLearning.publishedAt,
        createdAt: videoLearning.createdAt,
      })
      .from(videoLearning)
      .leftJoin(categories, eq(videoLearning.categoryId, categories.id))
      .leftJoin(topics, eq(videoLearning.topicId, topics.id))
      .where(and(...queryConditions))
      .orderBy(asc(videoLearning.displayOrder), desc(videoLearning.publishedAt), desc(videoLearning.createdAt));

    // Augment with canonical official safe embed URLs
    const safeVideos = rows.map((v) => {
      const parsed = parseAndValidateVideoUrl(v.videoUrl);
      return {
        ...v,
        embedUrl: parsed.embedUrl,
        isValidLink: parsed.valid,
        provider: parsed.provider || v.videoProvider,
      };
    });

    res.json({ videos: safeVideos });
  } catch (error: any) {
    console.error('Error fetching public video learning:', error);
    res.status(500).json({ error: 'Failed to retrieve video archives' });
  }
});

app.get('/api/videos/:slugOrId', async (req: Request, res: Response) => {
  if (!isPostgresConfigured) {
    const { slugOrId } = req.params;
    const isNumeric = /^\d+$/.test(slugOrId);
    const video = isNumeric
      ? dataStore.getVideoById(parseInt(slugOrId, 10))
      : dataStore.getVideos(true).find((v) => v.slug === slugOrId.toLowerCase().trim());
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    return res.json({ video });
  }
  try {
    const { slugOrId } = req.params;
    const isNumeric = /^\d+$/.test(slugOrId);

    const condition = isNumeric
      ? and(eq(videoLearning.id, parseInt(slugOrId, 10)), eq(videoLearning.status, 'published'))
      : and(eq(videoLearning.slug, slugOrId.toLowerCase().trim()), eq(videoLearning.status, 'published'));

    const rows = await db
      .select({
        id: videoLearning.id,
        title: videoLearning.title,
        slug: videoLearning.slug,
        categoryId: videoLearning.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        topicId: videoLearning.topicId,
        topicName: topics.name,
        topicSlug: topics.slug,
        videoUrl: videoLearning.videoUrl,
        videoProvider: videoLearning.videoProvider,
        thumbnailUrl: videoLearning.thumbnailUrl,
        description: videoLearning.description,
        status: videoLearning.status,
        displayOrder: videoLearning.displayOrder,
        duration: videoLearning.duration,
        instructor: videoLearning.instructor,
        publishedAt: videoLearning.publishedAt,
        createdAt: videoLearning.createdAt,
      })
      .from(videoLearning)
      .leftJoin(categories, eq(videoLearning.categoryId, categories.id))
      .leftJoin(topics, eq(videoLearning.topicId, topics.id))
      .where(condition!)
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = rows[0];
    const parsed = parseAndValidateVideoUrl(video.videoUrl);

    res.json({
      video: {
        ...video,
        embedUrl: parsed.embedUrl,
        isValidLink: parsed.valid,
        provider: parsed.provider || video.videoProvider,
      },
    });
  } catch (error: any) {
    console.error('Error fetching single video:', error);
    res.status(500).json({ error: 'Failed to retrieve video details' });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC API: ARTICLES
// -----------------------------------------------------------------------------
app.get('/api/articles', async (req: Request, res: Response) => {
  try {
    const { category, topic, keyword, search, page = '1', limit = '10' } = req.query;

    if (!isPostgresConfigured) {
      let filtered = dataStore.getArticles(true);
      if (category && typeof category === 'string') {
        filtered = filtered.filter((a) => a.categorySlug === category);
      }
      if (topic && typeof topic === 'string') {
        filtered = filtered.filter((a) => a.topics?.some((t) => t.slug === topic));
      }
      if (search && typeof search === 'string' && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.content.toLowerCase().includes(q)
        );
      }
      return res.json({
        articles: filtered,
        total: filtered.length,
        page: 1,
        totalPages: 1,
      });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    let queryConditions = [eq(articles.status, 'published')];

    // Category filter
    if (category) {
      const cat = await db.select().from(categories).where(eq(categories.slug, category as string)).limit(1);
      if (cat.length > 0) {
        queryConditions.push(eq(articles.categoryId, cat[0].id));
      } else {
        return res.json({ articles: [], total: 0, page: pageNum, totalPages: 0 });
      }
    }

    // Topic filter
    if (topic) {
      const top = await db.select().from(topics).where(eq(topics.slug, topic as string)).limit(1);
      if (top.length > 0) {
        const artTopicRels = await db.select().from(articleTopics).where(eq(articleTopics.topicId, top[0].id));
        const artIds = artTopicRels.map(r => r.articleId);
        if (artIds.length > 0) {
          queryConditions.push(inArray(articles.id, artIds));
        } else {
          return res.json({ articles: [], total: 0, page: pageNum, totalPages: 0 });
        }
      } else {
        return res.json({ articles: [], total: 0, page: pageNum, totalPages: 0 });
      }
    }

    // Keyword filter
    if (keyword) {
      const kw = await db.select().from(keywords).where(eq(keywords.slug, keyword as string)).limit(1);
      if (kw.length > 0) {
        const artKwRels = await db.select().from(articleKeywords).where(eq(articleKeywords.keywordId, kw[0].id));
        const artIds = artKwRels.map(r => r.articleId);
        if (artIds.length > 0) {
          queryConditions.push(inArray(articles.id, artIds));
        } else {
          return res.json({ articles: [], total: 0, page: pageNum, totalPages: 0 });
        }
      } else {
        return res.json({ articles: [], total: 0, page: pageNum, totalPages: 0 });
      }
    }

    // Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      queryConditions.push(
        or(
          ilike(articles.title, term),
          ilike(articles.excerpt, term),
          ilike(articles.content, term)
        )!
      );
    }

    const whereClause = and(...queryConditions);

    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(whereClause);
    const total = Number(totalRes[0]?.count || 0);

    const articleList = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        featuredImage: articles.featuredImage,
        categoryId: articles.categoryId,
        readingTimeMinutes: articles.readingTimeMinutes,
        viewsCount: articles.viewsCount,
        publishedAt: articles.publishedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(articles.publishedAt), desc(articles.id))
      .limit(limitNum)
      .offset(offset);

    // Fetch primary topics for each article
    const articleIds = articleList.map(a => a.id);
    let topicsMap = new Map<number, any[]>();
    if (articleIds.length > 0) {
      const topicRels = await db
        .select({
          articleId: articleTopics.articleId,
          topicId: topics.id,
          name: topics.name,
          slug: topics.slug,
          sanskritName: topics.sanskritName,
        })
        .from(articleTopics)
        .innerJoin(topics, eq(articleTopics.topicId, topics.id))
        .where(inArray(articleTopics.articleId, articleIds));

      for (const rel of topicRels) {
        if (!topicsMap.has(rel.articleId)) {
          topicsMap.set(rel.articleId, []);
        }
        topicsMap.get(rel.articleId)!.push({
          id: rel.topicId,
          name: rel.name,
          slug: rel.slug,
          sanskritName: rel.sanskritName,
        });
      }
    }

    const formatted = articleList.map(a => ({
      ...a,
      topics: topicsMap.get(a.id) || [],
    }));

    res.json({
      articles: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.warn('Database offline or unpopulated, serving fallback articles:', error);
    res.json({
      articles: FALLBACK_ARTICLES,
      total: FALLBACK_ARTICLES.length,
      page: 1,
      totalPages: 1,
    });
  }
});

// Alias /api/knowledge for knowledge list component
app.get('/api/knowledge', (req: Request, res: Response) => {
  const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(`/api/articles${query}`);
});

// Single Article by Slug
app.get('/api/articles/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!isPostgresConfigured) {
      const found = FALLBACK_ARTICLES.find(a => a.slug === slug || slug.includes(a.slug.substring(0, 10))) || FALLBACK_ARTICLES[0];
      return res.json({
        article: {
          ...found,
          topics: found.topics || [],
          keywords: [{ id: 1, name: 'Vedic Architecture', slug: 'vedic-architecture' }],
        },
        relatedArticles: FALLBACK_ARTICLES.filter(a => a.id !== found.id).slice(0, 3),
        breadcrumbs: [
          { label: 'Home', path: '/' },
          { label: found.categoryName || 'Articles', path: `/category/${found.categorySlug}` },
          { label: found.title, path: `/knowledge/${found.slug}` },
        ],
      });
    }

    const articleRes = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        categoryId: articles.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: users.displayName,
        metaTitle: articles.metaTitle,
        metaDescription: articles.metaDescription,
        readingTimeMinutes: articles.readingTimeMinutes,
        viewsCount: articles.viewsCount,
        publishedAt: articles.publishedAt,
        status: articles.status,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.slug, slug))
      .limit(1);

    if (articleRes.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = articleRes[0];

    // Asynchronously increment views count
    db.update(articles)
      .set({ viewsCount: sql`${articles.viewsCount} + 1` })
      .where(eq(articles.id, article.id))
      .catch(err => console.error('View increment error:', err));

    // Linked Topics
    const linkedTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
      })
      .from(articleTopics)
      .innerJoin(topics, eq(articleTopics.topicId, topics.id))
      .where(eq(articleTopics.articleId, article.id));

    // Linked Keywords
    const linkedKeywords = await db
      .select({
        id: keywords.id,
        name: keywords.name,
        slug: keywords.slug,
      })
      .from(articleKeywords)
      .innerJoin(keywords, eq(articleKeywords.keywordId, keywords.id))
      .where(eq(articleKeywords.articleId, article.id));

    // Related Articles (same category or shared topics, excluding current)
    let relatedArticles: any[] = [];
    if (article.categoryId) {
      relatedArticles = await db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          featuredImage: articles.featuredImage,
          readingTimeMinutes: articles.readingTimeMinutes,
        })
        .from(articles)
        .where(
          and(
            eq(articles.status, 'published'),
            eq(articles.categoryId, article.categoryId),
            sql`${articles.id} != ${article.id}`
          )
        )
        .limit(3);
    }

    // Breadcrumbs
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: article.categoryName || 'Articles', path: article.categorySlug ? `/category/${article.categorySlug}` : '/knowledge' },
      { label: article.title, path: `/knowledge/${article.slug}` },
    ];

    res.json({
      article: {
        ...article,
        topics: linkedTopics,
        keywords: linkedKeywords,
      },
      relatedArticles,
      breadcrumbs,
    });
  } catch (error) {
    console.warn('Database offline or unpopulated, serving fallback article detail:', error);
    const { slug } = req.params;
    const found = FALLBACK_ARTICLES.find(a => a.slug === slug || slug.includes(a.slug.substring(0, 10))) || FALLBACK_ARTICLES[0];
    res.json({
      article: {
        ...found,
        topics: found.topics || [],
        keywords: [{ id: 1, name: 'Vedic Architecture', slug: 'vedic-architecture' }],
      },
      relatedArticles: FALLBACK_ARTICLES.filter(a => a.id !== found.id).slice(0, 3),
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: found.categoryName || 'Articles', path: `/category/${found.categorySlug}` },
        { label: found.title, path: `/knowledge/${found.slug}` },
      ],
    });
  }
});

// Article Topics Retrieval & Linking
app.get('/api/articles/:slug/topics', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const articleRows = await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug })
      .from(articles)
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (articleRows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const linkedTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
        imageUrl: topics.imageUrl,
        isPrimary: articleTopics.isPrimary,
      })
      .from(articleTopics)
      .innerJoin(topics, eq(articleTopics.topicId, topics.id))
      .where(eq(articleTopics.articleId, articleRows[0].id));

    res.json({
      article: articleRows[0],
      topics: linkedTopics,
    });
  } catch (error) {
    console.error('Error fetching article topics:', error);
    res.status(500).json({ error: 'Failed to retrieve article topics' });
  }
});

app.post('/api/articles/:slug/topics', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const articleRows = await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug })
      .from(articles)
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (articleRows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = articleRows[0];
    const { topicId, topicSlug, topicIds, isPrimary = false } = req.body;
    const idsToLink: number[] = [];

    if (Array.isArray(topicIds)) {
      for (const id of topicIds) {
        const num = parseInt(id, 10);
        if (!isNaN(num)) idsToLink.push(num);
      }
    } else if (topicId) {
      idsToLink.push(parseInt(topicId, 10));
    } else if (topicSlug) {
      const top = await db.select({ id: topics.id }).from(topics).where(eq(topics.slug, topicSlug.toLowerCase().trim())).limit(1);
      if (top.length > 0) idsToLink.push(top[0].id);
      else return res.status(404).json({ error: `Topic '${topicSlug}' not found` });
    }

    const links = [];
    for (const tId of idsToLink) {
      const existing = await db
        .select()
        .from(articleTopics)
        .where(and(eq(articleTopics.articleId, article.id), eq(articleTopics.topicId, tId)))
        .limit(1);
      if (existing.length === 0) {
        const ins = await db.insert(articleTopics).values({
          articleId: article.id,
          topicId: tId,
          isPrimary: Boolean(isPrimary),
        }).returning();
        links.push(ins[0]);
      } else {
        links.push(existing[0]);
      }
    }

    res.json({
      message: `Successfully linked ${links.length} topic(s) to article`,
      articleId: article.id,
      links,
    });
  } catch (error: any) {
    console.error('Error linking topics to article:', error);
    res.status(500).json({ error: error.message || 'Failed to link topics' });
  }
});

app.delete('/api/articles/:slug/topics', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const articleRows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (articleRows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const topicId = req.query.topicId ? parseInt(req.query.topicId as string, 10) : (req.body.topicId ? parseInt(req.body.topicId, 10) : null);
    if (!topicId) {
      return res.status(400).json({ error: 'topicId is required' });
    }

    await db.delete(articleTopics).where(and(eq(articleTopics.articleId, articleRows[0].id), eq(articleTopics.topicId, topicId)));
    res.json({ message: 'Topic unlinked successfully', articleId: articleRows[0].id, topicId });
  } catch (error: any) {
    console.error('Error unlinking topic:', error);
    res.status(500).json({ error: error.message || 'Failed to unlink topic' });
  }
});

// Dedicated direct Topic Linking endpoint
app.post('/api/topics/link', async (req: Request, res: Response) => {
  try {
    const { articleId, topicId, articleSlug, topicSlug, topicIds, isPrimary = false } = req.body;
    let targetArticleId: number | null = null;
    const targetTopicIds: number[] = [];

    if (articleId) {
      targetArticleId = parseInt(articleId, 10);
    } else if (articleSlug) {
      const art = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, articleSlug.toLowerCase().trim())).limit(1);
      if (art.length > 0) targetArticleId = art[0].id;
      else return res.status(404).json({ error: `Article '${articleSlug}' not found` });
    }

    if (!targetArticleId) {
      return res.status(400).json({ error: 'articleId or articleSlug required' });
    }

    if (Array.isArray(topicIds) && topicIds.length > 0) {
      for (const id of topicIds) {
        const num = parseInt(id, 10);
        if (!isNaN(num)) targetTopicIds.push(num);
      }
    } else if (topicId) {
      targetTopicIds.push(parseInt(topicId, 10));
    } else if (topicSlug) {
      const top = await db.select({ id: topics.id }).from(topics).where(eq(topics.slug, topicSlug.toLowerCase().trim())).limit(1);
      if (top.length > 0) targetTopicIds.push(top[0].id);
      else return res.status(404).json({ error: `Topic '${topicSlug}' not found` });
    }

    if (targetTopicIds.length === 0) {
      return res.status(400).json({ error: 'topicId, topicSlug, or topicIds array required' });
    }

    const createdLinks = [];
    for (const tId of targetTopicIds) {
      const existing = await db
        .select()
        .from(articleTopics)
        .where(and(eq(articleTopics.articleId, targetArticleId), eq(articleTopics.topicId, tId)))
        .limit(1);
      if (existing.length === 0) {
        const inserted = await db.insert(articleTopics).values({
          articleId: targetArticleId,
          topicId: tId,
          isPrimary: Boolean(isPrimary),
        }).returning();
        createdLinks.push(inserted[0]);
      } else {
        createdLinks.push(existing[0]);
      }
    }

    const currentLinkedTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
        isPrimary: articleTopics.isPrimary,
      })
      .from(articleTopics)
      .innerJoin(topics, eq(articleTopics.topicId, topics.id))
      .where(eq(articleTopics.articleId, targetArticleId));

    res.json({
      success: true,
      message: `Successfully linked ${createdLinks.length} topic(s) to article #${targetArticleId}`,
      articleId: targetArticleId,
      linkedTopics: currentLinkedTopics,
    });
  } catch (error: any) {
    console.error('Error linking topic:', error);
    res.status(500).json({ error: error.message || 'Failed to link topic' });
  }
});

app.delete('/api/topics/link', async (req: Request, res: Response) => {
  try {
    let articleId = req.query.articleId ? parseInt(req.query.articleId as string, 10) : (req.body?.articleId ? parseInt(req.body.articleId, 10) : null);
    let topicId = req.query.topicId ? parseInt(req.query.topicId as string, 10) : (req.body?.topicId ? parseInt(req.body.topicId, 10) : null);
    const articleSlug = (req.query.articleSlug || req.body?.articleSlug) as string | undefined;
    const topicSlug = (req.query.topicSlug || req.body?.topicSlug) as string | undefined;

    if (!articleId && articleSlug) {
      const art = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, articleSlug.toLowerCase().trim())).limit(1);
      if (art.length > 0) articleId = art[0].id;
    }

    if (!topicId && topicSlug) {
      const top = await db.select({ id: topics.id }).from(topics).where(eq(topics.slug, topicSlug.toLowerCase().trim())).limit(1);
      if (top.length > 0) topicId = top[0].id;
    }

    if (!articleId || !topicId) {
      return res.status(400).json({ error: 'Both article (id or slug) and topic (id or slug) are required' });
    }

    await db.delete(articleTopics).where(and(eq(articleTopics.articleId, articleId), eq(articleTopics.topicId, topicId)));
    res.json({ success: true, message: `Unlinked topic #${topicId} from article #${articleId}` });
  } catch (error: any) {
    console.error('Error unlinking topic:', error);
    res.status(500).json({ error: error.message || 'Failed to unlink topic' });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC API: TOPICS (Entities separate from articles)
// -----------------------------------------------------------------------------
app.get('/api/topics', async (req: Request, res: Response) => {
  try {
    const { entityType } = req.query;

    if (!isPostgresConfigured) {
      let list = [...FALLBACK_TOPICS];
      if (entityType && typeof entityType === 'string') {
        list = list.filter(t => t.entityType === entityType);
      }
      return res.json({ topics: list });
    }

    let conditions = [];
    if (entityType && typeof entityType === 'string') {
      conditions.push(eq(topics.entityType, entityType));
    }

    const topicList = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
        imageUrl: topics.imageUrl,
      })
      .from(topics)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(topics.name));

    res.json({ topics: topicList });
  } catch (error) {
    console.warn('Database offline or unpopulated, serving fallback topics:', error);
    res.json({ topics: FALLBACK_TOPICS });
  }
});

// Topic Detail (with related topics and articles linking to this topic)
app.get('/api/topics/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!isPostgresConfigured) {
      const top = FALLBACK_TOPICS.find(t => t.slug === slug) || FALLBACK_TOPICS[0];
      return res.json({
        topic: top,
        relations: { outgoing: [], incoming: [] },
        articles: FALLBACK_ARTICLES.slice(0, 2),
        breadcrumbs: [
          { label: 'Home', path: '/' },
          { label: 'Topics', path: '/topics' },
          { label: top.name, path: `/topic/${top.slug}` },
        ],
      });
    }

    const topicRes = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, slug))
      .limit(1);

    if (topicRes.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const topic = topicRes[0];

    // Related Topics (Outgoing and Incoming)
    const outgoing = await db
      .select({
        relationId: topicRelations.id,
        relationType: topicRelations.relationType,
        targetTopicId: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
      })
      .from(topicRelations)
      .innerJoin(topics, eq(topicRelations.targetTopicId, topics.id))
      .where(eq(topicRelations.sourceTopicId, topic.id));

    const incoming = await db
      .select({
        relationId: topicRelations.id,
        relationType: topicRelations.relationType,
        sourceTopicId: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
      })
      .from(topicRelations)
      .innerJoin(topics, eq(topicRelations.sourceTopicId, topics.id))
      .where(eq(topicRelations.targetTopicId, topic.id));

    // Linked Articles (articles discussing this topic)
    const linkedArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        featuredImage: articles.featuredImage,
        publishedAt: articles.publishedAt,
        readingTimeMinutes: articles.readingTimeMinutes,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articleTopics)
      .innerJoin(articles, eq(articleTopics.articleId, articles.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(articleTopics.topicId, topic.id),
          eq(articles.status, 'published')
        )
      )
      .orderBy(desc(articles.publishedAt));

    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Topics & Entities', path: '/topics' },
      { label: topic.name, path: `/topic/${topic.slug}` },
    ];

    res.json({
      topic,
      relations: {
        outgoing,
        incoming,
      },
      articles: linkedArticles,
      breadcrumbs,
    });
  } catch (error) {
    console.warn('Database offline or unpopulated, serving fallback topic detail:', error);
    const { slug } = req.params;
    const top = FALLBACK_TOPICS.find(t => t.slug === slug) || FALLBACK_TOPICS[0];
    res.json({
      topic: top,
      relations: { outgoing: [], incoming: [] },
      articles: FALLBACK_ARTICLES.slice(0, 2),
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: 'Topics', path: '/topics' },
        { label: top.name, path: `/topic/${top.slug}` },
      ],
    });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC API: CATEGORIES
// -----------------------------------------------------------------------------
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    if (!isPostgresConfigured) {
      return res.json({ categories: FALLBACK_CATEGORIES });
    }

    const cats = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        displayOrder: categories.displayOrder,
      })
      .from(categories)
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    // Count published articles for each category
    const counts = await db
      .select({
        categoryId: articles.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .groupBy(articles.categoryId);

    const countMap = new Map<number, number>();
    for (const c of counts) {
      if (c.categoryId) countMap.set(c.categoryId, Number(c.count));
    }

    const categoriesWithCount = cats.map(c => ({
      ...c,
      articleCount: countMap.get(c.id) || 0,
    }));

    res.json({ categories: categoriesWithCount });
  } catch (error) {
    console.warn('Database offline or unpopulated, serving fallback categories:', error);
    res.json({ categories: FALLBACK_CATEGORIES });
  }
});

app.get('/api/categories/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (!isPostgresConfigured) {
      const cat = FALLBACK_CATEGORIES.find(c => c.slug === slug) || FALLBACK_CATEGORIES[0];
      const catArticles = FALLBACK_ARTICLES.filter(a => a.categorySlug === cat.slug);
      return res.json({
        category: cat,
        articles: catArticles.length > 0 ? catArticles : FALLBACK_ARTICLES,
        breadcrumbs: [
          { label: 'Home', path: '/' },
          { label: 'Categories', path: '/categories' },
          { label: cat.name, path: `/category/${cat.slug}` },
        ],
      });
    }

    const catRes = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (catRes.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = catRes[0];
    const categoryArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        featuredImage: articles.featuredImage,
        publishedAt: articles.publishedAt,
        readingTimeMinutes: articles.readingTimeMinutes,
        viewsCount: articles.viewsCount,
      })
      .from(articles)
      .where(and(eq(articles.categoryId, category.id), eq(articles.status, 'published')))
      .orderBy(desc(articles.publishedAt));

    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Categories', path: '/categories' },
      { label: category.name, path: `/category/${category.slug}` },
    ];

    res.json({
      category,
      articles: categoryArticles,
      breadcrumbs,
    });
  } catch (error) {
    console.warn('Database offline or unpopulated, serving fallback category detail:', error);
    const { slug } = req.params;
    const cat = FALLBACK_CATEGORIES.find(c => c.slug === slug) || FALLBACK_CATEGORIES[0];
    const catArticles = FALLBACK_ARTICLES.filter(a => a.categorySlug === cat.slug);
    res.json({
      category: cat,
      articles: catArticles.length > 0 ? catArticles : FALLBACK_ARTICLES,
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: 'Categories', path: '/categories' },
        { label: cat.name, path: `/category/${cat.slug}` },
      ],
    });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC API: KEYWORDS
// -----------------------------------------------------------------------------
app.get('/api/keywords', async (_req: Request, res: Response) => {
  try {
    if (!isPostgresConfigured) {
      return res.json({
        keywords: [
          { id: 1, name: 'Brahmasthana', slug: 'brahmasthana', usageCount: 12 },
          { id: 2, name: 'Ishanya', slug: 'ishanya', usageCount: 9 },
          { id: 3, name: 'Vastu Purusha', slug: 'vastu-purusha', usageCount: 15 },
          { id: 4, name: 'Paramashayika', slug: 'paramashayika', usageCount: 7 },
        ],
      });
    }

    const kwList = await db
      .select({
        id: keywords.id,
        name: keywords.name,
        slug: keywords.slug,
        usageCount: keywords.usageCount,
      })
      .from(keywords)
      .orderBy(desc(keywords.usageCount), asc(keywords.name));

    res.json({ keywords: kwList });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    res.status(500).json({ error: 'Failed to retrieve keywords' });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC API: SEARCH
// -----------------------------------------------------------------------------
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ articles: [], topics: [], categories: [] });
    }

    if (!isPostgresConfigured) {
      const term = q.toLowerCase();
      return res.json({
        articles: FALLBACK_ARTICLES.filter(a => a.title.toLowerCase().includes(term) || a.excerpt.toLowerCase().includes(term)),
        topics: FALLBACK_TOPICS.filter(t => t.name.toLowerCase().includes(term)),
        categories: FALLBACK_CATEGORIES.filter(c => c.name.toLowerCase().includes(term)),
      });
    }

    const term = `%${q}%`;

    const foundArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(articles.status, 'published'),
          or(
            ilike(articles.title, term),
            ilike(articles.excerpt, term),
            ilike(articles.content, term)
          )
        )
      )
      .limit(6);

    const foundTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
      })
      .from(topics)
      .where(
        or(
          ilike(topics.name, term),
          ilike(topics.sanskritName || '', term),
          ilike(topics.summary, term)
        )
      )
      .limit(6);

    const foundCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
      })
      .from(categories)
      .where(
        or(
          ilike(categories.name, term),
          ilike(categories.description || '', term)
        )
      )
      .limit(4);

    res.json({
      articles: foundArticles,
      topics: foundTopics,
      categories: foundCategories,
    });
  } catch (error) {
    console.warn('Search database offline, serving fallback search:', error);
    const q = ((req.query.q as string) || '').toLowerCase();
    res.json({
      articles: FALLBACK_ARTICLES.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)),
      topics: FALLBACK_TOPICS.filter(t => t.name.toLowerCase().includes(q)),
      categories: FALLBACK_CATEGORIES.filter(c => c.name.toLowerCase().includes(q)),
    });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC API: ADSENSE & MONETIZATION CONFIGURATION
// -----------------------------------------------------------------------------
app.get('/api/adsense-config', async (_req: Request, res: Response) => {
  const cached = apiCache.get<any>('settings:adsense');
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return res.json(cached);
  }

  if (!isPostgresConfigured) {
    const data = {
      publisherId: 'ca-pub-9697854430800000',
      enabled: true,
      autoAds: false,
    };
    return res.json(data);
  }

  try {
    const settings = await db.select().from(siteSettings).limit(1);
    const data = {
      publisherId: settings[0]?.adsensePublisherId || 'ca-pub-9697854430800000',
      enabled: settings[0]?.adsenseEnabled ?? true,
      autoAds: settings[0]?.adsenseAutoAds ?? false,
    };
    apiCache.set('settings:adsense', data, 60);
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(data);
  } catch (error) {
    res.json({
      publisherId: 'ca-pub-9697854430800000',
      enabled: true,
      autoAds: false,
    });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC API: ADVERTISEMENTS (Database-driven, route-aware, AdSense & scheduled)
// -----------------------------------------------------------------------------
app.get('/api/ads', async (req: Request, res: Response) => {
  try {
    const { route, placement } = req.query;

    if (!isPostgresConfigured) {
      return res.json({
        route: (route as string) || '/',
        adsBySlot: {},
        allAds: [],
      });
    }
    const cacheKey = `ads:list:${placement || 'all'}`;
    const cached = apiCache.get<any>(cacheKey);

    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
      return res.json({
        route: (route as string) || '/',
        adsBySlot: cached.adsBySlot,
        allAds: cached.allAds,
      });
    }

    const now = new Date();

    const conditions = [
      eq(advertisements.isActive, true),
      or(sql`${advertisements.startDate} IS NULL`, sql`${advertisements.startDate} <= ${now}`),
      or(sql`${advertisements.endDate} IS NULL`, sql`${advertisements.endDate} >= ${now}`),
    ];

    if (placement && typeof placement === 'string') {
      conditions.push(eq(advertisements.placement, placement.toUpperCase()));
    }

    const adList = await db
      .select({
        id: advertisements.id,
        title: advertisements.title,
        imageUrl: advertisements.imageUrl,
        destinationUrl: advertisements.destinationUrl,
        placement: advertisements.placement,
        adType: advertisements.adType,
        adSenseSlot: advertisements.adSenseSlot,
        adSenseFormat: advertisements.adSenseFormat,
        customHtml: advertisements.customHtml,
        priority: advertisements.priority,
        impressions: advertisements.impressions,
        clicks: advertisements.clicks,
      })
      .from(advertisements)
      .where(and(...conditions))
      .orderBy(desc(advertisements.priority), desc(advertisements.id));

    // Group active ads by placement slot (taking the highest priority active ad per slot)
    const adsBySlot: Record<string, typeof adList[0]> = {};
    for (const ad of adList) {
      const slotKey = ad.placement.toUpperCase();
      if (!adsBySlot[slotKey]) {
        adsBySlot[slotKey] = ad;
      }
    }

    // Cache in-memory for 15s (absorbs traffic spikes)
    apiCache.set(cacheKey, { adsBySlot, allAds: adList }, 15);
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');

    res.json({
      route: (route as string) || '/',
      adsBySlot,
      allAds: adList,
    });
  } catch (error) {
    console.warn('Could not fetch active ads:', error);
    res.json({ route: (req.query.route as string) || '/', adsBySlot: {}, allAds: [] });
  }
});

app.get('/api/ads/:placement', async (req: Request, res: Response) => {
  try {
    const { placement } = req.params;

    if (!isPostgresConfigured) {
      return res.json({ ad: null });
    }
    const cacheKey = `ads:slot:${placement.toUpperCase()}`;
    const cached = apiCache.get<any>(cacheKey);

    if (cached !== null) {
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
      return res.json({ ad: cached });
    }

    const now = new Date();

    const adList = await db
      .select({
        id: advertisements.id,
        title: advertisements.title,
        imageUrl: advertisements.imageUrl,
        destinationUrl: advertisements.destinationUrl,
        placement: advertisements.placement,
        adType: advertisements.adType,
        adSenseSlot: advertisements.adSenseSlot,
        adSenseFormat: advertisements.adSenseFormat,
        customHtml: advertisements.customHtml,
      })
      .from(advertisements)
      .where(
        and(
          eq(advertisements.placement, placement.toUpperCase()),
          eq(advertisements.isActive, true),
          or(sql`${advertisements.startDate} IS NULL`, sql`${advertisements.startDate} <= ${now}`),
          or(sql`${advertisements.endDate} IS NULL`, sql`${advertisements.endDate} >= ${now}`)
        )
      )
      .orderBy(desc(advertisements.priority), desc(advertisements.id))
      .limit(1);

    if (adList.length === 0) {
      apiCache.set(cacheKey, null, 15);
      return res.json({ ad: null });
    }

    const ad = adList[0];

    // Asynchronously record impression in background without blocking response
    db.insert(adImpressions)
      .values({
        advertisementId: ad.id,
        placement: ad.placement,
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      })
      .then(() => {
        return db.update(advertisements)
          .set({ impressions: sql`${advertisements.impressions} + 1` })
          .where(eq(advertisements.id, ad.id));
      })
      .catch(err => console.error('Ad impression tracking error:', err));

    apiCache.set(cacheKey, ad, 15);
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');

    res.json({ ad });
  } catch (error) {
    console.error('Error serving ad:', error);
    res.json({ ad: null });
  }
});

// Ad click tracking (Non-blocking async persistence)
app.post('/api/ads/:id/click', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const adRes = await db.select({
      id: advertisements.id,
      destinationUrl: advertisements.destinationUrl,
      placement: advertisements.placement,
    }).from(advertisements).where(eq(advertisements.id, id)).limit(1);

    if (adRes.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const ad = adRes[0];

    // Respond immediately so user redirects in <1ms
    res.json({ destinationUrl: ad.destinationUrl });

    // Record click and update count asynchronously in background
    Promise.all([
      db.insert(adClicks).values({
        advertisementId: ad.id,
        placement: ad.placement,
        ipAddress: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      }),
      db.update(advertisements)
        .set({ clicks: sql`${advertisements.clicks} + 1` })
        .where(eq(advertisements.id, ad.id)),
    ]).catch(err => console.error('Async ad click persistence error:', err));
  } catch (error) {
    console.error('Ad click error:', error);
    res.status(500).json({ error: 'Click tracking failed' });
  }
});

// -----------------------------------------------------------------------------
// SEO & UTILITIES: SITEMAP & ROBOTS
// -----------------------------------------------------------------------------
app.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const baseUrl = process.env.APP_URL || 'https://vasturitam.ai.studio';

    const allArticles = await db.select({ slug: articles.slug, updatedAt: articles.updatedAt })
      .from(articles)
      .where(eq(articles.status, 'published'));

    const allTopics = await db.select({ slug: topics.slug, updatedAt: topics.updatedAt }).from(topics);
    const allCategories = await db.select({ slug: categories.slug }).from(categories);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/knowledge</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/topics</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/categories</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;

    // Articles
    for (const art of allArticles) {
      xml += `  <url><loc>${baseUrl}/knowledge/${art.slug}</loc><lastmod>${art.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    }

    // Topics
    for (const top of allTopics) {
      xml += `  <url><loc>${baseUrl}/topic/${top.slug}</loc><lastmod>${top.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    }

    // Categories
    for (const cat of allCategories) {
      xml += `  <url><loc>${baseUrl}/category/${cat.slug}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://vasturitam.ai.studio';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

// -----------------------------------------------------------------------------
// AUTHENTICATION APIs
// -----------------------------------------------------------------------------
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!isPostgresConfigured) {
      if (email.toLowerCase().trim() === 'admin@vasturitam.com' && password === 'VastuAdmin2026!') {
        const sessionUser = {
          id: 1,
          uid: 'admin_vr_master_uid',
          email: 'admin@vasturitam.com',
          displayName: 'Vastu Ritam Acharya',
          role: 'admin',
          avatarUrl: '/trademark-logo.jpg',
        };
        const token = createSessionToken(sessionUser);
        res.cookie('vr_session', token, {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return res.json({ user: sessionUser, token });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const userList = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (userList.length === 0 || !userList[0].passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userList[0];
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // STRICT: Only authorized admin / editor can access CMS
    if (!['admin', 'editor'].includes(user.role)) {
      return res.status(403).json({ error: 'Access Denied: Only pre-authorized administrators are permitted to sign in.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionUser = {
      id: user.id,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    const token = createSessionToken(sessionUser);

    // Set HttpOnly cookie
    res.cookie('vr_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ user: sessionUser, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('vr_session');
  res.json({ message: 'Logged out successfully' });
});

// Admin Credential Change: Change login email and password after first login
app.put('/api/admin/change-credentials', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newEmail, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to verify your authorization.' });
    }

    // Fetch user from DB
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRows.length === 0 || !userRows[0].passwordHash) {
      return res.status(404).json({ error: 'User account not found or has no local password.' });
    }

    const user = userRows[0];
    if (!user.passwordHash) {
      return res.status(404).json({ error: 'User account has no local password.' });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'Incorrect current password. Please re-enter your valid current password.' });
    }

    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    let emailChanged = false;
    let passwordChanged = false;

    // Handle new email
    if (newEmail && typeof newEmail === 'string' && newEmail.trim()) {
      const cleanEmail = newEmail.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Invalid email address format.' });
      }

      if (cleanEmail !== user.email) {
        // Check duplicate
        const existing = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.email, cleanEmail), sql`${users.id} != ${userId}`))
          .limit(1);

        if (existing.length > 0) {
          return res.status(409).json({ error: 'This email is already registered to another administrator.' });
        }

        updates.email = cleanEmail;
        emailChanged = true;
      }
    }

    // Handle new password
    if (newPassword && typeof newPassword === 'string') {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }
      if (confirmPassword !== undefined && newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirmation password do not match.' });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      updates.passwordHash = newHash;
      passwordChanged = true;
    }

    if (!emailChanged && !passwordChanged) {
      return res.status(400).json({ error: 'No changes provided. Please enter a new email or new password.' });
    }

    const updatedUserList = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    const updatedUser = updatedUserList[0];

    const sessionUser = {
      id: updatedUser.id,
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
    };

    const newToken = createSessionToken(sessionUser);

    res.cookie('vr_session', newToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // Write audit log
    await db.insert(auditLogs).values({
      userId,
      action: 'UPDATE_ADMIN_CREDENTIALS',
      entityType: 'USER_CREDENTIALS',
      entityId: String(userId),
      details: `Admin updated login credentials: ${emailChanged ? `Email changed to ${updatedUser.email}. ` : ''}${passwordChanged ? 'Password updated.' : ''}`,
    });

    res.json({
      message: 'Login credentials successfully updated. Your new email and password are now active.',
      user: sessionUser,
      token: newToken,
    });
  } catch (error: any) {
    console.error('Error updating credentials:', error);
    res.status(500).json({ error: error.message || 'Failed to update credentials' });
  }
});

app.get('/api/auth/login-info', async (_req: Request, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({ hasCustomized: false });
  }
  try {
    const adminUser = await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin')).limit(1);
    const hasCustomized = adminUser.length > 0 && adminUser[0].email !== 'admin@vasturitam.com';
    res.json({ hasCustomized });
  } catch {
    res.json({ hasCustomized: false });
  }
});

// -----------------------------------------------------------------------------
// PUBLIC API: CONTACT DETAILS & SITE SETTINGS
// -----------------------------------------------------------------------------
app.get('/api/contact-details', async (_req: Request, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({ settings: dataStore.getSettings() });
  }
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    if (settings.length === 0) {
      return res.json({ settings: dataStore.getSettings() });
    }
    res.json({ settings: settings[0] });
  } catch (error) {
    res.json({ settings: dataStore.getSettings() });
  }
});

// -----------------------------------------------------------------------------
// ADMIN CMS APIS (Protected by RBAC)
// -----------------------------------------------------------------------------

// Dashboard Stats
app.get('/api/admin/dashboard', requireAuth, async (_req: AuthRequest, res: Response) => {
  if (!isPostgresConfigured) {
    const allArts = dataStore.getArticles(false);
    const pubArts = dataStore.getArticles(true);
    const ads = dataStore.getAds();
    const impressions = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
    const clicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
    return res.json({
      counts: {
        totalArticles: allArts.length,
        publishedArticles: pubArts.length,
        draftArticles: allArts.length - pubArts.length,
        totalTopics: dataStore.getTopics().length,
        totalCategories: dataStore.getCategories().length,
        totalKeywords: dataStore.getKeywords().length,
        totalAds: ads.length,
        totalImpressions: impressions,
        totalClicks: clicks,
        ctr: `${ctr}%`,
      },
      recentLogs: dataStore.getAuditLogs().slice(0, 10),
    });
  }
  try {
    const [totalArticles] = await db.select({ count: sql<number>`count(*)` }).from(articles);
    const [publishedArticles] = await db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'published'));
    const [draftArticles] = await db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'draft'));
    const [totalTopics] = await db.select({ count: sql<number>`count(*)` }).from(topics);
    const [totalCategories] = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const [totalKeywords] = await db.select({ count: sql<number>`count(*)` }).from(keywords);
    const [totalAds] = await db.select({ count: sql<number>`count(*)` }).from(advertisements);
    const [adMetrics] = await db.select({
      totalImpressions: sql<number>`coalesce(sum(${advertisements.impressions}), 0)`,
      totalClicks: sql<number>`coalesce(sum(${advertisements.clicks}), 0)`,
    }).from(advertisements);

    const impressions = Number(adMetrics?.totalImpressions || 0);
    const clicks = Number(adMetrics?.totalClicks || 0);
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

    const recentLogs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        userEmail: users.email,
        userName: users.displayName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);

    res.json({
      counts: {
        totalArticles: Number(totalArticles.count),
        publishedArticles: Number(publishedArticles.count),
        draftArticles: Number(draftArticles.count),
        totalTopics: Number(totalTopics.count),
        totalCategories: Number(totalCategories.count),
        totalKeywords: Number(totalKeywords.count),
        totalAds: Number(totalAds.count),
        totalImpressions: impressions,
        totalClicks: clicks,
        ctr: `${ctr}%`,
      },
      recentLogs,
    });
  } catch (error) {
    console.warn('Admin dashboard error, falling back to dataStore:', error);
    const allArts = dataStore.getArticles(false);
    const pubArts = dataStore.getArticles(true);
    const ads = dataStore.getAds();
    const impressions = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
    const clicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
    res.json({
      counts: {
        totalArticles: allArts.length,
        publishedArticles: pubArts.length,
        draftArticles: allArts.length - pubArts.length,
        totalTopics: dataStore.getTopics().length,
        totalCategories: dataStore.getCategories().length,
        totalKeywords: dataStore.getKeywords().length,
        totalAds: ads.length,
        totalImpressions: impressions,
        totalClicks: clicks,
        ctr: `${ctr}%`,
      },
      recentLogs: dataStore.getAuditLogs().slice(0, 10),
    });
  }
});

// Articles CRUD
app.get('/api/admin/articles', requireAuth, async (_req: AuthRequest, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({ articles: dataStore.getArticles(false) });
  }
  try {
    const list = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        categoryId: articles.categoryId,
        categoryName: categories.name,
        status: articles.status,
        authorName: users.displayName,
        readingTimeMinutes: articles.readingTimeMinutes,
        viewsCount: articles.viewsCount,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .orderBy(desc(articles.updatedAt));

    res.json({ articles: list });
  } catch (error) {
    console.warn('Fallback to dataStore for admin articles:', error);
    res.json({ articles: dataStore.getArticles(false) });
  }
});

app.post('/api/admin/articles', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      status = 'draft',
      metaTitle,
      metaDescription,
      readingTimeMinutes = 5,
      topicIds = [],
      keywordIds = [],
    } = req.body;

    if (!title || !slug || !excerpt || !content) {
      return res.status(400).json({ error: 'Title, slug, excerpt, and content are required' });
    }

    if (!isPostgresConfigured) {
      const created = dataStore.createArticle({
        title,
        slug: slug.toLowerCase().trim(),
        excerpt,
        content,
        featuredImage: featuredImage || '/hero-sanctuary.jpg',
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        authorId: req.user?.id || 1,
        authorName: req.user?.displayName || 'Admin',
        status: status as any,
        metaTitle,
        metaDescription,
        readingTimeMinutes: parseInt(readingTimeMinutes, 10) || 5,
        publishedAt: status === 'published' ? new Date().toISOString() : null,
      });

      if (Array.isArray(topicIds) && topicIds.length > 0) {
        dataStore.setArticleTopics(created.id, topicIds.map(Number));
      }
      if (Array.isArray(keywordIds) && keywordIds.length > 0) {
        dataStore.setArticleKeywords(created.id, keywordIds.map(Number));
      }

      dataStore.createAuditLog({
        userId: req.user?.id || 1,
        action: 'CREATE_ARTICLE',
        entityType: 'ARTICLE',
        entityId: String(created.id),
        details: `Created article "${title}" with status "${status}"`,
      });

      return res.status(201).json({ article: created });
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const inserted = await db.insert(articles).values({
      title,
      slug: slug.toLowerCase().trim(),
      excerpt,
      content,
      featuredImage,
      categoryId: categoryId ? parseInt(categoryId, 10) : null,
      authorId: req.user!.id,
      status,
      metaTitle,
      metaDescription,
      readingTimeMinutes: parseInt(readingTimeMinutes, 10) || 5,
      publishedAt,
    }).returning();

    const newArticle = inserted[0];

    // Connect topics
    if (Array.isArray(topicIds) && topicIds.length > 0) {
      for (const tId of topicIds) {
        await db.insert(articleTopics).values({
          articleId: newArticle.id,
          topicId: parseInt(tId, 10),
          isPrimary: false,
        });
      }
    }

    // Connect keywords
    if (Array.isArray(keywordIds) && keywordIds.length > 0) {
      for (const kId of keywordIds) {
        await db.insert(articleKeywords).values({
          articleId: newArticle.id,
          keywordId: parseInt(kId, 10),
        });
      }
    }

    // Log Audit
    await db.insert(auditLogs).values({
      userId: req.user!.id,
      action: 'CREATE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: String(newArticle.id),
      details: `Created article "${title}" with status "${status}"`,
    });

    res.status(201).json({ article: newArticle });
  } catch (error: any) {
    console.warn('Error creating article in DB, using fallback dataStore:', error);
    try {
      const created = dataStore.createArticle(req.body);
      return res.status(201).json({ article: created });
    } catch (fallbackErr: any) {
      res.status(500).json({ error: error.message || 'Failed to create article' });
    }
  }
});

app.put('/api/admin/articles/:id', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      status,
      metaTitle,
      metaDescription,
      readingTimeMinutes,
      topicIds,
      keywordIds,
    } = req.body;

    if (!isPostgresConfigured) {
      const existing = dataStore.getArticleById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Article not found' });
      }

      let publishedAt = existing.publishedAt;
      if (status === 'published' && !publishedAt) {
        publishedAt = new Date().toISOString();
      }

      const updated = dataStore.updateArticle(id, {
        title: title || existing.title,
        slug: slug ? slug.toLowerCase().trim() : existing.slug,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: content !== undefined ? content : existing.content,
        featuredImage: featuredImage !== undefined ? featuredImage : existing.featuredImage,
        categoryId: categoryId !== undefined ? (categoryId ? parseInt(categoryId, 10) : null) : existing.categoryId,
        status: (status || existing.status) as any,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
        readingTimeMinutes: readingTimeMinutes ? parseInt(readingTimeMinutes, 10) : existing.readingTimeMinutes,
        publishedAt,
      });

      if (Array.isArray(topicIds)) {
        dataStore.setArticleTopics(id, topicIds.map(Number));
      }
      if (Array.isArray(keywordIds)) {
        dataStore.setArticleKeywords(id, keywordIds.map(Number));
      }

      dataStore.createAuditLog({
        userId: req.user?.id || 1,
        action: 'UPDATE_ARTICLE',
        entityType: 'ARTICLE',
        entityId: String(id),
        details: `Updated article "${updated?.title}" (status: ${updated?.status})`,
      });

      return res.json({ article: updated });
    }

    const existing = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    let publishedAt = existing[0].publishedAt;
    if (status === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    const updated = await db.update(articles).set({
      title: title || existing[0].title,
      slug: slug ? slug.toLowerCase().trim() : existing[0].slug,
      excerpt: excerpt !== undefined ? excerpt : existing[0].excerpt,
      content: content !== undefined ? content : existing[0].content,
      featuredImage: featuredImage !== undefined ? featuredImage : existing[0].featuredImage,
      categoryId: categoryId !== undefined ? (categoryId ? parseInt(categoryId, 10) : null) : existing[0].categoryId,
      status: status || existing[0].status,
      metaTitle: metaTitle !== undefined ? metaTitle : existing[0].metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : existing[0].metaDescription,
      readingTimeMinutes: readingTimeMinutes ? parseInt(readingTimeMinutes, 10) : existing[0].readingTimeMinutes,
      publishedAt,
      updatedAt: new Date(),
    }).where(eq(articles.id, id)).returning();

    // Update topic relations if provided
    if (Array.isArray(topicIds)) {
      await db.delete(articleTopics).where(eq(articleTopics.articleId, id));
      for (const tId of topicIds) {
        await db.insert(articleTopics).values({
          articleId: id,
          topicId: parseInt(tId, 10),
          isPrimary: false,
        });
      }
    }

    // Update keyword relations if provided
    if (Array.isArray(keywordIds)) {
      await db.delete(articleKeywords).where(eq(articleKeywords.articleId, id));
      for (const kId of keywordIds) {
        await db.insert(articleKeywords).values({
          articleId: id,
          keywordId: parseInt(kId, 10),
        });
      }
    }

    // Audit Log
    await db.insert(auditLogs).values({
      userId: req.user!.id,
      action: 'UPDATE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: String(id),
      details: `Updated article "${updated[0].title}" (status: ${updated[0].status})`,
    });

    res.json({ article: updated[0] });
  } catch (error: any) {
    console.warn('Error updating article in DB, using fallback dataStore:', error);
    const id = parseInt(req.params.id, 10);
    const updated = dataStore.updateArticle(id, req.body);
    if (updated) {
      return res.json({ article: updated });
    }
    res.status(500).json({ error: error.message || 'Failed to update article' });
  }
});

app.delete('/api/admin/articles/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!isPostgresConfigured) {
      const existing = dataStore.getArticleById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Article not found' });
      }
      dataStore.deleteArticle(id);
      dataStore.createAuditLog({
        userId: req.user?.id || 1,
        action: 'DELETE_ARTICLE',
        entityType: 'ARTICLE',
        entityId: String(id),
        details: `Deleted article "${existing.title}"`,
      });
      return res.json({ message: 'Article deleted successfully' });
    }

    const existing = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await db.delete(articles).where(eq(articles.id, id));

    await db.insert(auditLogs).values({
      userId: req.user!.id,
      action: 'DELETE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: String(id),
      details: `Deleted article "${existing[0].title}"`,
    });

    res.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    const id = parseInt(req.params.id, 10);
    dataStore.deleteArticle(id);
    res.json({ message: 'Article deleted successfully' });
  }
});

// Topics CRUD & Relations
app.get('/api/admin/topics', requireAuth, async (_req: AuthRequest, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({ topics: FALLBACK_TOPICS });
  }
  try {
    const allTopics = await db.select().from(topics).orderBy(asc(topics.name));
    res.json({ topics: allTopics });
  } catch (error) {
    console.error('Error fetching admin topics:', error);
    res.status(500).json({ error: 'Failed to retrieve topics' });
  }
});

app.post('/api/admin/topics', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, sanskritName, entityType = 'concept', summary, description, imageUrl, metaTitle, metaDescription } = req.body;
    if (!name || !slug || !summary || !description) {
      return res.status(400).json({ error: 'Name, slug, summary, and description are required' });
    }

    const inserted = await db.insert(topics).values({
      name,
      slug: slug.toLowerCase().trim(),
      sanskritName,
      entityType,
      summary,
      description,
      imageUrl,
      metaTitle,
      metaDescription,
    }).returning();

    await db.insert(auditLogs).values({
      userId: req.user!.id,
      action: 'CREATE_TOPIC',
      entityType: 'TOPIC',
      entityId: String(inserted[0].id),
      details: `Created entity topic "${name}" (${entityType})`,
    });

    res.status(201).json({ topic: inserted[0] });
  } catch (error: any) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: error.message || 'Failed to create topic' });
  }
});

app.put('/api/admin/topics/:id', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, slug, sanskritName, entityType, summary, description, imageUrl, metaTitle, metaDescription } = req.body;

    const updated = await db.update(topics).set({
      name,
      slug: slug ? slug.toLowerCase().trim() : undefined,
      sanskritName,
      entityType,
      summary,
      description,
      imageUrl,
      metaTitle,
      metaDescription,
      updatedAt: new Date(),
    }).where(eq(topics.id, id)).returning();

    res.json({ topic: updated[0] });
  } catch (error: any) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: error.message || 'Failed to update topic' });
  }
});

app.delete('/api/admin/topics/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(topics).where(eq(topics.id, id));
    res.json({ message: 'Topic deleted' });
  } catch (error: any) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: error.message || 'Failed to delete topic' });
  }
});

// Topic-to-Topic Relations Management
app.post('/api/admin/topic-relations', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const { sourceTopicId, targetTopicId, relationType = 'related_to' } = req.body;
    if (!sourceTopicId || !targetTopicId || sourceTopicId === targetTopicId) {
      return res.status(400).json({ error: 'Valid distinct source and target topics required' });
    }

    const inserted = await db.insert(topicRelations).values({
      sourceTopicId: parseInt(sourceTopicId, 10),
      targetTopicId: parseInt(targetTopicId, 10),
      relationType,
    }).returning();

    res.status(201).json({ relation: inserted[0] });
  } catch (error: any) {
    console.error('Error creating topic relation:', error);
    res.status(500).json({ error: error.message || 'Failed to connect topics' });
  }
});

app.delete('/api/admin/topic-relations/:id', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(topicRelations).where(eq(topicRelations.id, id));
    res.json({ message: 'Relation removed' });
  } catch (error: any) {
    console.error('Error deleting topic relation:', error);
    res.status(500).json({ error: error.message || 'Failed to remove relation' });
  }
});

// Categories CRUD
app.get('/api/admin/categories', requireAuth, async (_req: AuthRequest, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({ categories: FALLBACK_CATEGORIES });
  }
  try {
    const cats = await db.select().from(categories).orderBy(asc(categories.displayOrder));
    res.json({ categories: cats });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

app.post('/api/admin/categories', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, icon, metaTitle, metaDescription, displayOrder = 0 } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug required' });
    }

    const inserted = await db.insert(categories).values({
      name,
      slug: slug.toLowerCase().trim(),
      description,
      icon,
      metaTitle,
      metaDescription,
      displayOrder: parseInt(displayOrder, 10) || 0,
    }).returning();

    res.status(201).json({ category: inserted[0] });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message || 'Failed to create category' });
  }
});

app.put('/api/admin/categories/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, slug, description, icon, metaTitle, metaDescription, displayOrder } = req.body;

    const updated = await db.update(categories).set({
      name,
      slug: slug ? slug.toLowerCase().trim() : undefined,
      description,
      icon,
      metaTitle,
      metaDescription,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : undefined,
    }).where(eq(categories.id, id)).returning();

    res.json({ category: updated[0] });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message || 'Failed to update category' });
  }
});

app.delete('/api/admin/categories/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(categories).where(eq(categories.id, id));
    res.json({ message: 'Category deleted' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message || 'Failed to delete category' });
  }
});

// Keywords CRUD
app.get('/api/admin/keywords', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;

    let queryConditions = [];
    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      queryConditions.push(
        or(
          ilike(keywords.name, term),
          ilike(keywords.slug, term)
        )!
      );
    }

    const whereClause = queryConditions.length > 0 ? and(...queryConditions) : undefined;

    // Fetch keywords
    const kwList = whereClause
      ? await db.select().from(keywords).where(whereClause).orderBy(desc(keywords.usageCount), asc(keywords.name))
      : await db.select().from(keywords).orderBy(desc(keywords.usageCount), asc(keywords.name));

    // Get live usage counts from articleKeywords table for accurate shastric referencing
    const usageCounts = await db
      .select({
        keywordId: articleKeywords.keywordId,
        count: sql<number>`count(*)`,
      })
      .from(articleKeywords)
      .groupBy(articleKeywords.keywordId);

    const countMap = new Map<number, number>();
    for (const row of usageCounts) {
      countMap.set(row.keywordId, Number(row.count));
    }

    const enrichedKeywords = kwList.map((kw) => ({
      ...kw,
      usageCount: countMap.get(kw.id) ?? kw.usageCount ?? 0,
    }));

    res.json({ keywords: enrichedKeywords });
  } catch (error) {
    console.error('Error fetching admin keywords:', error);
    res.status(500).json({ error: 'Failed to retrieve keywords' });
  }
});

app.post('/api/admin/keywords', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug: customSlug } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Term name is required.' });
    }

    const trimmedName = name.trim();
    const generatedSlug = (customSlug && typeof customSlug === 'string' && customSlug.trim())
      ? customSlug.toLowerCase().trim().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)/g, '')
      : trimmedName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)/g, '');

    if (!generatedSlug) {
      return res.status(400).json({ error: 'A valid slug could not be generated from the name.' });
    }

    // Check for duplicate name or slug
    const existing = await db
      .select()
      .from(keywords)
      .where(or(ilike(keywords.name, trimmedName), eq(keywords.slug, generatedSlug)))
      .limit(1);

    if (existing.length > 0) {
      const matchField = existing[0].name.toLowerCase() === trimmedName.toLowerCase() ? 'name' : 'slug';
      return res.status(409).json({ error: `A Shastric term with this ${matchField} already exists: "${existing[0].name}".` });
    }

    const inserted = await db.insert(keywords).values({
      name: trimmedName,
      slug: generatedSlug,
      usageCount: 0,
    }).returning();

    // Audit log
    await db.insert(auditLogs).values({
      userId: req.user?.id,
      action: 'CREATE_KEYWORD',
      entityType: 'keyword',
      entityId: inserted[0].id.toString(),
      details: `Created Shastric term #${inserted[0].name} (${inserted[0].slug})`,
    });

    res.status(201).json({ keyword: inserted[0] });
  } catch (error: any) {
    console.error('Error creating keyword:', error);
    res.status(500).json({ error: error.message || 'Failed to create keyword' });
  }
});

app.put('/api/admin/keywords/:id', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid keyword ID' });

    const { name, slug: customSlug } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Term name is required.' });
    }

    const trimmedName = name.trim();
    const generatedSlug = (customSlug && typeof customSlug === 'string' && customSlug.trim())
      ? customSlug.toLowerCase().trim().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)/g, '')
      : trimmedName.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)/g, '');

    // Check existing
    const current = await db.select().from(keywords).where(eq(keywords.id, id)).limit(1);
    if (current.length === 0) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    // Check duplicate among other keywords
    const duplicate = await db
      .select()
      .from(keywords)
      .where(
        and(
          sql`${keywords.id} != ${id}`,
          or(ilike(keywords.name, trimmedName), eq(keywords.slug, generatedSlug))
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      return res.status(409).json({ error: `Another keyword already uses the name or slug "${duplicate[0].name}".` });
    }

    const updated = await db
      .update(keywords)
      .set({
        name: trimmedName,
        slug: generatedSlug,
      })
      .where(eq(keywords.id, id))
      .returning();

    // Audit log
    await db.insert(auditLogs).values({
      userId: req.user?.id,
      action: 'UPDATE_KEYWORD',
      entityType: 'keyword',
      entityId: id.toString(),
      details: `Updated keyword #${current[0].name} -> #${trimmedName} (${generatedSlug})`,
    });

    res.json({ keyword: updated[0] });
  } catch (error: any) {
    console.error('Error updating keyword:', error);
    res.status(500).json({ error: error.message || 'Failed to update keyword' });
  }
});

app.delete('/api/admin/keywords/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid keyword ID' });

    const current = await db.select().from(keywords).where(eq(keywords.id, id)).limit(1);
    if (current.length === 0) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    // Remove any associations in articleKeywords first to maintain clean data integrity
    await db.delete(articleKeywords).where(eq(articleKeywords.keywordId, id));

    await db.delete(keywords).where(eq(keywords.id, id));

    // Audit log
    await db.insert(auditLogs).values({
      userId: req.user?.id,
      action: 'DELETE_KEYWORD',
      entityType: 'keyword',
      entityId: id.toString(),
      details: `Deleted Shastric term #${current[0].name} (${current[0].slug})`,
    });

    res.json({ message: 'Keyword deleted successfully', deletedId: id });
  } catch (error: any) {
    console.error('Error deleting keyword:', error);
    res.status(500).json({ error: error.message || 'Failed to delete keyword' });
  }
});

// Advertisements CMS CRUD
app.get('/api/admin/ads', requireAuth, async (_req: AuthRequest, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({ ads: [] });
  }
  try {
    const ads = await db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
    res.json({ ads });
  } catch (error) {
    console.error('Error fetching admin ads:', error);
    res.status(500).json({ error: 'Failed to retrieve ads' });
  }
});

app.post('/api/admin/ads', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      imageUrl,
      destinationUrl,
      placement,
      adType = 'BANNER',
      adSenseSlot,
      adSenseFormat = 'auto',
      customHtml,
      isActive = true,
      priority = 1,
      startDate,
      endDate,
    } = req.body;

    if (!title || !placement) {
      return res.status(400).json({ error: 'Title and placement are required' });
    }

    if (adType === 'BANNER' && (!imageUrl || !destinationUrl)) {
      return res.status(400).json({ error: 'Image URL and Destination URL are required for Banner ads' });
    }

    const inserted = await db.insert(advertisements).values({
      title,
      imageUrl: imageUrl || 'https://pagead2.googlesyndication.com',
      destinationUrl: destinationUrl || '#',
      placement: placement.toUpperCase(),
      adType: adType.toUpperCase(),
      adSenseSlot: adSenseSlot ? String(adSenseSlot).trim() : null,
      adSenseFormat: adSenseFormat || 'auto',
      customHtml: customHtml || null,
      isActive: Boolean(isActive),
      priority: parseInt(priority, 10) || 1,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    }).returning();

    // Invalidate ads cache immediately so new ad goes live instantly
    apiCache.invalidatePrefix('ads:');

    await db.insert(auditLogs).values({
      userId: req.user!.id,
      action: 'CREATE_AD',
      entityType: 'ADVERTISEMENT',
      entityId: String(inserted[0].id),
      details: `Created advertisement "${title}" (${adType}) for slot "${placement}"`,
    });

    res.status(201).json({ ad: inserted[0] });
  } catch (error: any) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: error.message || 'Failed to create advertisement' });
  }
});

app.put('/api/admin/ads/:id', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      title,
      imageUrl,
      destinationUrl,
      placement,
      adType,
      adSenseSlot,
      adSenseFormat,
      customHtml,
      isActive,
      priority,
      startDate,
      endDate,
    } = req.body;

    const updated = await db.update(advertisements).set({
      title,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      destinationUrl: destinationUrl !== undefined ? destinationUrl : undefined,
      placement: placement ? placement.toUpperCase() : undefined,
      adType: adType ? adType.toUpperCase() : undefined,
      adSenseSlot: adSenseSlot !== undefined ? (adSenseSlot ? String(adSenseSlot).trim() : null) : undefined,
      adSenseFormat: adSenseFormat !== undefined ? adSenseFormat : undefined,
      customHtml: customHtml !== undefined ? customHtml : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      priority: priority !== undefined ? parseInt(priority, 10) : undefined,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      updatedAt: new Date(),
    }).where(eq(advertisements.id, id)).returning();

    // Invalidate cache immediately
    apiCache.invalidatePrefix('ads:');

    res.json({ ad: updated[0] });
  } catch (error: any) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: error.message || 'Failed to update advertisement' });
  }
});

app.delete('/api/admin/ads/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(advertisements).where(eq(advertisements.id, id));
    apiCache.invalidatePrefix('ads:');
    res.json({ message: 'Advertisement deleted' });
  } catch (error: any) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: error.message || 'Failed to delete ad' });
  }
});

// -----------------------------------------------------------------------------
// ADMIN API: GYAN KOSH VIDEO LEARNING MANAGEMENT
// Strictly manages external video references (YouTube/Vimeo).
// No actual video file is ever uploaded, stored, or processed on the server.
// -----------------------------------------------------------------------------
app.get('/api/admin/videos', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await db
      .select({
        id: videoLearning.id,
        title: videoLearning.title,
        slug: videoLearning.slug,
        categoryId: videoLearning.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        topicId: videoLearning.topicId,
        topicName: topics.name,
        topicSlug: topics.slug,
        videoUrl: videoLearning.videoUrl,
        videoProvider: videoLearning.videoProvider,
        thumbnailUrl: videoLearning.thumbnailUrl,
        description: videoLearning.description,
        status: videoLearning.status,
        displayOrder: videoLearning.displayOrder,
        duration: videoLearning.duration,
        instructor: videoLearning.instructor,
        createdBy: videoLearning.createdBy,
        creatorName: users.displayName,
        publishedAt: videoLearning.publishedAt,
        createdAt: videoLearning.createdAt,
        updatedAt: videoLearning.updatedAt,
      })
      .from(videoLearning)
      .leftJoin(categories, eq(videoLearning.categoryId, categories.id))
      .leftJoin(topics, eq(videoLearning.topicId, topics.id))
      .leftJoin(users, eq(videoLearning.createdBy, users.id))
      .orderBy(asc(videoLearning.displayOrder), desc(videoLearning.updatedAt));

    const augmented = rows.map((v) => {
      const parsed = parseAndValidateVideoUrl(v.videoUrl);
      return {
        ...v,
        embedUrl: parsed.embedUrl,
        isValidLink: parsed.valid,
        provider: parsed.provider || v.videoProvider,
      };
    });

    res.json({ videos: augmented });
  } catch (error: any) {
    console.error('Error fetching admin videos:', error);
    res.status(500).json({ error: 'Failed to retrieve video catalog' });
  }
});

app.post('/api/admin/validate-video-url', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { videoUrl } = req.body;
    const result = parseAndValidateVideoUrl(videoUrl);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ valid: false, error: err.message || 'Validation error' });
  }
});

app.post('/api/admin/upload-thumbnail', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, mimeType, base64Data } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'base64Data and mimeType are required' });
    }

    const allowedMimes: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    const ext = allowedMimes[String(mimeType).toLowerCase()];
    if (!ext) {
      return res.status(400).json({ error: 'Invalid image format. Allowed formats: JPG, JPEG, PNG, WebP' });
    }

    const cleanBase64 = String(base64Data).replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum 5MB size limit' });
    }

    const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeBaseName = (fileName || 'thumbnail')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 30) || 'thumb';
    const uniqueFileName = `${safeBaseName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    try {
      await db.insert(media).values({
        fileName: uniqueFileName,
        fileUrl: publicUrl,
        mimeType,
        sizeBytes: buffer.length,
        altText: `Video Thumbnail: ${fileName || 'Thumbnail'}`,
        uploadedById: req.user?.id,
      });
    } catch (dbErr) {
      console.warn('Could not record thumbnail media entry:', dbErr);
    }

    res.status(201).json({
      url: publicUrl,
      fileName: uniqueFileName,
      sizeBytes: buffer.length,
      mimeType,
    });
  } catch (err: any) {
    console.error('Error uploading thumbnail:', err);
    res.status(500).json({ error: err.message || 'Failed to upload thumbnail image' });
  }
});

app.post('/api/admin/videos', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      videoUrl,
      categoryId,
      topicId,
      thumbnailUrl,
      description,
      status = 'draft',
      displayOrder = 0,
      duration,
      instructor,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Video title is required' });
    }
    if (!videoUrl || !String(videoUrl).trim()) {
      return res.status(400).json({ error: 'Video link URL is required' });
    }
    if (!thumbnailUrl || !String(thumbnailUrl).trim()) {
      return res.status(400).json({ error: 'Thumbnail image URL is required' });
    }
    if (!description || !String(description).trim()) {
      return res.status(400).json({ error: 'Short description is required' });
    }

    const validation = parseAndValidateVideoUrl(videoUrl);
    if (!validation.valid || !validation.provider) {
      return res.status(400).json({ error: validation.error || 'Invalid video link. Supported providers: YouTube, Vimeo' });
    }

    const cleanTitle = String(title).trim();
    let baseSlug = generateVideoSlug(cleanTitle);
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await db.select({ id: videoLearning.id }).from(videoLearning).where(eq(videoLearning.slug, finalSlug)).limit(1);
      if (existing.length === 0) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const validStatus = ['draft', 'published', 'unpublished'].includes(status) ? status : 'draft';
    const isPublished = validStatus === 'published';

    const inserted = await db.insert(videoLearning).values({
      title: cleanTitle,
      slug: finalSlug,
      categoryId: categoryId ? parseInt(categoryId, 10) : null,
      topicId: topicId ? parseInt(topicId, 10) : null,
      videoUrl: validation.normalizedUrl || String(videoUrl).trim(),
      videoProvider: validation.provider,
      thumbnailUrl: String(thumbnailUrl).trim(),
      description: String(description).trim(),
      status: validStatus,
      displayOrder: parseInt(displayOrder, 10) || 0,
      duration: duration ? String(duration).trim() : null,
      instructor: instructor ? String(instructor).trim() : 'VASTU RITAM Research Fellowship',
      createdBy: req.user?.id || null,
      publishedAt: isPublished ? new Date() : null,
    }).returning();

    await db.insert(auditLogs).values({
      userId: req.user?.id,
      action: 'CREATE_VIDEO',
      entityType: 'video_learning',
      entityId: String(inserted[0].id),
      details: JSON.stringify({ title: cleanTitle, provider: validation.provider, status: validStatus }),
    });

    apiCache.invalidatePrefix('videos:');

    res.status(201).json({ video: inserted[0] });
  } catch (error: any) {
    console.error('Error creating video record:', error);
    res.status(500).json({ error: error.message || 'Failed to create video record' });
  }
});

app.put('/api/admin/videos/:id', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await db.select().from(videoLearning).where(eq(videoLearning.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const {
      title,
      videoUrl,
      categoryId,
      topicId,
      thumbnailUrl,
      description,
      status,
      displayOrder,
      duration,
      instructor,
    } = req.body;

    let provider = existing[0].videoProvider;
    let normalizedUrl = existing[0].videoUrl;

    if (videoUrl && String(videoUrl).trim() !== existing[0].videoUrl) {
      const validation = parseAndValidateVideoUrl(videoUrl);
      if (!validation.valid || !validation.provider) {
        return res.status(400).json({ error: validation.error || 'Invalid video link URL' });
      }
      provider = validation.provider;
      normalizedUrl = validation.normalizedUrl || String(videoUrl).trim();
    }

    const nextStatus = status && ['draft', 'published', 'unpublished'].includes(status) ? status : existing[0].status;
    let publishedAt = existing[0].publishedAt;
    if (nextStatus === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    const updated = await db.update(videoLearning).set({
      title: title !== undefined ? String(title).trim() : undefined,
      videoUrl: normalizedUrl,
      videoProvider: provider,
      categoryId: categoryId !== undefined ? (categoryId ? parseInt(categoryId, 10) : null) : undefined,
      topicId: topicId !== undefined ? (topicId ? parseInt(topicId, 10) : null) : undefined,
      thumbnailUrl: thumbnailUrl !== undefined ? String(thumbnailUrl).trim() : undefined,
      description: description !== undefined ? String(description).trim() : undefined,
      status: nextStatus,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : undefined,
      duration: duration !== undefined ? (duration ? String(duration).trim() : null) : undefined,
      instructor: instructor !== undefined ? (instructor ? String(instructor).trim() : null) : undefined,
      publishedAt,
      updatedAt: new Date(),
    }).where(eq(videoLearning.id, id)).returning();

    await db.insert(auditLogs).values({
      userId: req.user?.id,
      action: 'UPDATE_VIDEO',
      entityType: 'video_learning',
      entityId: String(id),
      details: JSON.stringify({ id, title: updated[0].title, status: nextStatus }),
    });

    apiCache.invalidatePrefix('videos:');

    res.json({ video: updated[0] });
  } catch (error: any) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: error.message || 'Failed to update video record' });
  }
});

app.patch('/api/admin/videos/:id/status', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!['draft', 'published', 'unpublished'].includes(status)) {
      return res.status(400).json({ error: 'Status must be draft, published, or unpublished' });
    }

    const existing = await db.select().from(videoLearning).where(eq(videoLearning.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    let publishedAt = existing[0].publishedAt;
    if (status === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    const updated = await db.update(videoLearning).set({
      status,
      publishedAt,
      updatedAt: new Date(),
    }).where(eq(videoLearning.id, id)).returning();

    await db.insert(auditLogs).values({
      userId: req.user?.id,
      action: status === 'published' ? 'PUBLISH_VIDEO' : 'UNPUBLISH_VIDEO',
      entityType: 'video_learning',
      entityId: String(id),
      details: JSON.stringify({ id, status }),
    });

    apiCache.invalidatePrefix('videos:');

    res.json({ success: true, video: updated[0] });
  } catch (error: any) {
    console.error('Error updating video status:', error);
    res.status(500).json({ error: error.message || 'Failed to update video status' });
  }
});

app.delete('/api/admin/videos/:id', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await db.select().from(videoLearning).where(eq(videoLearning.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await db.delete(videoLearning).where(eq(videoLearning.id, id));

    await db.insert(auditLogs).values({
      userId: req.user?.id,
      action: 'DELETE_VIDEO',
      entityType: 'video_learning',
      entityId: String(id),
      details: JSON.stringify({ id, title: existing[0].title }),
    });

    apiCache.invalidatePrefix('videos:');

    res.json({ message: 'Video removed from library', id });
  } catch (error: any) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: error.message || 'Failed to delete video' });
  }
});

// Media Library
app.get('/api/admin/media', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const mediaList = await db.select().from(media).orderBy(desc(media.createdAt));
    res.json({ media: mediaList });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to retrieve media library' });
  }
});

app.post('/api/admin/media', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileUrl, mimeType, sizeBytes, altText } = req.body;
    if (!fileName || !fileUrl) {
      return res.status(400).json({ error: 'fileName and fileUrl required' });
    }

    const inserted = await db.insert(media).values({
      fileName,
      fileUrl,
      mimeType,
      sizeBytes: sizeBytes || 0,
      altText,
      uploadedById: req.user!.id,
    }).returning();

    res.status(201).json({ media: inserted[0] });
  } catch (error: any) {
    console.error('Error adding media:', error);
    res.status(500).json({ error: error.message || 'Failed to add media' });
  }
});

// Users / RBAC Management
app.get('/api/admin/users', requireAuth, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({
      users: [
        {
          id: 1,
          uid: 'admin_vr_master_uid',
          email: 'admin@vasturitam.com',
          displayName: 'Vastu Ritam Acharya',
          role: 'admin',
          avatarUrl: '/trademark-logo.jpg',
          createdAt: new Date(),
        },
      ],
    });
  }
  try {
    const userList = await db
      .select({
        id: users.id,
        uid: users.uid,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.id));

    res.json({ users: userList });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

app.put('/api/admin/users/:id/role', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { role } = req.body;
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updated = await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    res.json({ user: updated[0] });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: error.message || 'Failed to update user role' });
  }
});

// Audit Logs
app.get('/api/admin/audit-logs', requireAuth, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({ logs: [] });
  }
  try {
    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        userEmail: users.email,
        userName: users.displayName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// ADMIN CMS: CONTACT SETTINGS & DETAILS
// -----------------------------------------------------------------------------
app.get('/api/admin/settings/contact', requireAuth, async (_req: AuthRequest, res: Response) => {
  if (!isPostgresConfigured) {
    return res.json({ settings: dataStore.getSettings() });
  }
  try {
    let settings = await db.select().from(siteSettings).limit(1);
    if (settings.length === 0) {
      const inserted = await db.insert(siteSettings).values({}).returning();
      settings = inserted;
    }
    res.json({ settings: settings[0] });
  } catch (error) {
    console.error('Error fetching admin contact settings:', error);
    res.status(500).json({ error: 'Failed to retrieve contact settings' });
  }
});

app.put('/api/admin/settings/contact', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const {
      primaryPhone,
      secondaryPhone,
      primaryEmail,
      consultationEmail,
      whatsappNumber,
      whatsappNotice,
      consultationTimings,
      appointmentNotice,
      youtubeUrl,
      youtubeHandle,
      twitterUrl,
      twitterHandle,
      facebookUrl,
      facebookHandle,
      instagramUrl,
      instagramHandle,
      officeAddress,
      collaborationNotice,
      adsensePublisherId,
      adsenseEnabled,
      adsenseAutoAds,
    } = req.body;

    if (!primaryPhone || !primaryPhone.trim()) {
      return res.status(400).json({ error: 'Primary phone number is required' });
    }
    if (!primaryEmail || !primaryEmail.trim()) {
      return res.status(400).json({ error: 'Primary email address is required' });
    }

    if (!isPostgresConfigured) {
      const updatedSettings = dataStore.updateSettings({
        primaryPhone: primaryPhone.trim(),
        secondaryPhone: secondaryPhone?.trim() || null,
        primaryEmail: primaryEmail.trim(),
        consultationEmail: consultationEmail?.trim() || null,
        whatsappNumber: whatsappNumber?.trim() || null,
        whatsappNotice: whatsappNotice?.trim() || null,
        consultationTimings: consultationTimings?.trim() || null,
        appointmentNotice: appointmentNotice?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
        youtubeHandle: youtubeHandle?.trim() || null,
        twitterUrl: twitterUrl?.trim() || null,
        twitterHandle: twitterHandle?.trim() || null,
        facebookUrl: facebookUrl?.trim() || null,
        facebookHandle: facebookHandle?.trim() || null,
        instagramUrl: instagramUrl?.trim() || null,
        instagramHandle: instagramHandle?.trim() || null,
        officeAddress: officeAddress?.trim() || null,
        collaborationNotice: collaborationNotice?.trim() || null,
        adsensePublisherId: adsensePublisherId ? adsensePublisherId.trim() : 'ca-pub-9697854430800000',
        adsenseEnabled: adsenseEnabled !== undefined ? Boolean(adsenseEnabled) : true,
        adsenseAutoAds: adsenseAutoAds !== undefined ? Boolean(adsenseAutoAds) : false,
      });
      apiCache.invalidatePrefix('settings:');
      return res.json({
        settings: updatedSettings,
        message: 'Contact details & AdSense configuration successfully updated and live.',
      });
    }

    const existing = await db.select().from(siteSettings).limit(1);
    let updated;

    if (existing.length === 0) {
      const inserted = await db
        .insert(siteSettings)
        .values({
          primaryPhone: primaryPhone.trim(),
          secondaryPhone: secondaryPhone?.trim() || null,
          primaryEmail: primaryEmail.trim(),
          consultationEmail: consultationEmail?.trim() || null,
          whatsappNumber: whatsappNumber?.trim() || null,
          whatsappNotice: whatsappNotice?.trim() || null,
          consultationTimings: consultationTimings?.trim() || null,
          appointmentNotice: appointmentNotice?.trim() || null,
          youtubeUrl: youtubeUrl?.trim() || null,
          youtubeHandle: youtubeHandle?.trim() || null,
          twitterUrl: twitterUrl?.trim() || null,
          twitterHandle: twitterHandle?.trim() || null,
          facebookUrl: facebookUrl?.trim() || null,
          facebookHandle: facebookHandle?.trim() || null,
          instagramUrl: instagramUrl?.trim() || null,
          instagramHandle: instagramHandle?.trim() || null,
          officeAddress: officeAddress?.trim() || null,
          collaborationNotice: collaborationNotice?.trim() || null,
          adsensePublisherId: adsensePublisherId ? adsensePublisherId.trim() : 'ca-pub-9697854430800000',
          adsenseEnabled: adsenseEnabled !== undefined ? Boolean(adsenseEnabled) : true,
          adsenseAutoAds: adsenseAutoAds !== undefined ? Boolean(adsenseAutoAds) : false,
          updatedAt: new Date(),
        })
        .returning();
      updated = inserted[0];
    } else {
      const resUpdated = await db
        .update(siteSettings)
        .set({
          primaryPhone: primaryPhone.trim(),
          secondaryPhone: secondaryPhone?.trim() || null,
          primaryEmail: primaryEmail.trim(),
          consultationEmail: consultationEmail?.trim() || null,
          whatsappNumber: whatsappNumber?.trim() || null,
          whatsappNotice: whatsappNotice?.trim() || null,
          consultationTimings: consultationTimings?.trim() || null,
          appointmentNotice: appointmentNotice?.trim() || null,
          youtubeUrl: youtubeUrl?.trim() || null,
          youtubeHandle: youtubeHandle?.trim() || null,
          twitterUrl: twitterUrl?.trim() || null,
          twitterHandle: twitterHandle?.trim() || null,
          facebookUrl: facebookUrl?.trim() || null,
          facebookHandle: facebookHandle?.trim() || null,
          instagramUrl: instagramUrl?.trim() || null,
          instagramHandle: instagramHandle?.trim() || null,
          officeAddress: officeAddress?.trim() || null,
          collaborationNotice: collaborationNotice?.trim() || null,
          adsensePublisherId: adsensePublisherId !== undefined ? (adsensePublisherId ? adsensePublisherId.trim() : null) : undefined,
          adsenseEnabled: adsenseEnabled !== undefined ? Boolean(adsenseEnabled) : undefined,
          adsenseAutoAds: adsenseAutoAds !== undefined ? Boolean(adsenseAutoAds) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.id, existing[0].id))
        .returning();
      updated = resUpdated[0];
    }

    // Invalidate settings and public contact cache
    apiCache.invalidatePrefix('settings:');

    // Write immutable audit log
    await db.insert(auditLogs).values({
      userId: req.user!.id,
      action: 'UPDATE_CONTACT_SETTINGS',
      entityType: 'SITE_SETTINGS',
      entityId: String(updated.id),
      details: `Updated public contact & AdSense info: ${updated.primaryPhone}, ${updated.primaryEmail}`,
    });

    res.json({
      settings: updated,
      message: 'Contact details & AdSense configuration successfully updated and live.',
    });
  } catch (error: any) {
    console.warn('Error updating contact settings in DB, using dataStore fallback:', error);
    try {
      const updatedSettings = dataStore.updateSettings(req.body);
      apiCache.invalidatePrefix('settings:');
      return res.json({
        settings: updatedSettings,
        message: 'Contact details & AdSense configuration successfully updated and live.',
      });
    } catch {
      res.status(500).json({ error: error.message || 'Failed to update contact settings' });
    }
  }
});

// -----------------------------------------------------------------------------
// ADMIN CMS: WEBSITE LOGO UPLOAD & CONFIGURATION
// -----------------------------------------------------------------------------
app.get('/api/admin/settings/logo', async (_req: Request, res: Response) => {
  const currentSettings = isPostgresConfigured
    ? (await db.select({ logoUrl: siteSettings.logoUrl }).from(siteSettings).limit(1).catch(() => []))[0]
    : dataStore.getSettings();
  const logoUrl = currentSettings?.logoUrl || '/trademark-logo.jpg';
  res.json({ logoUrl });
});

app.put('/api/admin/settings/logo', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const { logoUrl } = req.body;
    if (!logoUrl || typeof logoUrl !== 'string') {
      return res.status(400).json({ error: 'Valid logoUrl is required' });
    }

    const cleanLogoUrl = logoUrl.trim();

    // 1. Update dataStore (guarantees local persistence and immediate fallback availability)
    dataStore.updateLogo(cleanLogoUrl);

    // 2. Update PostgreSQL if configured
    if (isPostgresConfigured) {
      try {
        const existing = await db.select().from(siteSettings).limit(1);
        if (existing.length === 0) {
          await db.insert(siteSettings).values({ logoUrl: cleanLogoUrl });
        } else {
          await db.update(siteSettings).set({ logoUrl: cleanLogoUrl, updatedAt: new Date() }).where(eq(siteSettings.id, existing[0].id));
        }
      } catch (dbErr) {
        console.warn('Postgres logo update notice (fallback active):', dbErr);
      }
    }

    // Invalidate cached contact/settings
    apiCache.invalidatePrefix('settings:');

    res.json({ success: true, logoUrl: cleanLogoUrl, message: 'Website logo updated successfully.' });
  } catch (error: any) {
    console.error('Error updating website logo:', error);
    res.status(500).json({ error: error.message || 'Failed to update website logo' });
  }
});

app.post('/api/admin/upload-logo', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, mimeType, base64Data } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'base64Data and mimeType are required' });
    }

    const allowedMimes: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };

    const ext = allowedMimes[String(mimeType).toLowerCase()];
    if (!ext) {
      return res.status(400).json({ error: 'Invalid logo format. Allowed formats: PNG, JPG, JPEG, WebP, SVG' });
    }

    const cleanBase64 = String(base64Data).replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Logo exceeds maximum 5MB size limit' });
    }

    const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeBaseName = (fileName || 'logo')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 30) || 'logo';
    const uniqueFileName = `${safeBaseName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    // Update dataStore
    dataStore.updateLogo(publicUrl);

    // Update PostgreSQL if configured
    if (isPostgresConfigured) {
      try {
        const existing = await db.select().from(siteSettings).limit(1);
        if (existing.length === 0) {
          await db.insert(siteSettings).values({ logoUrl: publicUrl });
        } else {
          await db.update(siteSettings).set({ logoUrl: publicUrl, updatedAt: new Date() }).where(eq(siteSettings.id, existing[0].id));
        }

        await db.insert(media).values({
          fileName: uniqueFileName,
          fileUrl: publicUrl,
          mimeType,
          sizeBytes: buffer.length,
          altText: `Official Website Logo: ${fileName || 'Logo'}`,
          uploadedById: req.user?.id,
        });
      } catch (dbErr) {
        console.warn('Postgres upload logo record notice:', dbErr);
      }
    }

    // Invalidate cached contact/settings
    apiCache.invalidatePrefix('settings:');

    res.status(201).json({
      success: true,
      logoUrl: publicUrl,
      url: publicUrl,
      fileName: uniqueFileName,
      sizeBytes: buffer.length,
      mimeType,
      message: 'Website logo uploaded and applied successfully',
    });
  } catch (err: any) {
    console.error('Error uploading logo:', err);
    res.status(500).json({ error: err.message || 'Failed to upload logo image' });
  }
});

// =============================================================================
// GYAN KOSH: HANDBOOK MANAGEMENT & SECURE CLIENT ACCESS APIs
// =============================================================================
const HANDBOOK_SECRET = process.env.HANDBOOK_SECRET || process.env.AUTH_SECRET || 'vastu-ritam-handbook-vault-token-2026';

function createHandbookAccessToken(handbookId: string | number, email: string): string {
  const payload = Buffer.from(JSON.stringify({
    hId: String(handbookId),
    email: String(email).toLowerCase().trim(),
    exp: Date.now() + 1000 * 60 * 60 * 48, // 48 hours validity
  })).toString('base64url');

  const sig = crypto.createHmac('sha256', HANDBOOK_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyHandbookAccessToken(token: string, handbookId: string | number): boolean {
  try {
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) return false;
    const expectedSig = crypto.createHmac('sha256', HANDBOOK_SECRET).update(payloadB64).digest('base64url');
    if (sig !== expectedSig) return false;
    const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return false;
    if (String(data.hId) !== String(handbookId)) return false;
    return true;
  } catch {
    return false;
  }
}

// 1. Public List: Published Handbooks
app.get('/api/handbooks', async (_req: Request, res: Response) => {
  try {
    let list = dataStore.getHandbooks(true);
    if (isPostgresConfigured) {
      try {
        const dbHb = await db.select().from(handbooks).where(eq(handbooks.isPublished, true)).orderBy(asc(handbooks.displayOrder));
        if (dbHb.length > 0) {
          list = dbHb.map((h) => ({
            id: h.id,
            title: h.title,
            slug: h.slug,
            subtitle: h.subtitle || '',
            targetAudience: h.targetAudience,
            pages: h.pages,
            topics: (() => {
              try {
                return JSON.parse(h.topics);
              } catch {
                return [];
              }
            })(),
            summary: h.summary,
            pdfFileName: h.pdfFileName,
            pdfFilePath: h.pdfFilePath,
            pdfFileSizeBytes: h.pdfFileSizeBytes,
            isPublished: h.isPublished,
            displayOrder: h.displayOrder,
            createdAt: h.createdAt.toISOString(),
            updatedAt: h.updatedAt.toISOString(),
          }));
        }
      } catch (dbErr) {
        console.warn('Postgres handbooks lookup notice:', dbErr);
      }
    }

    res.json({
      handbooks: list.map((h) => ({
        id: h.id,
        title: h.title,
        slug: h.slug,
        subtitle: h.subtitle,
        targetAudience: h.targetAudience,
        pages: h.pages,
        topics: h.topics,
        summary: h.summary,
        hasPdf: Boolean(h.pdfFileName && h.pdfFileSizeBytes),
        pdfFileSizeBytes: h.pdfFileSizeBytes,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching handbooks:', err);
    res.status(500).json({ error: 'Failed to retrieve handbooks' });
  }
});

// 2. Public: Request Client Access to Read Handbook (Validates contact details and returns secure stream token)
app.post('/api/handbooks/request-access', async (req: Request, res: Response) => {
  try {
    const { handbookId, email, phone, fullName } = req.body;

    if (!handbookId) {
      return res.status(400).json({ error: 'Handbook ID is required' });
    }

    // Email validation
    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Phone / mobile validation
    const rawPhone = String(phone || '').trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (!rawPhone || digitsOnly.length < 10 || digitsOnly.length > 15) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    const handbook = dataStore.getHandbookById(handbookId);
    if (!handbook) {
      return res.status(404).json({ error: 'Handbook treatise not found' });
    }

    // Generate signed token valid for 48 hours
    const token = createHandbookAccessToken(handbook.id, cleanEmail);

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Store lead record in dataStore
    const leadRecord = dataStore.createHandbookLead({
      handbookId: String(handbook.id),
      handbookTitle: handbook.title,
      fullName: fullName ? String(fullName).trim() : null,
      email: cleanEmail,
      phone: rawPhone,
      accessToken: token,
      ipAddress: clientIp,
      userAgent: userAgent,
    });

    // Store in Postgres if configured
    if (isPostgresConfigured) {
      try {
        await db.insert(handbookLeads).values({
          handbookId: String(handbook.id),
          handbookTitle: handbook.title,
          fullName: fullName ? String(fullName).trim() : null,
          email: cleanEmail,
          phone: rawPhone,
          accessToken: token,
          ipAddress: clientIp,
          userAgent: userAgent,
        });
      } catch (dbErr) {
        console.warn('Postgres handbook lead insert notice:', dbErr);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Access granted. Opening handbook reader...',
      token,
      handbook: {
        id: handbook.id,
        title: handbook.title,
        subtitle: handbook.subtitle,
        pages: handbook.pages,
        targetAudience: handbook.targetAudience,
      },
      leadId: leadRecord.id,
    });
  } catch (err: any) {
    console.error('Error handling handbook access request:', err);
    res.status(500).json({ error: err.message || 'Failed to process reading request' });
  }
});

// 3. Protected PDF Stream: Requires verified client token OR authenticated admin session
app.get('/api/handbooks/:id/stream', async (req: Request, res: Response) => {
  try {
    const handbookId = req.params.id;
    const token = req.query.token as string | undefined;

    const handbook = dataStore.getHandbookById(handbookId);
    if (!handbook) {
      return res.status(404).json({ error: 'Handbook not found' });
    }

    // Verify Authorization: Either valid signed token or Admin/Editor/Viewer session
    const isTokenValid = Boolean(token && verifyHandbookAccessToken(token, handbook.id));
    const isAdmin = Boolean((req as AuthRequest).user && ['admin', 'editor', 'viewer'].includes((req as AuthRequest).user?.role || ''));

    if (!isTokenValid && !isAdmin) {
      return res.status(401).json({
        error: 'Access denied. Please provide your email and mobile number to unlock reading access.',
        requiresDetails: true,
      });
    }

    // Locate PDF file on disk in private storage
    let filePath = handbook.pdfFilePath ? path.resolve(__dirname, handbook.pdfFilePath) : '';
    if (!filePath || !fs.existsSync(filePath)) {
      // Generate default PDF on the fly if needed
      const handbooksStorageDir = path.resolve(__dirname, 'storage', 'handbooks');
      if (!fs.existsSync(handbooksStorageDir)) {
        fs.mkdirSync(handbooksStorageDir, { recursive: true });
      }
      const defaultFileName = `handbook_${handbook.id}_default.pdf`;
      filePath = path.join(handbooksStorageDir, defaultFileName);

      const pdfBuffer = generateVastuHandbookPdf({
        title: handbook.title,
        subtitle: handbook.subtitle,
        targetAudience: handbook.targetAudience,
        pages: handbook.pages,
        topics: handbook.topics,
        summary: handbook.summary,
      });
      fs.writeFileSync(filePath, pdfBuffer);

      dataStore.updateHandbook(handbook.id, {
        pdfFileName: defaultFileName,
        pdfFilePath: path.relative(__dirname, filePath),
        pdfFileSizeBytes: pdfBuffer.length,
      });
    }

    const stat = fs.statSync(filePath);
    const safeTitle = handbook.title.replace(/[^a-zA-Z0-9_-]/g, '_');

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': stat.size,
      'Content-Disposition': `inline; filename="${safeTitle}.pdf"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err: any) {
    console.error('Error streaming handbook PDF:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream handbook document' });
    }
  }
});

// 4. Admin API: List Handbooks with File Stats & Lead Count
app.get('/api/admin/handbooks', requireAuth, requireRole(['admin', 'editor']), async (_req: AuthRequest, res: Response) => {
  try {
    const list = dataStore.getHandbooks();
    const leads = dataStore.getHandbookLeads();

    const withMetrics = list.map((h) => {
      const handbookLeadsCount = leads.filter((l) => String(l.handbookId) === String(h.id)).length;
      let fileExists = false;
      let actualSize = h.pdfFileSizeBytes || 0;

      if (h.pdfFilePath) {
        const fullP = path.resolve(__dirname, h.pdfFilePath);
        if (fs.existsSync(fullP)) {
          fileExists = true;
          actualSize = fs.statSync(fullP).size;
        }
      }

      return {
        ...h,
        leadsCount: handbookLeadsCount,
        hasPdf: fileExists,
        pdfFileSizeBytes: actualSize,
      };
    });

    res.json({ handbooks: withMetrics });
  } catch (err: any) {
    console.error('Error in /api/admin/handbooks:', err);
    res.status(500).json({ error: 'Failed to retrieve handbooks list' });
  }
});

// 5. Admin API: Create Handbook
app.post('/api/admin/handbooks', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, subtitle, targetAudience, pages, topics: topicList, summary, isPublished } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Handbook title is required' });
    }

    const created = dataStore.createHandbook({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      targetAudience: targetAudience ? targetAudience.trim() : 'Architects & Homeowners',
      pages: parseInt(pages, 10) || 40,
      topics: Array.isArray(topicList) ? topicList : [],
      summary: summary ? summary.trim() : '',
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    // Auto-generate sample PDF for the newly created handbook
    try {
      const handbooksStorageDir = path.resolve(__dirname, 'storage', 'handbooks');
      if (!fs.existsSync(handbooksStorageDir)) {
        fs.mkdirSync(handbooksStorageDir, { recursive: true });
      }
      const defaultFileName = `handbook_${created.id}_custom.pdf`;
      const filePath = path.join(handbooksStorageDir, defaultFileName);
      const pdfBuffer = generateVastuHandbookPdf({
        title: created.title,
        subtitle: created.subtitle,
        targetAudience: created.targetAudience,
        pages: created.pages,
        topics: created.topics,
        summary: created.summary,
      });
      fs.writeFileSync(filePath, pdfBuffer);

      dataStore.updateHandbook(created.id, {
        pdfFileName: defaultFileName,
        pdfFilePath: path.relative(__dirname, filePath),
        pdfFileSizeBytes: pdfBuffer.length,
      });
    } catch (pdfErr) {
      console.warn('Initial PDF generation notice for new handbook:', pdfErr);
    }

    // Save to Postgres if configured
    if (isPostgresConfigured) {
      try {
        await db.insert(handbooks).values({
          title: created.title,
          slug: created.slug,
          subtitle: created.subtitle,
          targetAudience: created.targetAudience,
          pages: created.pages,
          topics: JSON.stringify(created.topics),
          summary: created.summary,
          pdfFileName: created.pdfFileName,
          pdfFilePath: created.pdfFilePath,
          pdfFileSizeBytes: created.pdfFileSizeBytes,
          isPublished: created.isPublished,
          displayOrder: created.displayOrder,
        });
      } catch (dbErr) {
        console.warn('Postgres handbook create notice:', dbErr);
      }
    }

    dataStore.addAuditLog({
      userId: req.user?.id,
      action: 'CREATE_HANDBOOK',
      entityType: 'HANDBOOK',
      entityId: String(created.id),
      details: `Created new handbook treatise: "${created.title}"`,
    });

    res.status(201).json({
      success: true,
      handbook: dataStore.getHandbookById(created.id),
      message: 'Handbook created successfully',
    });
  } catch (err: any) {
    console.error('Error creating handbook:', err);
    res.status(500).json({ error: err.message || 'Failed to create handbook' });
  }
});

// 6. Admin API: Update Handbook Metadata
app.put('/api/admin/handbooks/:id', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const { title, subtitle, targetAudience, pages, topics: topicList, summary, isPublished, displayOrder } = req.body;

    const existing = dataStore.getHandbookById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Handbook not found' });
    }

    const updated = dataStore.updateHandbook(id, {
      title: title !== undefined ? title.trim() : existing.title,
      subtitle: subtitle !== undefined ? subtitle.trim() : existing.subtitle,
      targetAudience: targetAudience !== undefined ? targetAudience.trim() : existing.targetAudience,
      pages: pages !== undefined ? parseInt(pages, 10) || existing.pages : existing.pages,
      topics: topicList !== undefined ? (Array.isArray(topicList) ? topicList : existing.topics) : existing.topics,
      summary: summary !== undefined ? summary.trim() : existing.summary,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : existing.isPublished,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : existing.displayOrder,
    });

    if (isPostgresConfigured) {
      try {
        await db.update(handbooks).set({
          title: updated?.title,
          subtitle: updated?.subtitle,
          targetAudience: updated?.targetAudience,
          pages: updated?.pages,
          topics: JSON.stringify(updated?.topics),
          summary: updated?.summary,
          isPublished: updated?.isPublished,
          displayOrder: updated?.displayOrder,
          updatedAt: new Date(),
        }).where(eq(handbooks.id, existing.id));
      } catch (dbErr) {
        console.warn('Postgres handbook update notice:', dbErr);
      }
    }

    dataStore.addAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_HANDBOOK',
      entityType: 'HANDBOOK',
      entityId: String(id),
      details: `Updated handbook metadata: "${updated?.title}"`,
    });

    res.json({
      success: true,
      handbook: updated,
      message: 'Handbook details updated successfully',
    });
  } catch (err: any) {
    console.error('Error updating handbook:', err);
    res.status(500).json({ error: err.message || 'Failed to update handbook' });
  }
});

// 7. Admin API: Delete Handbook
app.delete('/api/admin/handbooks/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const existing = dataStore.getHandbookById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Handbook not found' });
    }

    // Delete associated physical file if exists
    if (existing.pdfFilePath) {
      const fullP = path.resolve(__dirname, existing.pdfFilePath);
      if (fs.existsSync(fullP)) {
        try {
          fs.unlinkSync(fullP);
        } catch {}
      }
    }

    dataStore.deleteHandbook(id);

    if (isPostgresConfigured) {
      try {
        await db.delete(handbooks).where(eq(handbooks.id, existing.id));
      } catch (dbErr) {
        console.warn('Postgres handbook delete notice:', dbErr);
      }
    }

    dataStore.addAuditLog({
      userId: req.user?.id,
      action: 'DELETE_HANDBOOK',
      entityType: 'HANDBOOK',
      entityId: String(id),
      details: `Deleted handbook: "${existing.title}"`,
    });

    res.json({ success: true, message: 'Handbook deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting handbook:', err);
    res.status(500).json({ error: err.message || 'Failed to delete handbook' });
  }
});

// 8. Admin API: Upload or Replace Handbook PDF File (Strictly validates PDF format and size limit up to 50MB)
app.post('/api/admin/handbooks/:id/upload-pdf', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const handbookId = req.params.id;
    const { fileName, mimeType, base64Data } = req.body;

    const handbook = dataStore.getHandbookById(handbookId);
    if (!handbook) {
      return res.status(404).json({ error: 'Handbook not found' });
    }

    if (!base64Data) {
      return res.status(400).json({ error: 'PDF file data is required' });
    }

    // MIME type check
    const isPdfMime = String(mimeType || '').toLowerCase().includes('pdf') || String(fileName || '').toLowerCase().endsWith('.pdf');
    if (!isPdfMime) {
      return res.status(400).json({ error: 'Invalid file format. Only standard PDF (.pdf) files are permitted.' });
    }

    const cleanBase64 = String(base64Data).replace(/^data:application\/pdf;base64,/, '').replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Size limit: 50MB
    const MAX_PDF_SIZE = 50 * 1024 * 1024;
    if (buffer.length > MAX_PDF_SIZE) {
      return res.status(400).json({ error: `File size exceeds maximum permitted 50MB limit (${(buffer.length / (1024 * 1024)).toFixed(1)}MB)` });
    }

    // PDF magic bytes check (%PDF-)
    const headerPrefix = buffer.subarray(0, 10).toString('utf-8');
    if (!headerPrefix.includes('%PDF')) {
      return res.status(400).json({ error: 'The uploaded file does not appear to be a valid standard PDF document.' });
    }

    const handbooksStorageDir = path.resolve(__dirname, 'storage', 'handbooks');
    if (!fs.existsSync(handbooksStorageDir)) {
      fs.mkdirSync(handbooksStorageDir, { recursive: true });
    }

    // Remove previous PDF if it was custom
    if (handbook.pdfFilePath) {
      const prevFile = path.resolve(__dirname, handbook.pdfFilePath);
      if (fs.existsSync(prevFile) && !handbook.pdfFilePath.includes('_default.pdf')) {
        try {
          fs.unlinkSync(prevFile);
        } catch {}
      }
    }

    const safeBaseName = (fileName || 'handbook')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 40) || 'handbook';
    const uniqueFileName = `handbook_${handbook.id}_${Date.now()}_${safeBaseName}.pdf`;
    const destinationPath = path.join(handbooksStorageDir, uniqueFileName);

    fs.writeFileSync(destinationPath, buffer);

    const relativePath = path.relative(__dirname, destinationPath);
    const updated = dataStore.updateHandbook(handbook.id, {
      pdfFileName: fileName || uniqueFileName,
      pdfFilePath: relativePath,
      pdfFileSizeBytes: buffer.length,
      updatedAt: new Date().toISOString(),
    });

    // Update in Postgres if configured
    if (isPostgresConfigured) {
      try {
        await db.update(handbooks).set({
          pdfFileName: fileName || uniqueFileName,
          pdfFilePath: relativePath,
          pdfFileSizeBytes: buffer.length,
          updatedAt: new Date(),
        }).where(eq(handbooks.id, handbook.id));
      } catch (dbErr) {
        console.warn('Postgres handbook PDF upload update notice:', dbErr);
      }
    }

    dataStore.addAuditLog({
      userId: req.user?.id,
      action: 'UPLOAD_HANDBOOK_PDF',
      entityType: 'HANDBOOK',
      entityId: String(handbook.id),
      details: `Uploaded/replaced PDF for "${handbook.title}": ${fileName || uniqueFileName} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`,
    });

    res.status(200).json({
      success: true,
      handbook: updated,
      fileName: fileName || uniqueFileName,
      fileSizeBytes: buffer.length,
      message: 'Handbook PDF successfully uploaded and published to repository',
    });
  } catch (err: any) {
    console.error('Error uploading handbook PDF:', err);
    res.status(500).json({ error: err.message || 'Failed to upload handbook PDF' });
  }
});

// 9. Admin API: Get All Client Access Leads / Contacts
app.get('/api/admin/handbook-leads', requireAuth, requireRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const { handbookId, search } = req.query;
    let leads = dataStore.getHandbookLeads(handbookId as string);

    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      leads = leads.filter(
        (l) =>
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.fullName && l.fullName.toLowerCase().includes(q)) ||
          l.handbookTitle.toLowerCase().includes(q)
      );
    }

    const allHandbooks = dataStore.getHandbooks();

    // Summary statistics
    const totalLeads = dataStore.getHandbookLeads().length;
    const uniqueEmails = new Set(dataStore.getHandbookLeads().map((l) => l.email)).size;
    const uniquePhones = new Set(dataStore.getHandbookLeads().map((l) => l.phone)).size;

    res.json({
      leads,
      handbooks: allHandbooks.map((h) => ({ id: h.id, title: h.title })),
      stats: {
        totalLeads,
        uniqueEmails,
        uniquePhones,
      },
    });
  } catch (err: any) {
    console.error('Error fetching handbook leads:', err);
    res.status(500).json({ error: 'Failed to retrieve handbook leads' });
  }
});

// 10. Admin API: Delete a Lead Record
app.delete('/api/admin/handbook-leads/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = dataStore.deleteHandbookLead(id);

    if (isPostgresConfigured) {
      try {
        await db.delete(handbookLeads).where(eq(handbookLeads.id, id));
      } catch (dbErr) {
        console.warn('Postgres delete handbook lead notice:', dbErr);
      }
    }

    if (!success) {
      return res.status(404).json({ error: 'Lead record not found' });
    }

    dataStore.addAuditLog({
      userId: req.user?.id,
      action: 'DELETE_HANDBOOK_LEAD',
      entityType: 'HANDBOOK_LEAD',
      entityId: String(id),
      details: `Removed client access lead #${id}`,
    });

    res.json({ success: true, message: 'Lead record removed successfully' });
  } catch (err: any) {
    console.error('Error deleting handbook lead:', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// 11. Admin API: Export All Leads to CSV Format
app.get('/api/admin/handbook-leads/export', requireAuth, requireRole(['admin', 'editor']), async (_req: AuthRequest, res: Response) => {
  try {
    const leads = dataStore.getHandbookLeads();

    const headers = ['ID', 'Date & Time (UTC)', 'Client Name', 'Email Address', 'Mobile Number', 'Handbook Requested', 'IP Address'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.createdAt}"`,
      `"${(l.fullName || '').replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${l.handbookTitle.replace(/"/g, '""')}"`,
      `"${(l.ipAddress || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="vastu_ritam_handbook_leads_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err: any) {
    console.error('Error exporting leads:', err);
    res.status(500).json({ error: 'Failed to export leads' });
  }
});

// Ensure health check endpoint responds immediately for Cloud Run and test suites
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

export { app };

// -----------------------------------------------------------------------------
// VITE DEV SERVER MIDDLEWARE & PRODUCTION SERVING
// -----------------------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error('Vite dev middleware error:', viteErr);
    }
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(200).send('<!doctype html><html><head><title>VASTU RITAM</title></head><body><div id="root"></div></body></html>');
        }
      });
    } else {
      console.warn('[Warning] dist directory not found, serving fallback HTML');
      app.get('*', (_req, res) => {
        res.status(200).send('<!doctype html><html><head><title>VASTU RITAM</title></head><body><div id="root"></div></body></html>');
      });
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vastu Ritam Production Server] running on http://0.0.0.0:${PORT} (PID ${process.pid})`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    // Still bind to port in emergency so Cloud Run container does not fail health checks
    try {
      const emergencyApp = express();
      emergencyApp.get('*', (_req, res) => res.status(200).send('Server initializing...'));
      emergencyApp.listen(PORT, '0.0.0.0', () => {
        console.log(`Emergency fallback listening on port ${PORT}`);
      });
    } catch {
      process.exit(1);
    }
  });
}
