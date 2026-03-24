-- Add full HTML body column to sent_emails for preview
ALTER TABLE sent_emails ADD COLUMN body_html TEXT;
