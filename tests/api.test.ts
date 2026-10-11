import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server.ts';
import { createSessionToken } from '../src/middleware/auth.ts';

describe('Express REST API Endpoints Integration Suite (server.ts)', () => {
  let server: http.Server;
  let baseUrl: string;
  let adminToken: string;

  before(async () => {
    adminToken = createSessionToken({
      id: 1,
      uid: 'local-admin-1',
      email: 'admin@vasturitam.com',
      displayName: 'Vastu Ritam Acharya',
      role: 'admin',
      avatarUrl: '/trademark-logo.jpg',
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /health returns 200 OK', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.equal(text, 'OK');
  });

  it('GET /robots.txt and GET /sitemap.xml return valid SEO responses', async () => {
    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    assert.equal(robotsRes.status, 200);
    const robotsText = await robotsRes.text();
    assert.ok(robotsText.includes('Sitemap:'));

    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    assert.equal(sitemapRes.status, 200);
    const sitemapXml = await sitemapRes.text();
    assert.ok(sitemapXml.includes('<urlset'));
  });

  it('GET /api/categories returns ordered Vastu categories', async () => {
    const res = await fetch(`${baseUrl}/api/categories`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.categories));
    assert.ok(data.categories.length > 0);
    assert.ok(data.categories[0].name);
    assert.ok(data.categories[0].slug);
  });

  it('GET /api/topics returns Vastu Purusha Mandala and directional topics', async () => {
    const res = await fetch(`${baseUrl}/api/topics`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.topics));
    assert.ok(data.topics.length > 0);
  });

  it('GET /api/articles returns published articles with pagination metadata', async () => {
    const res = await fetch(`${baseUrl}/api/articles?limit=5&page=1`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.articles));
    assert.equal(typeof data.total, 'number');
    assert.equal(typeof data.page, 'number');
    assert.equal(typeof data.totalPages, 'number');
  });

  it('GET /api/videos returns published video learning items', async () => {
    const res = await fetch(`${baseUrl}/api/videos`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.videos));
  });

  it('GET /api/search?q=vastu returns unified search results across entities', async () => {
    const res = await fetch(`${baseUrl}/api/search?q=vastu`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.articles));
    assert.ok(Array.isArray(data.topics));
    assert.ok(Array.isArray(data.categories));
  });

  it('GET /api/contact-details returns public institutional contact settings', async () => {
    const res = await fetch(`${baseUrl}/api/contact-details`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.settings);
    assert.ok(data.settings.primaryEmail);
  });

  it('enforces authentication on /api/admin/* endpoints and allows valid Bearer token', async () => {
    const unauthRes = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.equal(unauthRes.status, 401);

    const authRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    assert.equal(authRes.status, 200);
    const dashboardData = await authRes.json();
    assert.ok(dashboardData.counts);
    assert.equal(typeof dashboardData.counts.totalArticles, 'number');
    assert.ok(Array.isArray(dashboardData.recentLogs));
  });

  it('POST /api/admin/validate-video-url validates YouTube links for authenticated admins', async () => {
    const res = await fetch(`${baseUrl}/api/admin/validate-video-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.valid, true);
    assert.equal(body.provider, 'youtube');
    assert.equal(body.videoId, 'dQw4w9WgXcQ');
  });
});
