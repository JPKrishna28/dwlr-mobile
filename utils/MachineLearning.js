/**
 * MachineLearning.js
 * Provides utilities for predicting water levels using linear regression
 * and exponential smoothing time series analysis.
 */

// Simple linear regression implementation for multiple parameters
export const linearRegression = (data, parameter = 'level') => {
  try {
    if (!data || data.length < 5) {
      console.warn(`Insufficient data for linear regression prediction (${parameter})`);
      return { predict: () => null, error: 'Insufficient data for prediction (minimum 5 records required)' };
    }
    
    // Extract x (time) and y (parameter values) with validation
    const points = data.map((item, index) => {
      // Handle different parameter types
      let parameterValue;
      switch(parameter) {
        case 'pressure':
          parameterValue = item.pressure;
          break;
        case 'temperature':
          parameterValue = item.temperature;
          break;
        case 'level':
        case 'water_level':
        default:
          parameterValue = item.level !== undefined ? item.level : item.water_level;
          break;
      }
      
      const value = parseFloat(parameterValue);
      
      if (isNaN(value) || !isFinite(value) || parameterValue === null || parameterValue === undefined) {
        return null; // Will be filtered out
      }
      
      return {
        x: index, // use index as time for simplicity
        y: value,
        timestamp: item.timestamp
      };
    }).filter(point => point !== null); // Remove invalid points
    
    if (points.length < 5) {
      return { predict: () => null, error: `Insufficient valid data points for ${parameter} (${points.length}/5 required)` };
    }
    
    // Calculate means
    const n = points.length;
    const meanX = points.reduce((sum, point) => sum + point.x, 0) / n;
    const meanY = points.reduce((sum, point) => sum + point.y, 0) / n;
    
    // Validate means
    if (!isFinite(meanX) || !isFinite(meanY)) {
      return { predict: () => null, error: `Invalid mean calculations for ${parameter} - data may contain extreme values` };
    }
    
    // Calculate coefficients
    let numerator = 0;
    let denominator = 0;
    
    for (const point of points) {
      const xDiff = point.x - meanX;
      numerator += xDiff * (point.y - meanY);
      denominator += xDiff * xDiff;
    }
    
    // Slope and y-intercept
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;
    
    // R-squared (coefficient of determination)
    let totalSumSquares = 0;
    let residualSumSquares = 0;
    
    for (const point of points) {
      const predictedY = slope * point.x + intercept;
      totalSumSquares += Math.pow(point.y - meanY, 2);
      residualSumSquares += Math.pow(point.y - predictedY, 2);
    }
    
    const rSquared = totalSumSquares !== 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;
    
    // Return prediction function and metrics
    return {
      predict: (stepsAhead = 1) => {
        const futureX = n - 1 + stepsAhead;
        return slope * futureX + intercept;
      },
      slope,
      intercept,
      rSquared,
      error: null
    };
  } catch (error) {
    console.error('Linear regression error:', error);
    return { predict: () => null, error: error.message };
  }
};

// Exponential smoothing for time series prediction - multi-parameter
export const exponentialSmoothing = (data, parameter = 'level', alpha = 0.3) => {
  try {
    if (!data || data.length < 5) {
      console.warn(`Insufficient data for exponential smoothing prediction (${parameter})`);
      return { predict: () => null, error: 'Insufficient data for smoothing (minimum 5 records required)' };
    }
    
    // Extract parameter values with validation
    const values = data.map((item, index) => {
      // Handle different parameter types
      let parameterValue;
      switch(parameter) {
        case 'pressure':
          parameterValue = item.pressure;
          break;
        case 'temperature':
          parameterValue = item.temperature;
          break;
        case 'level':
        case 'water_level':
        default:
          parameterValue = item.level !== undefined ? item.level : item.water_level;
          break;
      }
      
      const value = parseFloat(parameterValue);
      
      if (isNaN(value) || !isFinite(value) || parameterValue === null || parameterValue === undefined) {
        return null; // Will be filtered out
      }
      
      return value;
    }).filter(value => value !== null);
    
    if (values.length < 5) {
      return { predict: () => null, error: `Insufficient valid data points for ${parameter} smoothing (${values.length}/5 required)` };
    }
    
    // Validate alpha parameter
    if (isNaN(alpha) || alpha <= 0 || alpha > 1) {
      alpha = 0.3; // Use default value
    }
    
    // Single exponential smoothing
    const smoothedValues = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      const smoothed = alpha * values[i] + (1 - alpha) * smoothedValues[i - 1];
      if (!isFinite(smoothed)) {
        throw new Error(`Invalid smoothed value calculated for ${parameter} at index ${i}`);
      }
      smoothedValues.push(smoothed);
    }
    
    // Calculate error metrics (MAPE - Mean Absolute Percentage Error)
    let totalError = 0;
    let validErrorCount = 0;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== 0) { // Avoid division by zero
        const absolutePercentageError = Math.abs((values[i] - smoothedValues[i-1]) / values[i]);
        if (isFinite(absolutePercentageError)) {
          totalError += absolutePercentageError;
          validErrorCount++;
        }
      }
    }
    
    const mape = validErrorCount > 0 ? (totalError / validErrorCount) * 100 : 0;
    
    // Return prediction function and metrics
    return {
      predict: (stepsAhead = 1) => {
        // For single exponential smoothing, the prediction is the last smoothed value
        return smoothedValues[smoothedValues.length - 1];
      },
      smoothedValues,
      mape,
      error: null
    };
  } catch (error) {
    console.error('Exponential smoothing error:', error);
    return { predict: () => null, error: error.message };
  }
};

