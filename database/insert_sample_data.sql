-- Insert sample data for user_profiles table
-- This will resolve the "getUserProfile returning no rows" error

INSERT INTO user_profiles (
    id,
    user_id,
    full_name,
    email,
    role,
    two_factor_enabled,
    email_verified,
    security_score,
    risk_level,
    account_locked,
    failed_login_attempts,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    gen_random_uuid(),
    'Test User',
    'test@example.com',
    'user',
    false,
    true,
    75,
    'low',
    false,
    0,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    gen_random_uuid(),
    'Admin User',
    'admin@example.com',
    'admin',
    true,
    true,
    95,
    'low',
    false,
    0,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    gen_random_uuid(),
    'Demo User',
    'demo@example.com',
    'user',
    false,
    true,
    60,
    'medium',
    false,
    0,
    NOW(),
    NOW()
);

-- Insert sample data for security_score_history table
-- This will resolve the "security_score_history.created_at column not existing" error

INSERT INTO security_score_history (
    id,
    user_id,
    score,
    factors,
    created_at
)
SELECT 
    gen_random_uuid(),
    up.id,
    up.security_score,
    '{"email_verified": 15, "security_settings": 10}'::JSONB,
    NOW() - INTERVAL '1 day'
FROM user_profiles up;

-- Insert sample data for threat_detection_rules table
-- This will resolve the "threat_detection_rules relation does not exist" error

CREATE TABLE IF NOT EXISTS threat_detection_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(100) NOT NULL,
    description TEXT,
    conditions JSONB,
    actions JSONB,
    severity VARCHAR(20) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Insert sample user_security_settings data
INSERT INTO user_security_settings (user_id)
SELECT id FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_security_settings WHERE user_id IS NOT NULL);