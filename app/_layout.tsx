import 'react-native-gesture-handler';
import { LogBox }                from 'react-native';
import { useEffect }              from 'react';
import { Stack }                  from 'expo-router';
import { StatusBar }              from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider }       from 'react-native-safe-area-context';
import { useAuthStore }           from '../src/features/auth/store';
import { socket }                 from '../src/shared/api/websocket';

LogBox.ignoreLogs([
  'Default FirebaseApp',
  'Require cycle',
  '[Layout children]',
]);

function AppInit() {
  const token           = useAuthStore(s => s.token);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    socket.setToken(token);
    if (isAuthenticated && token) {
      socket.connect();
    } else {
      socket.disconnect();
    }
    return () => { socket.disconnect(); };
  }, [token, isAuthenticated]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0F0F0F" />
        <AppInit />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
          <Stack.Screen name="admin"  options={{ presentation: 'fullScreenModal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
