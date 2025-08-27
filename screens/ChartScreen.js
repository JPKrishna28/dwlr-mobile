import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { supabase } from '../config/supabaseClient';
import CitySelectionScreen from './CitySelectionScreenFixed';
import { useCity } from '../contexts/CityContext';

const ChartScreen = () => {
  const [waterLevels, setWaterLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('water_level'); // 'water_level', 'battery_level', 'temperature', 'pressure'
  const [showCitySelector, setShowCitySelector] = useState(false);
  
  // Use shared city context
  const { selectedCity, setSelectedCity } = useCity();

  const screenWidth = Dimensions.get('window').width;

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue color
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`, // Gray color
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#3B82F6',
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#E5E7EB',
      strokeDasharray: '5,5',
    },
  };

  const batteryChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green color for battery
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#10B981',
    },
  };

  const temperatureChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(234, 88, 12, ${opacity})`, // Orange color for temperature
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#EA580C',
    },
  };

  const pressureChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`, // Purple color for pressure
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#9333EA',
    },
  };

  // Fetch water levels data from Supabase with dynamic table name
  const fetchWaterLevels = async (tableName = 'water_levels') => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(20); // Limit to last 20 readings for better chart display

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
    }
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    console.log('📊 ChartScreen: City selected:', city.name);
    setSelectedCity(city);  // This will trigger the useEffect to load data
    setShowCitySelector(false);
  };

  // Initialize the app - check for available cities
  useEffect(() => {
    // Start by showing city selector if no city is selected
    if (!selectedCity) {
      setLoading(false);
      setShowCitySelector(true);
    }
  }, []);

  // Respond to city context changes (when city is selected from other screens)
  useEffect(() => {
    if (selectedCity && selectedCity.tableName) {
      console.log('📊 ChartScreen: Responding to city context change:', selectedCity.name);
      setLoading(true);
      
      // Fetch data from the new table
      fetchWaterLevels(selectedCity.tableName);
    }
  }, [selectedCity]);

  // Subscribe to real-time updates for selected city
  useEffect(() => {
    if (!selectedCity) return;

    // Set up real-time subscription for the selected table
    const subscription = supabase
      .channel(`${selectedCity.tableName}_chart_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: selectedCity.tableName,
        },
        (payload) => {
          console.log(`Chart real-time update received for ${selectedCity.tableName}:`, payload);
          fetchWaterLevels(selectedCity.tableName);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedCity]);

  // Format data for charts
  const formatChartData = (dataType) => {
    if (!waterLevels.length) return null;

    const labels = waterLevels.map((reading) => {
      const date = new Date(reading.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const datasets = [{
      data: waterLevels.map((reading) => {
        const value = reading[dataType];
        return value !== null && value !== undefined ? parseFloat(value) : 0;
      }),
      color: (opacity = 1) => 
        dataType === 'water_level' 
          ? `rgba(59, 130, 246, ${opacity})` 
          : `rgba(16, 185, 129, ${opacity})`,
      strokeWidth: 2,
    }];

    return {
      labels,
      datasets,
    };
  };

  // Get chart title and unit
  const getChartInfo = (dataType) => {
    switch (dataType) {
      case 'water_level':
        return { title: 'Water Level Over Time', unit: 'm', color: 'text-blue-600' };
      case 'battery_level':
        return { title: 'Battery Level Over Time', unit: '%', color: 'text-green-600' };
      case 'temperature':
        return { title: 'Temperature Over Time', unit: '°C', color: 'text-orange-600' };
      case 'pressure':
        return { title: 'Pressure Over Time', unit: 'kPa', color: 'text-purple-600' };
      default:
        return { title: 'Data Over Time', unit: '', color: 'text-gray-600' };
    }
  };

  // Calculate statistics
  const calculateStats = (dataType) => {
    if (!waterLevels.length) return { min: 0, max: 0, avg: 0, latest: 0 };

    const values = waterLevels
      .map(reading => reading[dataType])
      .filter(val => val !== null && val !== undefined)
      .map(val => parseFloat(val));

    if (!values.length) return { min: 0, max: 0, avg: 0, latest: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latest = values[values.length - 1];

    return { min, max, avg, latest };
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading chart data...</Text>
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
        <Text style={styles.loadingText}>Please select a district monitoring station</Text>
        <TouchableOpacity 
          style={styles.selectCityButton} 
          onPress={() => setShowCitySelector(true)}
        >
          <Text style={styles.selectCityButtonText}>Select District</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = formatChartData(activeChart);
  const chartInfo = getChartInfo(activeChart);
  const stats = calculateStats(activeChart);

  return (
    <View style={styles.container}>
      {/* Header with city selector */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>
              Data Visualization
            </Text>
            <Text style={styles.headerSubtitle}>
              Interactive charts and analytics
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
            📊 Viewing data from {selectedCity?.tableName}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Chart Type Selector */}
        <View style={styles.selectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <TouchableOpacity
              style={[
                styles.selectorButton,
                styles.selectorButtonFirst,
                activeChart === 'water_level' ? styles.selectorButtonActive : styles.selectorButtonInactive
              ]}
              onPress={() => setActiveChart('water_level')}
            >
              <Text style={[
                styles.selectorButtonText,
                activeChart === 'water_level' ? styles.selectorButtonTextActive : styles.selectorButtonTextInactive
              ]}>
                💧 Water Level
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectorButton,
                styles.selectorButtonMiddle,
                activeChart === 'pressure' ? styles.selectorButtonActivePurple : styles.selectorButtonInactive
              ]}
              onPress={() => setActiveChart('pressure')}
            >
              <Text style={[
                styles.selectorButtonText,
                activeChart === 'pressure' ? styles.selectorButtonTextActive : styles.selectorButtonTextInactive
              ]}>
                🔧 Pressure
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectorButton,
                styles.selectorButtonMiddle,
                activeChart === 'temperature' ? styles.selectorButtonActiveOrange : styles.selectorButtonInactive
              ]}
              onPress={() => setActiveChart('temperature')}
            >
              <Text style={[
                styles.selectorButtonText,
                activeChart === 'temperature' ? styles.selectorButtonTextActive : styles.selectorButtonTextInactive
              ]}>
                🌡️ Temperature
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectorButton,
                styles.selectorButtonLast,
                activeChart === 'battery_level' ? styles.selectorButtonActiveGreen : styles.selectorButtonInactive
              ]}
              onPress={() => setActiveChart('battery_level')}
            >
              <Text style={[
                styles.selectorButtonText,
                activeChart === 'battery_level' ? styles.selectorButtonTextActive : styles.selectorButtonTextInactive
              ]}>
                🔋 Battery
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {chartData && chartData.labels.length > 0 ? (
          <View>
            {/* Chart Title */}
            <Text style={[
              styles.chartTitle,
              activeChart === 'water_level' ? styles.chartTitleBlue : 
              activeChart === 'battery_level' ? styles.chartTitleGreen :
              activeChart === 'temperature' ? styles.chartTitleOrange : styles.chartTitlePurple
            ]}>
              {chartInfo.title}
            </Text>

            {/* Line Chart */}
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={
                  activeChart === 'water_level' ? chartConfig : 
                  activeChart === 'battery_level' ? batteryChartConfig :
                  activeChart === 'temperature' ? temperatureChartConfig : pressureChartConfig
                }
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                fromZero={activeChart === 'battery_level'}
              />
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>
                Statistics
              </Text>
              
              <View style={styles.statsGrid}>
                {/* Latest Value */}
                <View style={styles.statItem}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>
                      Latest
                    </Text>
                    <Text style={[
                      styles.statValue,
                      activeChart === 'water_level' ? styles.statValueBlue : 
                      activeChart === 'battery_level' ? styles.statValueGreen :
                      activeChart === 'temperature' ? styles.statValueOrange : styles.statValuePurple
                    ]}>
                      {stats.latest.toFixed(2)} {chartInfo.unit}
                    </Text>
                  </View>
                </View>

                {/* Average */}
                <View style={styles.statItem}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>
                      Average
                    </Text>
                    <Text style={[styles.statValue, styles.statValueGray]}>
                      {stats.avg.toFixed(2)} {chartInfo.unit}
                    </Text>
                  </View>
                </View>

                {/* Minimum */}
                <View style={styles.statItem}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>
                      Minimum
                    </Text>
                    <Text style={[styles.statValue, styles.statValueRed]}>
                      {stats.min.toFixed(2)} {chartInfo.unit}
                    </Text>
                  </View>
                </View>

                {/* Maximum */}
                <View style={styles.statItem}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>
                      Maximum
                    </Text>
                    <Text style={[styles.statValue, styles.statValueGreen]}>
                      {stats.max.toFixed(2)} {chartInfo.unit}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              No data available for charts
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Data will appear here once readings are available
            </Text>
          </View>
        )}
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  selectorContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  selectorButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    minWidth: 120,
  },
  selectorButtonFirst: {
    borderRadius: 8,
  },
  selectorButtonMiddle: {
    borderRadius: 8,
  },
  selectorButtonLast: {
    borderRadius: 8,
    marginRight: 0,
  },
  selectorButtonActive: {
    backgroundColor: '#2563eb',
  },
  selectorButtonActiveGreen: {
    backgroundColor: '#059669',
  },
  selectorButtonActiveOrange: {
    backgroundColor: '#ea580c',
  },
  selectorButtonActivePurple: {
    backgroundColor: '#9333ea',
  },
  selectorButtonInactive: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectorButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  selectorButtonTextActive: {
    color: 'white',
  },
  selectorButtonTextInactive: {
    color: '#6b7280',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  chartTitleBlue: {
    color: '#2563eb',
  },
  chartTitleGreen: {
    color: '#059669',
  },
  chartTitleOrange: {
    color: '#ea580c',
  },
  chartTitlePurple: {
    color: '#9333ea',
  },
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    padding: 8,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statValueBlue: {
    color: '#2563eb',
  },
  statValueGreen: {
    color: '#059669',
  },
  statValueOrange: {
    color: '#ea580c',
  },
  statValuePurple: {
    color: '#9333ea',
  },
  statValueGray: {
    color: '#374151',
  },
  statValueRed: {
    color: '#dc2626',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 80,
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
});

export default ChartScreen;
