/**
 * Video Learning Database Utility Module
 *
 * Provides complete data access operations, strict server-side validation
 * for YouTube and Vimeo URLs, XSS sanitization for video metadata, and
 * safe embed URL generators for the 'video_learning' table.
 *
 * ARCHITECTURAL MANDATE:
 * The platform strictly NEVER uploads, stores, processes, or hosts video files.
 * This module handles only metadata and validated external provider references.
 */

import { eq, desc, asc, and, or, ilike, sql, inArray } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { videoLearning, categories, topics, users, auditLogs } from './schema.ts';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type SupportedVideoProvider = 'youtube' | 'vimeo';

export type VideoLearningStatus = 'draft' | 'published' | 'unpublished';

export type VideoLearningRow = typeof videoLearning.$inferSelect;
export type NewVideoLearningInsert = typeof videoLearning.$inferInsert;

export interface VideoUrlValidationResult {
  valid: boolean;
  provider: SupportedVideoProvider | null;
  videoId: string | null;
  embedUrl: string | null;
  normalizedUrl: string | null;
  error?: string;
}

export interface RawVideoInput {
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  categoryId?: number | string | null;
  topicId?: number | string | null;
  status?: VideoLearningStatus | string;
  displayOrder?: number | string;
  duration?: string | null;
  instructor?: string | null;
}

export interface SanitizedVideoMetadata {
  title: string;
  slug: string;
  videoUrl: string;
  videoProvider: SupportedVideoProvider;
  thumbnailUrl: string;
  description: string;
  categoryId: number | null;
  topicId: number | null;
  status: VideoLearningStatus;
  displayOrder: number;
  duration: string | null;
  instructor: string | null;
  publishedAt?: Date | null;
}

export interface VideoQueryFilters {
  status?: VideoLearningStatus | 'all';
  categoryId?: number;
  categorySlug?: string;
  topicId?: number;
  topicSlug?: string;
  provider?: SupportedVideoProvider | 'all';
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'display_order' | 'published_at' | 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface FormattedVideoRecord extends VideoLearningRow {
  categoryName?: string | null;
  categorySlug?: string | null;
  topicName?: string | null;
  topicSlug?: string | null;
  creatorName?: string | null;
  embedUrl: string | null;
  isValidLink: boolean;
}

// =============================================================================
// SERVER-SIDE VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates YouTube URL variations:
 * - https://www.youtube.com/watch?v=XXXXXXXXXXX
 * - https://youtube.com/watch?v=XXXXXXXXXXX
 * - https://m.youtube.com/watch?v=XXXXXXXXXXX
 * - https://youtu.be/XXXXXXXXXXX
 * - https://www.youtube.com/embed/XXXXXXXXXXX
 * - https://www.youtube-nocookie.com/embed/XXXXXXXXXXX
 * - https://www.youtube.com/shorts/XXXXXXXXXXX
 */
export function validateYouTubeUrl(rawUrl: string): VideoUrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'YouTube URL cannot be empty',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Invalid URL structure',
    };
  }

  // Reject dangerous schemes
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Only HTTPS and HTTP YouTube links are supported',
    };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const isYouTubeHost =
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'youtu.be' ||
    hostname === 'youtube-nocookie.com';

  if (!isYouTubeHost) {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Not a recognized YouTube domain',
    };
  }

  let videoId: string | null = null;

  if (hostname === 'youtu.be') {
    const firstSegment = parsed.pathname.replace(/^\//, '').split('/')[0];
    if (firstSegment) videoId = firstSegment;
  } else if (parsed.pathname.startsWith('/embed/')) {
    videoId = parsed.pathname.split('/')[2] || null;
  } else if (parsed.pathname.startsWith('/shorts/')) {
    videoId = parsed.pathname.split('/')[2] || null;
  } else if (parsed.searchParams.has('v')) {
    videoId = parsed.searchParams.get('v');
  }

  if (videoId) {
    videoId = videoId.split('?')[0].split('&')[0].trim();
  }

  // YouTube IDs strictly consist of 11 base64-like characters [a-zA-Z0-9_-]
  const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (!videoId || !youtubeIdRegex.test(videoId)) {
    return {
      valid: false,
      provider: 'youtube',
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Invalid YouTube video ID format (must be 11 characters, e.g. https://www.youtube.com/watch?v=XXXXXXXXXXX)',
    };
  }

  // Canonical safe privacy-enhanced embed URL
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return {
    valid: true,
    provider: 'youtube',
    videoId,
    embedUrl,
    normalizedUrl,
  };
}

/**
 * Validates Vimeo URL variations:
 * - https://vimeo.com/123456789
 * - https://player.vimeo.com/video/123456789
 * - https://vimeo.com/channels/.../123456789
 */
export function validateVimeoUrl(rawUrl: string): VideoUrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Vimeo URL cannot be empty',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Invalid URL structure',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Only HTTPS and HTTP Vimeo links are supported',
    };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const isVimeoHost = hostname === 'vimeo.com' || hostname === 'player.vimeo.com';

  if (!isVimeoHost) {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Not a recognized Vimeo domain',
    };
  }

  let videoId: string | null = null;

  if (hostname === 'player.vimeo.com' && parsed.pathname.startsWith('/video/')) {
    videoId = parsed.pathname.split('/')[2] || null;
  } else {
    const segments = parsed.pathname.split('/').filter(Boolean);
    for (const seg of segments) {
      if (/^\d{5,15}$/.test(seg)) {
        videoId = seg;
        break;
      }
    }
  }

  if (!videoId || !/^\d{5,15}$/.test(videoId)) {
    return {
      valid: false,
      provider: 'vimeo',
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Invalid Vimeo video ID (must be a numeric identifier, e.g. https://vimeo.com/123456789)',
    };
  }

  // Canonical safe embed with DNT (Do Not Track) enabled
  const embedUrl = `https://player.vimeo.com/video/${videoId}?dnt=1`;
  const normalizedUrl = `https://vimeo.com/${videoId}`;

  return {
    valid: true,
    provider: 'vimeo',
    videoId,
    embedUrl,
    normalizedUrl,
  };
}

