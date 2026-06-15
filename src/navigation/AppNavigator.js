import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Inbox, PlusCircle, User } from 'lucide-react-native';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Import Screens (we will create these next)
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 2,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen 
        name="Harita" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Talepler" 
        component={RequestsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme, colors } = useTheme();

  if (loading) {
    return null; // A loading screen could be here
  }

  const baseTheme = theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={{
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.primary,
      }
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
