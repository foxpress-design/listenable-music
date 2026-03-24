import { logEmail } from '../_email-log.js';

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
  const { id, status, reason } = await context.request.json();

  const db = context.env.DB;

  if (status === 'deleted') {
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

  await db.prepare(
    "UPDATE submissions SET status = ?, reviewed_at = datetime('now') WHERE id = ?"
  ).bind(status, id).run();

  // Send rejection email
  if (status === 'rejected') {
    const sub = await db.prepare('SELECT name, email, type FROM submissions WHERE id = ?').bind(id).first();
    const resendKey = context.env.RESEND_API_KEY;
    if (resendKey && sub && sub.email) {
      const siteUrl = context.env.SITE_URL || 'https://listenablemusic.ca';
      const typeLabel = sub.type === 'memory' ? 'memory' : sub.type === 'photo' ? 'photo' : 'music';
      const reasonHtml = reason
        ? `<p><strong>Reason:</strong> ${reason}</p>`
        : '';

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Listenable Music <hello@listenablemusic.ca>',
          to: sub.email,
          subject: 'Update on your submission to Listenable Music',
          html: `<p>Hi ${sub.name},</p>
                 <p>Thank you for sharing your ${typeLabel} on the James Campbell (AIA) memorial. After review, we were not able to include it on the site at this time.</p>
                 ${reasonHtml}
                 <p>Please don't be discouraged. You're welcome to submit again in the future, and we appreciate you taking the time to contribute.</p>
                 <p>With gratitude,<br/>Listenable Music</p>
                 <p style="color: #999; font-size: 12px;"><a href="${siteUrl}">listenablemusic.ca</a></p>`,
        }),
      }).catch(() => {});
      await logEmail(db, { subject: 'Update on your submission to Listenable Music', preview: `Rejection to ${sub.email}${reason ? ': ' + reason : ''}`, sentBy: context.data.adminEmail });
    }
  }

  return Response.json({ success: true });
}
