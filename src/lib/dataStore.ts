import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_STORE_PATH = path.resolve(process.cwd(), 'data-store.json');

export interface StoredArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categoryId: number | null;
  categoryName?: string;
  categorySlug?: string;
  authorId?: number;
  authorName?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  readingTimeMinutes: number;
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  topics?: Array<{ id: number; name: string; slug: string }>;
  keywords?: Array<{ id: number; name: string; slug: string }>;
}

export interface StoredTopic {
  id: number;
  name: string;
  slug: string;
  sanskritName: string;
  entityType: 'concept' | 'direction' | 'deity' | 'text' | 'remedy';
  summary: string;
  description?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  metaTitle?: string;
  metaDescription?: string;
  displayOrder: number;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredVideo {
  id: number;
  title: string;
  slug: string;
  videoUrl: string;
  videoPlatform: 'youtube' | 'vimeo';
  videoId: string;
  embedUrl: string;
  thumbnailUrl?: string;
  description: string;
  durationSeconds?: number;
  categoryId: number | null;
  categoryName?: string;
  categorySlug?: string;
  topicId?: number | null;
  topicName?: string;
  topicSlug?: string;
  status: 'draft' | 'published' | 'unpublished';
  displayOrder: number;
  viewCount: number;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSiteSettings {
  id: number;
  primaryPhone: string;
  secondaryPhone: string | null;
  primaryEmail: string;
  consultationEmail: string | null;
  whatsappNumber: string | null;
  whatsappNotice: string | null;
  consultationTimings: string | null;
  appointmentNotice: string | null;
  youtubeUrl: string | null;
  youtubeHandle: string | null;
  twitterUrl: string | null;
  twitterHandle: string | null;
  facebookUrl: string | null;
  facebookHandle: string | null;
  instagramUrl: string | null;
  instagramHandle: string | null;
  officeAddress: string | null;
  collaborationNotice: string | null;
  logoUrl: string | null;
  adsensePublisherId: string | null;
  adsenseEnabled: boolean;
  adsenseAutoAds: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredUser {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: 'admin' | 'editor' | 'viewer';
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredKeyword {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface StoredAd {
  id: number;
  title: string;
  imageUrl: string;
  destinationUrl: string;
  placement: string;
  adType: string;
  adSenseSlot?: string | null;
  adSenseFormat?: string;
  customHtml?: string | null;
  isActive: boolean;
  priority: number;
  startDate?: string | null;
  endDate?: string | null;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredMedia {
  id: number;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  uploadedById?: number;
  createdAt: string;
}

export interface StoredAuditLog {
  id: number;
  userId?: number;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface StoredHandbook {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  targetAudience: string;
  pages: number;
  topics: string[];
  summary: string;
  pdfFileName?: string | null;
  pdfFilePath?: string | null;
  pdfFileSizeBytes?: number | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredHandbookLead {
  id: number;
  handbookId: string;
  handbookTitle: string;
  fullName?: string | null;
  email: string;
  phone: string;
  accessToken?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface DataStoreState {
  articles: StoredArticle[];
  topics: StoredTopic[];
  categories: StoredCategory[];
  videos: StoredVideo[];
  settings: StoredSiteSettings;
  users: StoredUser[];
  keywords: StoredKeyword[];
  ads: StoredAd[];
  media: StoredMedia[];
  auditLogs: StoredAuditLog[];
  handbooks: StoredHandbook[];
  handbookLeads: StoredHandbookLead[];
}

class PersistentDataStore {
  private state: DataStoreState;

  constructor() {
    this.state = this.loadInitialData();
  }

  private loadInitialData(): DataStoreState {
    if (fs.existsSync(DATA_STORE_PATH)) {
      try {
        const raw = fs.readFileSync(DATA_STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.articles && parsed.categories && parsed.settings) {
          if (!parsed.handbooks || !Array.isArray(parsed.handbooks) || parsed.handbooks.length === 0) {
            parsed.handbooks = this.generateInitialHandbooks();
            this.saveToDisk(parsed);
          }
          if (!parsed.handbookLeads || !Array.isArray(parsed.handbookLeads)) {
            parsed.handbookLeads = [];
            this.saveToDisk(parsed);
          }
          return parsed;
        }
      } catch (err) {
        console.warn('Error reading data-store.json, creating initial store:', err);
      }
    }

    const initial = this.generateInitialData();
    this.saveToDisk(initial);
    return initial;
  }

  private generateInitialData(): DataStoreState {
    const adminHash = bcrypt.hashSync('VastuAdmin2026!', 10);
    const scholarHash = bcrypt.hashSync('VastuScholar2026!', 10);
    const now = new Date().toISOString();

    const categories: StoredCategory[] = [
      {
        id: 1,
        name: 'Classical Vastu Vidya',
        slug: 'classical-vastu-vidya',
        description: 'Foundational canons and architectural principles from Samarāṅgaṇa Sūtradhāra, Mayamatam, and Mānasāra.',
        icon: 'BookOpen',
        metaTitle: 'Classical Vastu Vidya - Ancient Architectural Shastras',
        metaDescription: 'Explore canonical Vedic treatises, geometric proportions, and spatial harmonics from authentic manuscripts.',
        displayOrder: 1,
        articleCount: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Spiritual Knowledge',
        slug: 'spiritual-knowledge',
        description: 'Cosmic energies, presiding deities (Devatas), and metaphysical laws governing the subtle field of dwellings.',
        icon: 'Sun',
        metaTitle: 'Spiritual Knowledge & Metaphysical Vastu',
        metaDescription: 'Deities, cosmic consciousness, and sacred orientation according to Vedic cosmology.',
        displayOrder: 2,
        articleCount: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'Architectural Harmony',
        slug: 'architectural-harmony',
        description: 'Harmonising structural engineering, natural light, cross-ventilation, and sacred geometry.',
        icon: 'Compass',
        metaTitle: 'Architectural Harmony & Natural Ventilation',
        metaDescription: 'How traditional courtyard systems and spatial orientation enhance modern building design.',
        displayOrder: 3,
        articleCount: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: 'Contemporary Space Solutions',
        slug: 'contemporary-space-solutions',
        description: 'Non-demolition remedies, urban apartments, corporate offices, and modern interior alignments.',
        icon: 'Building',
        metaTitle: 'Contemporary Space Solutions & Non-Demolition Vastu',
        metaDescription: 'Applying classical principles in modern urban apartments and commercial workspaces.',
        displayOrder: 4,
        articleCount: 2,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const topics: StoredTopic[] = [
      {
        id: 1,
        name: 'Vastu Purusha Mandala',
        slug: 'vastu-purusha-mandala',
        sanskritName: 'वास्तु पुरुष मण्डल',
        entityType: 'concept',
        summary: 'The metaphysical cosmic diagram and spatial grid upon which all sacred and domestic architecture is planned.',
        description: 'The Vastu Purusha Mandala is the foundational grid of classical architectural design, integrating directional deities, elemental energies, and cosmological geometry into building orientation.',
        imageUrl: '/emblem-circle.png',
        metaTitle: 'Vastu Purusha Mandala - The Sacred Cosmic Grid',
        metaDescription: 'Detailed explanation of the 81-grid Paramashayika and 64-grid Manduka mandalas in classical Vastu.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Brahmasthana',
        slug: 'brahmasthana',
        sanskritName: 'ब्रह्मस्थान',
        entityType: 'concept',
        summary: 'The luminous center of the dwelling or plot, governed by Lord Brahma (the creative source), representing Space/Ether.',
        description: 'In traditional Indian architecture, the Brahmasthana is kept open to the sky as a central courtyard (Angana), facilitating natural cooling, ventilation, and meditative tranquility.',
        imageUrl: '/hero-sanctuary.jpg',
        metaTitle: 'Brahmasthana - The Luminous Heart of Architecture',
        metaDescription: 'Why the central courtyard void acts as a thermodynamic chimney and energetic center of dwellings.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'Ishanya (North-East)',
        slug: 'ishanya-north-east',
        sanskritName: 'ईशान्य',
        entityType: 'direction',
        summary: 'The North-East directional quadrant ruled by Ishana, associated with the Water element and solar prana.',
        description: 'Associated with morning ultraviolet solar rays, mental clarity, meditation rooms, and water bodies.',
        imageUrl: '/heaven-portal.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: 'Agneya (South-East)',
        slug: 'agneya-south-east',
        sanskritName: 'आग्नेय',
        entityType: 'direction',
        summary: 'The South-East directional quadrant ruled by Agni Deva, governing metabolic energy, culinary fire, and vigor.',
        description: 'Governs culinary fire, electrical transformers, and metabolic vitality.',
        imageUrl: '/hero-sanctuary.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        name: 'Nairutya (South-West)',
        slug: 'nairutya-south-west',
        sanskritName: 'नैऋत्य',
        entityType: 'direction',
        summary: 'The South-West quadrant governed by Nirriti and corresponding to the Earth element, signifying stability and strength.',
        description: 'Governs structural stability, master bedrooms, and heavy load storage.',
        imageUrl: '/emblem-circle.png',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        name: 'Vayavya (North-West)',
        slug: 'vayavya-north-west',
        sanskritName: 'वायव्य',
        entityType: 'direction',
        summary: 'The North-West quadrant ruled by Vayu and associated with the Air element, movement, and commerce.',
        description: 'Governs air movement, finished goods dispatch, and guest accommodation.',
        imageUrl: '/heaven-portal.jpg',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const articles: StoredArticle[] = [
      {
        id: 1,
        title: 'Understanding Before Remedies: Reclaiming Classical Vastu From Modern Superstition',
        slug: 'understanding-before-remedies',
        excerpt: 'Why installing commercial pyramids and yantras without understanding spatial physics creates psychological dependency rather than genuine harmony.',
        content: `In contemporary practice, Vastu has frequently been reduced to fear-based commodification. Property owners are told that minor directional deviations will cause catastrophic failure unless they purchase expensive metallic items or tear down load-bearing walls.

At Vastu Ritam, we return to the root texts: Mayamatam, Manasara, and Samarangana Sutradhara. The ancient Acharyas were master architects, town planners, and environmental physicists. They understood solar angles, earth magnetic fluxes, prevailing wind directions, and thermodynamic air circulation.

When we understand WHY a kitchen is placed in Agneya (South-East)—to harness ultraviolet morning rays for kitchen sanitation while preventing infrared afternoon heat from spoiling stored grains—we realize that solutions should begin with architectural intelligence, not blind panic.`,
        featuredImage: '/hero-sanctuary.jpg',
        categoryId: 1,
        categoryName: 'Classical Vastu Vidya',
        categorySlug: 'classical-vastu-vidya',
        authorName: 'Vastu Ritam Research Desk',
        status: 'published',
        metaTitle: 'Understanding Before Remedies: Classical Vastu vs Superstition',
        metaDescription: 'Reclaiming authentic classical Vastu principles from fear-driven commercial remedies.',
        readingTimeMinutes: 7,
        viewsCount: 420,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        topics: [{ id: 1, name: 'Vastu Purusha Mandala', slug: 'vastu-purusha-mandala' }],
      },
      {
        id: 2,
        title: 'The Brahmasthana: The Luminous Heart of Spatial Architecture',
        slug: 'the-brahmasthana-luminous-heart',
        excerpt: 'An analytical study of central void spaces in traditional Indian courtyards and their thermodynamic cooling efficacy.',
        content: `The Brahmasthana represents the geometric and energetic center of any built form. In traditional Indian domestic architecture, known as Nalukettu in Kerala, Wada in Maharashtra, or Haveli in Rajasthan, this space was left open to the sky as a central courtyard (Angana).

Modern environmental engineering now validates what classical texts stated thousands of years ago: the open center creates a natural stack effect. As ambient indoor air warms up during daytime occupancy, it rises and escapes through the central courtyard, drawing cool air from perimeter shaded gardens.

When modern developers place elevator shafts, heavy RCC shear walls, or drainage stacks in this exact center, both acoustic tranquility and thermal airflow are severely compromised.`,
        featuredImage: '/heaven-portal.jpg',
        categoryId: 3,
        categoryName: 'Architectural Harmony',
        categorySlug: 'architectural-harmony',
        authorName: 'Ph.D. Research Scholar',
        status: 'published',
        metaTitle: 'The Brahmasthana: The Luminous Heart of Spatial Architecture',
        metaDescription: 'Thermodynamics, courtyard design, and cosmic center of classical dwellings.',
        readingTimeMinutes: 9,
        viewsCount: 310,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        topics: [{ id: 2, name: 'Brahmasthana', slug: 'brahmasthana' }],
      },
      {
        id: 3,
        title: 'The Geometry of the Mandala: The 81-Grid Paramashayika Explained',
        slug: 'the-geometry-of-the-mandala',
        excerpt: 'Deconstructing the mathematical allocations of 45 deities within the sacred architectural matrix.',
        content: `The Paramashayika Mandala is an 81-square grid (9x9) utilized for residential and municipal planning. Within this grid, 32 deities occupy the external perimeter (Padadevatas) governing environmental interfaces, while 13 deities govern internal sectors.

Each deity corresponds to a specific qualitative energy of nature. For instance, Parjanya represents rain and gentle moisture, Varuna represents oceanic depths and liquidity, and Yama represents disciplined mortality and resting cycles. Understanding these allocations allows contemporary architects to align functional programming (HVAC, server rooms, bedrooms, water storage) with classical energetic alignments.`,
        featuredImage: '/palm-leaf-texture.jpg',
        categoryId: 2,
        categoryName: 'Spiritual Knowledge',
        categorySlug: 'spiritual-knowledge',
        authorName: 'Vastu Ritam Academic Council',
        status: 'published',
        metaTitle: 'The Geometry of the Mandala: 81-Grid Paramashayika',
        metaDescription: 'Mathematical and metaphysical grid of the sacred architectural mandala.',
        readingTimeMinutes: 11,
        viewsCount: 535,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        topics: [{ id: 1, name: 'Vastu Purusha Mandala', slug: 'vastu-purusha-mandala' }],
      },
    ];

    const settings: StoredSiteSettings = {
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
      adsensePublisherId: 'ca-pub-9697854430800000',
      adsenseEnabled: true,
      adsenseAutoAds: false,
      createdAt: now,
      updatedAt: now,
    };

    const users: StoredUser[] = [
      {
        id: 1,
        uid: 'admin_vr_master_uid',
        email: 'admin@vasturitam.com',
        displayName: 'Vastu Ritam Acharya',
        passwordHash: adminHash,
        role: 'admin',
        avatarUrl: '/trademark-logo.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        uid: 'scholar_vr_editor_uid',
        email: 'scholar@vasturitam.com',
        displayName: 'Vedic Shastra Scholar',
        passwordHash: scholarHash,
        role: 'editor',
        avatarUrl: '/trademark-logo.jpg',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const keywords: StoredKeyword[] = [
      { id: 1, name: 'Vastu Vidya', slug: 'vastu-vidya', description: 'Classical architectural canon', createdAt: now },
      { id: 2, name: 'Brahmasthana', slug: 'brahmasthana', description: 'Central courtyard void', createdAt: now },
      { id: 3, name: 'Mandala', slug: 'mandala', description: 'Sacred spatial diagram', createdAt: now },
      { id: 4, name: 'Paramashayika', slug: 'paramashayika', description: '81-square layout matrix', createdAt: now },
    ];

    const videos: StoredVideo[] = [
      {
        id: 1,
        title: 'Samarāṅgaṇa Sūtradhāra: The Foundations of Classical Space Planning',
        slug: 'samarangana-sutradhara-foundations',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoPlatform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/hero-sanctuary.jpg',
        description: 'A scholarly breakdown of King Bhoja’s 11th-century encyclopedic treatise on town planning, mechanical devices, and architectural proportioning.',
        durationSeconds: 1540,
        categoryId: 1,
        categoryName: 'Classical Vastu Vidya',
        categorySlug: 'classical-vastu-vidya',
        topicId: 1,
        topicName: 'Vastu Purusha Mandala',
        topicSlug: 'vastu-purusha-mandala',
        status: 'published',
        displayOrder: 1,
        viewCount: 384,
        isFeatured: true,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ];

    return {
      articles,
      topics,
      categories,
      videos,
      settings,
      users,
      keywords,
      ads: [],
      media: [],
      auditLogs: [],
      handbooks: this.generateInitialHandbooks(),
      handbookLeads: [],
    };
  }

  private generateInitialHandbooks(): StoredHandbook[] {
    const now = new Date().toISOString();
    return [
      {
        id: 1,
        title: 'Vastu for Contemporary Architects',
        slug: 'vastu-for-contemporary-architects',
        subtitle: 'A Field Guide to Seamless Integration with Modern CAD & BIM Workflows',
        targetAudience: 'Architects & Urban Planners',
        pages: 48,
        topics: [
          'Solar Vector Mapping',
          'Brahmasthan in Multi-Story Apartments',
          'Façade Openings vs Dik-Bala',
          'Non-Destructive Layout Optimization',
        ],
        summary:
          'Written specifically for registered architects who want to respect client Vastu sentiments while preserving aesthetic integrity and building code compliance.',
        pdfFileName: 'sample_handbook_1.pdf',
        pdfFilePath: 'storage/handbooks/handbook_1_default.pdf',
        pdfFileSizeBytes: 18450,
        isPublished: true,
        displayOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: "The Informed Homebuyer's Vastu Checklist",
        slug: 'informed-homebuyers-vastu-checklist',
        subtitle: 'What to Observe Before Signing Property Deeds',
        targetAudience: 'Home Buyers & Real Estate Investors',
        pages: 36,
        topics: [
          'Evaluating Main Entrance Pada',
          'Slope & Drainage Verification',
          'Surrounding Negative Structures',
          'Separating Remediable Flaws from Critical Defects',
        ],
        summary:
          'A transparent, easy-to-follow guide to protect your life savings from high-risk property purchases without being misled by sensationalist claims.',
        pdfFileName: 'sample_handbook_2.pdf',
        pdfFilePath: 'storage/handbooks/handbook_2_default.pdf',
        pdfFileSizeBytes: 18240,
        isPublished: true,
        displayOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        title: 'Industrial & Factory Spatial Harmonics',
        slug: 'industrial-factory-spatial-harmonics',
        subtitle: 'Aligning Heavy Machinery, Substations, and Inventory Logistics',
        targetAudience: 'Plant Managers & Civil Engineers',
        pages: 54,
        topics: [
          'Earth-Bearing Capacity in Nairutya',
          'Hazardous Chemical Storage in Agni',
          'Raw Material Inflow vs Finished Goods Outflow',
          'Workforce Well-being',
        ],
        summary:
          'A practical technical treatise for manufacturing facilities, warehouse logistics, and corporate processing plants.',
        pdfFileName: 'sample_handbook_3.pdf',
        pdfFilePath: 'storage/handbooks/handbook_3_default.pdf',
        pdfFileSizeBytes: 18620,
        isPublished: true,
        displayOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private saveToDisk(stateToSave?: DataStoreState) {
    try {
      fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(stateToSave || this.state, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to persist data-store.json:', err);
    }
  }

  // --- Articles ---
  getArticles(filterPublishedOnly = false): StoredArticle[] {
    if (filterPublishedOnly) {
      return this.state.articles.filter((a) => a.status === 'published');
    }
    return [...this.state.articles];
  }

  getArticleById(id: number): StoredArticle | undefined {
    return this.state.articles.find((a) => a.id === id);
  }

  getArticleBySlug(slug: string): StoredArticle | undefined {
    const clean = slug.toLowerCase().trim();
    return this.state.articles.find((a) => a.slug === clean);
  }

  createArticle(data: Partial<StoredArticle>): StoredArticle {
    const now = new Date().toISOString();
    const nextId = this.state.articles.length > 0 ? Math.max(...this.state.articles.map((a) => a.id)) + 1 : 1;
    const cat = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;

    const newArticle: StoredArticle = {
      id: nextId,
      title: data.title || 'Untitled Article',
      slug: (data.slug || data.title || `article-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      excerpt: data.excerpt || '',
      content: data.content || '',
      featuredImage: data.featuredImage || '/hero-sanctuary.jpg',
      categoryId: data.categoryId || null,
      categoryName: cat?.name,
      categorySlug: cat?.slug,
      authorId: data.authorId || 1,
      authorName: data.authorName || 'Vastu Ritam Acharya',
      status: data.status || 'draft',
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.excerpt,
      readingTimeMinutes: data.readingTimeMinutes || Math.max(1, Math.round((data.content || '').split(/\s+/).length / 150)),
      viewsCount: 0,
      publishedAt: data.status === 'published' ? (data.publishedAt || now) : null,
      createdAt: now,
      updatedAt: now,
      topics: data.topics || [],
      keywords: data.keywords || [],
    };

    this.state.articles.unshift(newArticle);
    this.saveToDisk();
    return newArticle;
  }

  updateArticle(id: number, data: Partial<StoredArticle>): StoredArticle | undefined {
    const idx = this.state.articles.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;

    const existing = this.state.articles[idx];
    const now = new Date().toISOString();
    const nextStatus = data.status || existing.status;
    let publishedAt = existing.publishedAt;
    if (nextStatus === 'published' && !publishedAt) {
      publishedAt = now;
    }

    const cat = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;

    const updated: StoredArticle = {
      ...existing,
      ...data,
      categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      categoryName: cat ? cat.name : existing.categoryName,
      categorySlug: cat ? cat.slug : existing.categorySlug,
      status: nextStatus,
      publishedAt,
      updatedAt: now,
    };

    this.state.articles[idx] = updated;
    this.saveToDisk();
    return updated;
  }

  deleteArticle(id: number): boolean {
    const initialLen = this.state.articles.length;
    this.state.articles = this.state.articles.filter((a) => a.id !== id);
    if (this.state.articles.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  setArticleTopics(articleId: number, topicIds: number[]): void {
    const article = this.state.articles.find((a) => a.id === articleId);
    if (!article) return;
    article.topics = topicIds
      .map((id) => this.getTopicById(id))
      .filter((t): t is StoredTopic => Boolean(t))
      .map((t) => ({ id: t.id, name: t.name, slug: t.slug }));
    this.saveToDisk();
  }

  setArticleKeywords(articleId: number, keywordIds: number[]): void {
    const article = this.state.articles.find((a) => a.id === articleId);
    if (!article) return;
    article.keywords = keywordIds
      .map((id) => this.state.keywords.find((k) => k.id === id))
      .filter((k): k is StoredKeyword => Boolean(k))
      .map((k) => ({ id: k.id, name: k.name, slug: k.slug }));
    this.saveToDisk();
  }

  // --- Topics ---
  getTopics(): StoredTopic[] {
    return [...this.state.topics];
  }

  getTopicById(id: number): StoredTopic | undefined {
    return this.state.topics.find((t) => t.id === id);
  }

  getTopicBySlug(slug: string): StoredTopic | undefined {
    const clean = slug.toLowerCase().trim();
    return this.state.topics.find((t) => t.slug === clean);
  }

  createTopic(data: Partial<StoredTopic>): StoredTopic {
    const now = new Date().toISOString();
    const nextId = this.state.topics.length > 0 ? Math.max(...this.state.topics.map((t) => t.id)) + 1 : 1;
    const newTopic: StoredTopic = {
      id: nextId,
      name: data.name || 'New Topic',
      slug: (data.slug || data.name || `topic-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      sanskritName: data.sanskritName || '',
      entityType: data.entityType || 'concept',
      summary: data.summary || '',
      description: data.description || '',
      imageUrl: data.imageUrl || '/trademark-logo.jpg',
      metaTitle: data.metaTitle || data.name,
      metaDescription: data.metaDescription || data.summary,
      createdAt: now,
      updatedAt: now,
    };
    this.state.topics.push(newTopic);
    this.saveToDisk();
    return newTopic;
  }

  updateTopic(id: number, data: Partial<StoredTopic>): StoredTopic | undefined {
    const idx = this.state.topics.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.state.topics[idx] = {
      ...this.state.topics[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.state.topics[idx];
  }

  deleteTopic(id: number): boolean {
    const len = this.state.topics.length;
    this.state.topics = this.state.topics.filter((t) => t.id !== id);
    if (this.state.topics.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Categories ---
  getCategories(): StoredCategory[] {
    return [...this.state.categories];
  }

  getCategoryById(id: number): StoredCategory | undefined {
    return this.state.categories.find((c) => c.id === id);
  }

  getCategoryBySlug(slug: string): StoredCategory | undefined {
    const clean = slug.toLowerCase().trim();
    return this.state.categories.find((c) => c.slug === clean);
  }

  createCategory(data: Partial<StoredCategory>): StoredCategory {
    const now = new Date().toISOString();
    const nextId = this.state.categories.length > 0 ? Math.max(...this.state.categories.map((c) => c.id)) + 1 : 1;
    const newCat: StoredCategory = {
      id: nextId,
      name: data.name || 'New Category',
      slug: (data.slug || data.name || `cat-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      description: data.description || '',
      icon: data.icon || 'BookOpen',
      metaTitle: data.metaTitle || data.name,
      metaDescription: data.metaDescription || data.description,
      displayOrder: data.displayOrder || this.state.categories.length + 1,
      articleCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.state.categories.push(newCat);
    this.saveToDisk();
    return newCat;
  }

  updateCategory(id: number, data: Partial<StoredCategory>): StoredCategory | undefined {
    const idx = this.state.categories.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.state.categories[idx] = {
      ...this.state.categories[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.state.categories[idx];
  }

  deleteCategory(id: number): boolean {
    const len = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    if (this.state.categories.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Videos ---
  getVideos(filterPublishedOnly = false): StoredVideo[] {
    if (filterPublishedOnly) {
      return this.state.videos.filter((v) => v.status === 'published');
    }
    return [...this.state.videos];
  }

  getVideoById(id: number): StoredVideo | undefined {
    return this.state.videos.find((v) => v.id === id);
  }

  createVideo(data: Partial<StoredVideo>): StoredVideo {
    const now = new Date().toISOString();
    const nextId = this.state.videos.length > 0 ? Math.max(...this.state.videos.map((v) => v.id)) + 1 : 1;
    const cat = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;
    const top = data.topicId ? this.getTopicById(data.topicId) : undefined;

    const newVideo: StoredVideo = {
      id: nextId,
      title: data.title || 'Untitled Video',
      slug: (data.slug || data.title || `video-${nextId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      videoUrl: data.videoUrl || '',
      videoPlatform: data.videoPlatform || 'youtube',
      videoId: data.videoId || '',
      embedUrl: data.embedUrl || '',
      thumbnailUrl: data.thumbnailUrl || '/hero-sanctuary.jpg',
      description: data.description || '',
      durationSeconds: data.durationSeconds || 0,
      categoryId: data.categoryId || null,
      categoryName: cat?.name,
      categorySlug: cat?.slug,
      topicId: data.topicId || null,
      topicName: top?.name,
      topicSlug: top?.slug,
      status: data.status || 'draft',
      displayOrder: data.displayOrder || this.state.videos.length + 1,
      viewCount: 0,
      isFeatured: Boolean(data.isFeatured),
      publishedAt: data.status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    this.state.videos.unshift(newVideo);
    this.saveToDisk();
    return newVideo;
  }

  updateVideo(id: number, data: Partial<StoredVideo>): StoredVideo | undefined {
    const idx = this.state.videos.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;
    const existing = this.state.videos[idx];
    const now = new Date().toISOString();
    const nextStatus = data.status || existing.status;
    let publishedAt = existing.publishedAt;
    if (nextStatus === 'published' && !publishedAt) {
      publishedAt = now;
    }
    const cat = data.categoryId ? this.getCategoryById(data.categoryId) : undefined;
    const top = data.topicId ? this.getTopicById(data.topicId) : undefined;

    const updated: StoredVideo = {
      ...existing,
      ...data,
      categoryName: cat ? cat.name : existing.categoryName,
      categorySlug: cat ? cat.slug : existing.categorySlug,
      topicName: top ? top.name : existing.topicName,
      topicSlug: top ? top.slug : existing.topicSlug,
      status: nextStatus,
      publishedAt,
      updatedAt: now,
    };
    this.state.videos[idx] = updated;
    this.saveToDisk();
    return updated;
  }

  deleteVideo(id: number): boolean {
    const len = this.state.videos.length;
    this.state.videos = this.state.videos.filter((v) => v.id !== id);
    if (this.state.videos.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Site Settings & Logo ---
  getSettings(): StoredSiteSettings {
    return { ...this.state.settings };
  }

  updateSettings(data: Partial<StoredSiteSettings>): StoredSiteSettings {
    this.state.settings = {
      ...this.state.settings,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return { ...this.state.settings };
  }

  updateLogo(logoUrl: string): StoredSiteSettings {
    this.state.settings.logoUrl = logoUrl;
    this.state.settings.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return { ...this.state.settings };
  }

  // --- Users & Credentials ---
  getUsers(): StoredUser[] {
    return [...this.state.users];
  }

  getUserByEmail(email: string): StoredUser | undefined {
    const clean = email.toLowerCase().trim();
    return this.state.users.find((u) => u.email.toLowerCase().trim() === clean);
  }

  getUserById(id: number): StoredUser | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  updateUser(id: number, data: Partial<StoredUser>): StoredUser | undefined {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.state.users[idx] = {
      ...this.state.users[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.state.users[idx];
  }

  // --- Keywords ---
  getKeywords(): StoredKeyword[] {
    return [...this.state.keywords];
  }

  createKeyword(data: Partial<StoredKeyword>): StoredKeyword {
    const nextId = this.state.keywords.length > 0 ? Math.max(...this.state.keywords.map((k) => k.id)) + 1 : 1;
    const newK: StoredKeyword = {
      id: nextId,
      name: data.name || 'New Keyword',
      slug: (data.slug || data.name || `kw-${nextId}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: data.description || '',
      createdAt: new Date().toISOString(),
    };
    this.state.keywords.push(newK);
    this.saveToDisk();
    return newK;
  }

  updateKeyword(id: number, data: Partial<StoredKeyword>): StoredKeyword | undefined {
    const idx = this.state.keywords.findIndex((k) => k.id === id);
    if (idx === -1) return undefined;
    this.state.keywords[idx] = {
      ...this.state.keywords[idx],
      ...data,
    };
    this.saveToDisk();
    return this.state.keywords[idx];
  }

  deleteKeyword(id: number): boolean {
    const len = this.state.keywords.length;
    this.state.keywords = this.state.keywords.filter((k) => k.id !== id);
    if (this.state.keywords.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Ads ---
  getAds(): StoredAd[] {
    return [...this.state.ads];
  }

  getActiveAds(placement?: string): StoredAd[] {
    const now = new Date();
    return this.state.ads.filter((a) => {
      if (!a.isActive) return false;
      if (placement && a.placement.toUpperCase() !== placement.toUpperCase()) return false;
      if (a.startDate && new Date(a.startDate) > now) return false;
      if (a.endDate && new Date(a.endDate) < now) return false;
      return true;
    });
  }

  createAd(data: Partial<StoredAd>): StoredAd {
    const nextId = this.state.ads.length > 0 ? Math.max(...this.state.ads.map((a) => a.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newAd: StoredAd = {
      id: nextId,
      title: data.title || 'New Advertisement',
      imageUrl: data.imageUrl || '/hero-sanctuary.jpg',
      destinationUrl: data.destinationUrl || '/',
      placement: (data.placement || 'SIDEBAR').toUpperCase(),
      adType: data.adType || 'BANNER',
      adSenseSlot: data.adSenseSlot || null,
      adSenseFormat: data.adSenseFormat || 'auto',
      customHtml: data.customHtml || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      priority: data.priority || 1,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      impressions: 0,
      clicks: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.state.ads.unshift(newAd);
    this.saveToDisk();
    return newAd;
  }

  updateAd(id: number, data: Partial<StoredAd>): StoredAd | undefined {
    const idx = this.state.ads.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.state.ads[idx] = {
      ...this.state.ads[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.state.ads[idx];
  }

  deleteAd(id: number): boolean {
    const len = this.state.ads.length;
    this.state.ads = this.state.ads.filter((a) => a.id !== id);
    if (this.state.ads.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Media ---
  getMedia(): StoredMedia[] {
    return [...this.state.media];
  }

  addMedia(data: Partial<StoredMedia>): StoredMedia {
    const nextId = this.state.media.length > 0 ? Math.max(...this.state.media.map((m) => m.id)) + 1 : 1;
    const newM: StoredMedia = {
      id: nextId,
      fileName: data.fileName || 'file',
      fileUrl: data.fileUrl || '',
      mimeType: data.mimeType || 'image/jpeg',
      sizeBytes: data.sizeBytes || 0,
      altText: data.altText || '',
      uploadedById: data.uploadedById,
      createdAt: new Date().toISOString(),
    };
    this.state.media.unshift(newM);
    this.saveToDisk();
    return newM;
  }

  deleteMedia(id: number): boolean {
    const len = this.state.media.length;
    this.state.media = this.state.media.filter((m) => m.id !== id);
    if (this.state.media.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Audit Logs ---
  getAuditLogs(): StoredAuditLog[] {
    return [...this.state.auditLogs];
  }

  addAuditLog(data: Partial<StoredAuditLog>): StoredAuditLog {
    const nextId = this.state.auditLogs.length > 0 ? Math.max(...this.state.auditLogs.map((l) => l.id)) + 1 : 1;
    const newLog: StoredAuditLog = {
      id: nextId,
      userId: data.userId,
      action: data.action || 'GENERAL_ACTION',
      entityType: data.entityType || 'SYSTEM',
      entityId: data.entityId || '0',
      details: data.details || '',
      ipAddress: data.ipAddress,
      createdAt: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(newLog);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 200);
    }
    this.saveToDisk();
    return newLog;
  }

  createAuditLog(data: Partial<StoredAuditLog>): StoredAuditLog {
    return this.addAuditLog(data);
  }

  // --- Handbooks Management ---
  getHandbooks(publishedOnly = false): StoredHandbook[] {
    const list = this.state.handbooks || [];
    if (publishedOnly) {
      return list.filter((h) => h.isPublished).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getHandbookById(id: number | string): StoredHandbook | undefined {
    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    return (this.state.handbooks || []).find((h) => h.id === numId);
  }

  getHandbookBySlug(slug: string): StoredHandbook | undefined {
    const clean = slug.toLowerCase().trim();
    return (this.state.handbooks || []).find((h) => h.slug === clean);
  }

  createHandbook(data: Partial<StoredHandbook>): StoredHandbook {
    const now = new Date().toISOString();
    const list = this.state.handbooks || [];
    const nextId = list.length > 0 ? Math.max(...list.map((h) => h.id)) + 1 : 1;
    const cleanTitle = data.title || `Handbook ${nextId}`;
    const slug = (data.slug || cleanTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newHandbook: StoredHandbook = {
      id: nextId,
      title: cleanTitle,
      slug,
      subtitle: data.subtitle || '',
      targetAudience: data.targetAudience || 'Architects & Homeowners',
      pages: data.pages || 40,
      topics: Array.isArray(data.topics) ? data.topics : [],
      summary: data.summary || '',
      pdfFileName: data.pdfFileName || null,
      pdfFilePath: data.pdfFilePath || null,
      pdfFileSizeBytes: data.pdfFileSizeBytes || null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      displayOrder: data.displayOrder || nextId,
      createdAt: now,
      updatedAt: now,
    };

    list.push(newHandbook);
    this.state.handbooks = list;
    this.saveToDisk();
    return newHandbook;
  }

  updateHandbook(id: number | string, data: Partial<StoredHandbook>): StoredHandbook | undefined {
    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    const list = this.state.handbooks || [];
    const idx = list.findIndex((h) => h.id === numId);
    if (idx === -1) return undefined;

    const existing = list[idx];
    const now = new Date().toISOString();

    const updated: StoredHandbook = {
      ...existing,
      ...data,
      id: existing.id,
      topics: data.topics !== undefined ? (Array.isArray(data.topics) ? data.topics : existing.topics) : existing.topics,
      updatedAt: now,
    };

    list[idx] = updated;
    this.state.handbooks = list;
    this.saveToDisk();
    return updated;
  }

  deleteHandbook(id: number | string): boolean {
    const numId = typeof id === 'number' ? id : parseInt(String(id), 10);
    const list = this.state.handbooks || [];
    const len = list.length;
    this.state.handbooks = list.filter((h) => h.id !== numId);
    if (this.state.handbooks.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Handbook Client Leads ---
  getHandbookLeads(handbookIdFilter?: string): StoredHandbookLead[] {
    const list = this.state.handbookLeads || [];
    if (handbookIdFilter && handbookIdFilter !== 'all') {
      return list.filter((l) => String(l.handbookId) === String(handbookIdFilter));
    }
    return [...list];
  }

  createHandbookLead(data: Partial<StoredHandbookLead>): StoredHandbookLead {
    const now = new Date().toISOString();
    const list = this.state.handbookLeads || [];
    const nextId = list.length > 0 ? Math.max(...list.map((l) => l.id)) + 1 : 1;

    const newLead: StoredHandbookLead = {
      id: nextId,
      handbookId: String(data.handbookId || '1'),
      handbookTitle: data.handbookTitle || 'Vastu Handbook',
      fullName: data.fullName ? data.fullName.trim() : null,
      email: (data.email || '').trim().toLowerCase(),
      phone: (data.phone || '').trim(),
      accessToken: data.accessToken || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      createdAt: now,
    };

    list.unshift(newLead);
    this.state.handbookLeads = list;
    this.saveToDisk();
    return newLead;
  }

  deleteHandbookLead(id: number): boolean {
    const list = this.state.handbookLeads || [];
    const len = list.length;
    this.state.handbookLeads = list.filter((l) => l.id !== id);
    if (this.state.handbookLeads.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
}

export const dataStore = new PersistentDataStore();
