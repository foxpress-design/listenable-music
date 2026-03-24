async function getTotal(db) {
  const subscribers = await db.prepare(
    "SELECT COUNT(*) as count FROM subscribers WHERE source = 'event-june17' AND unsubscribed_at IS NULL"
  ).first();
  const likes = await db.prepare(
    "SELECT value FROM kv WHERE key = 'event-june17-likes'"
  ).first();
  return (subscribers?.count || 0) + (likes?.value ? parseInt(likes.value, 10) : 0);
}

export async function onRequestGet(context) {
  const db = context.env.DB;
  return Response.json({ count: await getTotal(db) });
}

export async function onRequestPost(context) {
  const { action } = await context.request.json();
  const db = context.env.DB;

  const existing = await db.prepare(
    "SELECT value FROM kv WHERE key = 'event-june17-likes'"
  ).first();
  let likes = existing?.value ? parseInt(existing.value, 10) : 0;

  if (action === 'like') {
    likes = Math.max(0, likes + 1);
  } else if (action === 'unlike') {
    likes = Math.max(0, likes - 1);
  }

  await db.prepare(
    "INSERT INTO kv (key, value) VALUES ('event-june17-likes', ?) ON CONFLICT(key) DO UPDATE SET value = ?"
  ).bind(String(likes), String(likes)).run();

  return Response.json({ count: await getTotal(db) });
}
