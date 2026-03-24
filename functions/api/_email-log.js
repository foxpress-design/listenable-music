export async function logEmail(db, { subject, preview, recipientCount, sentBy }) {
  await db.prepare(
    'INSERT INTO sent_emails (subject, body_preview, recipient_count, sent_by) VALUES (?, ?, ?, ?)'
  ).bind(subject, preview || '', recipientCount || 1, sentBy || 'system').run();
}
