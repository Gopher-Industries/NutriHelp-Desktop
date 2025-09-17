import { supabase } from '../services/supabase.js';

// Database migration utility
export const runDatabaseMigration = async () => {
  try {
    console.log('Starting database migration...');
    
    // Check what needs to be migrated
    const migrationStatus = await checkMigrationStatus();
    if (!migrationStatus.success) {
      throw new Error(migrationStatus.error);
    }
    
    if (!migrationStatus.needsMigration) {
      console.log('No migration needed');
      return { success: true };
    }
    
    // Step 1: Ensure user_profiles table has correct structure
    console.log('Ensuring user_profiles table structure...');
    const { error: userProfilesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create user_profiles table if it doesn't exist
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          email VARCHAR(255),
          age INTEGER,
          gender VARCHAR(10),
          height DECIMAL(5,2),
          weight DECIMAL(5,2),
          activity_level VARCHAR(20),
          dietary_restrictions TEXT[],
          health_conditions TEXT[],
          goals TEXT[],
          role VARCHAR(20) DEFAULT 'user',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE
        );
        
        -- Add missing columns if they don't exist
        DO $$
        BEGIN
          -- Add first_name column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='user_profiles' AND column_name='first_name') THEN
            ALTER TABLE user_profiles ADD COLUMN first_name VARCHAR(100);
          END IF;
          
          -- Add last_name column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='user_profiles' AND column_name='last_name') THEN
            ALTER TABLE user_profiles ADD COLUMN last_name VARCHAR(100);
          END IF;
          
          -- Add email column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='user_profiles' AND column_name='email') THEN
            ALTER TABLE user_profiles ADD COLUMN email VARCHAR(255);
          END IF;
          
          -- Add role column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='user_profiles' AND column_name='role') THEN
            ALTER TABLE user_profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
          END IF;
          
          -- Add is_active column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='user_profiles' AND column_name='is_active') THEN
            ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
          END IF;
          
          -- Add last_login column if missing
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name='user_profiles' AND column_name='last_login') THEN
            ALTER TABLE user_profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
          END IF;
        END $$;
        
        -- Enable RLS if not already enabled
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policy if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can manage own data') THEN
            CREATE POLICY "Users can manage own data" ON user_profiles
              FOR ALL USING (auth.uid() = user_id);
          END IF;
        END $$;
      `
    });
    
    if (userProfilesError) {
      console.error('Error setting up user_profiles table:', userProfilesError);
      throw userProfilesError;
    }
    
    // Step 2: Create notification tables
    if (migrationStatus.details.needsNotificationTables) {
      console.log('Creating notification tables...');
      
      const { error: notificationTablesError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Create sys_notifications table
          CREATE TABLE IF NOT EXISTS sys_notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create sys_notification_reads table
          CREATE TABLE IF NOT EXISTS sys_notification_reads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            notification_id UUID REFERENCES sys_notifications(id) ON DELETE CASCADE,
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            read_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(notification_id, user_id)
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_sys_notifications_created_at ON sys_notifications(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_sys_notification_reads_user ON sys_notification_reads(user_id);
          CREATE INDEX IF NOT EXISTS idx_sys_notification_reads_notification ON sys_notification_reads(notification_id);
          CREATE INDEX IF NOT EXISTS idx_sys_notification_reads_unread ON sys_notification_reads(user_id) WHERE read_at IS NULL;
          
          -- Enable RLS
          ALTER TABLE sys_notifications ENABLE ROW LEVEL SECURITY;
          ALTER TABLE sys_notification_reads ENABLE ROW LEVEL SECURITY;
          
          -- Create policies
          DO $$
          BEGIN
            -- Admin can manage all notifications
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sys_notifications' AND policyname = 'Admin can manage all notifications') THEN
              CREATE POLICY "Admin can manage all notifications" ON sys_notifications
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_profiles.user_id = auth.uid() 
                    AND user_profiles.role = 'admin'
                  )
                );
            END IF;
            
            -- Users can view notifications
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sys_notifications' AND policyname = 'Users can view notifications') THEN
              CREATE POLICY "Users can view notifications" ON sys_notifications
                FOR SELECT USING (true);
            END IF;
            
            -- Admin can view all read status
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sys_notification_reads' AND policyname = 'Admin can view all read status') THEN
              CREATE POLICY "Admin can view all read status" ON sys_notification_reads
                FOR SELECT USING (
                  EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_profiles.user_id = auth.uid() 
                    AND user_profiles.role = 'admin'
                  )
                );
            END IF;
            
            -- Users can manage own read status
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sys_notification_reads' AND policyname = 'Users can manage own read status') THEN
              CREATE POLICY "Users can manage own read status" ON sys_notification_reads
                FOR ALL USING (
                  EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_profiles.id = user_id 
                    AND user_profiles.user_id = auth.uid()
                  )
                );
            END IF;
          END $$;
        `
      });

      if (notificationTablesError) {
        console.error('Error creating notification tables:', notificationTablesError);
        throw notificationTablesError;
      }

      console.log('Notification tables created successfully');
    }
    
    // Step 3: Update existing users to have proper roles
    console.log('Updating user roles...');
    try {
      // Get current authenticated user
      const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();
      
      if (currentUserError) {
        console.warn('Could not get current user for role update:', currentUserError);
      } else if (currentUser.user) {
        // Update current user's role
        const role = currentUser.user.email === 's224384905@deakin.edu.au' ? 'admin' : 'user';
        const fullName = currentUser.user.user_metadata?.full_name || currentUser.user.email?.split('@')[0] || 'User';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: currentUser.user.id,
            first_name: firstName,
            last_name: lastName,
            email: currentUser.user.email,
            role: role,
            is_active: true
          }, {
            onConflict: 'user_id'
          });
        
        if (updateError) {
          console.warn(`Failed to update profile for user ${currentUser.user.email}:`, updateError);
        } else {
          console.log(`Updated profile for user ${currentUser.user.email} with role: ${role}`);
        }
      }
    } catch (error) {
      console.warn('Error during user role update:', error);
    }
    
    console.log('Database migration completed successfully');
    return { success: true };
    
  } catch (error) {
    console.error('Database migration failed:', error);
    return { success: false, error: error.message };
  }
};

// Check if migration is needed
export const checkMigrationStatus = async () => {
  try {
    let needsRoleColumn = false;
    let needsNotificationTables = false;

    // Check if role column exists in user_profiles table by trying to query it
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Column doesn't exist
        needsRoleColumn = true;
      }
    } catch (error) {
      needsRoleColumn = true;
    }

    // Check if sys_notifications table exists by trying to query it
    try {
      const { data, error } = await supabase
        .from('sys_notifications')
        .select('id')
        .limit(1);
      
      if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
        // Table doesn't exist
        needsNotificationTables = true;
      }
    } catch (error) {
      needsNotificationTables = true;
    }

    return {
      success: true,
      needsMigration: needsRoleColumn || needsNotificationTables,
      details: {
        needsRoleColumn,
        needsNotificationTables
      },
      reason: needsRoleColumn || needsNotificationTables ? 
        `Missing: ${needsRoleColumn ? 'role column' : ''} ${needsNotificationTables ? 'notification tables' : ''}` : 
        'Database is up to date'
    };
  } catch (error) {
    return { 
      success: false,
      needsMigration: true, 
      reason: error.message 
    };
  }
};