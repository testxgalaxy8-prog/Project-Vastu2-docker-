import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiCache } from '../src/lib/cache.ts';

describe('In-Memory TTL Cache (src/lib/cache.ts)', () => {
  beforeEach(() => {
    apiCache.clear();
  });

  it('stores and retrieves typed values before TTL expiration', () => {
    apiCache.set('articles:list', [{ id: 1, title: 'Brahmasthana' }], 60);
    const cached = apiCache.get<Array<{ id: number; title: string }>>('articles:list');
    assert.deepEqual(cached, [{ id: 1, title: 'Brahmasthana' }]);
  });

  it('returns null for non-existent keys', () => {
    assert.equal(apiCache.get('non-existent-key'), null);
  });

  it('expires entries after TTL has elapsed', async () => {
    apiCache.set('short-lived', 'value', 0.02); // 20ms TTL
    assert.equal(apiCache.get('short-lived'), 'value');
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.equal(apiCache.get('short-lived'), null);
  });

  it('deletes specific keys cleanly', () => {
    apiCache.set('settings:logo', '/logo.png');
    apiCache.delete('settings:logo');
    assert.equal(apiCache.get('settings:logo'), null);
  });

  it('invalidates only keys matching a given namespace prefix', () => {
    apiCache.set('articles:page:1', 'data1');
    apiCache.set('articles:page:2', 'data2');
    apiCache.set('topics:all', 'topicsData');

    apiCache.invalidatePrefix('articles:');

    assert.equal(apiCache.get('articles:page:1'), null);
    assert.equal(apiCache.get('articles:page:2'), null);
    assert.equal(apiCache.get('topics:all'), 'topicsData');
  });
});
