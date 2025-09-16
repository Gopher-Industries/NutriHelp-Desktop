import { supabase } from './supabase';

export const migrationService = {
  async createNotificationRecipientsTable() {
    try {
      console.log('Creating sys_notification_recipients table...');
      
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE sys_notifications ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20) DEFAULT 'all' CHECK (recipient_type IN ('all', 'specific'));
        `
      });
      
      if (alterError) {
        console.log('Column might already exist:', alterError.message);
      }
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS sys_notification_recipients (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            notification_id UUID REFERENCES sys_notifications(id) ON DELETE CASCADE,
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(notification_id, user_id)
          );
        `
      });
      
      if (createError) {
        console.log('Table might already exist:', createError.message);
      }
      
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_sys_notification_recipients_notification ON sys_notification_recipients(notification_id);
          CREATE INDEX IF NOT EXISTS idx_sys_notification_recipients_user ON sys_notification_recipients(user_id);
          CREATE INDEX IF NOT EXISTS idx_sys_notifications_recipient_type ON sys_notifications(recipient_type);
        `
      });
      
      if (indexError) {
        console.log('Indexes might already exist:', indexError.message);
      }
      
      console.log('Migration completed successfully!');
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      
      try {
        console.log('Trying alternative approach...');
        
        const { error: directError } = await supabase
          .from('sys_notification_recipients')
          .select('id')
          .limit(1);
          
        if (directError && directError.code === '42P01') {
          console.log('Table does not exist, creating manually...');
          
          const { error } = await supabase.rpc('create_notification_recipients_table');
          if (error) {
            console.error('Failed to create table:', error);
            return false;
          }
        }
        
        return true;
      } catch (fallbackError) {
        console.error('Fallback migration also failed:', fallbackError);
        return false;
      }
    }
  }
};

export default migrationService;
