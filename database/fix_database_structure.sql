-- Fix database structure issues
-- Execute this in Supabase SQL Editor to resolve table structure mismatches

-- Drop and recreate security_score_history table with correct structure
DROP TABLE IF EXISTS security_score_history CASCADE;

CREATE TABLE security_score_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    authentication_score INTEGER DEFAULT 0,
    device_security_score INTEGER DEFAULT 0,
    behavior_score INTEGER DEFAULT 0,
    compliance_score INTEGER DEFAULT 0,
    threat_resistance_score INTEGER DEFAULT 0,
    score_factors JSONB,
    recommendations TEXT[],
    improvement_suggestions TEXT[],
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate user_security_settings table with correct structure
DROP TABLE IF EXISTS user_security_settings CASCADE;

CREATE TABLE user_security_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    auto_lock_enabled BOOLEAN DEFAULT TRUE,
    auto_lock_timeout INTEGER DEFAULT 15,
    login_notifications BOOLEAN DEFAULT TRUE,
    security_emails BOOLEAN DEFAULT TRUE,
    data_encryption_enabled BOOLEAN DEFAULT TRUE,
    session_timeout INTEGER DEFAULT 30,
    auto_logout_enabled BOOLEAN DEFAULT TRUE,
    trusted_devices_enabled BOOLEAN DEFAULT FALSE,
    failed_login_limit INTEGER DEFAULT 5,
    account_lockout_duration INTEGER DEFAULT 15,
    password_expiry_days INTEGER DEFAULT 90,
    real_time_monitoring BOOLEAN DEFAULT TRUE,
    anomaly_detection BOOLEAN DEFAULT TRUE,
    threat_detection BOOLEAN DEFAULT TRUE,
    behavior_analytics BOOLEAN DEFAULT TRUE,
    security_score_tracking BOOLEAN DEFAULT TRUE,
    compliance_monitoring BOOLEAN DEFAULT FALSE,
    suspicious_activity_alerts BOOLEAN DEFAULT TRUE,
    email_security_reports BOOLEAN DEFAULT FALSE,
    max_concurrent_sessions INTEGER DEFAULT 5,
    require_2fa_for_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_score_history_user_id ON security_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_security_score_history_calculated_at ON security_score_history(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_score_history_overall_score ON security_score_history(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);

-- Enable RLS
ALTER TABLE security_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own security score history" ON security_score_history
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = security_score_history.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage own security settings" ON user_security_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = user_security_settings.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Admin can view all security score history" ON security_score_history
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can manage all security settings" ON user_security_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

-- Insert sample data using existing user_profiles
INSERT INTO security_score_history (
    id,
    user_id,
    overall_score,
    authentication_score,
    device_security_score,
    behavior_score,
    compliance_score,
    threat_resistance_score,
    score_factors,
    calculated_at
)
SELECT
    gen_random_uuid(),
    up.id,
    CASE
        WHEN up.role = 'admin' THEN 95
        WHEN up.email_verified = true THEN 75
        ELSE 60
    END as overall_score,
    CASE
        WHEN up.role = 'admin' THEN 20
        WHEN up.email_verified = true THEN 15
        ELSE 5
    END as authentication_score,
    10 as device_security_score,
    10 as behavior_score,
    0 as compliance_score,
    10 as threat_resistance_score,
    CASE
        WHEN up.role = 'admin' THEN '{"admin_role": 20, "email_verified": 15, "security_settings": 10}'
        WHEN up.email_verified = true THEN '{"email_verified": 15, "security_settings": 10}'
        ELSE '{"basic_security": 5}'
    END::JSONB as score_factors,
    NOW() - INTERVAL '1 day' as calculated_at
FROM user_profiles up
WHERE up.id IS NOT NULL;

-- Create threat_detection_rules table
CREATE TABLE IF NOT EXISTS threat_detection_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for threat_detection_rules
CREATE INDEX IF NOT EXISTS idx_threat_detection_rules_active ON threat_detection_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_threat_detection_rules_type ON threat_detection_rules(rule_type);

-- Insert sample threat detection rules
INSERT INTO threat_detection_rules (rule_name, rule_type, description, conditions, actions, severity) VALUES
('Brute Force Detection', 'login_attempt', 'Detect multiple failed login attempts', 
 '{"max_attempts": 5, "time_window": 3600}', 
 '{"action": "alert", "lock_account": true}', 'high'),
('Suspicious Location', 'location_anomaly', 'Detect logins from unusual locations', 
 '{"distance_threshold": 1000, "time_threshold": 3600}', 
 '{"action": "alert", "require_verification": true}', 'medium'),
('Device Anomaly', 'device_fingerprint', 'Detect new or suspicious devices', 
 '{"trust_threshold": 0.7, "activity_threshold": 5}', 
 '{"action": "alert", "require_device_verification": true}', 'medium');

INSERT INTO user_security_settings (
    id,
    user_id,
    auto_lock_enabled,
    auto_lock_timeout,
    login_notifications,
    security_emails,
    data_encryption_enabled,
    session_timeout,
    auto_logout_enabled,
    trusted_devices_enabled,
    failed_login_limit,
    account_lockout_duration,
    password_expiry_days,
    real_time_monitoring,
    anomaly_detection,
    threat_detection,
    behavior_analytics,
    security_score_tracking,
    compliance_monitoring,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    up.id,
    TRUE,
    30,
    TRUE,
    TRUE,
    TRUE,
    30,
    TRUE,
    FALSE,
    5,
    15,
    90,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    FALSE,
    NOW(),
    NOW()
FROM user_profiles up
WHERE up.id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_security_settings uss WHERE uss.user_id = up.id
);

INSERT INTO security_activity_logs (
    id,
    user_id,
    activity_type,
    activity_category,
    description,
    ip_address,
    location,
    risk_level,
    success,
    created_at
)
SELECT
    gen_random_uuid(),
    up.id,
    'login' AS activity_type,
    'authentication' AS activity_category,
    'User successful login' AS description,
    '192.168.1.100'::inet AS ip_address,
    'Beijing, China' AS location,
    'low' AS risk_level,
    TRUE AS success,
    NOW() - INTERVAL '1 hour' AS created_at
FROM user_profiles up
WHERE up.id IS NOT NULL;