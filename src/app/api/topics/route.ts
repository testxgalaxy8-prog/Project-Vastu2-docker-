import { db } from '../../../db/index.ts';
import { topics, articles, articleTopics } from '../../../db/schema.ts';
import { eq, asc, and, ilike, or, sql } from 'drizzle-orm';

/**
 * Next.js App Router Route Handler: GET /api/topics
 * Returns canonical topics/entities from PostgreSQL, with optional entityType & search filters,
 * including counts of published articles linking to each topic.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const entityType = url.searchParams.get('entityType');
    const search = url.searchParams.get('search');

    const conditions = [];
    if (entityType && entityType.trim()) {
      conditions.push(eq(topics.entityType, entityType.trim()));
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(topics.name, term),
          ilike(topics.sanskritName || '', term),
          ilike(topics.summary, term)
        )!
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const topicList = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
        imageUrl: topics.imageUrl,
        createdAt: topics.createdAt,
      })
      .from(topics)
      .where(whereClause)
      .orderBy(asc(topics.name));

    // Get article counts for each topic
    const counts = await db
      .select({
        topicId: articleTopics.topicId,
        count: sql<number>`count(${articles.id})`,
      })
      .from(articleTopics)
      .innerJoin(articles, eq(articleTopics.articleId, articles.id))
      .where(eq(articles.status, 'published'))
      .groupBy(articleTopics.topicId);

    const countMap = new Map<number, number>();
    for (const c of counts) {
      countMap.set(c.topicId, Number(c.count));
    }

    const formattedTopics = topicList.map((t) => ({
      ...t,
      articleCount: countMap.get(t.id) || 0,
    }));

    return Response.json({ topics: formattedTopics, total: formattedTopics.length });
  } catch (error) {
    console.error('Next.js API [GET /api/topics] error:', error);
    return Response.json({ error: 'Failed to retrieve topics from database' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: POST /api/topics
 * Creates a new canonical topic/entity in PostgreSQL.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      sanskritName,
      entityType = 'concept',
      summary,
      description,
      imageUrl,
      metaTitle,
      metaDescription,
    } = body;

    if (!name || !slug || !summary || !description) {
      return Response.json(
        { error: 'Name, slug, summary, and description are required' },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(topics)
      .values({
        name,
        slug: slug.toLowerCase().trim(),
        sanskritName,
        entityType,
        summary,
        description,
        imageUrl,
        metaTitle,
        metaDescription,
      })
      .returning();

    return Response.json({ topic: inserted[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Next.js API [POST /api/topics] error:', error);
    return Response.json({ error: error.message || 'Failed to create topic' }, { status: 500 });
  }
}
