export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  const action = url.searchParams.get('action');
  const key = url.searchParams.get('key');

  if (!id || !action || !key) {
    return new Response('Missing parameters', { status: 400 });
  }

  // Verify using last 8 chars of the Resend API key as a simple auth token
  const resendKey = context.env.RESEND_API_KEY;
  if (!resendKey || key !== resendKey.slice(-8)) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!['approved', 'rejected'].includes(action)) {
    return new Response('Invalid action', { status: 400 });
  }

  const db = context.env.DB;
  const sub = await db.prepare('SELECT id, name, type, status FROM submissions WHERE id = ?').bind(id).first();

  if (!sub) {
    return new Response(html('Submission not found', 'This submission no longer exists.'), {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (sub.status === action) {
    return new Response(html(`Already ${action}`, `This ${sub.type} from ${sub.name} was already ${action}.`), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  await db.prepare(
    "UPDATE submissions SET status = ?, reviewed_at = datetime('now') WHERE id = ?"
  ).bind(action, id).run();

  const verb = action === 'approved' ? 'Approved' : 'Rejected';
  return new Response(html(verb, `${sub.type} from ${sub.name} has been ${action}.`), {
    headers: { 'Content-Type': 'text/html' },
  });
}

function html(title, message) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title} - Listenable Music</title>
  <style>
    body { background: #000; color: #e0e0e0; font-family: 'Courier New', monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { text-align: center; padding: 2rem; }
    h1 { color: #00ff88; font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #999; font-size: 0.9rem; }
    a { color: #00ff88; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <p><a href="https://listenablemusic.ca/admin">Open Admin Dashboard</a></p>
  </div>
</body>
</html>`;
}
