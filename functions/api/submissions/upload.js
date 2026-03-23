export async function onRequestPost(context) {
  const formData = await context.request.formData();
  const file = formData.get('file');
  const name = formData.get('name');
  const email = formData.get('email');
  const caption = formData.get('caption');
  const type = formData.get('type'); // 'photo' or 'music'

  if (!file || !name || !email || !type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const allowedPhoto = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedMusic = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
  const allowed = type === 'photo' ? allowedPhoto : allowedMusic;

  if (!allowed.includes(file.type)) {
    return Response.json({ error: 'File type not allowed' }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 50MB)' }, { status: 400 });
  }

  const key = `submissions/${type}/${Date.now()}-${file.name}`;
  await context.env.UPLOADS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const db = context.env.DB;
  await db.prepare(
    `INSERT INTO submissions (type, name, email, caption, file_key, file_name, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(type, name, email, caption || null, key, file.name, file.size).run();

  return Response.json({ message: 'Thank you! Your submission will be reviewed.' });
}
