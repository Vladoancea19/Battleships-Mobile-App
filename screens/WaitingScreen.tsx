import React, { useEffect } from 'react';
import {View, Text, StyleSheet, ImageBackground} from 'react-native';
import { getGameDetails } from '../api';
import * as SecureStore from "expo-secure-store";

const WaitingScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const gameId = route.params.gameId;

    useEffect(() => {
        const checkOpponentJoinedGame = async () => {
            try {
                const accessToken = await SecureStore.getItemAsync('accessToken');
                if (accessToken) {
                    const gameDetails = await getGameDetails(accessToken, gameId);
                    if (gameDetails.player2Id) {
                        navigation.navigate('MapConfig', { gameId });
                    }
                }
            } catch (error) {
                console.error('Error checking opponent joined:', error);
            }
        };

        const interval = setInterval(checkOpponentJoinedGame, 5000);
        return () => clearInterval(interval);
    }, [navigation, gameId]);

    return (
        <ImageBackground source={require('../util/resources/background.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Text style={styles.text}>You successfully created a game and waiting for a player to join...</Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black'
    },
});

export default WaitingScreen;
