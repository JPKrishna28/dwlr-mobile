# Groundwater Insights Mobile App

A React Native mobile application built with Expo for monitoring groundwater data from Supabase database. The app provides real-time data visualization, historical charts, and comprehensive monitoring capabilities.

## 🚀 Features

- **🔐 User Authentication**: Secure login/signup with Supabase Auth
- **📊 Enhanced Data Visualization**: Interactive charts for all sensor data
  - 💧 Water Level monitoring
  - 🔋 Battery Level tracking  
  - 🌡️ Temperature monitoring
  - 🔧 Pressure measurements
- **🔄 Real-time Updates**: Live data synchronization using Supabase subscriptions
- **📱 Modern UI**: Clean, responsive design with NativeWind (Tailwind CSS)
- **🚪 Session Management**: Automatic login persistence and secure logout
- **📈 Statistics Dashboard**: Comprehensive analytics with min/max/average calculations
- **🔮 Prediction**: Machine learning predictions for future water levels
- **🌆 Multi-City Support**: Support for multiple cities and monitoring stations

## 📱 Screens

1. **🔐 Authentication Screen**: Secure login/signup with email and password
2. **🏠 Home Screen**: Scrollable list of all sensor readings with pull-to-refresh
3. **📊 Charts Screen**: Interactive visualization with 4 chart types:
   - Water Level over time
   - Pressure measurements  
   - Temperature readings
   - Battery level monitoring
4. **🔮 Prediction Screen**: Future water level predictions using machine learning
5. **⚙️ Profile Screen**: User management, app settings, and database statistics

## 🛠 Tech Stack

- **Framework**: React Native with Expo SDK 54
- **🔐 Authentication**: Supabase Auth with email/password
- **🗄️ Database**: Supabase (PostgreSQL) with Row Level Security
- **📊 Charts**: react-native-chart-kit with 4 data visualizations
- **🧭 Navigation**: Expo Router for file-based routing
- **🎨 Styling**: NativeWind (Tailwind CSS)
- **⚡ Real-time**: Supabase Real-time subscriptions with automatic reconnection
- **🔮 ML**: Machine learning algorithms for water level prediction

## 📊 Database Schema

The app connects to a Supabase table called `water_levels` with the following schema:

```sql
CREATE TABLE water_levels (
  id BIGSERIAL PRIMARY KEY,
  station_id UUID REFERENCES stations(id),
  timestamp TIMESTAMPTZ NOT NULL,
  water_level DECIMAL,
  pressure DECIMAL,
  temperature DECIMAL,
  battery_level DECIMAL
);

CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  elevation DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (optional)

### 2. Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd dwlr-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### 3. Supabase Configuration

1. **Update Supabase credentials** in `config/supabaseClient.js`:
   ```javascript
   const supabaseUrl = 'https://ytogcvqzqnzjfnxyqqip.supabase.co';
   const supabaseAnonKey = 'your_actual_anon_key_here'; // ✅ Already configured
   ```

2. **Set up authentication and RLS policies**:
   - Follow the detailed setup guide in `DATABASE_SETUP.md`
   - Enable email authentication in Supabase Dashboard
   - Configure Row Level Security policies for data protection

3. **Test the authentication**:
   - Create a test user account through the app
   - Verify email verification works
   - Test login/logout functionality

### 4. Running the App

Start the development server:
```bash
npm start
# or
npx expo start
```

This will open the Expo DevTools in your browser. You can then:
- Scan the QR code with the Expo Go app (iOS/Android)
- Press `i` to run on iOS Simulator
- Press `a` to run on Android Emulator
- Press `w` to run on web browser

## 📁 Project Structure

```
dwlr-app/
├── config/
│   └── supabaseClient.js      # Supabase client configuration
├── screens/
│   ├── HomeScreen.js          # Main data list screen
│   ├── ChartScreen.js         # Data visualization screen
│   └── ProfileScreen.js       # Settings and info screen
├── App.js                     # Main app with navigation
├── babel.config.js            # Babel configuration for NativeWind
├── tailwind.config.js         # Tailwind CSS configuration
├── global.css                 # Global styles
└── package.json               # Dependencies and scripts
```

## 🔧 Configuration Files

- **babel.config.js**: Configured for NativeWind/Tailwind CSS support
- **tailwind.config.js**: Tailwind CSS configuration with proper content paths
- **global.css**: Tailwind CSS directives

## 🌐 API Integration

The app uses Supabase client for:
- Fetching water level data
- Real-time subscriptions for live updates
- Connection testing and statistics

### Real-time Features

The app automatically updates when new data is inserted into the `water_levels` table using Supabase's real-time capabilities.

## 📊 Charts and Visualization

- **Line Charts**: Water level and battery level over time
- **Statistics**: Min, max, average, and latest values
- **Interactive**: Toggle between different data types
- **Responsive**: Adapts to different screen sizes

## 🎨 Styling

The app uses NativeWind for styling, which provides:
- Tailwind CSS classes in React Native
- Consistent design system
- Responsive design capabilities
- Modern, clean UI components

## 🔧 Development Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator (macOS only)
npm run web        # Run on web browser
```

## 🚀 Deployment

### Development Build
```bash
npx expo build:android
npx expo build:ios
```

### Production Build
```bash
npx expo build --type apk --release-channel production
```

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Package conflicts**: Delete `node_modules` and run `npm install`
3. **Simulator issues**: Reset simulator or restart Metro bundler

### Supabase Connection Issues

1. Verify your Supabase URL and anon key
2. Check if the `water_levels` table exists
3. Ensure Row Level Security (RLS) policies allow read access

## 📱 Device Compatibility

- **iOS**: 11.0+
- **Android**: API level 21+ (Android 5.0+)
- **Web**: Modern browsers with ES6+ support

## 🔐 Security

- Uses Supabase anon key for database access
- Implements proper error handling
- No sensitive data stored in client-side code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please check:
1. Expo documentation: https://docs.expo.dev/
2. Supabase documentation: https://supabase.com/docs
3. React Navigation documentation: https://reactnavigation.org/

---

**Version**: 1.0.0  
**Built with**: ❤️ using React Native, Expo, and Supabase
