/**
 * This script copies Ionicons.ttf from react-native-vector-icons to our assets folder
 */
const fs = require('fs');
const path = require('path');

// Get the project root directory
const PROJECT_ROOT = path.resolve(__dirname, '..');

const FONT_PATH = path.resolve(
  PROJECT_ROOT,
  'node_modules/react-native-vector-icons/Fonts/Ionicons.ttf'
);
const DEST_PATH = path.resolve(PROJECT_ROOT, 'assets/fonts/Ionicons.ttf');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(path.resolve(PROJECT_ROOT, 'assets/fonts'))) {
  fs.mkdirSync(path.resolve(PROJECT_ROOT, 'assets/fonts'), { recursive: true });
}

// Copy the font file
fs.copyFileSync(FONT_PATH, DEST_PATH);

console.log('✅ Successfully copied Ionicons.ttf to assets/fonts/');
