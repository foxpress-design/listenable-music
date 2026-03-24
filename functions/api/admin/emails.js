export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const email = await db.prepare(
      'SELECT id, subject, body_preview, body_html, recipient_count, sent_by, sent_at FROM sent_emails WHERE id = ?'
    ).bind(id).first();
    if (!email) {
      return Response.json({ error: 'Email not found' }, { status: 404 });
    }
    return Response.json({ email });
  }

  // Return all emails
  const { results } = await db.prepare(
    'SELECT id, subject, body_preview, recipient_count, sent_by, sent_at FROM sent_emails ORDER BY sent_at DESC'
  ).all();

  return Response.json({ emails: results || [] });
}
