import React from 'react';
import { View, Text, Button } from 'react-native';

const BookingScreen: React.FC = () => {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Booking Flow</Text>
      <Button title="Start Booking" onPress={() => {}} />
    </View>
  );
};

export default BookingScreen;
