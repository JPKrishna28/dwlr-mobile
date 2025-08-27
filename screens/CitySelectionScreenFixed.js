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
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showStations, setShowStations] = useState(false);

  // Available districts with their monitoring stations
  const availableDistricts = [
    {
      id: 'eluru',
      name: 'Eluru District',
      description: 'Eluru District monitoring stations',
      icon: '🌾',
      color: '#059669',
      stations: [
        {
          id: 'eluru_station1',
          name: 'Eluru Station 1',
          tableName: 'water_levels',
          description: 'Primary Eluru monitoring station',
          icon: '📍',
        },
        {
          id: 'eluru_station2', 
          name: 'Eluru Station 2',
          tableName: 'water_levels2',
          description: 'Secondary Eluru monitoring station',
          icon: '📍',
        }
      ]
    },
    {
      id: 'krishna',
      name: 'Krishna District',
      description: 'Krishna District monitoring stations',
      icon: '🏞️',
      color: '#2563eb',
      stations: [
        {
          id: 'krishna_station1',
          name: 'Krishna Station 1', 
          tableName: 'water_levels3',
          description: 'Primary Krishna monitoring station',
          icon: '📍',
        },
        {
          id: 'krishna_station2',
          name: 'Krishna Station 2',
          tableName: 'water_levels4',
          description: 'Secondary Krishna monitoring station',
          icon: '📍',
        }
      ]
    },
  ];

  // Check which tables exist in the database
  const checkAvailableDistricts = async () => {
    setLoading(true);
    const availableDistrictsFiltered = [];

    for (const district of availableDistricts) {
      const availableStations = [];
      
      for (const station of district.stations) {
        try {
          // Try to query the table to see if it exists
          const { data, error } = await supabase
            .from(station.tableName)
            .select('id')
            .limit(1);

          if (!error) {
            // Table exists, add to available stations
            availableStations.push(station);
          }
        } catch (err) {
          console.log(`Table ${station.tableName} not available:`, err.message);
        }
      }

      if (availableStations.length > 0) {
        availableDistrictsFiltered.push({
          ...district,
          stations: availableStations
        });
      }
    }

    setDistricts(availableDistrictsFiltered);
    setLoading(false);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setShowStations(true);
  };

  const handleStationSelect = (station) => {
    // Create a combined object for the parent component
    const selectedLocation = {
      id: station.id,
      name: `${selectedDistrict.name} - ${station.name}`,
      tableName: station.tableName,
      description: station.description,
      icon: selectedDistrict.icon,
      color: selectedDistrict.color,
      district: selectedDistrict.name,
      station: station.name
    };
    onCitySelect(selectedLocation);
  };

  const handleBackToDistricts = () => {
    setShowStations(false);
    setSelectedDistrict(null);
  };

  useEffect(() => {
    checkAvailableDistricts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading districts...</Text>
      </View>
    );
  }

  if (districts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No districts available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌊 Groundwater Monitoring</Text>
        <Text style={styles.subtitle}>
          {!showStations ? 
            'Select your district' : 
            `Select station in ${selectedDistrict?.name}`
          }
        </Text>
        {showStations && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDistricts}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {!showStations ? (
          // Show Districts
          districts.map((district) => (
            <TouchableOpacity
              key={district.id}
              style={[styles.card, { borderLeftColor: district.color }]}
              onPress={() => handleDistrictSelect(district)}
            >
              <Text style={styles.cardIcon}>{district.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{district.name}</Text>
                <Text style={styles.cardDescription}>{district.description}</Text>
                <Text style={styles.stationCount}>
                  {district.stations.length} stations
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          // Show Stations
          selectedDistrict?.stations.map((station) => (
            <TouchableOpacity
              key={station.id}
              style={styles.card}
              onPress={() => handleStationSelect(station)}
            >
              <Text style={styles.cardIcon}>{station.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{station.name}</Text>
                <Text style={styles.cardDescription}>{station.description}</Text>
                <Text style={styles.tableName}>{station.tableName}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  backButtonText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  stationCount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  tableName: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
});

export default CitySelectionScreen;
