export async function onRequestGet(context) {
  const db = context.env.DB;
  const { results } = await db.prepare(
    'SELECT id, email, name, subscribed_at, unsubscribed_at, source FROM subscribers ORDER BY subscribed_at DESC'
  ).all();
  return Response.json({ subscribers: results });
}
