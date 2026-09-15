import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useCircadianStore } from '@/store/use-circadian-store';

export default function TabLayout() {
  const { themeMode } = useAppPreferencesStore();
  const { currentElevationDeg } = useCircadianStore();

  const isNight = themeMode === 'dark' || (themeMode === 'auto_circadian' && currentElevationDeg < 0);

  const tabBgColor = isNight ? '#221E1A' : '#F4EFE2';
  const borderColor = isNight ? '#332D26' : '#DDD6C1';
  const activeColor = isNight ? '#E8A83E' : '#D9922E';
  const inactiveColor = isNight ? '#9E9789' : '#7A7875';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBgColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono_500Medium',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sol',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sunny-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sleep"
        options={{
          title: 'Sono',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="moon-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consistency"
        options={{
          title: 'Ritmo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Definições',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
