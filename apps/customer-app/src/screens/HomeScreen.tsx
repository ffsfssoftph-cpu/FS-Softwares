import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen: React.FC = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>FS Customer App</Text>
      <Button title="Browse Vehicles" onPress={() => {}} />
    </View>
  );
};

export default HomeScreen;
