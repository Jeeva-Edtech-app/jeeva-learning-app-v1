import { Stack } from 'expo-router';

export default function SubscriptionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
