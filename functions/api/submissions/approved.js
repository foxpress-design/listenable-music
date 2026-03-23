export async function onRequestGet(context) {
  const db = context.env.DB;
  const { results } = await db.prepare(
    "SELECT id, type, name, caption, file_key, file_name, submitted_at FROM submissions WHERE status = 'approved' ORDER BY submitted_at DESC"
  ).all();
  return Response.json({ submissions: results });
}