/**
 * Validates external video link against supported providers (YouTube & Vimeo).
 * Strictly prevents arbitrary or malicious URLs from being accepted.
 */
export function validateExternalVideoUrl(rawUrl: string): VideoUrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'External video link is required',
    };
  }

  const trimmed = rawUrl.trim();

  // Test YouTube
  const ytResult = validateYouTubeUrl(trimmed);
  if (ytResult.valid) {
    return ytResult;
  }
  // If it was a YouTube host but failed ID validation, return the specific error
  if (ytResult.provider === 'youtube') {
    return ytResult;
  }

  // Test Vimeo
  const vimeoResult = validateVimeoUrl(trimmed);
  if (vimeoResult.valid) {
    return vimeoResult;
  }
  // If it was a Vimeo host but failed ID validation, return the specific error
  if (vimeoResult.provider === 'vimeo') {
    return vimeoResult;
  }

  return {
    valid: false,
    provider: null,
    videoId: null,
    embedUrl: null,
    normalizedUrl: null,
    error: 'Unsupported video platform. Only external YouTube (youtube.com, youtu.be) and Vimeo (vimeo.com) video links are supported.',
  };
}

// =============================================================================
// SANITIZATION LOGIC
// =============================================================================

/**
 * Strips dangerous HTML tags and XSS injection vectors from text inputs.
 */
export function sanitizePlainText(input: unknown): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove null bytes and control chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Strip all other HTML tags
    .replace(/<[^>]+>/g, '')
    // Escape unsafe XML/HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

/**
 * Sanitizes URLs, ensuring no script execution, protocol spoofing, or invalid schemes.
 */
