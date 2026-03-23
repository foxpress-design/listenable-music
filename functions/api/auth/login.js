export async function onRequestPost(context) {
  const { email } = await context.request.json();
  const adminEmail = context.env.ADMIN_EMAIL;

  if (email?.toLowerCase() !== adminEmail?.toLowerCase()) {
    // Don't reveal whether the email is valid
    return Response.json({ message: 'If that email is registered, a login link has been sent.' });
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  const db = context.env.DB;
  await db.prepare(
    'INSERT INTO admin_sessions (token, email, expires_at) VALUES (?, ?, ?)'
  ).bind(token, email.toLowerCase(), expires).run();

  const loginUrl = `${context.env.SITE_URL}/admin?token=${token}`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Listenable Music <admin@listenablemusic.ca>',
      to: email,
      subject: 'Admin Login - Listenable Music',
      html: `<p>Click to log in:</p>
             <p><a href="${loginUrl}">${loginUrl}</a></p>
             <p style="color:#999;font-size:12px;">This link expires in 15 minutes.</p>`,
    }),
  });

  return Response.json({ message: 'If that email is registered, a login link has been sent.' });
}
