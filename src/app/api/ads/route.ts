import { db } from '../../../db/index.ts';
import { advertisements } from '../../../db/schema.ts';
import { eq, and, or, desc, sql } from 'drizzle-orm';

/**
 * Next.js App Router Route Handler: GET /api/ads
 * Fetches active scheduled advertisements from PostgreSQL, optionally filtered by route or placement slot.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const route = url.searchParams.get('route') || '/';
    const placement = url.searchParams.get('placement');
    const now = new Date();

    const conditions = [
      eq(advertisements.isActive, true),
      or(sql`${advertisements.startDate} IS NULL`, sql`${advertisements.startDate} <= ${now}`),
      or(sql`${advertisements.endDate} IS NULL`, sql`${advertisements.endDate} >= ${now}`),
    ];

    if (placement) {
      conditions.push(eq(advertisements.placement, placement.toUpperCase()));
    }

    const adList = await db
      .select({
        id: advertisements.id,
        title: advertisements.title,
        imageUrl: advertisements.imageUrl,
        destinationUrl: advertisements.destinationUrl,
        placement: advertisements.placement,
        priority: advertisements.priority,
        impressions: advertisements.impressions,
        clicks: advertisements.clicks,
      })
      .from(advertisements)
      .where(and(...conditions))
      .orderBy(desc(advertisements.priority), desc(advertisements.id));

    const adsBySlot: Record<string, (typeof adList)[0]> = {};
    for (const ad of adList) {
      const slotKey = ad.placement.toUpperCase();
      if (!adsBySlot[slotKey]) {
        adsBySlot[slotKey] = ad;
      }
    }

    return Response.json({
      route,
      adsBySlot,
      allAds: adList,
    });
  } catch (error) {
    console.error('Next.js API [GET /api/ads] error:', error);
    return Response.json(
      { error: 'Failed to fetch active advertisements', adsBySlot: {}, allAds: [] },
      { status: 500 }
    );
  }
}
