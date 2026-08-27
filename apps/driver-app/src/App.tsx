import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { registerRootComponent } from 'expo';
import LoginScreen from './screens/LoginScreen';

const App: React.FC = () => {
  useEffect(() => {
    // preflight
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        // eslint-disable-next-line no-console
        console.log('Biometric available:', hasHardware);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Local auth check failed', error);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <LoginScreen />
    </View>
  );
};

registerRootComponent(App);
export default App;
