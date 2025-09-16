import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      let userRole = auth.userProfile?.role;
      
      console.log('fetchNotifications called with:', { userId, userRole });
      
      if (!userId) {
        console.error('No userId found in auth state');
        throw new Error('User not authenticated');
      }

      // If userRole is not available, fetch it from database
      if (!userRole) {
        try {
          console.log('Fetching user role from database...');
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', userId);

          if (profileError) {
            console.warn('Failed to fetch user role:', profileError);
            userRole = 'user';
          } else if (userProfile && userProfile.length > 0) {
            userRole = userProfile[0].role;
            console.log('Fetched user role:', userRole);
          } else {
            userRole = 'user';
          }
        } catch (err) {
          console.warn('Error fetching user role, defaulting to user:', err);
          userRole = 'user';
        }
      }

      let notifications;
      let error;

      if (userRole === 'admin') {
        console.log('Fetching notifications for admin user');
        const { data, error: fetchError } = await supabase
          .from('user_notifications')
          .select(`
            *,
            created_by_profile:user_profiles!user_notifications_created_by_fkey(
              first_name,
              last_name,
              email
            ),
            recipient_profile:user_profiles!user_notifications_recipient_user_id_fkey(
              first_name,
              last_name,
              email
            )
          `)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });
        notifications = data;
        error = fetchError;
      } else {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, user_id, first_name, last_name, email, role')
          .eq('user_id', userId);

        if (profileError) {
          throw profileError;
        }
        
        if (!profile || profile.length === 0) {
          throw new Error('User profile not found');
        }
        
        const userProfile = profile[0];
        
        if (!userProfile || !userProfile.id) {
          throw new Error('User profile not found or invalid');
        }

        // Fetch notifications directly without problematic joins
        const { data, error: fetchError } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('recipient_user_id', userProfile.id)
          .or('is_deleted.eq.false,is_deleted.is.null')
          .order('created_at', { ascending: false });

        notifications = data;
        error = fetchError;
        
        // Get creator profile information separately to avoid join issues
        if (notifications && notifications.length > 0) {
          const creatorIds = [...new Set(notifications.map(n => n.created_by).filter(id => id))];
          
          if (creatorIds.length > 0) {
            const { data: creatorProfiles, error: profileError } = await supabase
              .from('user_profiles')
              .select('id, first_name, last_name, email')
              .in('id', creatorIds);
              
            if (!profileError && creatorProfiles) {
              const profileMap = {};
              creatorProfiles.forEach(profile => {
                profileMap[profile.id] = profile;
              });
              
              notifications = notifications.map(notification => ({
                ...notification,
                created_by_profile: profileMap[notification.created_by] || null
              }));
            } else {
              notifications = notifications.map(notification => ({
                ...notification,
                created_by_profile: null
              }));
            }
          } else {
            notifications = notifications.map(notification => ({
              ...notification,
              created_by_profile: null
            }));
          }
        }
      }

      if (error) {
        throw error;
      }

      // Process notifications for display (read status already in table)
      const processedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: notification.is_read,
        readAt: notification.read_at,
        createdByName: notification.created_by_profile ? 
          `${notification.created_by_profile.first_name} ${notification.created_by_profile.last_name}`.trim() : 'System',
        recipientName: notification.recipient_profile ? 
          `${notification.recipient_profile.first_name} ${notification.recipient_profile.last_name}`.trim() : 'User'
      }));
      
      return {
        notifications: processedNotifications,
        userRole: userRole
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async ({ title, content, recipientType = 'all', selectedUsers = [] }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      let userRole = auth.userProfile?.role;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // If userRole is not available, fetch it from database
      if (!userRole) {
        try {
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', userId);

          if (profileError) {
            userRole = 'user';
          } else if (userProfile && userProfile.length > 0) {
            userRole = userProfile[0].role;
          } else {
            userRole = 'user';
          }
        } catch (err) {
          userRole = 'user';
        }
      }

      if (userRole !== 'admin') {
        throw new Error('Admin privileges required');
      }

      // First get the user profile ID which is what the foreign key references
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId);

      if (profileError) throw profileError;
      if (!profile || profile.length === 0) throw new Error('User profile not found');
      
      const userProfile = profile[0];

      // Get recipients based on type
      let recipients = [];
      if (recipientType === 'all') {
        // Get all non-admin users
        const { data: allUsers, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, user_id, first_name, last_name, email, role')
          .neq('role', 'admin');
        
        if (usersError) {
          throw usersError;
        }
        
        recipients = allUsers.map(user => user.id);
      } else if (recipientType === 'specific' && selectedUsers.length > 0) {
        recipients = selectedUsers;
      }

      // Create notifications for each recipient using user_notifications table
      const notifications = recipients.map(recipientId => ({
        title,
        content,
        created_by: userProfile.id,
        recipient_user_id: recipientId,
        recipient_type: recipientType,
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

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

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
        .eq('id', notificationId)
        .eq('recipient_user_id', userProfile.id)
        .select();

      if (error) throw error;

      return { notificationId, readAt: data && data.length > 0 ? data[0].read_at : null };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;
      let userRole = auth.userProfile?.role;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // If userRole is not available, fetch it from database
      if (!userRole) {
        try {
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', userId);

          if (profileError) {
            userRole = 'user';
          } else if (userProfile && userProfile.length > 0) {
            userRole = userProfile[0].role;
          } else {
            userRole = 'user';
          }
        } catch (err) {
          userRole = 'user';
        }
      }

      if (userRole === 'admin') {
        return 0;
      }

      // First get the user profile ID
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

      return unreadNotifications.length;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  userRole: null,
  isCreateModalVisible: false,
  createLoading: false,
  createError: null
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    setCreateModalVisible: (state, action) => {
      state.isCreateModalVisible = action.payload;
    },
    resetNotifications: (state) => {
      return {
        ...initialState
      };
    },
    refreshForAccountSwitch: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.userRole = action.payload.userRole;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createNotification.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.createLoading = false;
        state.notifications.unshift({
          ...action.payload,
          readDetails: []
        });
        state.isCreateModalVisible = false;
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { notificationId, readAt } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          notification.readAt = readAt;
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  }
});

export const {
  clearError,
  setCreateModalVisible,
  resetNotifications,
  refreshForAccountSwitch
} = notificationSlice.actions;

export default notificationSlice.reducer;

export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotificationLoading = (state) => state.notifications.isLoading;
export const selectNotificationError = (state) => state.notifications.error;
export const selectUserRole = (state) => state.notifications.userRole;
export const selectCreateModalVisible = (state) => state.notifications.isCreateModalVisible;
export const selectCreateLoading = (state) => state.notifications.createLoading;
export const selectCreateError = (state) => state.notifications.createError;
