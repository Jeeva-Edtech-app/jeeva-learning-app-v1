import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { TrialProvider } from '@/context/TrialContext';
import { toastConfig } from '@/utils/toast';

function RootLayoutContent() {
  const colorScheme = useColorScheme();

  // Handle deep links for OAuth callbacks
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      try {
        const { hostname, path } = Linking.parse(url);
        
        // Handle OAuth callback deep links
        if (hostname === 'auth' && path === 'callback') {
          console.log('OAuth callback deep link received:', url);
          // expo-router will automatically handle routing to the callback screen
          // The callback screen will process the OAuth response
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Handle deep link when app is opened from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      <Toast config={toastConfig} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  
  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <TrialProvider>
                <RootLayoutContent />
              </TrialProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
