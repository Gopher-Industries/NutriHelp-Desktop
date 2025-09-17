-- 补充缺失的threat_detection_rules表
-- 执行此脚本来解决"relation public.threat_detection_rules does not exist"错误

-- 创建threat_detection_rules表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_threat_detection_rules_active ON threat_detection_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_threat_detection_rules_type ON threat_detection_rules(rule_type);

-- 插入示例威胁检测规则
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
('Multiple Failed Logins', 'authentication', 'Detect repeated authentication failures',
 '{"max_failures": 3, "time_window": 1800}',
 '{"action": "alert", "temporary_lock": true}', 'medium'),
('Unusual Access Pattern', 'behavior_analysis', 'Detect unusual user behavior patterns',
 '{"deviation_threshold": 0.8, "analysis_window": 86400}',
 '{"action": "monitor", "increase_scrutiny": true}', 'low');

-- 确保有测试用户数据（如果user_profiles表为空）
DO $$
BEGIN
    -- 检查user_profiles表是否为空
    IF NOT EXISTS (SELECT 1 FROM user_profiles LIMIT 1) THEN
        -- 插入测试用户数据
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
        );
        
        RAISE NOTICE 'Test user data inserted into user_profiles table';
    ELSE
        RAISE NOTICE 'user_profiles table already contains data';
    END IF;
END $$;