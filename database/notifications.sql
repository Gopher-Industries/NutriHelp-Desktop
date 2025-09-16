CREATE TABLE sys_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sys_notification_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES sys_notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(notification_id, user_id)
);

CREATE INDEX idx_sys_notifications_created_at ON sys_notifications(created_at DESC);
CREATE INDEX idx_sys_notification_reads_user ON sys_notification_reads(user_id);
CREATE INDEX idx_sys_notification_reads_notification ON sys_notification_reads(notification_id);
CREATE INDEX idx_sys_notification_reads_unread ON sys_notification_reads(user_id) WHERE read_at IS NULL;

ALTER TABLE sys_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all notifications" ON sys_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view notifications" ON sys_notifications
  FOR SELECT USING (true);

CREATE POLICY "Admin can view all read status" ON sys_notification_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can manage own read status" ON sys_notification_reads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = user_id 
      AND user_profiles.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_set_read_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_read_timestamp
  BEFORE UPDATE ON sys_notification_reads
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_read_timestamp();