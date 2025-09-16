// Script to generate demo data for machine learning predictions
// This data simulates a more complete history for better predictions

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://ytogcvqzqnzjfnxyqqip.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0b2djdnF6cW56amZueHlxcWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxODQxMzEsImV4cCI6MjA3MTc2MDEzMX0.HIdYgKaAPQ437yKCh0XFk7WQHK-bT_EMgEttmoLr7F0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Generate sample data with seasonal trend and some random variations
 * This will create more realistic data for ML prediction
 */
const generateHistoricalData = (tableName, location, startLevel, days = 30, seasonalFactor = 0.5) => {
  const data = [];
  const now = new Date();
  
  // Some random anomalies for testing
  const anomalyDays = [5, 12, 23]; 
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Create a seasonal pattern with weekly cycles
    const dayOfWeek = date.getDay(); // 0-6
    const weekCycle = Math.sin(dayOfWeek * Math.PI / 3.5) * seasonalFactor;
    
    // Add a slight downward trend
    const trend = -0.01 * i;
    
    // Add some random noise
    const noise = (Math.random() - 0.5) * 0.3;
    
    // Calculate water level with pattern
    let level = startLevel + weekCycle + trend + noise;
    
    // Add anomalies on specific days
    if (anomalyDays.includes(i)) {
      // Dramatic change to simulate an anomaly
      level += (Math.random() > 0.5 ? 1.5 : -1.5);
    }
    
    // Round to 2 decimal places
    level = Math.round(level * 100) / 100;
    
    // Add some temperature variation based on level
    const temperature = 20 + Math.random() * 10 + level * 0.5;
    
    // Add pH level variation (6.5-8.5 is typical range)
    const ph_level = 7 + (Math.random() - 0.5);
    
    data.push({
      timestamp: date.toISOString(),
      level,
      temperature: Math.round(temperature * 10) / 10,
      ph_level: Math.round(ph_level * 10) / 10,
      location
    });
  }
  
  return data;
};

const insertHistoricalData = async () => {
  try {
    console.log('Generating historical data for predictions...');
    
    // Get all table names to add data to
    const tables = ['water_levels', 'water_levels2', 'water_levels3', 'water_levels4'];
    const locations = [
      'Eluru District - Main Station',
      'Eluru District - Secondary Station',
      'Krishna District - Station 1',
      'Krishna District - Station 2'
    ];
    const startLevels = [4.2, 3.9, 3.5, 4.5]; // Different baseline for each station
    
    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i];
      const location = locations[i];
      const startLevel = startLevels[i];
      
      // Generate 30 days of historical data with seasonal patterns
      const historicalData = generateHistoricalData(
        tableName, 
        location, 
        startLevel, 
        30,
        0.5 + (i * 0.1) // Different seasonal factors for variety
      );
      
      console.log(`Inserting ${historicalData.length} records into ${tableName}...`);
      
      // Delete existing data first (optional - careful in production!)
      // await supabase.from(tableName).delete().gte('id', 0);
      
      // Insert in batches to avoid timeout
      const batchSize = 10;
      for (let j = 0; j < historicalData.length; j += batchSize) {
        const batch = historicalData.slice(j, j + batchSize);
        const { error } = await supabase.from(tableName).insert(batch);
        
        if (error) {
          console.error(`Error inserting batch into ${tableName}:`, error);
        }
      }
      
      console.log(`✅ Completed generating data for ${tableName}`);
    }
    
    console.log('✅ All historical data generated successfully!');
    
  } catch (error) {
    console.error('Error generating historical data:', error);
  }
};

// Run if called directly
if (require.main === module) {
  insertHistoricalData();
}

module.exports = { insertHistoricalData, generateHistoricalData };
