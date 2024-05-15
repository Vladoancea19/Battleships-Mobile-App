import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import UserDetailsScreen from './screens/UserDetailsScreen';
import LobbyScreen from "./screens/LobbyScreen";
import WaitingScreen from "./screens/WaitingScreen";
import MapConfigScreen from "./screens/MapConfigScreen";


type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserDetails: undefined;
  Lobby: undefined;
  MapConfig: { gameId: string };
  WaitingScreen: { gameId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="MapConfig" component={MapConfigScreen} />
          <Stack.Screen name="WaitingScreen" component={WaitingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default App;