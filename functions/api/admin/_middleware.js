export async function onRequest(context) {
  const auth = context.request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = auth.slice(7);
  const db = context.env.DB;

  // Only accept 'session' type tokens (not one-time magic link tokens)
  const session = await db.prepare(
    "SELECT email FROM admin_sessions WHERE token = ? AND type = 'session' AND expires_at > datetime('now')"
  ).bind(token).first();

  if (!session || session.email !== context.env.ADMIN_EMAIL?.toLowerCase()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  context.data.adminEmail = session.email;
  return context.next();
}
