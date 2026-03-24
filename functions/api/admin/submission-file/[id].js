export async function onRequestGet(context) {
  const id = context.params.id;
  const db = context.env.DB;

  const sub = await db.prepare('SELECT file_key, type FROM submissions WHERE id = ?').bind(id).first();
  if (!sub || !sub.file_key) {
    return new Response('Not found', { status: 404 });
  }

  // Music URLs are stored as the URL itself
  if (sub.file_key.startsWith('http')) {
    return new Response(sub.file_key, { headers: { 'Content-Type': 'text/plain' } });
  }

  const object = await context.env.UPLOADS.get(sub.file_key);
  if (!object) {
    return new Response('File not found', { status: 404 });
  }

  const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
