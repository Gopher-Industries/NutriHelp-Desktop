# NutriHelp Desktop

A cross-platform desktop nutrition assistant application built with Electron and React, providing personalized nutrition advice, meal planning, and health management features.

## 🚀 Features

- **Cross-Platform Support**: Compatible with Windows, macOS, and Linux
- **Modern UI**: Beautiful interface built with Ant Design
- **Real-time Data Sync**: Cloud synchronization powered by Supabase
- **Offline Functionality**: Works offline with local data caching
- **Smart Recommendations**: AI-driven personalized nutrition suggestions
- **Data Visualization**: Rich charts and analytics for health data
- **Secure & Reliable**: End-to-end encryption and secure authentication

## 🛠️ Technology Stack

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

## 📁 Project Structure

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


## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or yarn 1.22.x
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nutrihelp-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure Supabase**
   - Create a new project at [Supabase](https://supabase.com)
   - Get your project URL and anon key
   - Update the `.env` file:
   ```env
   REACT_APP_SUPABASE_URL=https://mdauzoueyzgtqsojttkp.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYXV6b3VleXpndHFzb2p0dGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE1MDE2MjYsImV4cCI6MjAyNzA3NzYyNn0.0EaAI8B563zQe9hcm4zjMWAlxCCYaw28mOXLcnRbooM
   ```

### Database Setup

Execute the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  age INTEGER,
  gender VARCHAR(10),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  activity_level VARCHAR(20),
  dietary_restrictions TEXT[],
  health_conditions TEXT[],
  goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foods database table
CREATE TABLE foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  calories_per_100g DECIMAL(8,2),
  protein DECIMAL(8,2),
  carbs DECIMAL(8,2),
  fat DECIMAL(8,2),
  fiber DECIMAL(8,2),
  vitamins JSONB,
  minerals JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal records table
CREATE TABLE meal_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  food_id UUID REFERENCES foods(id),
  quantity DECIMAL(8,2) NOT NULL,
  calories DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can manage own data" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meal records" ON meal_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Foods are viewable by everyone" ON foods
  FOR SELECT USING (true);
```

## 🏃‍♂️ Running the Application

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
# Build the React application
npm run build

# Package the Electron application
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

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Different Platforms

The application supports building for multiple platforms:

- **Windows**: Generates NSIS installer
- **macOS**: Creates standard Mac application
- **Linux**: Produces AppImage, DEB, and RPM packages

```bash
# Build for current platform
npm run dist

# Build for specific platform (if cross-compilation is set up)
npm run dist -- --win
npm run dist -- --mac
npm run dist -- --linux
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Supabase project URL | - |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | - |
| `REACT_APP_ENVIRONMENT` | Runtime environment | development |

### Application Features

- **User Authentication**: Secure login/registration with Supabase Auth
- **Profile Management**: Comprehensive user health profiles
- **Nutrition Tracking**: Food database with detailed nutritional information
- **Meal Planning**: Personalized meal recommendations
- **Health Monitoring**: Weight and health metrics tracking
- **Data Visualization**: Charts and progress tracking
- **Offline Support**: Local data caching for offline usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [documentation](docs/)
2. Search [existing issues](../../issues)
3. Create a [new issue](../../issues/new)
4. Contact the development team