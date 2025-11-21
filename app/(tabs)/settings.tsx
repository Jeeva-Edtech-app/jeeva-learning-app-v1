import { Stack } from 'expo-router';
import SettingsScreen from '@/screens/SettingsScreen';

export default function Settings() {
  return (
    <>
      <Stack.Screen options={{ title: 'Settings', headerShown: false }} />
      <SettingsScreen />
    </>
  );
}
