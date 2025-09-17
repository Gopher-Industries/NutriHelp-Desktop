CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(32);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS backup_codes TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_security_scan TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'low';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS user_password_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    device_fingerprint VARCHAR(255) UNIQUE NOT NULL,
    operating_system VARCHAR(100),
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    screen_resolution VARCHAR(20),
    timezone VARCHAR(50),
    language VARCHAR(10),
    ip_address INET,
    location VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    is_trusted BOOLEAN DEFAULT FALSE,
    is_current BOOLEAN DEFAULT FALSE,
    risk_score INTEGER DEFAULT 0,
    suspicious_activity_count INTEGER DEFAULT 0,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES user_devices(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_suspicious BOOLEAN DEFAULT FALSE,
    session_duration INTEGER DEFAULT 0,
    activity_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS security_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_category VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    risk_level VARCHAR(20) DEFAULT 'low',
    threat_indicators TEXT[],
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_security_settings (
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

CREATE TABLE IF NOT EXISTS security_score_history (
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

CREATE TABLE IF NOT EXISTS security_scan_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    scan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    threats_detected INTEGER DEFAULT 0,
    vulnerabilities_found INTEGER DEFAULT 0,
    issues_found JSONB,
    recommendations TEXT[],
    scan_duration INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES user_profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS real_time_security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    source VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    threat_indicators TEXT[],
    risk_score INTEGER DEFAULT 0,
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS user_behavior_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    behavior_type VARCHAR(50) NOT NULL,
    pattern_data JSONB NOT NULL,
    baseline_data JSONB,
    anomaly_score DECIMAL(5,2) DEFAULT 0.0,
    is_anomaly BOOLEAN DEFAULT FALSE,
    confidence_level DECIMAL(3,2) DEFAULT 0.0,
    analysis_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_compliance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    compliance_type VARCHAR(50) NOT NULL,
    standard VARCHAR(50) NOT NULL,
    requirement VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    score INTEGER DEFAULT 0,
    findings TEXT[],
    recommendations TEXT[],
    evidence JSONB,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_password_history_user_id ON user_password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_password_history_created_at ON user_password_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON user_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_devices_trusted ON user_devices(user_id, is_trusted);
CREATE INDEX IF NOT EXISTS idx_user_devices_last_active ON user_devices(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_devices_risk_score ON user_devices(risk_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_id ON user_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_suspicious ON user_sessions(is_suspicious);

CREATE INDEX IF NOT EXISTS idx_security_activity_logs_user_id ON security_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_activity_logs_type ON security_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_security_activity_logs_category ON security_activity_logs(activity_category);
CREATE INDEX IF NOT EXISTS idx_security_activity_logs_risk ON security_activity_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_security_activity_logs_created_at ON security_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_activity_logs_user_created ON security_activity_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_security_score_history_user_id ON security_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_security_score_history_created_at ON security_score_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_score_history_score ON security_score_history(score DESC);

CREATE INDEX IF NOT EXISTS idx_security_scan_logs_user_id ON security_scan_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_scan_logs_status ON security_scan_logs(status);
CREATE INDEX IF NOT EXISTS idx_security_scan_logs_started_at ON security_scan_logs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_read ON security_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_real_time_security_events_user_id ON real_time_security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_real_time_security_events_type ON real_time_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_real_time_security_events_severity ON real_time_security_events(severity);
CREATE INDEX IF NOT EXISTS idx_real_time_security_events_processed ON real_time_security_events(is_processed);
CREATE INDEX IF NOT EXISTS idx_real_time_security_events_created_at ON real_time_security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_real_time_security_events_risk_score ON real_time_security_events(risk_score DESC);

CREATE INDEX IF NOT EXISTS idx_threat_detection_rules_active ON threat_detection_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_threat_detection_rules_type ON threat_detection_rules(rule_type);

CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_user_id ON user_behavior_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_type ON user_behavior_analytics(behavior_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_anomaly ON user_behavior_analytics(is_anomaly);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_date ON user_behavior_analytics(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_behavior_analytics_score ON user_behavior_analytics(anomaly_score DESC);

CREATE INDEX IF NOT EXISTS idx_security_compliance_logs_user_id ON security_compliance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_compliance_logs_type ON security_compliance_logs(compliance_type);
CREATE INDEX IF NOT EXISTS idx_security_compliance_logs_status ON security_compliance_logs(status);
CREATE INDEX IF NOT EXISTS idx_security_compliance_logs_assessed_at ON security_compliance_logs(assessed_at DESC);

ALTER TABLE user_password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_compliance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own password history" ON user_password_history
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = user_password_history.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage own devices" ON user_devices
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = user_devices.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage own sessions" ON user_sessions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = user_sessions.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can view own activity logs" ON security_activity_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = security_activity_logs.user_id
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

CREATE POLICY "Users can view own security score history" ON security_score_history
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = security_score_history.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can view own security scan logs" ON security_scan_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = security_scan_logs.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage own security alerts" ON security_alerts
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = security_alerts.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can view own real-time security events" ON real_time_security_events
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = real_time_security_events.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can view own behavior analytics" ON user_behavior_analytics
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = user_behavior_analytics.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Users can view own compliance logs" ON security_compliance_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = security_compliance_logs.user_id
        AND user_profiles.user_id = auth.uid()
    )
);

CREATE POLICY "Admin can manage all security data" ON user_password_history
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can manage all devices" ON user_devices
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can manage all sessions" ON user_sessions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view all activity logs" ON security_activity_logs
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

CREATE POLICY "Admin can view all security score history" ON security_score_history
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view all security scan logs" ON security_scan_logs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can manage all security alerts" ON security_alerts
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view all real-time security events" ON real_time_security_events
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view all behavior analytics" ON user_behavior_analytics
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE POLICY "Admin can view all compliance logs" ON security_compliance_logs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = 'admin'
    )
);

CREATE OR REPLACE FUNCTION log_real_time_security_event(
    p_user_id UUID,
    p_event_type VARCHAR,
    p_event_category VARCHAR,
    p_severity VARCHAR,
    p_source VARCHAR,
    p_title VARCHAR,
    p_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_location VARCHAR DEFAULT NULL,
    p_country VARCHAR DEFAULT NULL,
    p_threat_indicators TEXT[] DEFAULT NULL,
    p_risk_score INTEGER DEFAULT 0,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO real_time_security_events (
        user_id, event_type, event_category, severity, source, title, description,
        ip_address, user_agent, location, country, threat_indicators, risk_score, metadata
    ) VALUES (
        p_user_id, p_event_type, p_event_category, p_severity, p_source, p_title, p_description,
        p_ip_address, p_user_agent, p_location, p_country, p_threat_indicators, p_risk_score, p_metadata
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_security_activity(
    p_user_id UUID,
    p_activity_type VARCHAR,
    p_activity_category VARCHAR,
    p_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_location VARCHAR DEFAULT NULL,
    p_country VARCHAR DEFAULT NULL,
    p_city VARCHAR DEFAULT NULL,
    p_risk_level VARCHAR DEFAULT 'low',
    p_threat_indicators TEXT[] DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO security_activity_logs (
        user_id, activity_type, activity_category, description,
        ip_address, user_agent, location, country, city, risk_level,
        threat_indicators, success, error_message, metadata
    ) VALUES (
        p_user_id, p_activity_type, p_activity_category, p_description,
        p_ip_address, p_user_agent, p_location, p_country, p_city, p_risk_level,
        p_threat_indicators, p_success, p_error_message, p_metadata
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION detect_security_threats(
    p_user_id UUID
) RETURNS TABLE(
    threat_type VARCHAR,
    severity VARCHAR,
    description TEXT,
    risk_score INTEGER,
    recommendations TEXT[]
) AS $$
DECLARE
    failed_logins INTEGER;
    suspicious_devices INTEGER;
    unusual_locations INTEGER;
    concurrent_sessions INTEGER;
BEGIN
    SELECT COUNT(*) INTO failed_logins
    FROM security_activity_logs
    WHERE user_id = p_user_id
    AND activity_type = 'login'
    AND success = FALSE
    AND created_at > NOW() - INTERVAL '1 hour';
    
    SELECT COUNT(*) INTO suspicious_devices
    FROM user_devices
    WHERE user_id = p_user_id
    AND is_trusted = FALSE
    AND suspicious_activity_count > 3;
    
    SELECT COUNT(DISTINCT location) INTO unusual_locations
    FROM security_activity_logs
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours';
    
    SELECT COUNT(*) INTO concurrent_sessions
    FROM user_sessions
    WHERE user_id = p_user_id
    AND is_active = TRUE;
    
    IF failed_logins >= 5 THEN
        RETURN QUERY SELECT
            'brute_force_attack'::VARCHAR,
            'high'::VARCHAR,
            'Multiple failed login attempts detected'::TEXT,
            85,
            ARRAY['Enable account lockout', 'Review login activity', 'Consider 2FA']::TEXT[];
    END IF;
    
    IF suspicious_devices > 0 THEN
        RETURN QUERY SELECT
            'suspicious_device'::VARCHAR,
            'medium'::VARCHAR,
            'Untrusted devices with suspicious activity detected'::TEXT,
            65,
            ARRAY['Review device list', 'Remove untrusted devices', 'Enable device notifications']::TEXT[];
    END IF;
    
    IF unusual_locations > 5 THEN
        RETURN QUERY SELECT
            'unusual_location_pattern'::VARCHAR,
            'medium'::VARCHAR,
            'Login attempts from multiple unusual locations'::TEXT,
            55,
            ARRAY['Review recent activity', 'Enable location alerts', 'Verify account access']::TEXT[];
    END IF;
    
    IF concurrent_sessions > 10 THEN
        RETURN QUERY SELECT
            'excessive_sessions'::VARCHAR,
            'low'::VARCHAR,
            'High number of concurrent sessions detected'::TEXT,
            35,
            ARRAY['Review active sessions', 'Revoke unnecessary sessions', 'Set session limits']::TEXT[];
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION analyze_user_behavior(
    p_user_id UUID,
    p_behavior_type VARCHAR
) RETURNS TABLE(
    anomaly_detected BOOLEAN,
    anomaly_score DECIMAL,
    confidence_level DECIMAL,
    description TEXT,
    recommendations TEXT[]
) AS $$
DECLARE
    avg_login_time TIME;
    current_login_time TIME;
    avg_session_duration INTEGER;
    current_session_duration INTEGER;
    typical_locations TEXT[];
    current_location VARCHAR;
    score DECIMAL := 0.0;
    confidence DECIMAL := 0.0;
BEGIN
    IF p_behavior_type = 'login_pattern' THEN
        SELECT AVG(EXTRACT(HOUR FROM created_at)::TIME) INTO avg_login_time
        FROM security_activity_logs
        WHERE user_id = p_user_id
        AND activity_type = 'login'
        AND success = TRUE
        AND created_at > NOW() - INTERVAL '30 days';
        
        SELECT EXTRACT(HOUR FROM created_at)::TIME INTO current_login_time
        FROM security_activity_logs
        WHERE user_id = p_user_id
        AND activity_type = 'login'
        AND success = TRUE
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF ABS(EXTRACT(EPOCH FROM (current_login_time - avg_login_time))) > 14400 THEN
            score := 0.75;
            confidence := 0.85;
            RETURN QUERY SELECT
                TRUE,
                score,
                confidence,
                'Unusual login time detected'::TEXT,
                ARRAY['Verify account access', 'Enable login notifications']::TEXT[];
        END IF;
    END IF;
    
    IF p_behavior_type = 'session_duration' THEN
        SELECT AVG(session_duration) INTO avg_session_duration
        FROM user_sessions
        WHERE user_id = p_user_id
        AND created_at > NOW() - INTERVAL '30 days';
        
        SELECT session_duration INTO current_session_duration
        FROM user_sessions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF current_session_duration > (avg_session_duration * 3) THEN
            score := 0.65;
            confidence := 0.75;
            RETURN QUERY SELECT
                TRUE,
                score,
                confidence,
                'Unusually long session duration detected'::TEXT,
                ARRAY['Review session activity', 'Set session timeouts']::TEXT[];
        END IF;
    END IF;
    
    RETURN QUERY SELECT
        FALSE,
        0.0::DECIMAL,
        0.0::DECIMAL,
        'No anomalies detected'::TEXT,
        ARRAY[]::TEXT[];
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_enhanced_security_score(
    p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    profile_record RECORD;
    settings_record RECORD;
    device_count INTEGER;
    trusted_device_count INTEGER;
    recent_activity_count INTEGER;
    factors JSONB := '{}'::JSONB;
BEGIN
    SELECT * INTO profile_record
    FROM user_profiles
    WHERE id = p_user_id;
    
    SELECT * INTO settings_record
    FROM user_security_settings
    WHERE user_id = p_user_id;
    
    IF profile_record.email_verified THEN
        score := score + 15;
        factors := factors || '{"email_verified": 15}'::JSONB;
    END IF;
    
    IF profile_record.two_factor_enabled THEN
        score := score + 25;
        factors := factors || '{"two_factor_enabled": 25}'::JSONB;
    END IF;
    
    IF profile_record.biometric_enabled THEN
        score := score + 20;
        factors := factors || '{"biometric_enabled": 20}'::JSONB;
    END IF;
    
    IF settings_record.auto_lock_enabled THEN
        score := score + 10;
        factors := factors || '{"auto_lock_enabled": 10}'::JSONB;
    END IF;
    
    IF settings_record.data_encryption_enabled THEN
        score := score + 15;
        factors := factors || '{"data_encryption_enabled": 15}'::JSONB;
    END IF;
    
    IF settings_record.login_notifications THEN
        score := score + 5;
        factors := factors || '{"login_notifications": 5}'::JSONB;
    END IF;
    
    SELECT COUNT(*) INTO device_count
    FROM user_devices
    WHERE user_id = p_user_id;
    
    SELECT COUNT(*) INTO trusted_device_count
    FROM user_devices
    WHERE user_id = p_user_id AND is_trusted = TRUE;
    
    IF device_count > 0 AND (trusted_device_count::FLOAT / device_count) >= 0.8 THEN
        score := score + 10;
        factors := factors || '{"trusted_devices_ratio": 10}'::JSONB;
    END IF;
    
    SELECT COUNT(*) INTO recent_activity_count
    FROM security_activity_logs
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '7 days'
    AND success = FALSE;
    
    IF recent_activity_count = 0 THEN
        score := score + 5;
        factors := factors || '{"no_recent_failures": 5}'::JSONB;
    ELSIF recent_activity_count > 10 THEN
        score := score - 15;
        factors := factors || '{"high_failure_rate": -15}'::JSONB;
    END IF;
    
    score := GREATEST(0, LEAST(100, score));
    
    INSERT INTO security_score_history (user_id, score, factors)
    VALUES (p_user_id, score, factors);
    
    UPDATE user_profiles
    SET security_score = score
    WHERE id = p_user_id;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_devices_updated_at
    BEFORE UPDATE ON user_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_security_settings_updated_at
    BEFORE UPDATE ON user_security_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threat_detection_rules_updated_at
    BEFORE UPDATE ON threat_detection_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO user_security_settings (user_id)
SELECT id FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_security_settings);

INSERT INTO threat_detection_rules (rule_name, rule_type, description, conditions, actions, severity) VALUES
('Brute Force Detection', 'login_attempt', 'Detect multiple failed login attempts', 
 '{"max_attempts": 5, "time_window": 3600}', 
 '{"action": "alert", "lock_account": true}', 'high'),
('Suspicious Location', 'location_anomaly', 'Detect logins from unusual locations', 
 '{"distance_threshold": 1000, "time_threshold": 3600}', 
 '{"action": "alert", "require_verification": true}', 'medium'),
('Device Anomaly', 'device_fingerprint', 'Detect new or suspicious devices', 
 '{"trust_threshold": 0.7, "activity_threshold": 5}', 
 '{"action": "alert", "require_device_verification": true}', 'medium'),
('Session Hijacking', 'session_anomaly', 'Detect potential session hijacking', 
 '{"ip_change": true, "user_agent_change": true}', 
 '{"action": "revoke_session", "alert": true}', 'high');