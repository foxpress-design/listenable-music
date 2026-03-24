export async function onRequestGet(context) {
  const db = context.env.DB;
  const result = await db.prepare(
    "SELECT COUNT(*) as count FROM subscribers WHERE source = 'event-june17' AND unsubscribed_at IS NULL"
  ).first();
  return Response.json({ count: result?.count || 0 });
}
