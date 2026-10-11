import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateVideoUrl, generateVideoSlug } from '../src/lib/videoUtils.ts';

describe('Video Utilities (src/lib/videoUtils.ts)', () => {
  describe('parseAndValidateVideoUrl()', () => {
    it('validates standard YouTube watch URLs and produces youtube-nocookie embed URL', () => {
      const result = parseAndValidateVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      assert.equal(result.valid, true);
      assert.equal(result.provider, 'youtube');
      assert.equal(result.videoId, 'dQw4w9WgXcQ');
      assert.equal(result.embedUrl, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1');
      assert.equal(result.normalizedUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });

    it('validates short youtu.be URLs with query parameters', () => {
      const result = parseAndValidateVideoUrl('https://youtu.be/ABC123xyz01?si=testshare');
      assert.equal(result.valid, true);
      assert.equal(result.provider, 'youtube');
      assert.equal(result.videoId, 'ABC123xyz01');
      assert.equal(result.embedUrl, 'https://www.youtube-nocookie.com/embed/ABC123xyz01?rel=0&modestbranding=1');
    });

    it('validates YouTube Shorts and Embed URLs', () => {
      const shortsResult = parseAndValidateVideoUrl('https://www.youtube.com/shorts/Z987654321a');
      assert.equal(shortsResult.valid, true);
      assert.equal(shortsResult.videoId, 'Z987654321a');

      const embedResult = parseAndValidateVideoUrl('https://www.youtube-nocookie.com/embed/Z987654321a');
      assert.equal(embedResult.valid, true);
      assert.equal(embedResult.videoId, 'Z987654321a');
    });

    it('rejects YouTube URLs with invalid video ID length', () => {
      const result = parseAndValidateVideoUrl('https://www.youtube.com/watch?v=short');
      assert.equal(result.valid, false);
      assert.equal(result.provider, 'youtube');
      assert.ok(result.error?.includes('11-character YouTube video ID'));
    });

    it('validates Vimeo standard and player URLs', () => {
      const vimeoStandard = parseAndValidateVideoUrl('https://vimeo.com/123456789');
      assert.equal(vimeoStandard.valid, true);
      assert.equal(vimeoStandard.provider, 'vimeo');
      assert.equal(vimeoStandard.videoId, '123456789');
      assert.equal(vimeoStandard.embedUrl, 'https://player.vimeo.com/video/123456789?dnt=1');

      const vimeoPlayer = parseAndValidateVideoUrl('https://player.vimeo.com/video/987654321');
      assert.equal(vimeoPlayer.valid, true);
      assert.equal(vimeoPlayer.provider, 'vimeo');
      assert.equal(vimeoPlayer.videoId, '987654321');
    });

    it('rejects empty, malformed, or unsafe protocol URLs', () => {
      assert.equal(parseAndValidateVideoUrl('').valid, false);
      assert.equal(parseAndValidateVideoUrl('not-a-url').valid, false);
      assert.equal(parseAndValidateVideoUrl('javascript:alert(1)').valid, false);
      assert.equal(parseAndValidateVideoUrl('ftp://youtube.com/watch?v=dQw4w9WgXcQ').valid, false);
    });

    it('rejects unsupported video hosting domains', () => {
      const result = parseAndValidateVideoUrl('https://example.com/video/12345');
      assert.equal(result.valid, false);
      assert.equal(result.provider, null);
      assert.ok(result.error?.includes('Unsupported video platform'));
    });
  });

  describe('generateVideoSlug()', () => {
    it('generates clean kebab-case slugs from titles with special characters', () => {
      const slug = generateVideoSlug('  Vastu Purusha Mandala: The 81-Grid Matrix!  ');
      assert.equal(slug, 'vastu-purusha-mandala-the-81-grid-matrix');
    });

    it('returns fallback timestamped slug when title has no alphanumeric characters', () => {
      const slug = generateVideoSlug('!!!');
      assert.ok(slug.startsWith('video-'));
    });
  });
});
