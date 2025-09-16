import { supabase } from './supabase';

/**
 * Database debug service for querying and displaying database table data
 */
export const databaseDebugService = {
  /**
   * Query user profile table data
   */
  async getUserProfiles() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Query security score history table data
   */
  async getSecurityScoreHistory() {
    try {
      const { data, error } = await supabase
        .from('security_score_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching security score history:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Query user security settings table data
   */
  async getUserSecuritySettings() {
    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user security settings:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Query security scan log table data
   */
  async getSecurityScanLogs() {
    try {
      const { data, error } = await supabase
        .from('security_scan_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching security scan logs:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Query security alert table data
   */
  async getSecurityAlerts() {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Query all related data for a specific user
   */
  async getUserData(userId) {
    try {
      const results = {};
      
      // Query user profile
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId);
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        results.profile = null;
      } else {
        results.profile = profiles && profiles.length > 0 ? profiles[0] : null;
      }
      
      // Query security score history
      const { data: scoreHistory, error: scoreError } = await supabase
        .from('security_score_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (scoreError) {
        console.error('Error fetching security score history:', scoreError);
      }
      results.scoreHistory = scoreHistory || [];
      
      // Query user security settings
      const { data: securitySettingsArray, error: settingsError } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', userId);
      
      if (settingsError) {
        console.error('Error fetching user security settings:', settingsError);
        results.securitySettings = null;
      } else {
        results.securitySettings = securitySettingsArray && securitySettingsArray.length > 0 ? securitySettingsArray[0] : null;
      }
      
      // Query security scan logs
      const { data: scanLogs, error: scanError } = await supabase
        .from('security_scan_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (scanError) {
        console.error('Error fetching security scan logs:', scanError);
      }
      results.scanLogs = scanLogs || [];
      
      // Query security alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (alertsError) {
        console.error('Error fetching security alerts:', alertsError);
      }
      results.alerts = alerts || [];
      
      return { success: true, data: results };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get data overview for all tables
   */
  async getAllTablesOverview() {
    try {
      const results = {};
      
      // Get data from all tables
      const [profiles, scoreHistory, securitySettings, scanLogs, alerts] = await Promise.all([
        this.getUserProfiles(),
        this.getSecurityScoreHistory(),
        this.getUserSecuritySettings(),
        this.getSecurityScanLogs(),
        this.getSecurityAlerts()
      ]);
      
      results.userProfiles = profiles;
      results.securityScoreHistory = scoreHistory;
      results.userSecuritySettings = securitySettings;
      results.securityScanLogs = scanLogs;
      results.securityAlerts = alerts;
      
      return { success: true, data: results };
    } catch (error) {
      console.error('Error fetching all tables overview:', error);
      return { success: false, error: error.message };
    }
  }
};

export default databaseDebugService;