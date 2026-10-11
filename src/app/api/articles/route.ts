import { db } from '../../../db/index.ts';
import { articles, categories, topics, articleTopics, keywords, articleKeywords } from '../../../db/schema.ts';
import { eq, desc, and, or, ilike, sql, inArray } from 'drizzle-orm';

/**
 * Next.js App Router Route Handler: GET /api/articles
 * Direct PostgreSQL querying with category, topic, keyword, and search filters.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const topic = url.searchParams.get('topic');
    const keyword = url.searchParams.get('keyword');
    const search = url.searchParams.get('search');
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
    const offset = (page - 1) * limit;

    const conditions = [eq(articles.status, 'published')];

    // Category filter
    if (category) {
      const cat = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
      if (cat.length > 0) {
        conditions.push(eq(articles.categoryId, cat[0].id));
      } else {
        return Response.json({ articles: [], total: 0, page, totalPages: 0 });
      }
    }

    // Topic filter (via ArticleTopic M:N relation)
    if (topic) {
      const top = await db.select().from(topics).where(eq(topics.slug, topic)).limit(1);
      if (top.length > 0) {
        const artTopicRels = await db
          .select({ articleId: articleTopics.articleId })
          .from(articleTopics)
          .where(eq(articleTopics.topicId, top[0].id));
        const artIds = artTopicRels.map((r) => r.articleId);
        if (artIds.length > 0) {
          conditions.push(inArray(articles.id, artIds));
        } else {
          return Response.json({ articles: [], total: 0, page, totalPages: 0 });
        }
      } else {
        return Response.json({ articles: [], total: 0, page, totalPages: 0 });
      }
    }

    // Keyword filter
    if (keyword) {
      const kw = await db.select().from(keywords).where(eq(keywords.slug, keyword)).limit(1);
      if (kw.length > 0) {
        const artKwRels = await db
          .select({ articleId: articleKeywords.articleId })
          .from(articleKeywords)
          .where(eq(articleKeywords.keywordId, kw[0].id));
        const artIds = artKwRels.map((r) => r.articleId);
        if (artIds.length > 0) {
          conditions.push(inArray(articles.id, artIds));
        } else {
          return Response.json({ articles: [], total: 0, page, totalPages: 0 });
        }
      } else {
        return Response.json({ articles: [], total: 0, page, totalPages: 0 });
      }
    }

    // Search term
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(articles.title, term),
          ilike(articles.excerpt, term),
          ilike(articles.content, term)
        )!
      );
    }

    const whereClause = and(...conditions);

    // Total Count
    const totalRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(whereClause);
    const total = Number(totalRes[0]?.count || 0);

    // Fetch Articles
    const articleRows = await db
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
      .limit(limit)
      .offset(offset);

    // Fetch linked canonical topics for each article
    const articleIds = articleRows.map((a) => a.id);
    const topicsMap = new Map<number, any[]>();

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

    const formattedArticles = articleRows.map((a) => ({
      ...a,
      topics: topicsMap.get(a.id) || [],
    }));

    return Response.json({
      articles: formattedArticles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Next.js API [GET /api/articles] error:', error);
    return Response.json({ error: 'Failed to fetch articles from database' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: POST /api/articles
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    } = body;

    if (!title || !slug || !excerpt || !content) {
      return Response.json({ error: 'Title, slug, excerpt, and content are required' }, { status: 400 });
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const inserted = await db
      .insert(articles)
      .values({
        title,
        slug: slug.toLowerCase().trim(),
        excerpt,
        content,
        featuredImage,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        status,
        metaTitle,
        metaDescription,
        readingTimeMinutes: parseInt(readingTimeMinutes, 10) || 5,
        publishedAt,
      })
      .returning();

    const newArticle = inserted[0];

    // Link topics if provided
    if (Array.isArray(topicIds) && topicIds.length > 0) {
      for (const tId of topicIds) {
        await db.insert(articleTopics).values({
          articleId: newArticle.id,
          topicId: parseInt(tId, 10),
          isPrimary: false,
        });
      }
    }

    return Response.json({ article: newArticle }, { status: 201 });
  } catch (error: any) {
    console.error('Next.js API [POST /api/articles] error:', error);
    return Response.json({ error: error.message || 'Failed to create article' }, { status: 500 });
  }
}
