import { db } from '../../../../db/index.ts';
import { articles, topics, articleTopics } from '../../../../db/schema.ts';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Next.js App Router Route Handler: POST /api/topics/link
 * Links an article with one or more canonical topics directly in PostgreSQL.
 *
 * Accepted JSON payloads:
 * 1) By IDs: { articleId: number, topicId: number, isPrimary?: boolean }
 * 2) By Bulk IDs: { articleId: number, topicIds: number[] }
 * 3) By Slugs: { articleSlug: string, topicSlug: string, isPrimary?: boolean }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, topicId, articleSlug, topicSlug, topicIds, isPrimary = false } = body;

    let targetArticleId: number | null = null;
    const targetTopicIds: number[] = [];

    // Resolve Article ID
    if (articleId) {
      targetArticleId = parseInt(articleId, 10);
    } else if (articleSlug) {
      const art = await db
        .select({ id: articles.id })
        .from(articles)
        .where(eq(articles.slug, articleSlug.toLowerCase().trim()))
        .limit(1);
      if (art.length > 0) {
        targetArticleId = art[0].id;
      } else {
        return Response.json({ error: `Article with slug '${articleSlug}' not found` }, { status: 404 });
      }
    }

    if (!targetArticleId) {
      return Response.json({ error: 'Valid articleId or articleSlug is required' }, { status: 400 });
    }

    // Resolve Topic ID(s)
    if (Array.isArray(topicIds) && topicIds.length > 0) {
      for (const tId of topicIds) {
        const parsed = parseInt(tId, 10);
        if (!isNaN(parsed)) targetTopicIds.push(parsed);
      }
    } else if (topicId) {
      targetTopicIds.push(parseInt(topicId, 10));
    } else if (topicSlug) {
      const top = await db
        .select({ id: topics.id })
        .from(topics)
        .where(eq(topics.slug, topicSlug.toLowerCase().trim()))
        .limit(1);
      if (top.length > 0) {
        targetTopicIds.push(top[0].id);
      } else {
        return Response.json({ error: `Topic with slug '${topicSlug}' not found` }, { status: 404 });
      }
    }

    if (targetTopicIds.length === 0) {
      return Response.json({ error: 'Valid topicId, topicSlug, or topicIds array required' }, { status: 400 });
    }

    const createdLinks = [];
    for (const tId of targetTopicIds) {
      // Check existing relation
      const existing = await db
        .select()
        .from(articleTopics)
        .where(and(eq(articleTopics.articleId, targetArticleId), eq(articleTopics.topicId, tId)))
        .limit(1);

      if (existing.length === 0) {
        const inserted = await db
          .insert(articleTopics)
          .values({
            articleId: targetArticleId,
            topicId: tId,
            isPrimary: Boolean(isPrimary),
          })
          .returning();
        createdLinks.push(inserted[0]);
      } else {
        createdLinks.push(existing[0]);
      }
    }

    // Fetch the updated linked topics with details for client convenience
    const currentLinkedTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
        isPrimary: articleTopics.isPrimary,
      })
      .from(articleTopics)
      .innerJoin(topics, eq(articleTopics.topicId, topics.id))
      .where(eq(articleTopics.articleId, targetArticleId));

    return Response.json({
      success: true,
      message: `Successfully linked ${createdLinks.length} topic(s) to article #${targetArticleId}`,
      articleId: targetArticleId,
      linkedTopics: currentLinkedTopics,
    });
  } catch (error: any) {
    console.error('Next.js API [POST /api/topics/link] error:', error);
    return Response.json({ error: error.message || 'Failed to link topic to article' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: DELETE /api/topics/link
 * Unlinks an article and topic in PostgreSQL.
 *
 * Accepted JSON payload:
 * { articleId: number, topicId: number }
 * OR { articleSlug: string, topicSlug: string }
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let articleId = url.searchParams.get('articleId');
    let topicId = url.searchParams.get('topicId');
    let articleSlug = url.searchParams.get('articleSlug');
    let topicSlug = url.searchParams.get('topicSlug');

    try {
      const body = await request.json();
      if (body.articleId) articleId = body.articleId;
      if (body.topicId) topicId = body.topicId;
      if (body.articleSlug) articleSlug = body.articleSlug;
      if (body.topicSlug) topicSlug = body.topicSlug;
    } catch {
      // url search params used
    }

    let targetArticleId: number | null = null;
    let targetTopicId: number | null = null;

    if (articleId) {
      targetArticleId = parseInt(articleId, 10);
    } else if (articleSlug) {
      const art = await db
        .select({ id: articles.id })
        .from(articles)
        .where(eq(articles.slug, articleSlug.toLowerCase().trim()))
        .limit(1);
      if (art.length > 0) targetArticleId = art[0].id;
    }

    if (topicId) {
      targetTopicId = parseInt(topicId, 10);
    } else if (topicSlug) {
      const top = await db
        .select({ id: topics.id })
        .from(topics)
        .where(eq(topics.slug, topicSlug.toLowerCase().trim()))
        .limit(1);
      if (top.length > 0) targetTopicId = top[0].id;
    }

    if (!targetArticleId || !targetTopicId) {
      return Response.json(
        { error: 'Both article (id or slug) and topic (id or slug) are required' },
        { status: 400 }
      );
    }

    await db
      .delete(articleTopics)
      .where(and(eq(articleTopics.articleId, targetArticleId), eq(articleTopics.topicId, targetTopicId)));

    return Response.json({
      success: true,
      message: `Unlinked topic #${targetTopicId} from article #${targetArticleId}`,
      articleId: targetArticleId,
      topicId: targetTopicId,
    });
  } catch (error: any) {
    console.error('Next.js API [DELETE /api/topics/link] error:', error);
    return Response.json({ error: error.message || 'Failed to unlink topic' }, { status: 500 });
  }
}