export function sanitizeUrl(rawUrl: unknown): string {
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // Block javascript:, data:, vbscript:, etc.
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return '';
  }

  // Allow internal relative paths (e.g. /uploads/image.webp or /hero-sanctuary.jpg)
  if (trimmed.startsWith('/')) {
    return trimmed.replace(/[<>"'`]/g, '');
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Generates an SEO & canonical URL slug from a title string.
 */
export function sanitizeVideoSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

  return base || `video-${Date.now()}`;
}

/**
 * Sanitizes and validates the full video metadata payload prior to database insertion.
 * Throws a detailed error if any constraint fails.
 */
export function sanitizeVideoMetadata(raw: RawVideoInput): SanitizedVideoMetadata {
  // 1. Title validation & sanitization
  const rawTitle = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!rawTitle) {
    throw new Error('Video title is required and cannot be empty');
  }
  if (rawTitle.length > 250) {
    throw new Error('Video title exceeds maximum allowed length of 250 characters');
  }
  const cleanTitle = sanitizePlainText(rawTitle);

  // 2. Video URL validation & provider detection
  const validation = validateExternalVideoUrl(raw.videoUrl);
  if (!validation.valid || !validation.provider) {
    throw new Error(validation.error || 'Invalid video URL link');
  }

  // 3. Thumbnail URL validation & sanitization
  const cleanThumbnail = sanitizeUrl(raw.thumbnailUrl);
  if (!cleanThumbnail) {
    throw new Error('A valid thumbnail image URL or upload is required');
  }

  // 4. Description validation & sanitization
  const rawDesc = typeof raw.description === 'string' ? raw.description.trim() : '';
  if (!rawDesc) {
    throw new Error('Video description is required');
  }
  if (rawDesc.length > 5000) {
    throw new Error('Video description exceeds maximum allowed length of 5000 characters');
  }
  const cleanDescription = sanitizePlainText(rawDesc);

  // 5. Category ID & Topic ID parsing
  let categoryId: number | null = null;
  if (raw.categoryId !== undefined && raw.categoryId !== null && raw.categoryId !== '') {
    const num = parseInt(String(raw.categoryId), 10);
    if (!isNaN(num) && num > 0) categoryId = num;
  }

  let topicId: number | null = null;
  if (raw.topicId !== undefined && raw.topicId !== null && raw.topicId !== '') {
    const num = parseInt(String(raw.topicId), 10);
    if (!isNaN(num) && num > 0) topicId = num;
  }

  // 6. Publication Status
  const allowedStatuses: VideoLearningStatus[] = ['draft', 'published', 'unpublished'];
  const status: VideoLearningStatus = allowedStatuses.includes(raw.status as any)
    ? (raw.status as VideoLearningStatus)
    : 'draft';

  // 7. Display Order
  const displayOrder = parseInt(String(raw.displayOrder || 0), 10) || 0;

  // 8. Duration & Instructor (optional)
  const duration = raw.duration ? sanitizePlainText(String(raw.duration).slice(0, 30)) : null;
  const instructor = raw.instructor
    ? sanitizePlainText(String(raw.instructor).slice(0, 150))
    : 'Vastu Ritam Research Fellowship';

  return {
    title: cleanTitle,
    slug: sanitizeVideoSlug(cleanTitle),
    videoUrl: validation.normalizedUrl || raw.videoUrl.trim(),
    videoProvider: validation.provider,
    thumbnailUrl: cleanThumbnail,
    description: cleanDescription,
    categoryId,
    topicId,
    status,
    displayOrder,
    duration,
    instructor,
    publishedAt: status === 'published' ? new Date() : null,
  };
}

// =============================================================================
// DATABASE QUERY & CRUD UTILITIES
// =============================================================================

/**
 * Transforms a raw database record into a safe, formatted record
 * containing the official safe embed URL.
 */
export function formatVideoRecord(row: any): FormattedVideoRecord {
  const validation = validateExternalVideoUrl(row.videoUrl);

  return {
    ...row,
    embedUrl: validation.embedUrl,
    isValidLink: validation.valid,
    videoProvider: (validation.provider || row.videoProvider) as SupportedVideoProvider,
  };
}

/**
 * Ensures a slug is unique by querying the database and appending
 * an incremental suffix if needed.
 */
export async function resolveUniqueVideoSlug(
  db: NodePgDatabase<any>,
  baseSlug: string,
  excludeId?: number
): Promise<string> {
  let finalSlug = baseSlug;
  let counter = 1;

  while (true) {
    const query = db
      .select({ id: videoLearning.id })
      .from(videoLearning)
      .where(eq(videoLearning.slug, finalSlug));

    const existing = await query.limit(1);

    if (existing.length === 0 || (excludeId && existing[0].id === excludeId)) {
      return finalSlug;
    }

    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Retrieves a list of videos with optional filtering, search, sorting, and pagination.
 */
export async function queryVideos(
  db: NodePgDatabase<any>,
  filters: VideoQueryFilters = {}
): Promise<FormattedVideoRecord[]> {
  const conditions = [];

  // Status Filter
  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(videoLearning.status, filters.status));
  }

  // Category Filter (by ID or Slug)
  if (filters.categoryId) {
    conditions.push(eq(videoLearning.categoryId, filters.categoryId));
  } else if (filters.categorySlug) {
    const cat = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, filters.categorySlug.toLowerCase().trim()))
      .limit(1);
    if (cat.length > 0) {
      conditions.push(eq(videoLearning.categoryId, cat[0].id));
    } else {
      return [];
    }
  }

  // Topic Filter (by ID or Slug)
  if (filters.topicId) {
    conditions.push(eq(videoLearning.topicId, filters.topicId));
  } else if (filters.topicSlug) {
    const top = await db
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.slug, filters.topicSlug.toLowerCase().trim()))
      .limit(1);
    if (top.length > 0) {
      conditions.push(eq(videoLearning.topicId, top[0].id));
    } else {
      return [];
    }
  }

  // Provider Filter
  if (filters.provider && filters.provider !== 'all') {
    conditions.push(eq(videoLearning.videoProvider, filters.provider));
  }

  // Search Filter
  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(videoLearning.title, term),
        ilike(videoLearning.description, term),
        ilike(videoLearning.instructor, term)
      )!
    );
  }

  // Sorting
  let orderByClause;
  const sortDir = filters.sortOrder === 'desc' ? desc : asc;

  switch (filters.sortBy) {
    case 'published_at':
      orderByClause = [sortDir(videoLearning.publishedAt), desc(videoLearning.createdAt)];
      break;
    case 'created_at':
      orderByClause = [sortDir(videoLearning.createdAt)];
      break;
    case 'title':
      orderByClause = [sortDir(videoLearning.title)];
      break;
    case 'display_order':
    default:
      orderByClause = [asc(videoLearning.displayOrder), desc(videoLearning.updatedAt)];
      break;
  }

  let baseQuery = db
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
    .leftJoin(users, eq(videoLearning.createdBy, users.id));

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  baseQuery = baseQuery.orderBy(...orderByClause) as any;

  if (filters.limit) {
    baseQuery = baseQuery.limit(filters.limit) as any;
  }
  if (filters.offset) {
    baseQuery = baseQuery.offset(filters.offset) as any;
  }

  const rows = await baseQuery;
  return rows.map(formatVideoRecord);
}

