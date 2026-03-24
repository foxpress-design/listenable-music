export async function onRequestGet(context) {
  const db = context.env.DB;

  // Get all events from kv table (stored as event-config-{tag})
  const configs = await db.prepare(
    "SELECT key, value FROM kv WHERE key LIKE 'event-config-%'"
  ).all();

  const events = [];
  for (const row of configs.results || []) {
    const config = JSON.parse(row.value);
    const tag = config.tag;

    // Get subscribers for this event
    const subs = await db.prepare(
      'SELECT id, email, name, subscribed_at FROM subscribers WHERE source = ? AND unsubscribed_at IS NULL ORDER BY subscribed_at DESC'
    ).bind(tag).all();

    events.push({
      ...config,
      subscriber_count: subs.results?.length || 0,
      subscribers: subs.results || [],
    });
  }

  return Response.json({ events });
}

export async function onRequestPost(context) {
  const { name, date, location, tag } = await context.request.json();

  if (!name || !date || !tag) {
    return Response.json({ error: 'Name, date, and tag are required' }, { status: 400 });
  }

  const db = context.env.DB;
  const key = `event-config-${tag}`;
  const value = JSON.stringify({ name, date, location: location || '', tag });

  await db.prepare(
    'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
  ).bind(key, value, value).run();

  return Response.json({ success: true });
}
