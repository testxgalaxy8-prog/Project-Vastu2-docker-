/**
 * Video Learning Management System Utilities
 *
 * Enforces strict security validation, external provider detection (YouTube & Vimeo),
 * and safe canonical embed URL generation.
 *
 * NOTE: The website strictly NEVER uploads, stores, processes, or hosts video files.
 * Only external links and references to supported video platforms are managed.
 */

export type SupportedVideoProvider = 'youtube' | 'vimeo';

export interface VideoValidationResult {
  valid: boolean;
  provider: SupportedVideoProvider | null;
  videoId: string | null;
  embedUrl: string | null;
  normalizedUrl: string | null;
  error?: string;
}

/**
 * Validates external video link, identifies provider, extracts video ID,
 * and generates a secure official embed URL (e.g. youtube-nocookie.com, player.vimeo.com).
 */
export function parseAndValidateVideoUrl(rawUrl: string): VideoValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Video link URL is required',
    };
  }

  const trimmed = rawUrl.trim();

  // Basic URL structure and protocol check
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Invalid URL format. Please provide a full link starting with https://',
    };
  }

  // Enforce HTTPS or HTTP (strictly block javascript:, data:, file:, etc.)
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    return {
      valid: false,
      provider: null,
      videoId: null,
      embedUrl: null,
      normalizedUrl: null,
      error: 'Unsupported URL protocol. Only https:// links are permitted.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

  // 1. YouTube Identification
  // Matches: youtube.com, youtu.be, m.youtube.com, youtube-nocookie.com
  if (
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'youtu.be' ||
    hostname === 'youtube-nocookie.com'
  ) {
    let videoId: string | null = null;

    if (hostname === 'youtu.be') {
      // Format: https://youtu.be/ABC123xyz01
      const pathPart = parsedUrl.pathname.replace(/^\//, '').split('/')[0];
      if (pathPart) videoId = pathPart;
    } else if (parsedUrl.pathname.startsWith('/embed/')) {
      // Format: https://www.youtube.com/embed/ABC123xyz01
      videoId = parsedUrl.pathname.split('/')[2] || null;
    } else if (parsedUrl.pathname.startsWith('/shorts/')) {
      // Format: https://www.youtube.com/shorts/ABC123xyz01
      videoId = parsedUrl.pathname.split('/')[2] || null;
    } else if (parsedUrl.searchParams.has('v')) {
      // Format: https://www.youtube.com/watch?v=ABC123xyz01
      videoId = parsedUrl.searchParams.get('v');
    }

    // Clean videoId from any query remnants
    if (videoId) {
      videoId = videoId.split('?')[0].split('&')[0];
    }

    // Standard YouTube ID regex: 11 alphanumeric characters, dashes, or underscores
    const ytIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoId || !ytIdRegex.test(videoId)) {
      return {
        valid: false,
        provider: 'youtube',
        videoId: null,
        embedUrl: null,
        normalizedUrl: null,
        error: 'Could not extract valid 11-character YouTube video ID. Example: https://www.youtube.com/watch?v=XXXXXXXXXXX',
      };
    }

    return {
      valid: true,
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  // 2. Vimeo Identification
  // Matches: vimeo.com, player.vimeo.com
  if (hostname === 'vimeo.com' || hostname === 'player.vimeo.com') {
    let videoId: string | null = null;

    if (hostname === 'player.vimeo.com' && parsedUrl.pathname.startsWith('/video/')) {
      // Format: https://player.vimeo.com/video/123456789
      videoId = parsedUrl.pathname.split('/')[2] || null;
    } else {
      // Format: https://vimeo.com/123456789 or https://vimeo.com/channels/.../123456789
      const segments = parsedUrl.pathname.split('/').filter(Boolean);
      // Grab numeric segment
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
        error: 'Could not extract valid Vimeo video ID. Example: https://vimeo.com/123456789',
      };
    }

    return {
      valid: true,
      provider: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1`,
      normalizedUrl: `https://vimeo.com/${videoId}`,
    };
  }

  // Unsupported Provider
  return {
    valid: false,
    provider: null,
    videoId: null,
    embedUrl: null,
    normalizedUrl: null,
    error: 'Unsupported video platform. Currently, YouTube (youtube.com, youtu.be) and Vimeo (vimeo.com) are supported.',
  };
}

/**
 * Generates an SEO & database friendly unique slug from title
 */
export function generateVideoSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);

  return base || `video-${Date.now()}`;
}
