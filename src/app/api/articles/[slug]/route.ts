import { db } from '../../../../db/index.ts';
import {
  articles,
  categories,
  topics,
  articleTopics,
  keywords,
  articleKeywords,
  users,
} from '../../../../db/schema.ts';
import { eq, and, sql } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

/**
 * Next.js App Router Route Handler: GET /api/articles/[slug]
 * Retrieves full article details directly from PostgreSQL, increments view count,
 * and fetches linked canonical topics, keywords, and related articles.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    if (!slug) {
      return Response.json({ error: 'Article slug is required' }, { status: 400 });
    }

    const articleRows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        featuredImage: articles.featuredImage,
        categoryId: articles.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        authorName: users.displayName,
        metaTitle: articles.metaTitle,
        metaDescription: articles.metaDescription,
        readingTimeMinutes: articles.readingTimeMinutes,
        viewsCount: articles.viewsCount,
        publishedAt: articles.publishedAt,
        status: articles.status,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (articleRows.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = articleRows[0];

    // Increment views count asynchronously
    db.update(articles)
      .set({ viewsCount: sql`${articles.viewsCount} + 1` })
      .where(eq(articles.id, article.id))
      .catch((err) => console.error('Next.js API view increment error:', err));

    // Fetch linked canonical topics
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

    // Fetch linked keywords
    const linkedKeywords = await db
      .select({
        id: keywords.id,
        name: keywords.name,
        slug: keywords.slug,
      })
      .from(articleKeywords)
      .innerJoin(keywords, eq(articleKeywords.keywordId, keywords.id))
      .where(eq(articleKeywords.articleId, article.id));

    // Related articles based on same category
    let relatedArticles: any[] = [];
    if (article.categoryId) {
      relatedArticles = await db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          featuredImage: articles.featuredImage,
          readingTimeMinutes: articles.readingTimeMinutes,
        })
        .from(articles)
        .where(
          and(
            eq(articles.status, 'published'),
            eq(articles.categoryId, article.categoryId),
            sql`${articles.id} != ${article.id}`
          )
        )
        .limit(3);
    }

    // Breadcrumbs hierarchy
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      {
        label: article.categoryName || 'Articles',
        path: article.categorySlug ? `/category/${article.categorySlug}` : '/knowledge',
      },
      { label: article.title, path: `/knowledge/${article.slug}` },
    ];

    return Response.json({
      article: {
        ...article,
        topics: linkedTopics,
        keywords: linkedKeywords,
      },
      relatedArticles,
      breadcrumbs,
    });
  } catch (error) {
    console.error('Next.js API [GET /api/articles/[slug]] error:', error);
    return Response.json({ error: 'Failed to retrieve article from database' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: PUT /api/articles/[slug]
 * Updates an article by its slug.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const existing = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (existing.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    const current = existing[0];
    const body = await request.json();
    const {
      title,
      newSlug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      status,
      metaTitle,
      metaDescription,
      readingTimeMinutes,
      topicIds,
    } = body;

    let publishedAt = current.publishedAt;
    if (status === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    const updated = await db
      .update(articles)
      .set({
        title: title || current.title,
        slug: newSlug ? newSlug.toLowerCase().trim() : current.slug,
        excerpt: excerpt !== undefined ? excerpt : current.excerpt,
        content: content !== undefined ? content : current.content,
        featuredImage: featuredImage !== undefined ? featuredImage : current.featuredImage,
        categoryId:
          categoryId !== undefined
            ? categoryId
              ? parseInt(categoryId, 10)
              : null
            : current.categoryId,
        status: status || current.status,
        metaTitle: metaTitle !== undefined ? metaTitle : current.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : current.metaDescription,
        readingTimeMinutes: readingTimeMinutes
          ? parseInt(readingTimeMinutes, 10)
          : current.readingTimeMinutes,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, current.id))
      .returning();

    // If topicIds provided, update relations
    if (Array.isArray(topicIds)) {
      await db.delete(articleTopics).where(eq(articleTopics.articleId, current.id));
      for (const tId of topicIds) {
        await db.insert(articleTopics).values({
          articleId: current.id,
          topicId: parseInt(tId, 10),
          isPrimary: false,
        });
      }
    }

    return Response.json({ article: updated[0] });
  } catch (error: any) {
    console.error('Next.js API [PUT /api/articles/[slug]] error:', error);
    return Response.json({ error: error.message || 'Failed to update article' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: DELETE /api/articles/[slug]
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const existing = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug.toLowerCase().trim()))
      .limit(1);

    if (existing.length === 0) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    await db.delete(articles).where(eq(articles.id, existing[0].id));
    return Response.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('Next.js API [DELETE /api/articles/[slug]] error:', error);
    return Response.json({ error: error.message || 'Failed to delete article' }, { status: 500 });
  }
}