// Advanced prediction using weighted ensemble of methods
export const predictWaterLevels = (data, daysToPredict = 7) => {
  try {
    if (!data || data.length < 7) {
      return {
        predictions: [],
        error: 'Insufficient data for prediction'
      };
    }
    
    // Sort data by timestamp in ascending order
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Apply different prediction methods
    const linearModel = linearRegression(sortedData);
    const expSmoothingModel = exponentialSmoothing(sortedData);
    
    // Create predictions for each day
    const predictions = [];
    const lastDate = new Date(sortedData[sortedData.length - 1].timestamp);
    
    for (let i = 1; i <= daysToPredict; i++) {
      const predictedDate = new Date(lastDate);
      predictedDate.setDate(predictedDate.getDate() + i);
      
      // Get predictions from each model
      const linearPrediction = linearModel.predict(i);
      const smoothingPrediction = expSmoothingModel.predict();
      
      // Weight the predictions (give more weight to linear if it has good fit)
      const linearWeight = linearModel.rSquared > 0.7 ? 0.7 : 0.5;
      const smoothingWeight = 1 - linearWeight;
      
      // Weighted average
      const weightedPrediction = 
        (linearPrediction * linearWeight) + 
        (smoothingPrediction * smoothingWeight);
      
      // Add confidence based on R-squared and MAPE
      const confidence = 
        (linearModel.rSquared * linearWeight) + 
        ((100 - expSmoothingModel.mape) / 100 * smoothingWeight);
      
      predictions.push({
        date: predictedDate.toISOString(),
        predicted_level: parseFloat(weightedPrediction.toFixed(2)),
        confidence: parseFloat((confidence * 100).toFixed(1))
      });
    }
    
    return {
      predictions,
      metrics: {
        linearRSquared: linearModel.rSquared,
        expSmoothingMAPE: expSmoothingModel.mape
      },
      error: null
    };
  } catch (error) {
    console.error('Water level prediction error:', error);
    return {
      predictions: [],
      error: error.message
    };
  }
};

