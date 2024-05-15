import React, { useState } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground} from 'react-native';
import { register } from '../api';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserDetails: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Register'
>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const emailRegex = /\S+@\S+\.\S+/;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    try {
      const response = await register(email, password);
      console.log('Registration successful:', response.data);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert('Registration Failed', 'Please check your input and try again.');
    }
  };

  return (
      <ImageBackground source={require('../util/resources/background.png')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Text
              style={styles.button}
              onPress={() => handleRegister()}>
            Register
          </Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}>
            Have an account? Login here
          </Text>
        </View>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  button: {
    fontSize: 20,
    alignSelf: "center"
  },
  input: {
    height: 40,
    marginBottom: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  link: {
    marginTop: 15,
    color: 'black',
    textAlign: 'center',
  },
});

export default RegisterScreen;
