import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { loadFonts } from '../utils/fonts';

export default function AppWrapper({ children }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await loadFonts();
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Error loading fonts:', e);
        setError(e);
        // Continue without fonts as a fallback
        setFontsLoaded(true);
      }
    }

    prepare();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>
          Loading application...
        </Text>
      </View>
    );
  }

  if (error) {
    console.warn('App started with font loading error:', error);
  }

  return children;
}
