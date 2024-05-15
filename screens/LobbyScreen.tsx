import React, { useEffect, useState } from 'react';
import { ImageBackground, View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getAvailableGames, createGame, joinGame, UserDetails, getUserDetails } from '../api';
import { StackNavigationProp } from '@react-navigation/stack';
import {log} from "expo/build/devtools/logger";

type LobbyScreenProps = {
    navigation: StackNavigationProp<any, any>;
};

const LobbyScreen: React.FC<LobbyScreenProps> = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState<any[]>([]);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (accessToken) {
                const userDetailsResponse = await getUserDetails(accessToken);
                setUserDetails(userDetailsResponse);
                const availableGamesResponse = await getAvailableGames(accessToken);
                setGames(availableGamesResponse.games.filter(game => game.status === 'CREATED' && game.player1Id !== userDetailsResponse.user.id));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleCreateGame = async () => {
        let gameId;
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (accessToken) {
                const response = await createGame(accessToken);
                gameId = response.id;
                navigation.navigate('WaitingScreen', { gameId });
            }
        } catch (error) {
            console.error('Error creating game:', error);
        }
    };

    const handleJoinGame = async (gameId: string) => {
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (accessToken) {
                await joinGame(accessToken, gameId);
                navigation.navigate('MapConfig', { gameId });
            }
        } catch (error) {
            console.error('Error joining game:', error);
        }
    };

    const renderGameItem = ({ item }: { item: any }) => {
        return (
            <View style={styles.gameContainer}>
                <Text style={styles.gameText}>Game #{item.id}</Text>
                <Text style={styles.gameText}>Hosted by: {item.player1.email}</Text>
                <TouchableOpacity onPress={() => handleJoinGame(item.id)}>
                    <Text style={styles.joinButton}>Join Game</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ImageBackground source={require('../util/resources/background.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Battleship</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('UserDetails')}>
                        <Text style={styles.profileIcon}>Profile</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                    <Text style={styles.subtitle}>Join a game:</Text>
                    <TouchableOpacity onPress={handleCreateGame}>
                        <Text style={styles.createButton}>Create game</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={games}
                    renderItem={renderGameItem}
                    keyExtractor={(item) => item.id}
                />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    gameText: {
        fontSize: 16,
        color: 'black',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    profileIcon: {
        fontSize: 18,
        color: 'white',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    gameContainer: {
        padding: 10,
        borderWidth: 1,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    joinButton: {
        fontSize: 16,
        color: 'green',
    },
    createButton: {
        fontSize: 18,
        color: 'white',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
});

export default LobbyScreen;
