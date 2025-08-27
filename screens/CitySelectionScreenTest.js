import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../config/supabaseClient';

// Simple test version to debug the issue
const CitySelectionScreenTest = ({ onCitySelect }) => {
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>City Selection Test</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          Alert.alert('Test', 'Component is working!');
          onCitySelect({
            id: 'test',
            name: 'Test District',
            tableName: 'water_levels',
            description: 'Test station',
            icon: '📍',
            color: '#2563eb'
          });
        }}
      >
        <Text style={styles.buttonText}>Select Test District</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CitySelectionScreenTest;
