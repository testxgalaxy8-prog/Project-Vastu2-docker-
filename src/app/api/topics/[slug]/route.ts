import { db } from '../../../../db/index.ts';
import { topics, topicRelations, articles, articleTopics, categories } from '../../../../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

/**
 * Next.js App Router Route Handler: GET /api/topics/[slug]
 * Retrieves topic by slug from PostgreSQL with bidirectional knowledge graph relations and linked articles.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    if (!slug) {
      return Response.json({ error: 'Topic slug is required' }, { status: 400 });
    }

    const topicRows = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (topicRows.length === 0) {
      return Response.json({ error: 'Topic not found' }, { status: 404 });
    }

    const topic = topicRows[0];

    // Outgoing Topic-to-Topic relations
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

    // Incoming Topic-to-Topic relations
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

    // Articles linking to this topic
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
      .where(and(eq(articleTopics.topicId, topic.id), eq(articles.status, 'published')))
      .orderBy(desc(articles.publishedAt));

    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Topics & Entities', path: '/topics' },
      { label: topic.name, path: `/topic/${topic.slug}` },
    ];

    return Response.json({
      topic,
      relations: {
        outgoing,
        incoming,
      },
      articles: linkedArticles,
      breadcrumbs,
    });
  } catch (error) {
    console.error('Next.js API [GET /api/topics/[slug]] error:', error);
    return Response.json({ error: 'Failed to retrieve topic details from database' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: PUT /api/topics/[slug]
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const existing = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (existing.length === 0) {
      return Response.json({ error: 'Topic not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, newSlug, sanskritName, entityType, summary, description, imageUrl, metaTitle, metaDescription } =
      body;

    const updated = await db
      .update(topics)
      .set({
        name: name || existing[0].name,
        slug: newSlug ? newSlug.toLowerCase().trim() : existing[0].slug,
        sanskritName: sanskritName !== undefined ? sanskritName : existing[0].sanskritName,
        entityType: entityType || existing[0].entityType,
        summary: summary !== undefined ? summary : existing[0].summary,
        description: description !== undefined ? description : existing[0].description,
        imageUrl: imageUrl !== undefined ? imageUrl : existing[0].imageUrl,
        metaTitle: metaTitle !== undefined ? metaTitle : existing[0].metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing[0].metaDescription,
        updatedAt: new Date(),
      })
      .where(eq(topics.id, existing[0].id))
      .returning();

    return Response.json({ topic: updated[0] });
  } catch (error: any) {
    console.error('Next.js API [PUT /api/topics/[slug]] error:', error);
    return Response.json({ error: error.message || 'Failed to update topic' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: DELETE /api/topics/[slug]
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const existing = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (existing.length === 0) {
      return Response.json({ error: 'Topic not found' }, { status: 404 });
    }

    await db.delete(topics).where(eq(topics.id, existing[0].id));
    return Response.json({ message: 'Topic deleted successfully' });
  } catch (error: any) {
    console.error('Next.js API [DELETE /api/topics/[slug]] error:', error);
    return Response.json({ error: error.message || 'Failed to delete topic' }, { status: 500 });
  }
}
