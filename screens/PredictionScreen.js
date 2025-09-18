import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../config/supabaseClient';
import { useCity } from '../contexts/CityContext';
import { predictWaterLevels, formatPredictionData, detectAnomalies, predictMultipleParameters, formatMultiParameterData } from '../utils/MachineLearning';
import { checkDataSufficiency, insertSampleData } from '../utils/sampleDataGenerator';

const PredictionScreen = () => {
  const [waterLevels, setWaterLevels] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [multiPredictions, setMultiPredictions] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState('level');
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predictionDays, setPredictionDays] = useState(7);
  const [metrics, setMetrics] = useState(null);
  
  // Use shared city context
  const { selectedCity } = useCity();

  const screenWidth = Dimensions.get('window').width;

  // Clean and validate water level data for multiple parameters
  const cleanWaterLevelData = (data) => {
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid data format provided for cleaning');
      return [];
    }
    
    const cleaned = data.filter(record => {
      // Check if record exists and has required fields
      if (!record || typeof record !== 'object') {
        console.warn('Skipping invalid record:', record);
        return false;
      }
      
      // Check for water level field (could be 'level' or 'water_level')
      const waterLevel = record.level || record.water_level;
      
      if (waterLevel === null || waterLevel === undefined || waterLevel === '') {
        console.warn('Skipping record with missing water level:', record);
        return false;
      }
      
      // Convert level to number and validate
      const levelNum = parseFloat(waterLevel);
      if (isNaN(levelNum) || !isFinite(levelNum)) {
        console.warn('Skipping record with invalid water level value:', waterLevel);
        return false;
      }
      
      // Check for reasonable water level ranges (0-1000 meters)
      if (levelNum < 0 || levelNum > 1000) {
        console.warn('Skipping record with unrealistic water level value:', levelNum);
        return false;
      }
      
      // Validate pressure data (optional)
      if (record.pressure !== null && record.pressure !== undefined && record.pressure !== '') {
        const pressureNum = parseFloat(record.pressure);
        if (isNaN(pressureNum) || !isFinite(pressureNum) || pressureNum < 0 || pressureNum > 12000) {
          console.warn('Record has invalid pressure value, setting to null:', record.pressure);
          record.pressure = null;
        }
      }
      
      // Validate temperature data (optional)
      if (record.temperature !== null && record.temperature !== undefined && record.temperature !== '') {
        const tempNum = parseFloat(record.temperature);
        if (isNaN(tempNum) || !isFinite(tempNum) || tempNum < -50 || tempNum > 70) {
          console.warn('Record has invalid temperature value, setting to null:', record.temperature);
          record.temperature = null;
        }
      }
      
      // Check timestamp validity
      if (!record.timestamp) {
        console.warn('Skipping record with missing timestamp:', record);
        return false;
      }
      
      const timestamp = new Date(record.timestamp);
      if (isNaN(timestamp.getTime())) {
        console.warn('Skipping record with invalid timestamp:', record.timestamp);
        return false;
      }
      
      return true;
    }).map(record => ({
      ...record,
      level: parseFloat(record.level || record.water_level), // Normalize to 'level' field
      water_level: parseFloat(record.level || record.water_level), // Keep original field too
      pressure: record.pressure ? parseFloat(record.pressure) : null,
      temperature: record.temperature ? parseFloat(record.temperature) : null,
      timestamp: record.timestamp
    }));
    
    // Sort by timestamp to ensure chronological order
    cleaned.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    console.log(`🧹 Data cleaning: ${data.length} raw records → ${cleaned.length} clean records`);
    
    // Log parameter availability
    const withPressure = cleaned.filter(r => r.pressure !== null).length;
    const withTemperature = cleaned.filter(r => r.temperature !== null).length;
    console.log(`📊 Parameter availability: Water Level: ${cleaned.length}, Pressure: ${withPressure}, Temperature: ${withTemperature}`);
    
    return cleaned;
  };

  // Fetch water levels for the selected city
  const fetchWaterLevels = async (tableName) => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching water level data from ${tableName} for prediction...`);
      
      // First check if we have sufficient data overall
      const sufficiencyCheck = await checkDataSufficiency(tableName, 5);
      
      if (!sufficiencyCheck.sufficient) {
        console.log(sufficiencyCheck.message);
        
        // Ask user if they want to generate sample data
        Alert.alert(
          'Insufficient Data',
          `Not enough data for predictions (${sufficiencyCheck.recordCount}/5 records required). Would you like to generate sample data for testing?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setLoading(false);
                return;
              }
            },
            {
              text: 'Generate Sample Data',
              onPress: async () => {
                console.log('🌊 User chose to generate sample data...');
                const result = await insertSampleData(tableName, 30);
                
                if (result.success) {
                  Alert.alert('Success', result.message, [
                    { text: 'OK', onPress: () => fetchWaterLevels(tableName) }
                  ]);
                } else {
                  Alert.alert('Error', `Failed to generate sample data: ${result.error}`);
                  setLoading(false);
                }
              }
            }
          ]
        );
        return;
      }
      
      console.log(`✅ Total records in ${tableName}: ${sufficiencyCheck.recordCount}`);
      
      // Get the last 30 days of data for better prediction
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let { data, error } = await supabase
        .from(tableName)
        .select('*')
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: true });
      
      if (error) {
        console.error('Error fetching water levels for prediction:', error);
        Alert.alert('Error', 'Failed to fetch water level data for prediction');
        return;
      }
      
      // If recent data is insufficient, get the most recent records regardless of date
      if (data.length < 5) {
        console.log(`⚠️ Only ${data.length} records from last 30 days. Fetching most recent ${Math.min(30, sufficiencyCheck.recordCount)} records...`);
        
        const { data: allRecentData, error: allError } = await supabase
          .from(tableName)
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(30);
        
        if (allError) {
          console.error('Error fetching all recent water levels:', allError);
          Alert.alert('Error', 'Failed to fetch historical data for prediction');
          return;
        }
        
        // Reverse to get chronological order for prediction
        data = allRecentData.reverse();
        
        Alert.alert(
          'Using Historical Data',
          `No recent data found (last 30 days). Using the most recent ${data.length} records for prediction.`,
          [{ text: 'OK' }]
        );
      }
      
      console.log(`✅ Fetched ${data.length} water level records for prediction`);
      
      // Clean and validate the data before processing
      const cleanedData = cleanWaterLevelData(data);
      
      if (cleanedData.length < 5) {
        Alert.alert(
          'Data Quality Issue', 
          `After cleaning invalid data, only ${cleanedData.length} valid records remain. At least 5 valid records are required for predictions.`
        );
        setWaterLevels([]);
        return;
      }
      
      console.log(`🧹 Cleaned data: ${cleanedData.length} valid records (removed ${data.length - cleanedData.length} invalid records)`);
      setWaterLevels(cleanedData);
      
      // Generate predictions
      generatePredictions(cleanedData);
      
      // Detect anomalies
      detectWaterLevelAnomalies(cleanedData);
      
    } catch (err) {
      console.error('Unexpected error fetching water levels for prediction:', err);
      Alert.alert('Error', 'An unexpected error occurred while preparing predictions');
    } finally {
      setLoading(false);
    }
  };

  // Generate water level predictions for multiple parameters
  const generatePredictions = (data) => {
    try {
      console.log(`🧠 Generating multi-parameter predictions for ${predictionDays} days...`);
      
      // Generate predictions for all parameters
      const multiResult = predictMultipleParameters(data, predictionDays);
      setMultiPredictions(multiResult);
      
      // Also generate the legacy single-parameter prediction for backward compatibility
      const result = predictWaterLevels(data, predictionDays);
      
      if (result.error) {
        console.error('Legacy prediction error:', result.error);
      } else {
        console.log(`✅ Generated ${result.predictions.length} legacy predictions`);
        setPredictions(result.predictions);
        setMetrics(result.metrics);
      }
      
      // Log multi-parameter results
      Object.keys(multiResult).forEach(param => {
        const paramResult = multiResult[param];
        if (paramResult.error) {
          console.warn(`${param} predictions failed:`, paramResult.error);
        } else {
          console.log(`✅ Generated ${paramResult.predictions.length} ${param} predictions (accuracy: ${paramResult.accuracy}%)`);
        }
      });
      
    } catch (err) {
      console.error('Unexpected error generating predictions:', err);
      Alert.alert('Error', 'Failed to generate predictions');
    }
  };

  // Detect anomalies in multi-parameter data
  const detectWaterLevelAnomalies = (data) => {
    try {
      console.log(`🔍 Detecting anomalies in ${selectedParameter} data...`);
      const result = detectAnomalies(data, selectedParameter);
      
      if (result.error) {
        console.error(`Anomaly detection error for ${selectedParameter}:`, result.error);
        return;
      }
      
      console.log(`✅ Detected ${result.anomalies.length} ${selectedParameter} anomalies`);
      setAnomalies(result.anomalies);
      
    } catch (err) {
      console.error(`Unexpected error detecting ${selectedParameter} anomalies:`, err);
    }
  };

  // Respond to city context changes
  useEffect(() => {
    if (selectedCity && selectedCity.tableName) {
      console.log('🔮 PredictionScreen: Responding to city change:', selectedCity.name);
      fetchWaterLevels(selectedCity.tableName);
    } else {
      setLoading(false);
    }
  }, [selectedCity]);

  // Change prediction time range
  const changePredictionDays = (days) => {
    setPredictionDays(days);
    if (waterLevels.length > 0) {
      generatePredictions(waterLevels);
    }
  };

  // Render parameter selection interface
  const renderParameterSelector = () => {
    const parameters = [
      { key: 'level', label: 'Water Level', unit: 'm', icon: '🌊' },
      { key: 'pressure', label: 'Pressure', unit: 'hPa', icon: '🔵' },
      { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' }
    ];

    return (
      <View style={styles.parameterContainer}>
        <Text style={styles.sectionTitle}>Select Parameter</Text>
        <View style={styles.parameterButtonsContainer}>
          {parameters.map((param) => {
            const isSelected = selectedParameter === param.key;
            const hasData = multiPredictions && multiPredictions[param.key] && 
                           !multiPredictions[param.key].error && 
                           multiPredictions[param.key].predictions.length > 0;
            
            return (
              <TouchableOpacity
                key={param.key}
                style={[
                  styles.parameterButton,
                  isSelected && styles.parameterButtonSelected,
                  !hasData && styles.parameterButtonDisabled
                ]}
                onPress={() => hasData && setSelectedParameter(param.key)}
                disabled={!hasData}
              >
                <Text style={styles.parameterIcon}>{param.icon}</Text>
                <Text style={[
                  styles.parameterLabel,
                  isSelected && styles.parameterLabelSelected,
                  !hasData && styles.parameterLabelDisabled
                ]}>
                  {param.label}
                </Text>
                <Text style={[
                  styles.parameterUnit,
                  isSelected && styles.parameterUnitSelected,
                  !hasData && styles.parameterUnitDisabled
                ]}>
                  ({param.unit})
                </Text>
                {!hasData && (
                  <Text style={styles.noDataIndicator}>No Data</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Render enhanced prediction chart with multi-parameter support
  const renderEnhancedPredictionChart = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4895f2" />
          <Text style={styles.loadingText}>Generating predictions...</Text>
        </View>
      );
    }

    if (!multiPredictions || !multiPredictions[selectedParameter] || 
        multiPredictions[selectedParameter].error || 
        multiPredictions[selectedParameter].predictions.length === 0) {
      
      const errorMessage = multiPredictions && multiPredictions[selectedParameter] 
        ? multiPredictions[selectedParameter].error 
        : 'No prediction data available';
        
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            {errorMessage}
          </Text>
          <Text style={styles.noDataSubtext}>
            Try selecting a different parameter or ensure sufficient historical data is available
          </Text>
        </View>
      );
    }

    const chartData = formatMultiParameterData(multiPredictions, selectedParameter);
    const paramInfo = {
      level: { title: 'Water Level Predictions', unit: 'meters' },
      pressure: { title: 'Pressure Predictions', unit: 'hPa' },
      temperature: { title: 'Temperature Predictions', unit: '°C' }
    };
    
    const currentParam = paramInfo[selectedParameter];
    const predictionData = multiPredictions[selectedParameter];
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{currentParam.title}</Text>
        <Text style={styles.chartSubtitle}>
          {selectedCity ? selectedCity.name : 'No station selected'}
        </Text>
        
        {/* Display prediction accuracy */}
        <View style={styles.accuracyContainer}>
          <Text style={styles.accuracyText}>
            Accuracy: {Math.round(predictionData.accuracy)}% | Data Points: {predictionData.dataPoints}
          </Text>
        </View>
        
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#f8f9fa',
            decimalPlaces: selectedParameter === 'temperature' ? 1 : 0,
            color: (opacity = 1) => {
              switch(selectedParameter) {
                case 'level': return `rgba(52, 152, 219, ${opacity})`;
                case 'pressure': return `rgba(231, 76, 60, ${opacity})`;
                case 'temperature': return `rgba(241, 196, 15, ${opacity})`;
                default: return `rgba(52, 152, 219, ${opacity})`;
              }
            },
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffffff'
            }
          }}
          bezier
          style={styles.chart}
        />
        
        <View style={styles.predictionLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { 
              backgroundColor: selectedParameter === 'level' ? '#3498db' : 
                             selectedParameter === 'pressure' ? '#e74c3c' : '#f1c40f' 
            }]} />
            <Text style={styles.legendText}>
              Predicted {currentParam.title.split(' ')[0]} ({currentParam.unit})
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render prediction chart
  const renderPredictionChart = () => {
    if (!predictions || predictions.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No prediction data available
          </Text>
          <Text style={styles.noDataSubtext}>
            Select a city with sufficient historical data
          </Text>
        </View>
      );
    }

    const chartData = formatPredictionData(predictions);
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Water Level Predictions</Text>
        <Text style={styles.chartSubtitle}>
          {selectedCity ? selectedCity.name : 'No station selected'}
        </Text>
        
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#f8f9fa',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(72, 149, 242, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(48, 48, 48, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#4895f2',
            },
          }}
          bezier
          style={styles.chart}
        />
        
        <View style={styles.predictionLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4895f2' }]} />
            <Text style={styles.legendText}>Predicted Water Level</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render time range selector
  const renderTimeRangeSelector = () => {
    return (
      <View style={styles.timeRangeContainer}>
        <Text style={styles.sectionTitle}>Prediction Range</Text>
        <View style={styles.timeButtonsContainer}>
          {[3, 7, 14, 30].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.timeButton,
                predictionDays === days && styles.activeTimeButton,
              ]}
              onPress={() => changePredictionDays(days)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  predictionDays === days && styles.activeTimeButtonText,
                ]}
              >
                {days} Days
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render prediction metrics
  const renderMetrics = () => {
    if (!metrics) return null;
    
    return (
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Prediction Accuracy</Text>
        <View style={styles.metricsContent}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {metrics.linearRSquared 
                ? `${(metrics.linearRSquared * 100).toFixed(1)}%`
                : 'N/A'}
            </Text>
            <Text style={styles.metricLabel}>Model Fit</Text>
          </View>
          
          <View style={styles.metricDivider} />
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {predictions.length > 0 
                ? `${predictions[0].confidence}%`
                : 'N/A'}
            </Text>
            <Text style={styles.metricLabel}>Confidence</Text>
          </View>
          
          <View style={styles.metricDivider} />
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {metrics.expSmoothingMAPE 
                ? `${metrics.expSmoothingMAPE.toFixed(1)}%`
                : 'N/A'}
            </Text>
            <Text style={styles.metricLabel}>Error Rate</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render anomalies section
  const renderAnomalies = () => {
    if (!anomalies || anomalies.length === 0) return null;
    
    return (
      <View style={styles.anomaliesContainer}>
        <Text style={styles.sectionTitle}>Detected Anomalies</Text>
        <View style={styles.anomaliesContent}>
          <Text style={styles.anomaliesText}>
            {anomalies.length} unusual water level readings detected in historical data
          </Text>
          {anomalies.length > 0 && (
            <TouchableOpacity
              style={styles.anomaliesButton}
              onPress={() => {
                Alert.alert(
                  'Anomalies Detected',
                  `${anomalies.length} unusual water level readings were found in the historical data. These may indicate sensor errors or significant environmental events.`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.anomaliesButtonText}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4895f2" />
        <Text style={styles.loadingText}>Generating predictions...</Text>
      </View>
    );
  }

  // Render no city selected state
  if (!selectedCity) {
    return (
      <View style={styles.noCityContainer}>
        <Text style={styles.noCityText}>No monitoring station selected</Text>
        <Text style={styles.noCitySubtext}>
          Please select a monitoring station to view predictions
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Parameter Selection */}
        {renderParameterSelector()}
        
        {/* Enhanced Multi-Parameter Prediction Chart */}
        {renderEnhancedPredictionChart()}
        
        {/* Time Range Selector */}
        {renderTimeRangeSelector()}
        
        {/* Prediction Metrics */}
        {renderMetrics()}
        
        {/* Anomalies */}
        {renderAnomalies()}
        
        {/* Prediction Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Predictions are based on historical data and statistical models. Actual water levels may vary due to weather conditions and other factors.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  noCityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  noCitySubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  predictionLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  timeRangeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  timeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTimeButton: {
    backgroundColor: '#3b82f6',
  },
  timeButtonText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  activeTimeButtonText: {
    color: '#ffffff',
  },
  metricsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  metricsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  anomaliesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  anomaliesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  anomaliesText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  anomaliesButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  anomaliesButtonText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  disclaimerContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
  // Parameter selection styles
  parameterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  parameterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  parameterButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  parameterButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  parameterButtonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  parameterIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  parameterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  parameterLabelSelected: {
    color: '#1976d2',
  },
  parameterLabelDisabled: {
    color: '#9ca3af',
  },
  parameterUnit: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  parameterUnitSelected: {
    color: '#1976d2',
  },
  parameterUnitDisabled: {
    color: '#9ca3af',
  },
  noDataIndicator: {
    fontSize: 8,
    color: '#ef4444',
    marginTop: 2,
    fontWeight: '500',
  },
  accuracyContainer: {
    backgroundColor: '#f0f9ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
});

export default PredictionScreen;
