import { db } from '../../../../db/index.ts';
import { topics, topicRelations } from '../../../../db/schema.ts';
import { eq, and, or } from 'drizzle-orm';

/**
 * Next.js App Router Route Handler: GET /api/topics/relations
 * Retrieves topic-to-topic entity relations graph links.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sourceTopicId = url.searchParams.get('sourceTopicId');
    const targetTopicId = url.searchParams.get('targetTopicId');

    const conditions = [];
    if (sourceTopicId) conditions.push(eq(topicRelations.sourceTopicId, parseInt(sourceTopicId, 10)));
    if (targetTopicId) conditions.push(eq(topicRelations.targetTopicId, parseInt(targetTopicId, 10)));

    const relationsList = await db
      .select({
        id: topicRelations.id,
        relationType: topicRelations.relationType,
        sourceTopicId: topicRelations.sourceTopicId,
        targetTopicId: topicRelations.targetTopicId,
        createdAt: topicRelations.createdAt,
      })
      .from(topicRelations)
      .where(conditions.length ? and(...conditions) : undefined);

    return Response.json({ relations: relationsList });
  } catch (error) {
    console.error('Next.js API [GET /api/topics/relations] error:', error);
    return Response.json({ error: 'Failed to retrieve topic relations' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: POST /api/topics/relations
 * Establishes a semantic relationship between two topics/entities.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceTopicId, targetTopicId, relationType = 'related_to' } = body;

    const sId = parseInt(sourceTopicId, 10);
    const tId = parseInt(targetTopicId, 10);

    if (isNaN(sId) || isNaN(tId) || sId === tId) {
      return Response.json(
        { error: 'Valid distinct sourceTopicId and targetTopicId are required' },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(topicRelations)
      .values({
        sourceTopicId: sId,
        targetTopicId: tId,
        relationType,
      })
      .returning();

    return Response.json({ relation: inserted[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Next.js API [POST /api/topics/relations] error:', error);
    return Response.json({ error: error.message || 'Failed to create topic relation' }, { status: 500 });
  }
}

/**
 * Next.js App Router Route Handler: DELETE /api/topics/relations
 */
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    let id = url.searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        if (body.id) id = body.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return Response.json({ error: 'Relation id is required' }, { status: 400 });
    }

    await db.delete(topicRelations).where(eq(topicRelations.id, parseInt(id, 10)));
    return Response.json({ message: 'Relation removed successfully' });
  } catch (error: any) {
    console.error('Next.js API [DELETE /api/topics/relations] error:', error);
    return Response.json({ error: error.message || 'Failed to remove topic relation' }, { status: 500 });
  }
}
