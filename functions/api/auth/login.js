import { logEmail } from '../_email-log.js';

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

  const html = `
    <p>Hi,</p>
    <p>You requested a login link for the Listenable Music admin panel. Click the button below to sign in.</p>
    <p style="margin:2rem 0;">
      <a href="${loginUrl}"
         style="background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;font-family:sans-serif;font-size:14px;">
        Log in to Admin
      </a>
    </p>
    <p style="color:#666;font-size:13px;">Or copy and paste this link into your browser:</p>
    <p style="color:#666;font-size:13px;word-break:break-all;">${loginUrl}</p>
    <p style="color:#999;font-size:12px;margin-top:2rem;">This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>
    <p style="color:#999;font-size:12px;">-- Listenable Music</p>
  `;

  const text = `Log in to the Listenable Music admin panel:\n\n${loginUrl}\n\nThis link expires in 15 minutes. If you did not request this, ignore this email.`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Listenable Music <hello@listenablemusic.ca>',
        to: email,
        subject: 'Your admin login link',
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Resend error sending admin login link: ${res.status} ${body}`);
    } else {
      await logEmail(db, {
        subject: 'Your admin login link',
        preview: 'Admin login link',
        recipientCount: 1,
        sentBy: 'system',
        bodyHtml: html,
      });
    }
  } catch (err) {
    console.error('Failed to send admin login email:', err);
  }

  return Response.json({ message: 'If that email is registered, a login link has been sent.' });
}
