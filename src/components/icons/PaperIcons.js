import React from 'react';

const PaperIcon = ({ children, className = '', size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ 
      verticalAlign: 'text-top', 
      marginRight: '8px',
      display: 'inline-block',
      transform: 'translateY(2px)',
      ...props.style 
    }}
    {...props}
  >
    {children}
  </svg>
);

export const DashboardOutlined = (props) => (
  <PaperIcon {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </PaperIcon>
);

export const UserOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </PaperIcon>
);

export const CalendarOutlined = (props) => (
  <PaperIcon {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </PaperIcon>
);

export const SettingOutlined = (props) => (
  <PaperIcon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </PaperIcon>
);

export const ToolOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </PaperIcon>
);

export const PlusOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M12 5v14m-7-7h14" />
  </PaperIcon>
);

export const DeleteOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </PaperIcon>
);

export const EditOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </PaperIcon>
);

export const SwapOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />
  </PaperIcon>
);

export const LockOutlined = (props) => (
  <PaperIcon {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <circle cx="12" cy="16" r="1" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </PaperIcon>
);

export const BellOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </PaperIcon>
);

export const LogoutOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </PaperIcon>
);

export const ExperimentOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M9 2v6l-3 3.5a1 1 0 0 0 .7 1.7h10.6a1 1 0 0 0 .7-1.7L15 8V2" />
    <path d="M12 2v6" />
    <path d="M9 2h6" />
  </PaperIcon>
);

export const ThunderboltOutlined = (props) => (
  <PaperIcon {...props}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </PaperIcon>
);

export const HeartOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </PaperIcon>
);

export const BarChartOutlined = (props) => (
  <PaperIcon {...props}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </PaperIcon>
);

export const SecurityScanOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </PaperIcon>
);

export const RobotOutlined = (props) => (
  <PaperIcon {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </PaperIcon>
);

export const LineChartOutlined = (props) => (
  <PaperIcon {...props}>
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
    <polyline points="17,6 23,6 23,12" />
  </PaperIcon>
);

export const BookOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </PaperIcon>
);

export const TeamOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </PaperIcon>
);

export const FileTextOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </PaperIcon>
);

export const MonitorOutlined = (props) => (
  <PaperIcon {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </PaperIcon>
);

export const BugOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M8 6V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
    <path d="M8 21h8" />
    <path d="M12 21V9" />
    <path d="M8 9h8" />
    <path d="M8 9L5.5 7" />
    <path d="M16 9l2.5-2" />
    <path d="M8 21l-2.5 2" />
    <path d="M16 21l2.5 2" />
  </PaperIcon>
);

export const RadarChartOutlined = (props) => (
  <PaperIcon {...props}>
    <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
    <polygon points="12,7 18.5,10 18.5,14 12,17 5.5,14 5.5,10" />
    <polygon points="12,12 15,13.5 15,16.5 12,18 9,16.5 9,13.5" />
  </PaperIcon>
);

export const AlertOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </PaperIcon>
);

export const SafetyOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </PaperIcon>
);

export const SafetyCertificateOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </PaperIcon>
);

export const HomeOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </PaperIcon>
);

export const EyeOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </PaperIcon>
);

export const EyeInvisibleOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </PaperIcon>
);

export const EyeTwoTone = (props) => (
  <PaperIcon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </PaperIcon>
);

export const SearchOutlined = (props) => (
  <PaperIcon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </PaperIcon>
);

export const FilterOutlined = (props) => (
  <PaperIcon {...props}>
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
  </PaperIcon>
);

export const ReloadOutlined = (props) => (
  <PaperIcon {...props}>
    <polyline points="23,4 23,10 17,10" />
    <polyline points="1,20 1,14 7,14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
  </PaperIcon>
);

export const CheckCircleOutlined = (props) => {
  const { noMargin, ...restProps } = props;
  const defaultStyle = noMargin ? 
    { verticalAlign: 'middle', transform: 'translateY(-3px)', display: 'inline-block' } : 
    { marginRight: '6px', verticalAlign: 'middle', transform: 'translateY(-3px)', display: 'inline-block' };
  
  return (
    <PaperIcon {...restProps} style={{ ...defaultStyle, ...restProps.style }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="9,12 11,14 15,10" />
    </PaperIcon>
  );
};

export const CheckOutlined = (props) => (
  <PaperIcon {...props}>
    <polyline points="20,6 9,17 4,12" />
  </PaperIcon>
);

export const ExclamationCircleOutlined = (props) => {
  const { noMargin, ...restProps } = props;
  const defaultStyle = noMargin ? 
    { verticalAlign: 'middle', transform: 'translateY(-3px)', display: 'inline-block' } : 
    { verticalAlign: 'text-top', marginRight: '8px', display: 'inline-block', transform: 'translateY(2px)' };
  
  return (
    <PaperIcon {...restProps} style={{ ...defaultStyle, ...restProps.style }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </PaperIcon>
  );
};

export const CloseOutlined = (props) => (
  <PaperIcon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </PaperIcon>
);

export const CloseCircleOutlined = (props) => (
  <PaperIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </PaperIcon>
);

export const ClockCircleOutlined = (props) => {
  const { noMargin, ...restProps } = props;
  const defaultStyle = noMargin ? 
    { verticalAlign: 'middle', transform: 'translateY(-1px)', display: 'inline-block' } : 
    { marginRight: '6px', verticalAlign: 'middle', transform: 'translateY(-1px)', display: 'inline-block' };
  
  return (
    <PaperIcon {...restProps} style={{ ...defaultStyle, ...restProps.style }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 15,15" />
    </PaperIcon>
  );
};

export const ArrowLeftOutlined = (props) => (
  <PaperIcon {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </PaperIcon>
);

export const BgColorsOutlined = (props) => (
  <PaperIcon {...props}>
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </PaperIcon>
);

export const PieChartOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </PaperIcon>
);

export const DownloadOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </PaperIcon>
);

export const TrophyOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M6 9a9 9 0 0 0 12 0" />
    <path d="M12 18v3" />
    <path d="M8 21h8" />
  </PaperIcon>
);

export const RiseOutlined = (props) => (
  <PaperIcon {...props}>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
    <polyline points="16,7 22,7 22,13" />
  </PaperIcon>
);

export const FallOutlined = (props) => (
  <PaperIcon {...props}>
    <polyline points="22,17 13.5,8.5 8.5,13.5 2,7" />
    <polyline points="16,17 22,17 22,11" />
  </PaperIcon>
);

export const EnvironmentOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </PaperIcon>
);

export const GlobalOutlined = (props) => (
  <PaperIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </PaperIcon>
);

export const AimOutlined = (props) => (
  <PaperIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </PaperIcon>
);

export const FireOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </PaperIcon>
);

export const DropletOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </PaperIcon>
);

export const InfoCircleOutlined = (props) => (
  <PaperIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </PaperIcon>
);

export const WarningOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </PaperIcon>
);

export const SaveOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </PaperIcon>
);

export const ExportOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </PaperIcon>
);

export const ImportOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </PaperIcon>
);

export const CloudOutlined = (props) => (
  <PaperIcon {...props}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </PaperIcon>
);

export const MobileOutlined = (props) => (
  <PaperIcon {...props}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </PaperIcon>
);

export const DatabaseOutlined = (props) => (
  <PaperIcon {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </PaperIcon>
);

export default PaperIcon;