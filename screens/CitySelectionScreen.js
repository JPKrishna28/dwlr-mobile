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
  const [selectedStation, setSelectedStation] = useState(null);
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
    setSelectedStation(null);
    setShowStations(true);
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
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
    setSelectedStation(null);
  };

  useEffect(() => {
    checkAvailableDistricts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Checking available district monitoring stations...</Text>
      </View>
    );
  }

  if (districts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🚫</Text>
        <Text style={styles.emptyTitle}>No District Monitoring Stations Available</Text>
        <Text style={styles.emptyDescription}>
          Please contact your administrator to set up district monitoring stations.
        </Text>
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
            `Select monitoring station in ${selectedDistrict?.name}`
          }
        </Text>
        {showStations && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDistricts}>
            <Text style={styles.backButtonText}>← Back to Districts</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* District/Station Selection */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {!showStations ? (
            // Show Districts
            districts.map((district) => (
              <TouchableOpacity
                key={district.id}
                style={[
                  styles.districtCard,
                  { borderColor: district.color }
                ]}
                onPress={() => handleDistrictSelect(district)}
                activeOpacity={0.8}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.districtIcon}>{district.icon}</Text>
                    <View style={styles.districtInfo}>
                      <Text style={styles.districtName}>{district.name}</Text>
                      <Text style={styles.districtDescription}>{district.description}</Text>
                      <Text style={styles.stationCount}>
                        {district.stations.length} monitoring station{district.stations.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.colorIndicator, { backgroundColor: district.color }]} />
              </TouchableOpacity>
            ))
          ) : (
            // Show Stations for Selected District
            selectedDistrict?.stations.map((station) => (
              <TouchableOpacity
                key={station.id}
                style={[
                  styles.stationCard,
                  selectedStation?.id === station.id && styles.stationCardSelected,
                ]}
                onPress={() => handleStationSelect(station)}
                activeOpacity={0.8}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.stationIcon}>{station.icon}</Text>
                    <View style={styles.stationInfo}>
                      <Text style={[
                        styles.stationName,
                        selectedStation?.id === station.id && styles.stationNameSelected
                      ]}>
                        {station.name}
                      </Text>
                      <Text style={[
                        styles.stationDescription,
                        selectedStation?.id === station.id && styles.stationDescriptionSelected
                      ]}>
                        {station.description}
                      </Text>
                      <Text style={[
                        styles.tableName,
                        selectedStation?.id === station.id && styles.tableNameSelected
                      ]}>
                        Table: {station.tableName}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {selectedStation?.id === station.id && (
                  <View style={[styles.selectedIndicator, { backgroundColor: selectedDistrict.color }]} />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {!showStations ? 
            `${districts.length} district${districts.length !== 1 ? 's' : ''} available` :
            `${selectedDistrict?.stations.length || 0} station${(selectedDistrict?.stations.length || 0) !== 1 ? 's' : ''} in ${selectedDistrict?.name}`
          }
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
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  districtCard: {
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
    overflow: 'hidden',
  },
  stationCard: {
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
  stationCardSelected: {
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    elevation: 6,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  districtIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  stationIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  districtInfo: {
    flex: 1,
  },
  stationInfo: {
    flex: 1,
  },
  districtName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  stationNameSelected: {
    color: '#2563eb',
  },
  districtDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  stationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  stationDescriptionSelected: {
    color: '#3b82f6',
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
  tableNameSelected: {
    color: '#6b7280',
  },
  colorIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
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
