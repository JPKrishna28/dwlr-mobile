import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CityProvider } from './contexts/CityContext';

// Import debug utility
import './config/authDebug';

// Import screens
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ChartScreen from './screens/ChartScreen';
import ProfileScreen from './screens/ProfileScreen';
import PredictionScreen from './screens/PredictionScreen';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Custom tab bar icon component
const TabIcon = ({ focused, color, title }) => {
  const getIcon = (title) => {
    switch (title) {
      case 'Home':
        return '🏠';
      case 'Charts':
        return '📊';
      case 'Predict':
        return '🔮';
      case 'Profile':
        return '⚙️';
      default:
        return '📱';
    }
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={styles.tabIconText}>
        {getIcon(title)}
      </Text>
      <Text 
        style={[
          styles.tabIconLabel,
          { 
            color,
            fontWeight: focused ? '600' : '400'
          }
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

// Main App Component with Authentication
const AppContent = () => {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
        <Text style={styles.loadingSubtext}>Please wait</Text>
      </View>
    );
  }

  // Show auth screen if user is not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Show main app if user is logged in
  return <MainApp />;
};

// Main App with Navigation
const MainApp = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          // Remove header for all screens (we have custom headers)
          headerShown: false,
          
          // Tab bar styling
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          
          // Tab bar label styling
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: -4,
          },
          
          // Tab bar colors
          tabBarActiveTintColor: '#2563EB', // Blue-600
          tabBarInactiveTintColor: '#6B7280', // Gray-500
          
          // Custom tab bar icon
          tabBarIcon: ({ focused, color }) => (
            <TabIcon 
              focused={focused} 
              color={color} 
              title={
                route.name === 'Home' ? 'Home' : 
                route.name === 'Charts' ? 'Charts' : 
                route.name === 'Predict' ? 'Predict' : 
                'Profile'
              } 
            />
          ),
        })}
      >
        {/* Home Tab - Main data list */}
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: '',
          }}
        />
        
        {/* Charts Tab - Data visualization */}
        <Tab.Screen 
          name="Charts" 
          component={ChartScreen}
          options={{
            tabBarLabel: '',
          }}
        />

        {/* Prediction Tab - ML forecasting */}
        <Tab.Screen 
          name="Predict" 
          component={PredictionScreen}
          options={{
            tabBarLabel: '',
          }}
        />
        
        {/* Profile Tab - Settings and info */}
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <>
      {/* Status bar configuration */}
      <StatusBar style="light" backgroundColor="#2563EB" />
      
      {/* Auth Provider wrapping the entire app */}
      <AuthProvider>
        <CityProvider>
          <AppContent />
        </CityProvider>
      </AuthProvider>
    </>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabIconLabel: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
});
