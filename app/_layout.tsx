import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, HankenGrotesk_400Regular, HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { useLegalConsentStore } from '@/store/legal-consent-store';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { initializeDatabase } from '@/services/dbService';
import '../global.css';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_700Bold,
    JetBrainsMono_500Medium,
  });

  const { hasAcceptedDisclaimer, isLoading: isConsentLoading, initializeConsent } = useLegalConsentStore();
  const { loadPreferences, isLoaded: isPrefsLoaded } = useAppPreferencesStore();

  useEffect(() => {
    try {
      initializeDatabase();
    } catch {
      // Base de dados local
    }
    initializeConsent();
    loadPreferences();
  }, [initializeConsent, loadPreferences]);

  useEffect(() => {
    if (fontsLoaded && !isConsentLoading && isPrefsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isConsentLoading, isPrefsLoaded]);

  useEffect(() => {
    if (isConsentLoading) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasAcceptedDisclaimer && !inOnboarding) {
      // Bloqueio rigoroso de conformidade de saúde: redireciona para o Disclaimer Gate
      router.replace('/onboarding/disclaimer');
    } else if (hasAcceptedDisclaimer && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasAcceptedDisclaimer, isConsentLoading, segments, router]);

  if (!fontsLoaded || isConsentLoading || !isPrefsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EDE6D3]">
        <ActivityIndicator size="large" color="#D9922E" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/disclaimer" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="paywall/index" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </>
  );
}
