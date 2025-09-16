import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Card, Row, Col, Statistic, Progress, Typography, Space, Button, Avatar, Divider } from 'antd';
import {
  CalendarOutlined,
  FireOutlined,
  DropletOutlined,
  TrophyOutlined,
  PlusOutlined,
  HeartOutlined,
  ThunderboltOutlined
} from '../../../components/icons/PaperIcons';
import { selectUserProfile } from '../../store/slices/authSlice';

const { Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const userProfile = useSelector(selectUserProfile);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [dashboardData, setDashboardData] = useState({
    dailyCalories: {
      consumed: 1650,
      target: 2000,
      remaining: 350
    },
    waterIntake: {
      consumed: 6,
      target: 8
    },
    macros: {
      carbs: { consumed: 180, target: 250 },
      protein: { consumed: 85, target: 120 },
      fat: { consumed: 65, target: 80 }
    },
    weeklyProgress: {
      workoutsCompleted: 4,
      targetWorkouts: 5,
      weightChange: -0.5
    },
    recentMeals: [
      { id: 1, name: 'Oatmeal Breakfast', calories: 320, time: '08:30' },
      { id: 2, name: 'Chicken Breast Salad', calories: 450, time: '12:30' },
      { id: 3, name: 'Nuts Snack', calories: 180, time: '15:00' }
    ]
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCalorieProgressColor = () => {
    const percentage = (dashboardData.dailyCalories.consumed / dashboardData.dailyCalories.target) * 100;
    if (percentage < 70) return '#52c41a';
    if (percentage < 90) return '#faad14';
    return '#ff4d4f';
  };

  const getMacroPercentage = (macro) => {
    return (macro.consumed / macro.target) * 100;
  };

  return (
    <Content className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Area */}
      <div className="mb-6">
        <Row align="middle" className="mb-4">
          <Col>
            <Space size="large">
              <Avatar size={64} className="bg-green-600">
                {userProfile && (userProfile.first_name || userProfile.last_name)
                  ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim().charAt(0)
                  : (user?.email?.charAt(0) || 'U')}
              </Avatar>
              <div>
                <Title level={2} className="mb-0">
                  {getGreeting()}, {userProfile && (userProfile.first_name || userProfile.last_name)
                    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
                    : (user?.email || 'User')}!
                </Title>
                <Text type="secondary" className="text-lg">
                  Today is {currentTime.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Daily Calories"
              value={dashboardData.dailyCalories.consumed}
              suffix={`/ ${dashboardData.dailyCalories.target}`}
              prefix={<FireOutlined className="text-orange-500" />}
            />
            <Progress
              percent={(dashboardData.dailyCalories.consumed / dashboardData.dailyCalories.target) * 100}
              strokeColor={getCalorieProgressColor()}
              className="mt-2"
            />
            <Text type="secondary" className="text-sm">
              {dashboardData.dailyCalories.remaining} calories remaining
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Water Intake"
              value={dashboardData.waterIntake.consumed}
              suffix={`/ ${dashboardData.waterIntake.target} cups`}
              prefix={<DropletOutlined className="text-blue-500" />}
            />
            <Progress
              percent={(dashboardData.waterIntake.consumed / dashboardData.waterIntake.target) * 100}
              strokeColor="#1890ff"
              className="mt-2"
            />
            <Button type="link" size="small" icon={<PlusOutlined />}>
              Add Water Record
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Weekly Workouts"
              value={dashboardData.weeklyProgress.workoutsCompleted}
              suffix={`/ ${dashboardData.weeklyProgress.targetWorkouts} times`}
              prefix={<TrophyOutlined className="text-yellow-500" />}
            />
            <Progress
              percent={(dashboardData.weeklyProgress.workoutsCompleted / dashboardData.weeklyProgress.targetWorkouts) * 100}
              strokeColor="#faad14"
              className="mt-2"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title="Weight Change"
              value={dashboardData.weeklyProgress.weightChange}
              suffix="kg"
              prefix={<HeartOutlined className="text-red-500" />}
              valueStyle={{ color: dashboardData.weeklyProgress.weightChange < 0 ? '#52c41a' : '#ff4d4f' }}
            />
            <Text type="secondary" className="text-sm">
              This week's change
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Nutrition Distribution */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Today's Nutrition Intake" extra={<Button type="link">View Details</Button>}>
            <Space direction="vertical" className="w-full">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Text>Carbohydrates</Text>
                  <Text>{dashboardData.macros.carbs.consumed}g / {dashboardData.macros.carbs.target}g</Text>
                </div>
                <Progress
                  percent={getMacroPercentage(dashboardData.macros.carbs)}
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Text>Protein</Text>
                  <Text>{dashboardData.macros.protein.consumed}g / {dashboardData.macros.protein.target}g</Text>
                </div>
                <Progress
                  percent={getMacroPercentage(dashboardData.macros.protein)}
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Text>Fat</Text>
                  <Text>{dashboardData.macros.fat.consumed}g / {dashboardData.macros.fat.target}g</Text>
                </div>
                <Progress
                  percent={getMacroPercentage(dashboardData.macros.fat)}
                  strokeColor="#faad14"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Recent Meal Records" 
            extra={
              <Button type="primary" icon={<PlusOutlined />} className="bg-green-600 border-green-600">
                Add Meal
              </Button>
            }
          >
            <Space direction="vertical" className="w-full">
              {dashboardData.recentMeals.map((meal, index) => (
                <div key={meal.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <Text strong>{meal.name}</Text>
                      <br />
                      <Text type="secondary" className="text-sm">{meal.time}</Text>
                    </div>
                    <div className="text-right">
                      <Text className="text-orange-600">
                        <ThunderboltOutlined /> {meal.calories} calories
                      </Text>
                    </div>
                  </div>
                  {index < dashboardData.recentMeals.length - 1 && <Divider className="my-3" />}
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={6}>
            <Button 
              type="default" 
              size="large" 
              className="w-full h-20 flex flex-col items-center justify-center"
              icon={<PlusOutlined className="text-xl mb-1" />}
            >
              Record Meal
            </Button>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Button 
              type="default" 
              size="large" 
              className="w-full h-20 flex flex-col items-center justify-center"
              icon={<CalendarOutlined className="text-xl mb-1" />}
            >
              Meal Plan
            </Button>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Button 
              type="default" 
              size="large" 
              className="w-full h-20 flex flex-col items-center justify-center"
              icon={<DropletOutlined className="text-xl mb-1" />}
            >
              Record Water
            </Button>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Button 
              type="default" 
              size="large" 
              className="w-full h-20 flex flex-col items-center justify-center"
              icon={<HeartOutlined className="text-xl mb-1" />}
            >
              Health Record
            </Button>
          </Col>
        </Row>
      </Card>
    </Content>
  );
};

export default Dashboard;