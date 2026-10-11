import { db } from '../../../db/index.ts';
import { categories, articles } from '../../../db/schema.ts';
import { eq, asc, sql } from 'drizzle-orm';

/**
 * Next.js App Router Route Handler: GET /api/categories
 * Retrieves all categories with published article counts.
 */
export async function GET() {
  try {
    const cats = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        displayOrder: categories.displayOrder,
      })
      .from(categories)
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    const counts = await db
      .select({
        categoryId: articles.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .groupBy(articles.categoryId);

    const countMap = new Map<number, number>();
    for (const c of counts) {
      if (c.categoryId) countMap.set(c.categoryId, Number(c.count));
    }

    const categoriesWithCount = cats.map((cat) => ({
      ...cat,
      articleCount: countMap.get(cat.id) || 0,
    }));

    return Response.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Next.js API [GET /api/categories] error:', error);
    return Response.json({ error: 'Failed to retrieve categories' }, { status: 500 });
  }
}
