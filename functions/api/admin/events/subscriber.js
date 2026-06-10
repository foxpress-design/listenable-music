export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'id is required' }, { status: 400 });
  }

  const db = context.env.DB;

  const sub = await db.prepare(
    'SELECT id FROM subscribers WHERE id = ?'
  ).bind(id).first();

  if (!sub) {
    return Response.json({ error: 'Subscriber not found' }, { status: 404 });
  }

  await db.prepare('DELETE FROM unsubscribe_tokens WHERE subscriber_id = ?').bind(id).run();
  await db.prepare('DELETE FROM subscribers WHERE id = ?').bind(id).run();

  return Response.json({ ok: true });
}
