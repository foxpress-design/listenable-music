export async function onRequestPost(context) {
  const formData = await context.request.formData();
  const type = formData.get('type'); // 'memory', 'photo', or 'music'
  const name = formData.get('name');
  const email = formData.get('email');
  const caption = formData.get('caption');
  const story = formData.get('story');
  const musicSource = formData.get('musicSource');
  const musicUrl = formData.get('musicUrl');
  const file = formData.get('file');

  if (!name || !type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = context.env.DB;

  if (type === 'memory') {
    if (!story || !story.trim()) {
      return Response.json({ error: 'Please share your memory' }, { status: 400 });
    }

    await db.prepare(
      `INSERT INTO submissions (type, name, email, caption, file_key, file_name, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind('memory', name, email || null, caption || null, null, null, 0).run();

    // Store the story text in a separate update since schema doesn't have a story column
    // For now, store it in file_key as a text reference
    const id = (await db.prepare('SELECT last_insert_rowid() as id').first()).id;
    const storyKey = `submissions/memory/${Date.now()}-story.txt`;
    await context.env.UPLOADS.put(storyKey, story, {
      httpMetadata: { contentType: 'text/plain' },
    });
    await db.prepare('UPDATE submissions SET file_key = ?, file_name = ? WHERE rowid = ?')
      .bind(storyKey, 'story.txt', id).run();

    return Response.json({ message: 'Thank you! Your submission will be reviewed.' });
  }

  if (type === 'music' && musicSource && musicSource !== 'file') {
    if (!musicUrl || !musicUrl.trim()) {
      return Response.json({ error: 'Please provide a URL' }, { status: 400 });
    }

    await db.prepare(
      `INSERT INTO submissions (type, name, email, caption, file_key, file_name, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind('music', name, email || null, caption || null, musicUrl, `${musicSource} link`, 0).run();

    return Response.json({ message: 'Thank you! Your submission will be reviewed.' });
  }

  // File upload (photo or music file)
  if (!file) {
    return Response.json({ error: 'Please select a file' }, { status: 400 });
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

  await db.prepare(
    `INSERT INTO submissions (type, name, email, caption, file_key, file_name, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(type, name, email || null, caption || null, key, file.name, file.size).run();

  return Response.json({ message: 'Thank you! Your submission will be reviewed.' });
}
