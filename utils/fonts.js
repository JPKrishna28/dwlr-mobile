/**
 * Font helper for configuring and loading icon fonts
 */
import * as Font from 'expo-font';
import Ionicons from 'react-native-vector-icons/Fonts/Ionicons.ttf';

// Map of all the icon fonts
export const IconFonts = {
  Ionicons,
};

// Load icon fonts
export const loadFonts = async () => {
  await Font.loadAsync({
    'Ionicons': Ionicons,
  });
};
