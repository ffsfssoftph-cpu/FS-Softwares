import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import axios from 'axios';
import { z } from 'zod';
import { loginSchema } from '../validators/loginSchema';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  async function handleBiometric() {
    try {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Login with Biometrics' });
      if (result.success) {
        Alert.alert('Authenticated');
      } else {
        Alert.alert('Biometric failed');
      }
    } catch (error) {
      Alert.alert('Biometric error');
    }
  }

  async function handleLogin() {
    try {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        Alert.alert('Validation error', JSON.stringify(parsed.error.format()));
        return;
      }
      const resp = await axios.post('/api/auth/login', { email, password });
      if (resp.data?.accessToken) {
        Alert.alert('Login successful');
      }
    } catch (error) {
      Alert.alert('Login failed');
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Driver Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <Button title="Login" onPress={handleLogin} />
      <View style={{ height: 12 }} />
      <Button title="Use Biometrics" onPress={handleBiometric} />
    </View>
  );
};

export default LoginScreen;
