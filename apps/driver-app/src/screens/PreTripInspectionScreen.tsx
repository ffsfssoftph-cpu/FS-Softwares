import React from 'react';
import { View, Text, Button, Image } from 'react-native';

const PreTripInspectionScreen: React.FC = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Pre-Trip Inspection</Text>
      <Text style={{ marginBottom: 8 }}>Capture photos of the vehicle condition</Text>
      <Button title="Take Photo" onPress={() => {}} />
    </View>
  );
};

export default PreTripInspectionScreen;
