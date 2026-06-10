function htmlToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<hr[^>]*>/gi, '\n---\n')
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&mdash;/g, '-').replace(/&ndash;/g, '-').replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '\xb7').replace(/&#x1F4CD;/g, '📍')
    .replace(/\n{3,}/g, '\n\n').trim();
}

function wrapHtml(body, unsubUrl) {
  return `<!DOCTYPE html><html><body>${body}<hr style="border:none;border-top:1px solid #333;margin:2rem 0"><p style="color:#999;font-size:12px"><a href="${unsubUrl}" style="color:#999">Unsubscribe</a></p></body></html>`;
}

export async function onRequestPost(context) {
  const { tag, subject, body, emails } = await context.request.json();

  if (!tag || !subject || !body) {
    return Response.json({ error: 'Tag, subject, and body are required' }, { status: 400 });
  }

  const db = context.env.DB;
  const resendKey = context.env.RESEND_API_KEY;

  // Get subscribers for this event
  const subs = await db.prepare(
    'SELECT id, email FROM subscribers WHERE source = ? AND unsubscribed_at IS NULL'
  ).bind(tag).all();

  let subscribers = subs.results || [];

  // If specific emails were selected, filter to only those
  if (Array.isArray(emails) && emails.length > 0) {
    const emailSet = new Set(emails.map(e => e.toLowerCase()));
    subscribers = subscribers.filter(s => emailSet.has(s.email.toLowerCase()));
  }
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    // Get or create unsubscribe token
    let tokenRow = await db.prepare(
      'SELECT token FROM unsubscribe_tokens WHERE subscriber_id = ?'
    ).bind(sub.id).first();

    if (!tokenRow) {
      const newToken = crypto.randomUUID();
      await db.prepare(
        'INSERT INTO unsubscribe_tokens (token, subscriber_id) VALUES (?, ?)'
      ).bind(newToken, sub.id).run();
      tokenRow = { token: newToken };
    }

    if (sent + failed > 0) await new Promise(r => setTimeout(r, 250));
    const unsubUrl = `${context.env.SITE_URL}/api/unsubscribe?token=${tokenRow.token}`;
    const htmlBody = body.replace(/\n/g, '<br>');

    try {
      if (resendKey) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Listenable Music <hello@listenablemusic.ca>',
            reply_to: 'philip@foxpress.design',
            to: sub.email,
            subject,
            html: wrapHtml(htmlBody, unsubUrl),
            text: `${htmlToText(htmlBody)}\n\n---\nUnsubscribe: ${unsubUrl}`,
            headers: {
              'List-Unsubscribe': `<${unsubUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          }),
        });
        if (res.ok) sent++;
        else failed++;
      }
    } catch {
      failed++;
    }
  }

  // Log to sent_emails
  const htmlBody = body.replace(/\n/g, '<br>');
  await db.prepare(
    "INSERT INTO sent_emails (subject, body_preview, recipient_count, sent_by, body_html) VALUES (?, ?, ?, ?, ?)"
  ).bind(subject, body.substring(0, 200), sent, context.data.adminEmail || 'admin', htmlBody).run();

  return Response.json({ sent, failed, total: subscribers.length });
}
