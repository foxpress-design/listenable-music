export async function onRequestGet(context) {
  const db = context.env.DB;
  const row = await db.prepare(
    "SELECT count FROM page_views WHERE page = 'home'"
  ).first();
  return Response.json({ views: row?.count || 0 });
}

export async function onRequestPost(context) {
  const db = context.env.DB;
  await db.prepare(
    `INSERT INTO page_views (page, count)
     VALUES ('home', 1)
     ON CONFLICT(page) DO UPDATE SET count = count + 1`
  ).run();
  const row = await db.prepare(
    "SELECT count FROM page_views WHERE page = 'home'"
  ).first();
  return Response.json({ views: row?.count || 1 });
}
