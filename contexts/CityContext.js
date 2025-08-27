import React, { createContext, useContext, useState } from 'react';

const CityContext = createContext({
  selectedCity: null,
  setSelectedCity: () => {},
  clearSelection: () => {},
});

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(null);

  const clearSelection = () => {
    setSelectedCity(null);
  };

  const updateSelectedCity = (cityData) => {
    console.log('🏙️  City selection updated:', cityData);
    setSelectedCity(cityData);
  };

  const value = {
    selectedCity,
    setSelectedCity: updateSelectedCity,
    clearSelection,
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};
