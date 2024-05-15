import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { getUserDetails, UserDetails } from '../api';
import { StackNavigationProp } from '@react-navigation/stack';

type UserDetailsScreenProps = {
    navigation: StackNavigationProp<any, 'UserDetails'>;
};

const UserDetailsScreen: React.FC<UserDetailsScreenProps> = ({ navigation }) => {
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const accessToken = await SecureStore.getItemAsync('accessToken');
                if (!accessToken) {
                    console.error("Access token not found");
                    return;
                }
                const details = await getUserDetails(accessToken);
                setUserDetails(details);
            } catch (error) {
                console.error('Failed to fetch user details:', error);
            }
        };

        fetchDetails();
    }, []);

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('accessToken');
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        }));
    };

    if (!userDetails) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>Profile</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionText}>Email: {userDetails.user.email}</Text>
                <Text style={styles.sectionText}>User ID: {userDetails.user.id}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionText}>Games Played: {userDetails.gamesPlayed}</Text>
                <Text style={styles.sectionText}>Games Won: {userDetails.gamesWon}</Text>
                <Text style={styles.sectionText}>Games Lost: {userDetails.gamesLost}</Text>
            </View>
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        marginBottom: 20
    },
    section: {
        marginBottom: 20
    },
    sectionText: {
        fontSize: 16
    },
});

export default UserDetailsScreen;
