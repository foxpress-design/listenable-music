const TAG_RE = /^event-[a-z0-9-]+$/;

async function getTotal(db, tag) {
  const subscribers = await db.prepare(
    'SELECT COUNT(*) as count FROM subscribers WHERE source = ? AND unsubscribed_at IS NULL'
  ).bind(tag).first();
  const likes = await db.prepare(
    'SELECT value FROM kv WHERE key = ?'
  ).bind(`${tag}-likes`).first();
  return (subscribers?.count || 0) + (likes?.value ? parseInt(likes.value, 10) : 0);
}

export async function onRequestGet(context) {
  const tag = new URL(context.request.url).searchParams.get('tag');
  if (!TAG_RE.test(tag || '')) {
    return Response.json({ error: 'Invalid tag' }, { status: 400 });
  }
  return Response.json({ count: await getTotal(context.env.DB, tag) });
}

export async function onRequestPost(context) {
  const { tag, action } = await context.request.json();
  if (!TAG_RE.test(tag || '')) {
    return Response.json({ error: 'Invalid tag' }, { status: 400 });
  }
  const db = context.env.DB;
  const key = `${tag}-likes`;

  const existing = await db.prepare('SELECT value FROM kv WHERE key = ?').bind(key).first();
  let likes = existing?.value ? parseInt(existing.value, 10) : 0;

  if (action === 'like') {
    likes = Math.max(0, likes + 1);
  } else if (action === 'unlike') {
    likes = Math.max(0, likes - 1);
  }

  await db.prepare(
    'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?'
  ).bind(key, String(likes), String(likes)).run();

  return Response.json({ count: await getTotal(db, tag) });
}