// Detect anomalies in multi-parameter data
export const detectAnomalies = (data, parameter = 'level', sensitivityThreshold = 2) => {
  try {
    if (!data || data.length < 7) {
      return { anomalies: [], error: 'Insufficient data for anomaly detection (minimum 7 records required)' };
    }
    
    // Extract parameter values with validation
    const values = data.map((item, index) => {
      // Handle different parameter types
      let parameterValue;
      switch(parameter) {
        case 'pressure':
          parameterValue = item.pressure;
          break;
        case 'temperature':
          parameterValue = item.temperature;
          break;
        case 'level':
        case 'water_level':
        default:
          parameterValue = item.level !== undefined ? item.level : item.water_level;
          break;
      }
      
      const value = parseFloat(parameterValue);
      
      if (isNaN(value) || !isFinite(value) || parameterValue === null || parameterValue === undefined) {
        console.warn(`Invalid ${parameter} value for anomaly detection: ${parameterValue} at index ${index}`);
        return null;
      }
      return value;
    }).filter(value => value !== null);
    
    if (values.length < 7) {
      return { anomalies: [], error: `Insufficient valid ${parameter} data for anomaly detection (${values.length}/7 required)` };
    }
    
    // Calculate mean and standard deviation
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    
    const variance = values.reduce((sum, value) => {
      return sum + Math.pow(value - mean, 2);
    }, 0) / values.length;
    
    const stdDev = Math.sqrt(variance);
    
    if (!isFinite(mean) || !isFinite(stdDev) || stdDev === 0) {
      return { anomalies: [], error: `Cannot calculate meaningful statistics for ${parameter} anomaly detection` };
    }
    
    // Adjust sensitivity threshold based on parameter type
    let adjustedThreshold = sensitivityThreshold;
    switch(parameter) {
      case 'pressure':
        adjustedThreshold = 2.5; // Pressure changes more gradually
        break;
      case 'temperature':
        adjustedThreshold = 2.0; // Temperature can have reasonable daily variation
        break;
      case 'level':
      case 'water_level':
      default:
        adjustedThreshold = 2.0; // Water level standard threshold
        break;
    }
    
    // Identify anomalies using Z-score
    const anomalies = data.filter((item, index) => {
      // Handle different parameter types
      let parameterValue;
      switch(parameter) {
        case 'pressure':
          parameterValue = item.pressure;
          break;
        case 'temperature':
          parameterValue = item.temperature;
          break;
        case 'level':
        case 'water_level':
        default:
          parameterValue = item.level !== undefined ? item.level : item.water_level;
          break;
      }
      
      const value = parseFloat(parameterValue);
      
      if (isNaN(value) || !isFinite(value) || parameterValue === null || parameterValue === undefined) {
        return false;
      }
      
      const zScore = Math.abs((value - mean) / stdDev);
      return zScore > adjustedThreshold;
    });
    
    console.log(`🔍 Anomaly detection for ${parameter}: Found ${anomalies.length} anomalies out of ${data.length} records`);
    
    return {
      anomalies,
      stats: {
        mean: Math.round(mean * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        threshold: adjustedThreshold,
        parameter
      },
      error: null
    };
  } catch (error) {
    console.error(`Anomaly detection error for ${parameter}:`, error);
    return { anomalies: [], error: error.message };
  }
};

// Utility to format predictions for display
export const formatPredictionData = (predictions) => {
  return {
    labels: predictions.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        data: predictions.map(p => p.predicted_level),
        color: (opacity = 1) => `rgba(86, 152, 235, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };
};

// Multi-parameter prediction function
export const predictMultipleParameters = (data, daysToPredict = 7) => {
  try {
    if (!data || data.length < 7) {
      return {
        waterLevel: { predictions: [], error: 'Insufficient data' },
        pressure: { predictions: [], error: 'Insufficient data' },
        temperature: { predictions: [], error: 'Insufficient data' }
      };
    }

    const results = {};
    const parameters = ['level', 'pressure', 'temperature'];
    
    parameters.forEach(param => {
      console.log(`🔮 Generating predictions for ${param}...`);
      
      // Check if parameter has sufficient data
      const validData = data.filter(item => {
        const value = param === 'level' ? (item.level || item.water_level) : item[param];
        return value !== null && value !== undefined && !isNaN(parseFloat(value));
      });
      
      if (validData.length < 5) {
        results[param] = {
          predictions: [],
          error: `Insufficient ${param} data (${validData.length}/5 required)`,
          accuracy: 0
        };
        return;
      }
      
      // Use ensemble of linear regression and exponential smoothing
      const linearModel = linearRegression(validData, param);
      const smoothingModel = exponentialSmoothing(validData, param);
      
      if (linearModel.error && smoothingModel.error) {
        results[param] = {
          predictions: [],
          error: `Both prediction methods failed for ${param}`,
          accuracy: 0
        };
        return;
      }
      
      // Generate predictions for the next few days
      const predictions = [];
      const lastTimestamp = new Date(validData[validData.length - 1].timestamp);
      
      for (let i = 1; i <= daysToPredict; i++) {
        const futureDate = new Date(lastTimestamp);
        futureDate.setDate(lastTimestamp.getDate() + i);
        
        const nextIndex = validData.length + i - 1;
        
        // Get predictions from both models
        const linearPred = linearModel.predict ? linearModel.predict(nextIndex) : null;
        const smoothingPred = smoothingModel.predict ? smoothingModel.predict() : null;
        
        // Use ensemble average if both available, otherwise use available one
        let ensemblePred = null;
        if (linearPred !== null && smoothingPred !== null) {
          ensemblePred = (linearPred + smoothingPred) / 2;
        } else if (linearPred !== null) {
          ensemblePred = linearPred;
        } else if (smoothingPred !== null) {
          ensemblePred = smoothingPred;
        }
        
        if (ensemblePred !== null && isFinite(ensemblePred)) {
          predictions.push({
            date: futureDate.toISOString(),
            [param === 'level' ? 'predicted_level' : `predicted_${param}`]: Math.round(ensemblePred * 100) / 100,
            confidence: Math.max(0, Math.min(100, 100 - (linearModel.mape || smoothingModel.mape || 0)))
          });
        }
      }
      
      results[param] = {
        predictions,
        error: predictions.length > 0 ? null : `No valid predictions generated for ${param}`,
        accuracy: Math.max(0, Math.min(100, 100 - (linearModel.mape || smoothingModel.mape || 0))),
        dataPoints: validData.length,
        models: {
          linear: linearModel.error ? 'failed' : 'success',
          smoothing: smoothingModel.error ? 'failed' : 'success'
        }
      };
    });
    
    return results;
    
  } catch (error) {
    console.error('Multi-parameter prediction error:', error);
    return {
      waterLevel: { predictions: [], error: error.message },
      pressure: { predictions: [], error: error.message },
      temperature: { predictions: [], error: error.message }
    };
  }
};

// Format multi-parameter chart data
export const formatMultiParameterData = (predictions, parameter) => {
  if (!predictions || !predictions[parameter] || !predictions[parameter].predictions) {
    return { labels: [], datasets: [] };
  }
  
  const data = predictions[parameter].predictions;
  const fieldName = parameter === 'level' ? 'predicted_level' : `predicted_${parameter}`;
  
  return {
    labels: data.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        data: data.map(p => p[fieldName]),
        color: (opacity = 1) => {
          switch(parameter) {
            case 'level': return `rgba(86, 152, 235, ${opacity})`;
            case 'pressure': return `rgba(255, 99, 132, ${opacity})`;
            case 'temperature': return `rgba(255, 206, 84, ${opacity})`;
            default: return `rgba(86, 152, 235, ${opacity})`;
          }
        },
        strokeWidth: 2
      }
    ]
  };
};