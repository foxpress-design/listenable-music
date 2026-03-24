import { logEmail } from '../_email-log.js';

async function sendEmails(context, { type, name, email, submissionId, preview }) {
  const resendKey = context.env.RESEND_API_KEY;
  if (!resendKey) return;
  const db = context.env.DB;

  const siteUrl = context.env.SITE_URL || 'https://listenablemusic.ca';
  const adminEmail = context.env.ADMIN_EMAIL;
  const typeLabel = type === 'memory' ? 'memory' : type === 'photo' ? 'photo' : 'music';

  // Email to submitter (if they provided email)
  if (email) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Listenable Music <hello@listenablemusic.ca>',
        to: email,
        subject: 'Your submission has been received',
        html: `<p>Hi ${name},</p>
               <p>Thank you for sharing your ${typeLabel} on the James Campbell (AIA) memorial.</p>
               <p>Your submission has been received and will be reviewed shortly. Once approved, it will appear on the site for everyone to see.</p>
               <p>With gratitude,<br/>Listenable Music</p>
               <p style="color: #999; font-size: 12px;"><a href="${siteUrl}">listenablemusic.ca</a></p>`,
      }),
    }).catch(() => {});
    await logEmail(db, { subject: 'Your submission has been received', preview: `Confirmation to ${email}`, sentBy: 'system' });
  }

  // Email to admin
  if (adminEmail) {
    const approveUrl = `${siteUrl}/api/submissions/action?id=${submissionId}&action=approved&key=${encodeURIComponent(resendKey.slice(-8))}`;
    const rejectUrl = `${siteUrl}/api/submissions/action?id=${submissionId}&action=rejected&key=${encodeURIComponent(resendKey.slice(-8))}`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Listenable Music <hello@listenablemusic.ca>',
        to: adminEmail,
        subject: `New ${typeLabel} submission from ${name}`,
        html: `<p>New ${typeLabel} submission on Listenable Music:</p>
               <table style="font-family: monospace; font-size: 14px; margin: 16px 0;">
                 <tr><td style="padding: 4px 12px 4px 0; color: #999;">From</td><td>${name}${email ? ` (${email})` : ''}</td></tr>
                 <tr><td style="padding: 4px 12px 4px 0; color: #999;">Type</td><td>${typeLabel}</td></tr>
                 ${preview ? `<tr><td style="padding: 4px 12px 4px 0; color: #999;">Content</td><td>${preview}</td></tr>` : ''}
               </table>
               <p>
                 <a href="${approveUrl}" style="display: inline-block; padding: 10px 24px; background: #166534; color: #4ade80; text-decoration: none; font-family: monospace; font-weight: bold; margin-right: 8px;">APPROVE</a>
                 <a href="${rejectUrl}" style="display: inline-block; padding: 10px 24px; background: #333; color: #999; text-decoration: none; font-family: monospace; font-weight: bold;">REJECT</a>
               </p>
               <p style="color: #999; font-size: 12px;">Or review in the <a href="${siteUrl}/admin">admin dashboard</a>.</p>`,
      }),
    }).catch(() => {});
    await logEmail(db, { subject: `New ${typeLabel} submission from ${name}`, preview: preview || '', sentBy: 'system' });
  }
}

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const type = formData.get('type');
    const name = formData.get('name');
    const email = formData.get('email');
    const caption = formData.get('caption');
    const story = formData.get('story');
    const musicSource = formData.get('musicSource');
    const musicUrl = formData.get('musicUrl');
    const file = formData.get('file');

    if (!name || !type) {
      return Response.json({ error: 'Name and submission type are required' }, { status: 400 });
    }

    const db = context.env.DB;

    if (type === 'memory') {
      if (!story || !story.trim()) {
        return Response.json({ error: 'Please write your memory or story' }, { status: 400 });
      }

      const storyKey = `submissions/memory/${Date.now()}-story.txt`;
      await context.env.UPLOADS.put(storyKey, story, {
        httpMetadata: { contentType: 'text/plain' },
      });

      const result = await db.prepare(
        `INSERT INTO submissions (type, name, email, caption, file_key, file_name, file_size)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind('memory', name, email || null, caption || null, storyKey, 'story.txt', story.length).run();

      const submissionId = result.meta.last_row_id;
      const preview = story.length > 200 ? story.slice(0, 200) + '...' : story;
      await sendEmails(context, { type, name, email, submissionId, preview });

      return Response.json({ message: 'Thank you! Your memory will be reviewed and shared.' });
    }

    if (type === 'music' && musicSource && musicSource !== 'file') {
      if (!musicUrl || !musicUrl.trim()) {
        return Response.json({ error: 'Please provide a URL' }, { status: 400 });
      }

      const result = await db.prepare(
        `INSERT INTO submissions (type, name, email, caption, file_key, file_name, file_size)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind('music', name, email || null, caption || null, musicUrl, `${musicSource} link`, 0).run();

      const submissionId = result.meta.last_row_id;
      await sendEmails(context, { type, name, email, submissionId, preview: musicUrl });

      return Response.json({ message: 'Thank you! Your submission will be reviewed.' });
    }

    if (!file) {
      return Response.json({ error: 'Please select a file to upload' }, { status: 400 });
    }

    const allowedPhoto = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedMusic = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
    const allowed = type === 'photo' ? allowedPhoto : allowedMusic;

    if (!allowed.includes(file.type)) {
      return Response.json({ error: `File type not allowed. Accepted: ${allowed.join(', ')}` }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 50MB)' }, { status: 400 });
    }

    const key = `submissions/${type}/${Date.now()}-${file.name}`;
    await context.env.UPLOADS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    const result = await db.prepare(
      `INSERT INTO submissions (type, name, email, caption, file_key, file_name, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(type, name, email || null, caption || null, key, file.name, file.size).run();

    const submissionId = result.meta.last_row_id;
    await sendEmails(context, { type, name, email, submissionId, preview: file.name });

    return Response.json({ message: 'Thank you! Your submission will be reviewed.' });
  } catch (err) {
    console.error('Submission error:', err);
    return Response.json({ error: `Something went wrong: ${err.message}` }, { status: 500 });
  }
}
