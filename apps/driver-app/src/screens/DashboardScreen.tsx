import React from 'react';
import { View, Text, Button } from 'react-native';
import useBackgroundLocation from '../hooks/useBackgroundLocation';

const DashboardScreen: React.FC = () => {
  const { startTracking, stopTracking, isTracking } = useBackgroundLocation();
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Driver Dashboard</Text>
      <Button title={isTracking ? 'Stop Tracking' : 'Start Tracking'} onPress={() => (isTracking ? stopTracking() : startTracking())} />
    </View>
  );
};

export default DashboardScreen;
