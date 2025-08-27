// Script to set up Krishna district monitoring station tables
// This script creates water_levels3 and water_levels4 tables for Krishna district stations

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupKrishnaTables() {
  try {
    console.log('Setting up Krishna district monitoring station tables...');

    // Create water_levels3 table (Krishna - Station 1)
    const { error: error3 } = await supabase.rpc('create_water_levels_table', {
      table_name: 'water_levels3',
      station_info: 'Krishna District - Monitoring Station 1'
    });

    if (error3) {
      console.log('Creating water_levels3 table manually...');
      // If RPC doesn't exist, we'll need to create tables through the Supabase dashboard
      console.log('Please create table "water_levels3" with the following structure:');
      console.log(`
        CREATE TABLE water_levels3 (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          level DECIMAL(5,2) NOT NULL,
          location VARCHAR(100) DEFAULT 'Krishna District - Station 1',
          temperature DECIMAL(4,1),
          ph_level DECIMAL(3,1),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
    }

    // Create water_levels4 table (Krishna - Station 2)
    const { error: error4 } = await supabase.rpc('create_water_levels_table', {
      table_name: 'water_levels4',
      station_info: 'Krishna District - Monitoring Station 2'
    });

    if (error4) {
      console.log('Creating water_levels4 table manually...');
      console.log('Please create table "water_levels4" with the following structure:');
      console.log(`
        CREATE TABLE water_levels4 (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          level DECIMAL(5,2) NOT NULL,
          location VARCHAR(100) DEFAULT 'Krishna District - Station 2',
          temperature DECIMAL(4,1),
          ph_level DECIMAL(3,1),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
    }

    // Insert sample data for Krishna stations
    console.log('Inserting sample data for Krishna district stations...');

    // Sample data for water_levels3 (Krishna Station 1)
    const sampleData3 = [
      { level: 4.2, temperature: 23.5, ph_level: 7.2, location: 'Krishna District - Station 1' },
      { level: 4.0, temperature: 24.1, ph_level: 7.1, location: 'Krishna District - Station 1' },
      { level: 3.8, temperature: 24.8, ph_level: 6.9, location: 'Krishna District - Station 1' },
      { level: 4.1, temperature: 23.9, ph_level: 7.0, location: 'Krishna District - Station 1' },
      { level: 4.3, temperature: 23.2, ph_level: 7.3, location: 'Krishna District - Station 1' }
    ];

    // Sample data for water_levels4 (Krishna Station 2)
    const sampleData4 = [
      { level: 3.9, temperature: 25.2, ph_level: 6.8, location: 'Krishna District - Station 2' },
      { level: 3.7, temperature: 25.8, ph_level: 6.7, location: 'Krishna District - Station 2' },
      { level: 3.5, temperature: 26.1, ph_level: 6.9, location: 'Krishna District - Station 2' },
      { level: 3.8, temperature: 25.5, ph_level: 7.0, location: 'Krishna District - Station 2' },
      { level: 4.0, temperature: 24.9, ph_level: 7.1, location: 'Krishna District - Station 2' }
    ];

    // Try to insert data (will work if tables exist)
    try {
      await supabase.from('water_levels3').insert(sampleData3);
      console.log('✅ Sample data inserted for water_levels3');
    } catch (insertError3) {
      console.log('⚠️  Could not insert data for water_levels3. Table may not exist.');
    }

    try {
      await supabase.from('water_levels4').insert(sampleData4);
      console.log('✅ Sample data inserted for water_levels4');
    } catch (insertError4) {
      console.log('⚠️  Could not insert data for water_levels4. Table may not exist.');
    }

    console.log('Krishna district table setup completed!');
    
  } catch (error) {
    console.error('Error setting up Krishna tables:', error);
  }
}

// Manual SQL commands to run in Supabase SQL editor
console.log(`
=== MANUAL SQL SETUP FOR KRISHNA DISTRICT ===

Run these commands in your Supabase SQL editor:

-- Create water_levels3 table (Krishna Station 1)
CREATE TABLE water_levels3 (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  level DECIMAL(5,2) NOT NULL,
  location VARCHAR(100) DEFAULT 'Krishna District - Station 1',
  temperature DECIMAL(4,1),
  ph_level DECIMAL(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create water_levels4 table (Krishna Station 2)
CREATE TABLE water_levels4 (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  level DECIMAL(5,2) NOT NULL,
  location VARCHAR(100) DEFAULT 'Krishna District - Station 2',
  temperature DECIMAL(4,1),
  ph_level DECIMAL(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample data for water_levels3
INSERT INTO water_levels3 (level, temperature, ph_level, location) VALUES
(4.2, 23.5, 7.2, 'Krishna District - Station 1'),
(4.0, 24.1, 7.1, 'Krishna District - Station 1'),
(3.8, 24.8, 6.9, 'Krishna District - Station 1'),
(4.1, 23.9, 7.0, 'Krishna District - Station 1'),
(4.3, 23.2, 7.3, 'Krishna District - Station 1');

-- Insert sample data for water_levels4
INSERT INTO water_levels4 (level, temperature, ph_level, location) VALUES
(3.9, 25.2, 6.8, 'Krishna District - Station 2'),
(3.7, 25.8, 6.7, 'Krishna District - Station 2'),
(3.5, 26.1, 6.9, 'Krishna District - Station 2'),
(3.8, 25.5, 7.0, 'Krishna District - Station 2'),
(4.0, 24.9, 7.1, 'Krishna District - Station 2');

-- Enable RLS (Row Level Security) if needed
ALTER TABLE water_levels3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_levels4 ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed)
CREATE POLICY "Allow authenticated users to read water_levels3" ON water_levels3
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read water_levels4" ON water_levels4
  FOR SELECT TO authenticated USING (true);

=== END SQL SETUP ===
`);

if (require.main === module) {
  setupKrishnaTables();
}

module.exports = { setupKrishnaTables };
