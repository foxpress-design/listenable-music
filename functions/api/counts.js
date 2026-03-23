export async function onRequestGet(context) {
  const db = context.env.DB;
  const { results } = await db.prepare('SELECT track_src, count FROM play_counts').all();
  const counts = {};
  for (const row of results) {
    counts[row.track_src] = row.count;
  }
  return Response.json(counts);
}
