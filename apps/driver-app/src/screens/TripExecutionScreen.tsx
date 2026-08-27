import React from 'react';
import { View, Text, Button } from 'react-native';

const TripExecutionScreen: React.FC = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Trip Execution</Text>
      <Button title="Start Trip" onPress={() => {}} />
    </View>
  );
};

export default TripExecutionScreen;
