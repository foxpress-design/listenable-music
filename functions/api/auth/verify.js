export async function onRequestPost(context) {
  const { token } = await context.request.json();
  const db = context.env.DB;

  const session = await db.prepare(
    "SELECT * FROM admin_sessions WHERE token = ? AND used = 0 AND expires_at > datetime('now')"
  ).bind(token).first();

  if (!session) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Mark token as used
  await db.prepare('UPDATE admin_sessions SET used = 1 WHERE token = ?').bind(token).run();

  // Create a long-lived session token (7 days)
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.prepare(
    "INSERT INTO admin_sessions (token, email, type, expires_at) VALUES (?, ?, 'session', ?)"
  ).bind(sessionToken, session.email, expires).run();

  return Response.json({ token: sessionToken, email: session.email });
}
