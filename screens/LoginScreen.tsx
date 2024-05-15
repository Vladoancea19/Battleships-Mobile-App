import React, { useState } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground} from 'react-native';
import { login, getUserDetails } from '../api';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any, any>;
};

const emailRegex = /\S+@\S+\.\S+/;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = async () => {
        try {
          const loginResponse = await login(email, password);
          const accessToken = loginResponse.data.accessToken;
      
          if (!accessToken) {
            console.error('No access token received');
            Alert.alert('Login Failed', 'No access token received');
            return;
          }

          await SecureStore.setItemAsync('accessToken', accessToken);

          const userDetails = await getUserDetails(accessToken);

          console.log(userDetails);

          navigation.navigate('Lobby');
  
        } catch (error: unknown) {
            const errorMessage = (error as { message?: string }).message || 'An error occurred during login.';
            Alert.alert('Login Failed', errorMessage);
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
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <Text
                    style={styles.button}
                    onPress={() => handleLogin()}>
                    Login
                </Text>

                <Text
                    style={styles.link}
                    onPress={() => navigation.navigate('Register')}>
                    Don't have an account? Register here
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
    input: {
        height: 40,
        marginBottom: 12,
        borderWidth: 1,
        paddingHorizontal: 10,
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
    link: {
        marginTop: 15,
        color: 'black',
        textAlign: 'center',
    },
});

export default LoginScreen;
