import { db } from '../../../../../db/index.ts';
import { articles, topics, articleTopics } from '../../../../../db/schema.ts';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

/**
 * Next.js App Router Route Handler: GET /api/articles/[slug]/topics
 * Returns all canonical topics linked to this article.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const articleRows = await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug })
      .from(articles)
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (articleRows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = articleRows[0];

    const linkedTopics = await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        sanskritName: topics.sanskritName,
        entityType: topics.entityType,
        summary: topics.summary,
        imageUrl: topics.imageUrl,
        isPrimary: articleTopics.isPrimary,
      })
      .from(articleTopics)
      .innerJoin(topics, eq(articleTopics.topicId, topics.id))
      .where(eq(articleTopics.articleId, article.id));

    return Response.json({
      article: { id: article.id, slug: article.slug, title: article.title },
      topics: linkedTopics,
    });
  } catch (error) {
    console.error('Next.js API [GET /api/articles/[slug]/topics] error:', error);
    return Response.json({ error: 'Failed to retrieve article topics' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: POST /api/articles/[slug]/topics
 * Links one or more topics to the article directly in PostgreSQL.
 * Body can be:
 *   { topicId: number, isPrimary?: boolean }
 *   OR { topicSlug: string, isPrimary?: boolean }
 *   OR { topicIds: number[] }
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const articleRows = await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug })
      .from(articles)
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (articleRows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = articleRows[0];
    const body = await request.json();
    const { topicId, topicSlug, topicIds, isPrimary = false } = body;

    const idsToLink: number[] = [];

    if (Array.isArray(topicIds)) {
      for (const id of topicIds) {
        const numId = parseInt(id, 10);
        if (!isNaN(numId)) idsToLink.push(numId);
      }
    } else if (topicId) {
      idsToLink.push(parseInt(topicId, 10));
    } else if (topicSlug) {
      const top = await db
        .select({ id: topics.id })
        .from(topics)
        .where(eq(topics.slug, topicSlug.toLowerCase().trim()))
        .limit(1);
      if (top.length > 0) {
        idsToLink.push(top[0].id);
      } else {
        return Response.json({ error: `Topic with slug '${topicSlug}' not found` }, { status: 404 });
      }
    } else {
      return Response.json({ error: 'topicId, topicSlug, or topicIds required' }, { status: 400 });
    }

    const linkedResults = [];
    for (const tId of idsToLink) {
      // Check if already linked
      const existing = await db
        .select()
        .from(articleTopics)
        .where(and(eq(articleTopics.articleId, article.id), eq(articleTopics.topicId, tId)))
        .limit(1);

      if (existing.length === 0) {
        const inserted = await db
          .insert(articleTopics)
          .values({
            articleId: article.id,
            topicId: tId,
            isPrimary: Boolean(isPrimary),
          })
          .returning();
        linkedResults.push(inserted[0]);
      } else {
        linkedResults.push(existing[0]);
      }
    }

    return Response.json({
      message: `Successfully linked ${linkedResults.length} topic(s) to article`,
      articleId: article.id,
      articleSlug: article.slug,
      links: linkedResults,
    });
  } catch (error: any) {
    console.error('Next.js API [POST /api/articles/[slug]/topics] error:', error);
    return Response.json({ error: error.message || 'Failed to link topic to article' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: DELETE /api/articles/[slug]/topics
 * Unlinks a topic from the article.
 * Accepts ?topicId= or ?topicSlug=, or JSON body { topicId } or { topicSlug }.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const articleRows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (articleRows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = articleRows[0];
    const url = new URL(request.url);
    let targetTopicId: number | null = null;

    if (url.searchParams.get('topicId')) {
      targetTopicId = parseInt(url.searchParams.get('topicId')!, 10);
    } else if (url.searchParams.get('topicSlug')) {
      const top = await db
        .select({ id: topics.id })
        .from(topics)
        .where(eq(topics.slug, url.searchParams.get('topicSlug')!.toLowerCase().trim()))
        .limit(1);
      if (top.length > 0) targetTopicId = top[0].id;
    } else {
      try {
        const body = await request.json();
        if (body.topicId) targetTopicId = parseInt(body.topicId, 10);
        else if (body.topicSlug) {
          const top = await db
            .select({ id: topics.id })
            .from(topics)
            .where(eq(topics.slug, body.topicSlug.toLowerCase().trim()))
            .limit(1);
          if (top.length > 0) targetTopicId = top[0].id;
        }
      } catch {
        // no body provided
      }
    }

    if (!targetTopicId) {
      return Response.json({ error: 'Valid topicId or topicSlug required to unlink' }, { status: 400 });
    }

    await db
      .delete(articleTopics)
      .where(and(eq(articleTopics.articleId, article.id), eq(articleTopics.topicId, targetTopicId)));

    return Response.json({ message: 'Topic unlinked successfully', articleId: article.id, topicId: targetTopicId });
  } catch (error: any) {
    console.error('Next.js API [DELETE /api/articles/[slug]/topics] error:', error);
    return Response.json({ error: error.message || 'Failed to unlink topic' }, { status: 500 });
  }
}