/**
 * Retrieves a single video record by ID.
 */
export async function getVideoById(
  db: NodePgDatabase<any>,
  id: number
): Promise<FormattedVideoRecord | null> {
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
    .where(eq(videoLearning.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  return formatVideoRecord(rows[0]);
}

/**
 * Retrieves a single video record by its unique canonical slug.
 */
export async function getVideoBySlug(
  db: NodePgDatabase<any>,
  slug: string,
  onlyPublished: boolean = true
): Promise<FormattedVideoRecord | null> {
  const conditions = [eq(videoLearning.slug, slug.toLowerCase().trim())];
  if (onlyPublished) {
    conditions.push(eq(videoLearning.status, 'published'));
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
    .where(and(...conditions))
    .limit(1);

  if (rows.length === 0) return null;
  return formatVideoRecord(rows[0]);
}

/**
 * Creates and inserts a sanitized video learning record.
 */
export async function createVideoRecord(
  db: NodePgDatabase<any>,
  rawInput: RawVideoInput,
  authorId?: number | null
): Promise<FormattedVideoRecord> {
  const sanitized = sanitizeVideoMetadata(rawInput);
  const uniqueSlug = await resolveUniqueVideoSlug(db, sanitized.slug);

  const inserted = await db
    .insert(videoLearning)
    .values({
      title: sanitized.title,
      slug: uniqueSlug,
      categoryId: sanitized.categoryId,
      topicId: sanitized.topicId,
      videoUrl: sanitized.videoUrl,
      videoProvider: sanitized.videoProvider,
      thumbnailUrl: sanitized.thumbnailUrl,
      description: sanitized.description,
      status: sanitized.status,
      displayOrder: sanitized.displayOrder,
      duration: sanitized.duration,
      instructor: sanitized.instructor,
      createdBy: authorId || null,
      publishedAt: sanitized.publishedAt,
    })
    .returning();

  // Audit log
  try {
    await db.insert(auditLogs).values({
      userId: authorId || null,
      action: 'CREATE_VIDEO',
      entityType: 'video_learning',
      entityId: String(inserted[0].id),
      details: JSON.stringify({
        title: sanitized.title,
        provider: sanitized.videoProvider,
        status: sanitized.status,
      }),
    });
  } catch (err) {
    console.warn('Audit logging failed for createVideoRecord:', err);
  }

  const fetched = await getVideoById(db, inserted[0].id);
  return fetched || formatVideoRecord(inserted[0]);
}

/**
 * Updates an existing video learning record with full validation and sanitization.
 */
export async function updateVideoRecord(
  db: NodePgDatabase<any>,
  id: number,
  rawInput: Partial<RawVideoInput>,
  userId?: number | null
): Promise<FormattedVideoRecord> {
  const existing = await getVideoById(db, id);
  if (!existing) {
    throw new Error(`Video with ID ${id} not found`);
  }

  // Merge with existing values for full validation
  const merged: RawVideoInput = {
    title: rawInput.title !== undefined ? rawInput.title : existing.title,
    videoUrl: rawInput.videoUrl !== undefined ? rawInput.videoUrl : existing.videoUrl,
    thumbnailUrl: rawInput.thumbnailUrl !== undefined ? rawInput.thumbnailUrl : existing.thumbnailUrl,
    description: rawInput.description !== undefined ? rawInput.description : existing.description,
    categoryId: rawInput.categoryId !== undefined ? rawInput.categoryId : existing.categoryId,
    topicId: rawInput.topicId !== undefined ? rawInput.topicId : existing.topicId,
    status: rawInput.status !== undefined ? (rawInput.status as VideoLearningStatus) : existing.status,
    displayOrder: rawInput.displayOrder !== undefined ? rawInput.displayOrder : existing.displayOrder,
    duration: rawInput.duration !== undefined ? rawInput.duration : existing.duration,
    instructor: rawInput.instructor !== undefined ? rawInput.instructor : existing.instructor,
  };

  const sanitized = sanitizeVideoMetadata(merged);

  // If title changed, resolve new unique slug
  let finalSlug = existing.slug;
  if (sanitized.title !== existing.title) {
    finalSlug = await resolveUniqueVideoSlug(db, sanitized.slug, id);
  }

  // Handle publishedAt timestamp transitions
  let publishedAt = existing.publishedAt ? new Date(existing.publishedAt) : null;
  if (sanitized.status === 'published' && !publishedAt) {
    publishedAt = new Date();
  }

  const updated = await db
    .update(videoLearning)
    .set({
      title: sanitized.title,
      slug: finalSlug,
      categoryId: sanitized.categoryId,
      topicId: sanitized.topicId,
      videoUrl: sanitized.videoUrl,
      videoProvider: sanitized.videoProvider,
      thumbnailUrl: sanitized.thumbnailUrl,
      description: sanitized.description,
      status: sanitized.status,
      displayOrder: sanitized.displayOrder,
      duration: sanitized.duration,
      instructor: sanitized.instructor,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(videoLearning.id, id))
    .returning();

  try {
    await db.insert(auditLogs).values({
      userId: userId || null,
      action: 'UPDATE_VIDEO',
      entityType: 'video_learning',
      entityId: String(id),
      details: JSON.stringify({
        id,
        title: sanitized.title,
        status: sanitized.status,
      }),
    });
  } catch (err) {
    console.warn('Audit logging failed for updateVideoRecord:', err);
  }

  const fetched = await getVideoById(db, id);
  return fetched || formatVideoRecord(updated[0]);
}

/**
 * Toggles or updates the publication status of a video record.
 */
export async function setVideoStatus(
  db: NodePgDatabase<any>,
  id: number,
  status: VideoLearningStatus,
  userId?: number | null
): Promise<FormattedVideoRecord> {
  const allowed: VideoLearningStatus[] = ['draft', 'published', 'unpublished'];
  if (!allowed.includes(status)) {
    throw new Error('Invalid status. Allowed values: draft, published, unpublished');
  }

  const existing = await getVideoById(db, id);
  if (!existing) {
    throw new Error(`Video with ID ${id} not found`);
  }

  let publishedAt = existing.publishedAt ? new Date(existing.publishedAt) : null;
  if (status === 'published' && !publishedAt) {
    publishedAt = new Date();
  }

  const updated = await db
    .update(videoLearning)
    .set({
      status,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(videoLearning.id, id))
    .returning();

  try {
    await db.insert(auditLogs).values({
      userId: userId || null,
      action: status === 'published' ? 'PUBLISH_VIDEO' : 'UNPUBLISH_VIDEO',
      entityType: 'video_learning',
      entityId: String(id),
      details: JSON.stringify({ id, status }),
    });
  } catch (err) {
    console.warn('Audit logging failed for setVideoStatus:', err);
  }

  const fetched = await getVideoById(db, id);
  return fetched || formatVideoRecord(updated[0]);
}

/**
 * Permanently deletes a video record by ID.
 */
export async function deleteVideoRecord(
  db: NodePgDatabase<any>,
  id: number,
  userId?: number | null
): Promise<{ success: boolean; id: number; title: string }> {
  const existing = await getVideoById(db, id);
  if (!existing) {
    throw new Error(`Video with ID ${id} not found`);
  }

  await db.delete(videoLearning).where(eq(videoLearning.id, id));

  try {
    await db.insert(auditLogs).values({
      userId: userId || null,
      action: 'DELETE_VIDEO',
      entityType: 'video_learning',
      entityId: String(id),
      details: JSON.stringify({ id, title: existing.title }),
    });
  } catch (err) {
    console.warn('Audit logging failed for deleteVideoRecord:', err);
  }

  return { success: true, id, title: existing.title };
}
