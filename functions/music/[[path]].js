// Serve music files from R2 bucket
export async function onRequestGet(context) {
  const path = context.params.path;
  if (!path || path.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const key = `music/${path.join('/')}`;
  const object = await context.env.UPLOADS.get(key);

  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'audio/mpeg');
  headers.set('Content-Length', object.size);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Accept-Ranges', 'bytes');

  // Handle range requests for audio seeking
  const range = context.request.headers.get('Range');
  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = parseInt(match[1]);
      const end = match[2] ? parseInt(match[2]) : object.size - 1;
      const chunk = end - start + 1;

      const sliced = await context.env.UPLOADS.get(key, {
        range: { offset: start, length: chunk },
      });

      headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
      headers.set('Content-Length', chunk);

      return new Response(sliced.body, { status: 206, headers });
    }
  }

  return new Response(object.body, { headers });
}
