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

const CitySelectionScreen = ({ onCitySelect }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);

  // Available cities with their corresponding table names
  const availableCities = [
    {
      id: 'city1',
      name: 'City 1',
      tableName: 'water_levels', // Original table
      description: 'Primary monitoring station',
      icon: '🏙️',
      color: '#2563eb',
    },
    {
      id: 'city2',
      name: 'City 2',
      tableName: 'water_levels2', // New table for city 2
      description: 'Secondary monitoring station',
      icon: '🌆',
      color: '#059669',
    },
  ];

  // Check which tables exist in the database
  const checkAvailableTables = async () => {
    setLoading(true);
    const availableCitiesFiltered = [];

    for (const city of availableCities) {
      try {
        // Try to query the table to see if it exists
        const { data, error } = await supabase
          .from(city.tableName)
          .select('id')
          .limit(1);

        if (!error) {
          // Table exists, add to available cities
          availableCitiesFiltered.push(city);
        }
      } catch (err) {
        console.log(`Table ${city.tableName} not available:`, err.message);
      }
    }

    setCities(availableCitiesFiltered);
    setLoading(false);

    // Auto-select first city if only one is available
    if (availableCitiesFiltered.length === 1) {
      handleCitySelect(availableCitiesFiltered[0]);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    // Store selected city in local state and pass to parent
    onCitySelect(city);
  };

  useEffect(() => {
    checkAvailableTables();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Checking available monitoring stations...</Text>
      </View>
    );
  }

  if (cities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🚫</Text>
        <Text style={styles.emptyTitle}>No Monitoring Stations Available</Text>
        <Text style={styles.emptyDescription}>
          Please contact your administrator to set up monitoring stations.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌊 Groundwater Monitoring</Text>
        <Text style={styles.subtitle}>Select your monitoring station</Text>
      </View>

      {/* City Selection Cards */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={[
                styles.cityCard,
                selectedCity?.id === city.id && styles.cityCardSelected,
              ]}
              onPress={() => handleCitySelect(city)}
              activeOpacity={0.8}
            >
              <View style={styles.cityCardContent}>
                <View style={styles.cityCardHeader}>
                  <Text style={styles.cityIcon}>{city.icon}</Text>
                  <View style={styles.cityInfo}>
                    <Text style={[
                      styles.cityName,
                      selectedCity?.id === city.id && styles.cityNameSelected
                    ]}>
                      {city.name}
                    </Text>
                    <Text style={[
                      styles.cityDescription,
                      selectedCity?.id === city.id && styles.cityDescriptionSelected
                    ]}>
                      {city.description}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cityCardFooter}>
                  <Text style={[
                    styles.tableName,
                    selectedCity?.id === city.id && styles.tableNameSelected
                  ]}>
                    Table: {city.tableName}
                  </Text>
                  
                  {selectedCity?.id === city.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {selectedCity?.id === city.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: city.color }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Action Button */}
      {selectedCity && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.proceedButton, { backgroundColor: selectedCity.color }]}
            onPress={() => {
              Alert.alert(
                'Station Selected',
                `You have selected ${selectedCity.name}. The app will now display data from ${selectedCity.tableName}.`,
                [{ text: 'Continue', onPress: () => {} }]
              );
            }}
          >
            <Text style={styles.proceedButtonText}>
              Continue to {selectedCity.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {cities.length} monitoring station{cities.length !== 1 ? 's' : ''} available
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  cityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cityCardSelected: {
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    elevation: 6,
  },
  cityCardContent: {
    padding: 20,
  },
  cityCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cityIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  cityNameSelected: {
    color: '#2563eb',
  },
  cityDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  cityDescriptionSelected: {
    color: '#3b82f6',
  },
  cityCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableName: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  tableNameSelected: {
    color: '#6b7280',
  },
  selectedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  proceedButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default CitySelectionScreen;
