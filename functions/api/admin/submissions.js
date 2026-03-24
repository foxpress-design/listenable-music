export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const status = url.searchParams.get('status') || 'pending';
  const db = context.env.DB;
  const { results } = await db.prepare(
    'SELECT * FROM submissions WHERE status = ? ORDER BY submitted_at DESC'
  ).bind(status).all();
  return Response.json({ submissions: results });
}

export async function onRequestPatch(context) {
  const { id, status } = await context.request.json();

  if (status === 'deleted') {
    const db = context.env.DB;
    const sub = await db.prepare('SELECT file_key FROM submissions WHERE id = ?').bind(id).first();
    if (sub && sub.file_key && !sub.file_key.startsWith('http')) {
      try { await context.env.UPLOADS.delete(sub.file_key) } catch {}
    }
    await db.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();
    return Response.json({ success: true });
  }

  if (!['approved', 'rejected'].includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }
  const db = context.env.DB;
  await db.prepare(
    "UPDATE submissions SET status = ?, reviewed_at = datetime('now') WHERE id = ?"
  ).bind(status, id).run();
  return Response.json({ success: true });
}
