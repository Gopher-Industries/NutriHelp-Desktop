-- Add recipient_type column to sys_notifications table
ALTER TABLE sys_notifications ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20) DEFAULT 'all' CHECK (recipient_type IN ('all', 'specific'));

-- Create sys_notification_recipients table
CREATE TABLE IF NOT EXISTS sys_notification_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES sys_notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sys_notification_recipients_notification ON sys_notification_recipients(notification_id);
CREATE INDEX IF NOT EXISTS idx_sys_notification_recipients_user ON sys_notification_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_sys_notifications_recipient_type ON sys_notifications(recipient_type);

-- Enable Row Level Security
ALTER TABLE sys_notification_recipients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sys_notification_recipients
CREATE POLICY "Admin can manage all notification recipients" ON sys_notification_recipients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own notification recipients" ON sys_notification_recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = user_id 
      AND user_profiles.user_id = auth.uid()
    )
  );

-- Update existing notifications to have recipient_type = 'all' if not set
UPDATE sys_notifications SET recipient_type = 'all' WHERE recipient_type IS NULL;