import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { ToolOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const UnderDevelopment = ({ moduleName }) => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '24px', 
      height: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '600px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <ToolOutlined 
            style={{ 
              fontSize: '64px', 
              color: '#1890ff',
              marginBottom: '16px'
            }} 
          />
          
          <Title level={2} style={{ margin: 0 }}>
            {moduleName || 'Module'} Under Development
          </Title>
          
          <Text type="secondary" style={{ fontSize: '16px' }}>
            This feature is currently being developed and will be available soon.
          </Text>
          
          <Text type="secondary">
            We are working hard to bring you the best experience. 
            Please check back later for updates.
          </Text>
          
          <Button 
            type="primary" 
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ marginTop: '24px' }}
          >
            Back to Dashboard
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default UnderDevelopment;