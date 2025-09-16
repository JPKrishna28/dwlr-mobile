/**
 * Generate sample water level data for testing predictions
 * This utility helps create realistic test data when tables don't have enough records
 */

import { supabase } from '../config/supabaseClient';

// Generate realistic water level data with some variation and trends
export const generateSampleData = (days = 30, baseLevel = 15.5) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setDate(now.getDate() - i);
    timestamp.setHours(12, 0, 0, 0); // Set to noon for consistency
    
    // Create realistic variation with trends
    const dayOfYear = timestamp.getDay();
    const randomVariation = (Math.random() - 0.5) * 2; // ±1 meter variation
    const seasonalTrend = Math.sin(i / 30 * Math.PI) * 3; // Seasonal pattern
    const weeklyPattern = Math.sin(dayOfYear / 7 * Math.PI * 2) * 0.5; // Weekly pattern
    
    const level = baseLevel + seasonalTrend + weeklyPattern + randomVariation;
    
    data.push({
      id: `sample_${i}`,
      timestamp: timestamp.toISOString(),
      level: Math.round(level * 100) / 100, // Round to 2 decimal places
      temperature: Math.round((25 + Math.random() * 10) * 100) / 100, // 25-35°C
      ph: Math.round((7 + Math.random() * 2) * 100) / 100, // pH 7-9
      location: 'Krishna Station 1',
      notes: `Sample data point ${days - i}`
    });
  }
  
  return data;
};

// Insert sample data into a specific table
export const insertSampleData = async (tableName, days = 30) => {
  try {
    console.log(`🌊 Generating ${days} days of sample data for ${tableName}...`);
    
    // Check if data already exists
    const { data: existingData, error: checkError } = await supabase
      .from(tableName)
      .select('id')
      .limit(5);
    
    if (checkError) {
      console.error('Error checking existing data:', checkError);
      return { success: false, error: checkError.message };
    }
    
    if (existingData && existingData.length >= 5) {
      console.log(`✅ Table ${tableName} already has ${existingData.length} records. No sample data needed.`);
      return { success: true, message: 'Sufficient data already exists' };
    }
    
    // Generate sample data
    const sampleData = generateSampleData(days);
    
    // Insert data in batches to avoid overwhelming the database
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < sampleData.length; i += batchSize) {
      batches.push(sampleData.slice(i, i + batchSize));
    }
    
    let totalInserted = 0;
    
    for (const batch of batches) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch into ${tableName}:`, error);
        return { success: false, error: error.message };
      }
      
      totalInserted += data.length;
      console.log(`✅ Inserted batch of ${data.length} records into ${tableName}`);
    }
    
    console.log(`🎉 Successfully inserted ${totalInserted} sample records into ${tableName}`);
    return { 
      success: true, 
      message: `Successfully added ${totalInserted} sample records`,
      recordsAdded: totalInserted 
    };
    
  } catch (error) {
    console.error('Unexpected error inserting sample data:', error);
    return { success: false, error: error.message };
  }
};

// Check data sufficiency for predictions
export const checkDataSufficiency = async (tableName, minRecords = 5) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id, timestamp')
      .order('timestamp', { ascending: false })
      .limit(minRecords);
    
    if (error) {
      return { sufficient: false, error: error.message };
    }
    
    const recordCount = data ? data.length : 0;
    const sufficient = recordCount >= minRecords;
    
    return {
      sufficient,
      recordCount,
      minRequired: minRecords,
      message: sufficient 
        ? `✅ Sufficient data: ${recordCount} records available`
        : `❌ Insufficient data: ${recordCount} records found, ${minRecords} required`
    };
  } catch (error) {
    return { sufficient: false, error: error.message };
  }
};
