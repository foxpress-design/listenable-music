export async function onRequestGet(context) {
  const db = context.env.DB;

  // Check cache (refresh every 24 hours)
  const cached = await db.prepare(
    "SELECT data FROM bandcamp_cache WHERE key = 'collection' AND fetched_at > datetime('now', '-24 hours')"
  ).first();

  if (cached) {
    return Response.json(JSON.parse(cached.data));
  }

  try {
    // Fetch the fan page to get fan_id
    const pageRes = await fetch('https://bandcamp.com/jamesambient', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    });
    const html = await pageRes.text();

    const fanIdMatch = html.match(/"fan_id"\s*:\s*(\d+)/);
    if (!fanIdMatch) throw new Error('Could not find fan_id');

    const fanId = fanIdMatch[1];

    // Use Bandcamp's internal collection API
    const apiRes = await fetch('https://bandcamp.com/api/fancollection/1/collection_items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        fan_id: parseInt(fanId),
        older_than_token: `${Date.now()}::a::`,
        count: 50,
      }),
    });

    if (!apiRes.ok) throw new Error(`API returned ${apiRes.status}`);

    const apiData = await apiRes.json();
    const items = (apiData.items || []).map(item => ({
      title: item.album_title || item.item_title,
      artist: item.band_name,
      url: item.item_url,
      artUrl: item.item_art ? `https://f4.bcbits.com/img/a${item.item_art}_16.jpg` : null,
      albumId: item.album_id,
      trackId: item.tralbum_id,
      type: item.tralbum_type === 'a' ? 'a' : 't',
    }));

    const data = { items, fetchedAt: new Date().toISOString() };

    await db.prepare(
      "INSERT OR REPLACE INTO bandcamp_cache (key, data, fetched_at) VALUES ('collection', ?, datetime('now'))"
    ).bind(JSON.stringify(data)).run();

    return Response.json(data);
  } catch (err) {
    console.error('Bandcamp fetch failed:', err);

    // Fallback: return stale cache
    const stale = await db.prepare(
      "SELECT data FROM bandcamp_cache WHERE key = 'collection'"
    ).first();

    if (stale) {
      const data = JSON.parse(stale.data);
      data.stale = true;
      return Response.json(data);
    }

    return Response.json({
      items: [],
      fallbackUrl: 'https://bandcamp.com/jamesambient',
      error: 'Could not fetch collection',
    });
  }
}
