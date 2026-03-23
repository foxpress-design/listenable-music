export async function onRequestPost(context) {
  const { email } = await context.request.json();

  if (!email || !/^.+@.+\..+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  const db = context.env.DB;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if already subscribed
  const existing = await db.prepare(
    'SELECT id, unsubscribed_at FROM subscribers WHERE email = ?'
  ).bind(normalizedEmail).first();

  let subscriberId;

  if (existing && !existing.unsubscribed_at) {
    return Response.json({ message: 'You are already subscribed.' });
  }

  if (existing && existing.unsubscribed_at) {
    // Re-subscribe
    await db.prepare(
      "UPDATE subscribers SET unsubscribed_at = NULL, subscribed_at = datetime('now') WHERE id = ?"
    ).bind(existing.id).run();
    subscriberId = existing.id;
  } else {
    const result = await db.prepare(
      'INSERT INTO subscribers (email) VALUES (?)'
    ).bind(normalizedEmail).run();
    subscriberId = result.meta.last_row_id;
  }

  // Generate unsubscribe token
  const unsubToken = crypto.randomUUID();
  await db.prepare(
    'INSERT INTO unsubscribe_tokens (token, subscriber_id) VALUES (?, ?)'
  ).bind(unsubToken, subscriberId).run();

  const unsubUrl = `${context.env.SITE_URL}/api/unsubscribe?token=${unsubToken}`;

  // Send welcome email via Resend
  const resendKey = context.env.RESEND_API_KEY;
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Listenable Music <hello@listenablemusic.ca>',
        to: normalizedEmail,
        subject: 'Welcome to Listenable Music',
        html: `<p>Thank you for subscribing to Listenable Music, a tribute to James Campbell (AIA).</p>
               <p>We will notify you when new content, photos, or music is shared.</p>
               <p style="color: #999; font-size: 12px;">
                 <a href="${unsubUrl}">Unsubscribe</a>
               </p>`,
      }),
    });
  }

  return Response.json({ message: 'Subscribed. Thank you.' });
}
