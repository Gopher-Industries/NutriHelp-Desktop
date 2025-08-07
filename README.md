# NutriHelp Desktop

A cross-platform desktop nutrition assistant application built with Electron and React, providing personalized nutrition advice, meal planning, and health management features.

## Features

- **Cross-Platform Support**: Compatible with Windows, macOS, and Linux
- **Modern UI**: Beautiful interface built with Ant Design
- **Real-time Data Sync**: Cloud synchronization powered by Supabase
- **Offline Functionality**: Works offline with local data caching
- **Smart Recommendations**: AI-driven personalized nutrition suggestions
- **Data Visualization**: Rich charts and analytics for health data
- **Secure & Reliable**: End-to-end encryption and secure authentication

## Technology Stack

### Frontend
- **Framework**: Electron + React 18
- **UI Library**: Ant Design 5.x
- **State Management**: Redux Toolkit
- **Routing**: React Router 6
- **Styling**: Styled Components + CSS Modules
- **Charts**: Chart.js + React-Chartjs-2
- **Date Handling**: date-fns

### Backend Services
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Real-time Communication**: Supabase Realtime
- **File Storage**: Supabase Storage

### Development Tools
- **Build Tools**: React Scripts + Electron Builder
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **Version Control**: Git

## Project Structure

```
nutrihelp-desktop/
├── public/                        # Public assets
│   ├── index.html                 # HTML template
│   └── favicon.ico                # App icon
├── src/                           # Source code
│   ├── main/                      # Electron main process
│   │   ├── main.js                # Main process entry point
│   │   └── menu.js                # Application menu configuration
│   ├── preload/                   # Preload scripts
│   │   └── preload.js             # Secure API exposure to renderer
│   └── renderer/                  # Renderer process (React app)
│       ├── App.js                 # App root component
│       ├── index.js               # Entry point for React renderer
│       ├── assets/                # Static assets
│       │   ├── fonts/             # Font files
│       │   ├── icons/             # Icon resources
│       │   └── images/            # Image resources
│       ├── components/            # Reusable components
│       │   ├── Auth/              # Authentication components
│       │   ├── Charts/            # Chart components
│       │   ├── Common/            # Common shared components
│       │   ├── Forms/             # Form components
│       │   └── Layout/            # Layout structure components
│       ├── context/               # React Context API
│       │   ├── AuthContext.js     # Authentication context
│       │   └── ThemeContext.js    # Theme context
│       ├── hooks/                 # Custom React Hooks
│       │   ├── useAuth.js
│       │   ├── useLocalStorage.js
│       │   └── useNutrition.js
│       ├── pages/                 # Page-level components
│       │   ├── Auth/              # Login, Signup pages
│       │   ├── Dashboard/         # Dashboard overview
│       │   ├── Health/            # Health monitoring features
│       │   ├── Help/              # Help & support
│       │   ├── MealPlan/          # Meal planning pages
│       │   ├── Nutrition/         # Nutrition analysis pages
│       │   ├── Profile/           # User profile pages
│       │   ├── Recipe/            # Recipe management
│       │   └── Settings/          # App settings
│       ├── services/              # API and storage services
│       │   ├── api.js             # API wrapper functions
│       │   ├── storage.js         # Local storage handler
│       │   └── supabase.js        # Supabase config and client
│       ├── store/                 # Redux state management
│       │   ├── index.js           # Store setup
│       │   └── slices/            # Redux slices
│       ├── styles/                # Styling
│       │   ├── index.css          # Global styles
│       │   ├── variables.css      # CSS variables
│       │   └── themes/            # Theme-specific styles
│       ├── utils/                 # Utility functions
│       │   ├── constants.js       # App-wide constants
│       │   ├── helpers.js         # General utilities
│       │   ├── nutrition.js       # Nutrition-specific logic
│       │   └── validation.js      # Form validation
├── .env.example                  # Example environment variables
├── README.md                     # Project documentation
├── build/                        # Production build output
├── dist/                         # Electron package output
├── package.json                  # Project dependencies and scripts

```


## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or yarn 1.22.x
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gopher-Industries/NutriHelp-Desktop
   cd nutrihelp-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase**
   Copy the `.env` file in the root directory.

## Running the Application

### Development Mode

```bash
# Start the development server
npm run dev
# or
yarn dev
```

This will start both the React development server and the Electron application.

### Building for Production

```bash
npm run build

npm run dist
```

### Available Scripts

- `npm start` - Start Electron with Electron Forge
- `npm run dev` - Start development mode with hot reload
- `npm run build` - Build React application for production
- `npm run dist` - Build and package Electron application
- `npm test` - Run tests
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier


## Building for Different Platforms

The application supports building for multiple platforms:

- **Windows**: Generates NSIS installer
- **macOS**: Creates standard Mac application
- **Linux**: Produces AppImage, DEB, and RPM packages

```bash
npm run dist

npm run dist -- --win
npm run dist -- --mac
npm run dist -- --linux
```

## Application Features

- **User Authentication**: Secure login/registration with Supabase Auth
- **Profile Management**: Comprehensive user health profiles
- **Nutrition Tracking**: Food database with detailed nutritional information
- **Meal Planning**: Personalized meal recommendations
- **Health Monitoring**: Weight and health metrics tracking
- **Data Visualization**: Charts and progress tracking
- **Offline Support**: Local data caching for offline usage