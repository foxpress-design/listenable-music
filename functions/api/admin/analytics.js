export async function onRequestGet(context) {
  const db = context.env.DB;

  // Total active subscribers
  const subCount = await db.prepare(
    'SELECT COUNT(*) as count FROM subscribers WHERE unsubscribed_at IS NULL'
  ).first();

  // Total plays
  const playCount = await db.prepare(
    'SELECT SUM(count) as total FROM play_counts'
  ).first();

  // Top 10 tracks by play count
  const { results: topTracks } = await db.prepare(
    'SELECT track_src, count FROM play_counts ORDER BY count DESC LIMIT 10'
  ).all();

  // Total submissions by status
  const { results: submissionStats } = await db.prepare(
    'SELECT status, COUNT(*) as count FROM submissions GROUP BY status'
  ).all();

  // Emails sent
  const emailCount = await db.prepare(
    'SELECT COUNT(*) as count FROM sent_emails'
  ).first();

  // Recent sent emails
  const { results: recentEmails } = await db.prepare(
    'SELECT subject, recipient_count, sent_at, sent_by FROM sent_emails ORDER BY sent_at DESC LIMIT 20'
  ).all();

  return Response.json({
    subscribers: subCount?.count || 0,
    totalPlays: playCount?.total || 0,
    topTracks,
    submissionStats: Object.fromEntries((submissionStats || []).map(s => [s.status, s.count])),
    emailsSent: emailCount?.count || 0,
    recentEmails: recentEmails || [],
  });
}
