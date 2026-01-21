import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import FeedScreen from './src/screens/FeedScreen';
import LoginScreen from './src/screens/LoginScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SwapsScreen from './src/screens/SwapsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#050816',
    primary: '#7C3AED',
    card: '#050816',
    text: '#F9FAFB',
    border: '#111827',
  },
};

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: '#020617',
        borderTopColor: '#111827',
        height: 70,
        paddingBottom: 10,
        paddingTop: 10,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Feed') iconName = focused ? 'pulse' : 'pulse-outline';
        else if (route.name === 'Matches') iconName = focused ? 'sparkles' : 'sparkles-outline';
        else if (route.name === 'Swaps') iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
        const tint = focused ? '#A855F7' : '#6B7280';
        return <Ionicons name={iconName} size={size} color={tint} />;
      },
    })}
  >
    <Tab.Screen name="Feed" component={FeedScreen} />
    <Tab.Screen name="Matches" component={MatchesScreen} />
    <Tab.Screen name="Swaps" component={SwapsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer theme={AppTheme}>
      {user ? (
        <AppTabs />
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
