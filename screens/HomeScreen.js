import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { supabase } from '../config/supabaseClient';
import CitySelectionScreen from './CitySelectionScreen';

const HomeScreen = () => {
  const [waterLevels, setWaterLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Fetch water levels data from Supabase with dynamic table name
  const fetchWaterLevels = async (tableName = 'water_levels') => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        Alert.alert('Error', `Failed to fetch data from ${tableName}`);
        return;
      }

      setWaterLevels(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowCitySelector(false);
    setLoading(true);
    
    // Unsubscribe from previous subscription
    if (subscription) {
      subscription.unsubscribe();
    }
    
    // Fetch data from the new table
    fetchWaterLevels(city.tableName);
    
    // Set up new real-time subscription
    setupRealtimeSubscription(city.tableName);
  };

  // Setup real-time subscription for the selected table
  const setupRealtimeSubscription = (tableName) => {
    const newSubscription = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log(`Real-time update received for ${tableName}:`, payload);
          // Refresh data when changes occur
          fetchWaterLevels(tableName);
        }
      )
      .subscribe();
    
    setSubscription(newSubscription);
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    if (selectedCity) {
      fetchWaterLevels(selectedCity.tableName);
    }
  };

  // Initialize the app - check for available cities
  useEffect(() => {
    // Start by showing city selector if no city is selected
    if (!selectedCity) {
      setLoading(false);
      setShowCitySelector(true);
    }
  }, []);

  // Cleanup subscription on component unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [subscription]);

  // Render individual water level reading card
  const renderWaterLevelCard = (reading) => {
    const { date, time } = formatTimestamp(reading.timestamp);
    
    return (
      <View
        key={reading.id}
        style={styles.card}
      >
        {/* Header with timestamp */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {date}
          </Text>
          <Text style={styles.cardSubtitle}>
            {time}
          </Text>
        </View>

        {/* Metrics grid */}
        <View style={styles.metricsGrid}>
          {/* Water Level */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>
              Water Level
            </Text>
            <Text style={[styles.metricValue, styles.metricValueBlue]}>
              {reading.water_level?.toFixed(2) || 'N/A'} m
            </Text>
          </View>

          {/* Pressure */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>
              Pressure
            </Text>
            <Text style={[styles.metricValue, styles.metricValueGreen]}>
              {reading.pressure?.toFixed(2) || 'N/A'} kPa
            </Text>
          </View>

          {/* Temperature */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>
              Temperature
            </Text>
            <Text style={[styles.metricValue, styles.metricValueOrange]}>
              {reading.temperature?.toFixed(1) || 'N/A'}°C
            </Text>
          </View>

          {/* Battery Level */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>
              Battery
            </Text>
            <Text style={[
              styles.metricValue,
              (reading.battery_level || 0) > 20 ? styles.metricValueGreen : styles.metricValueRed
            ]}>
              {reading.battery_level?.toFixed(0) || 'N/A'}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading water level data...</Text>
      </View>
    );
  }

  // Show city selector modal
  if (showCitySelector) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showCitySelector}
        onRequestClose={() => setShowCitySelector(false)}
      >
        <CitySelectionScreen onCitySelect={handleCitySelect} />
      </Modal>
    );
  }

  // Show message if no city is selected
  if (!selectedCity) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Please select a monitoring station</Text>
        <TouchableOpacity 
          style={styles.selectCityButton} 
          onPress={() => setShowCitySelector(true)}
        >
          <Text style={styles.selectCityButtonText}>Select Station</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with city selector */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>
              Groundwater Insights
            </Text>
            <Text style={styles.headerSubtitle}>
              {waterLevels.length} readings available
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cityButton}
            onPress={() => setShowCitySelector(true)}
          >
            <Text style={styles.cityButtonIcon}>{selectedCity?.icon}</Text>
            <Text style={styles.cityButtonText}>{selectedCity?.name}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cityInfo}>
          <Text style={styles.cityInfoText}>
            📍 {selectedCity?.description} • Table: {selectedCity?.tableName}
          </Text>
        </View>
      </View>

      {/* Data list */}
      {waterLevels.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>
            No data available for {selectedCity?.name}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            Pull down to refresh or check your connection
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scrollContent}>
            {waterLevels.map(renderWaterLevelCard)}
          </View>
        </ScrollView>
      )}

      {/* City Selection Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showCitySelector}
        onRequestClose={() => setShowCitySelector(false)}
      >
        <CitySelectionScreen onCitySelect={handleCitySelect} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    color: '#bfdbfe',
    marginTop: 4,
  },
  cityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cityButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cityButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cityInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cityInfoText: {
    color: '#bfdbfe',
    fontSize: 12,
  },
  selectCityButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  selectCityButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricItem: {
    width: '50%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricValueBlue: {
    color: '#2563eb',
  },
  metricValueGreen: {
    color: '#059669',
  },
  metricValueOrange: {
    color: '#ea580c',
  },
  metricValueRed: {
    color: '#dc2626',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
});

export default HomeScreen;
