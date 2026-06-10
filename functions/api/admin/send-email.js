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
  const { subject, body } = await context.request.json();

  if (!subject || !body) {
    return Response.json({ error: 'Subject and body required' }, { status: 400 });
  }

  const db = context.env.DB;
  const resendKey = context.env.RESEND_API_KEY;

  const { results: subscribers } = await db.prepare(
    'SELECT id, email FROM subscribers WHERE unsubscribed_at IS NULL'
  ).all();

  if (!subscribers.length) {
    return Response.json({ error: 'No active subscribers' }, { status: 400 });
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    let unsub = await db.prepare(
      'SELECT token FROM unsubscribe_tokens WHERE subscriber_id = ?'
    ).bind(sub.id).first();

    if (!unsub) {
      const token = crypto.randomUUID();
      await db.prepare(
        'INSERT INTO unsubscribe_tokens (token, subscriber_id) VALUES (?, ?)'
      ).bind(token, sub.id).run();
      unsub = { token };
    }

    const unsubUrl = `${context.env.SITE_URL}/api/unsubscribe?token=${unsub.token}`;

    const htmlBody = body.replace(/\n/g, '<br>');
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Listenable Music <hello@listenablemusic.ca>',
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
    } catch {
      failed++;
    }
  }

  await db.prepare(
    'INSERT INTO sent_emails (subject, body_preview, recipient_count, sent_by, body_html) VALUES (?, ?, ?, ?, ?)'
  ).bind(subject, body.slice(0, 200), sent, context.data.adminEmail, body.replace(/\n/g, '<br>')).run();

  return Response.json({ sent, failed, total: subscribers.length });
}
