import React from 'react';
import { View, Text } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import BookingScreen from './screens/BookingScreen';

const App: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
    </View>
  );
};

export default App;
