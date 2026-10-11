import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dataStore } from '../src/lib/dataStore.ts';

describe('Persistent DataStore (src/lib/dataStore.ts)', () => {
  it('loads initial classical Vastu categories, topics, and articles', () => {
    const categories = dataStore.getCategories();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0);

    const topics = dataStore.getTopics();
    assert.ok(Array.isArray(topics));
    assert.ok(topics.length > 0);

    const articles = dataStore.getArticles();
    assert.ok(Array.isArray(articles));
    assert.ok(articles.length > 0);
  });

  it('retrieves site settings with valid contact details and logo URL', () => {
    const settings = dataStore.getSettings();
    assert.ok(settings);
    assert.ok(typeof settings.primaryPhone === 'string');
    assert.ok(typeof settings.primaryEmail === 'string');
    assert.ok(typeof settings.logoUrl === 'string');
  });

  it('creates, updates, and deletes a keyword in dataStore', () => {
    const uniqueSlug = `test-vastu-keyword-${Date.now()}`;
    const created = dataStore.createKeyword({
      name: 'Test Vastu Keyword',
      slug: uniqueSlug,
      description: 'Unit test keyword entry',
    });

    assert.ok(created.id);
    assert.equal(created.slug, uniqueSlug);

    const updated = dataStore.updateKeyword(created.id, {
      description: 'Updated keyword description',
    });
    assert.equal(updated?.description, 'Updated keyword description');

    const deleted = dataStore.deleteKeyword(created.id);
    assert.equal(deleted, true);
  });
});
