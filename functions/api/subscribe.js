export async function onRequestPost(context) {
  const { email, name, tag } = await context.request.json();

  if (!email || !/^.+@.+\..+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  const db = context.env.DB;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if already subscribed
  const existing = await db.prepare(
    'SELECT id, unsubscribed_at FROM subscribers WHERE email = ?'
  ).bind(normalizedEmail).first();

  const isEvent = tag === 'event-june17';
  let subscriberId;

  const trimmedName = name ? name.trim() : null;

  if (existing && !existing.unsubscribed_at) {
    if (!isEvent) {
      return Response.json({ message: 'You are already subscribed.' });
    }
    // Already subscribed but signing up for event: update source to track interest
    subscriberId = existing.id;
    await db.prepare(
      "UPDATE subscribers SET source = 'event-june17', name = COALESCE(?, name) WHERE id = ?"
    ).bind(trimmedName, existing.id).run();
  } else if (existing && existing.unsubscribed_at) {
    // Re-subscribe
    const source = tag || 'website';
    await db.prepare(
      "UPDATE subscribers SET unsubscribed_at = NULL, subscribed_at = datetime('now'), source = ?, name = COALESCE(?, name) WHERE id = ?"
    ).bind(source, trimmedName, existing.id).run();
    subscriberId = existing.id;
  } else {
    const source = tag || 'website';
    const result = await db.prepare(
      'INSERT INTO subscribers (email, name, source) VALUES (?, ?, ?)'
    ).bind(normalizedEmail, trimmedName, source).run();
    subscriberId = result.meta.last_row_id;
  }

  // Generate unsubscribe token
  const unsubToken = crypto.randomUUID();
  await db.prepare(
    'INSERT INTO unsubscribe_tokens (token, subscriber_id) VALUES (?, ?)'
  ).bind(unsubToken, subscriberId).run();

  const unsubUrl = `${context.env.SITE_URL}/api/unsubscribe?token=${unsubToken}`;

  // Send email via Resend
  const resendKey = context.env.RESEND_API_KEY;
  if (resendKey) {
    const emailContent = isEvent
      ? {
          subject: "You're in: Raise a Pint for James - June 17th",
          html: `<p>You've signed up for <strong>Raise a Pint for James</strong>.</p>
                 <p><strong>Date:</strong> June 17th, 2026 (what would have been James's 49th birthday)</p>
                 <p><strong>Location:</strong> Toronto. Exact venue TBA.</p>
                 <p>We'll gather at an old English pub to raise a pint in his name. We look forward to celebrating with you.</p>
                 <p>Details will be sent as the date approaches.</p>
                 <p><a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Raise+a+Pint+for+James&dates=20260617T180000/20260617T230000&location=Toronto%2C+ON&details=James+Campbell%27s+49th+birthday.+We%27ll+gather+at+an+old+English+pub+to+raise+a+pint+in+his+name.+Venue+TBA.%0A%0Ahttps%3A%2F%2Flistenablemusic.ca%2F%23events">Add to Calendar</a></p>
                 <p><a href="${context.env.SITE_URL}/#events">Share a link to this event</a></p>
                 <p style="color: #999; font-size: 12px;">
                   <a href="${unsubUrl}">Unsubscribe</a>
                 </p>`,
        }
      : {
          subject: 'Welcome to Listenable Music',
          html: `<p>Thank you for subscribing to Listenable Music, a tribute to James Campbell (AIA).</p>
                 <p>We will notify you when new content, photos, or music is shared.</p>
                 <p style="color: #999; font-size: 12px;">
                   <a href="${unsubUrl}">Unsubscribe</a>
                 </p>`,
        };

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Listenable Music <hello@listenablemusic.ca>',
        to: normalizedEmail,
        ...emailContent,
      }),
    });
  }

  // Notify admin of new signup
  const adminEmail = context.env.ADMIN_EMAIL;
  if (resendKey && adminEmail) {
    const type = isEvent ? 'event signup' : 'mailing list signup';
    const nameLabel = trimmedName ? ` (${trimmedName})` : '';
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Listenable Music <hello@listenablemusic.ca>',
        to: adminEmail,
        subject: `New ${type}: ${normalizedEmail}`,
        html: `<p><strong>${normalizedEmail}</strong>${nameLabel} just signed up.</p>
               <p><strong>Type:</strong> ${isEvent ? 'Event: Raise a Pint for James' : 'Mailing list'}</p>
               <p><strong>Source:</strong> ${tag || 'website'}</p>`,
      }),
    });
  }

  const message = isEvent
    ? "We look forward to celebrating with you. Check your email for details."
    : 'Subscribed. Thank you.';

  return Response.json({ message });
}
