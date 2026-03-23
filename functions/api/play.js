export async function onRequestPost(context) {
  const { track } = await context.request.json();
  if (!track) {
    return Response.json({ error: 'Missing track' }, { status: 400 });
  }

  const db = context.env.DB;
  await db.prepare(
    `INSERT INTO play_counts (track_src, count, last_played)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(track_src) DO UPDATE SET
       count = count + 1,
       last_played = datetime('now')`
  ).bind(track).run();

  const row = await db.prepare('SELECT count FROM play_counts WHERE track_src = ?').bind(track).first();
  return Response.json({ track, count: row?.count || 1 });
}
