import supabase from './supabase';
import authMiddleware from './authMiddleware';

const notificationService = {
  async createMessage(messageData) {
    try {
      const { user } = await authMiddleware.getCurrentUserProfile();
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id);
      
      if (profileError) throw profileError;
      if (!profile || profile.length === 0) throw new Error('User profile not found');
      
      const userProfile = profile[0];
      
      // Get recipients based on type
      let recipients = [];
      if (messageData.recipientType === 'all') {
        // Get all non-admin users
        const { data: allUsers, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, user_id, first_name, last_name, email, role')
          .neq('role', 'admin');
        
        if (usersError) {
          throw usersError;
        }
        
        recipients = allUsers.map(user => user.id);
      } else if (messageData.recipientType === 'specific' && messageData.selectedUsers && messageData.selectedUsers.length > 0) {
        recipients = messageData.selectedUsers;
      }

      // Create notifications for each recipient using user_notifications table
      const notifications = recipients.map(recipientId => ({
        title: messageData.title,
        content: messageData.content,
        created_by: userProfile.id,
        recipient_user_id: recipientId,
        recipient_type: messageData.recipientType || 'all',
        type: 'info',
        priority: 'normal',
        notification_category: 'general',
        is_read: false,
        is_deleted: false,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('user_notifications')
        .insert(notifications)
        .select();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getAllMessages() {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select(`
          *,
          created_by_profile:user_profiles!user_notifications_created_by_fkey(first_name, last_name, role),
          recipient_profile:user_profiles!user_notifications_recipient_user_id_fkey(first_name, last_name, email)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Group messages by title, content, and created_at to calculate recipients count
      const messageGroups = {};
      
      data.forEach(notification => {
        const messageKey = `${notification.title}_${notification.content}_${notification.created_at}`;
        
        if (!messageGroups[messageKey]) {
          messageGroups[messageKey] = {
            ...notification,
            recipients_count: 0,
            recipient_type: notification.recipient_type
          };
        }
        
        messageGroups[messageKey].recipients_count += 1;
      });

      const result = Object.values(messageGroups);
      return { data: result, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getMessageReadStatus(messageId) {
    try {
      await authMiddleware.validateAdminAction('view message read status');
      
      // Get all notifications with this ID and their read status
      const { data, error } = await supabase
        .from('user_notifications')
        .select(`
          *,
          recipient_profile:user_profiles!user_notifications_recipient_user_id_fkey(
            first_name,
            last_name,
            role
          )
        `)
        .eq('id', messageId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getAllUsersReadStatus() {
    try {
      await authMiddleware.validateAdminAction('view all users read status');
      
      // Get all notifications with their read status
      const { data: notifications, error: notificationsError } = await supabase
        .from('user_notifications')
        .select(`
          id,
          title,
          created_at,
          is_read,
          read_at,
          recipient_user_id,
          recipient_type,
          recipient_profile:user_profiles!user_notifications_recipient_user_id_fkey(
            id,
            user_id,
            first_name,
            last_name,
            role
          )
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (notificationsError) {
        throw notificationsError;
      }

      // Group notifications by title and created_at to identify unique messages
      const messageGroups = {};
      notifications.forEach(notification => {
        const messageKey = `${notification.title}_${notification.created_at}`;
        if (!messageGroups[messageKey]) {
          messageGroups[messageKey] = {
            messageId: notification.id,
            messageTitle: notification.title,
            messageCreatedAt: notification.created_at,
            messageRecipientType: notification.recipient_type || 'all',
            userStatuses: []
          };
        }
        
        if (notification.recipient_profile) {
          messageGroups[messageKey].userStatuses.push({
            userId: notification.recipient_profile.user_id,
            userName: `${notification.recipient_profile.first_name} ${notification.recipient_profile.last_name}`.trim(),
            userRole: notification.recipient_profile.role,
            isRead: notification.is_read,
            readAt: notification.read_at
          });
        }
      });

      const result = Object.values(messageGroups);
      return { data: result, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async markMessageAsRead(messageId, userId) {
    try {
      // Get user profile ID
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId);

      if (profileError) throw profileError;
      if (!profile || profile.length === 0) throw new Error('User profile not found');
      
      const userProfile = profile[0];

      const { data, error } = await supabase
        .from('user_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('recipient_user_id', userProfile.id)
        .select();

      if (error) {
        throw error;
      }

      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getUserMessages(userId, limit = 10) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId);

      if (profileError) throw profileError;
      if (!profile || profile.length === 0) throw new Error('User profile not found');
      
      const userProfile = profile[0];

      const { data, error } = await supabase
        .from('user_notifications')
        .select(`
          *,
          created_by_profile:user_profiles!user_notifications_created_by_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .eq('recipient_user_id', userProfile.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getUnreadCount(userId) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId);

      if (profileError) throw profileError;
      if (!profile || profile.length === 0) throw new Error('User profile not found');
      
      const userProfile = profile[0];

      const { data: unreadNotifications, error } = await supabase
        .from('user_notifications')
        .select('id')
        .eq('recipient_user_id', userProfile.id)
        .eq('is_read', false)
        .eq('is_deleted', false);

      if (error) throw error;

      return { data: unreadNotifications.length, error: null };
    } catch (error) {
      return { data: 0, error };
    }
  },

  async deleteMessage(messageId) {
    try {
      await authMiddleware.validateAdminAction('delete messages');
      
      // Soft delete by setting is_deleted to true
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  async deleteMessageGroup(deleteParams) {
    try {
      await authMiddleware.validateAdminAction('delete messages');
      
      // Delete all notifications with matching parameters
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_deleted: true })
        .eq('title', deleteParams.title)
        .eq('content', deleteParams.content)
        .eq('created_at', deleteParams.created_at);

      if (error) {
        throw error;
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  subscribeToMessages(callback) {
    return supabase
      .channel('user_notifications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_notifications'
      }, callback)
      .subscribe();
  },

  subscribeToReadStatus(callback) {
    return supabase
      .channel('user_notifications_read_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_notifications',
        filter: 'is_read=eq.true'
      }, callback)
      .subscribe();
  },

  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
};

export default notificationService;