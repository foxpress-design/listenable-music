export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Invalid unsubscribe link.', { status: 400 });
  }

  const db = context.env.DB;
  const record = await db.prepare(
    'SELECT subscriber_id FROM unsubscribe_tokens WHERE token = ?'
  ).bind(token).first();

  if (!record) {
    return new Response('Invalid or expired unsubscribe link.', { status: 400 });
  }

  await db.prepare(
    "UPDATE subscribers SET unsubscribed_at = datetime('now') WHERE id = ?"
  ).bind(record.subscriber_id).run();

  return new Response(
    '<html><body style="background:#0a0a0a;color:#e0e0e0;font-family:monospace;padding:2rem;text-align:center"><h2>Unsubscribed</h2><p>You have been removed from the mailing list.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  );
}
