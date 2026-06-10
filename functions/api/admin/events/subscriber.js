export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const tag = url.searchParams.get('tag');
  const id = url.searchParams.get('id');

  if (!tag || !id) {
    return Response.json({ error: 'tag and id are required' }, { status: 400 });
  }

  const db = context.env.DB;

  // Verify the subscriber belongs to this event tag before deleting
  const sub = await db.prepare(
    'SELECT id FROM subscribers WHERE id = ? AND source = ?'
  ).bind(id, tag).first();

  if (!sub) {
    return Response.json({ error: 'Subscriber not found for this event' }, { status: 404 });
  }

  await db.prepare('DELETE FROM subscribers WHERE id = ?').bind(id).run();

  return Response.json({ ok: true });
}
