export async function onRequestGet(context) {
  const db = context.env.DB;
  const result = await db.prepare(
    "SELECT COUNT(*) as count FROM subscribers WHERE source = 'event-june17' AND unsubscribed_at IS NULL"
  ).first();
  // Likes stored in KV if available, otherwise just return subscriber count
  let likes = 0;
  if (context.env.KV) {
    const val = await context.env.KV.get('event-june17-likes');
    likes = val ? parseInt(val, 10) : 0;
  }
  return Response.json({ count: (result?.count || 0) + likes });
}

export async function onRequestPost(context) {
  const { action } = await context.request.json();
  if (!context.env.KV) {
    return Response.json({ error: 'KV not configured' }, { status: 500 });
  }
  const val = await context.env.KV.get('event-june17-likes');
  let likes = val ? parseInt(val, 10) : 0;
  if (action === 'like') {
    likes = Math.max(0, likes + 1);
  } else if (action === 'unlike') {
    likes = Math.max(0, likes - 1);
  }
  await context.env.KV.put('event-june17-likes', String(likes));

  const db = context.env.DB;
  const result = await db.prepare(
    "SELECT COUNT(*) as count FROM subscribers WHERE source = 'event-june17' AND unsubscribed_at IS NULL"
  ).first();
  return Response.json({ count: (result?.count || 0) + likes });
}
