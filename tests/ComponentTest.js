// Test script to verify the multi-station functionality
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Test import of the fixed component
import CitySelectionScreen from '../screens/CitySelectionScreenFixed';

const TestApp = () => {
  const handleCitySelect = (cityData) => {
    console.log('Selected city/station:', cityData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Component Test</Text>
      <CitySelectionScreen
        onCitySelect={handleCitySelect}
        onClose={() => console.log('Modal closed')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
});

export default TestApp;
