import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/shared/theme';
import { usePushNotifications } from '../src/shared/hooks/usePushNotifications';
import { useAuthStore } from '../src/features/auth/store';
import { socket } from '../src/shared/api/websocket';
import { useSponsorshipStore } from '../src/shared/stores/sponsorshipStore';
import { SponsorshipAPI } from '../src/shared/api/sponsorship';

function AppInit() {
const isAuthenticated = useAuthStore(s => s.isAuthenticated);

// Push Notifications
usePushNotifications();

// WebSocket + Sponsorship
useEffect(() => {
if (!isAuthenticated) return;

socket.connect();

SponsorshipAPI.getState()
.then(res => {
if (res.data?.isActive && res.data.campaign) {
useSponsorshipStore.getState().setSponsored(res.data.campaign);
}
})
.catch(() => {});

// WS Events
const unsubscribe = socket.on('sponsored_update', (p: any) => {
if (p?.campaign) useSponsorshipStore.getState().setSponsored(p.campaign);
});

const unsubscribeEnd = socket.on('sponsored_ended', () => {
useSponsorshipStore.getState().clearSponsored();
});

return () => {
unsubscribe();
unsubscribeEnd();
socket.disconnect();
};

}, [isAuthenticated]);

return null;
}

export default function RootLayout() {
return (
<GestureHandlerRootView style={{ flex: 1 }}>
<SafeAreaProvider>
<StatusBar style="light" backgroundColor={Colors.background} />
<AppInit />
<Stack screenOptions={{ headerShown: false }}>
<Stack.Screen name="index" />
<Stack.Screen name="(auth)" />
<Stack.Screen name="(tabs)" />
<Stack.Screen name="upload" options={{ presentation: 'modal' }} />
<Stack.Screen name="admin" />
</Stack>
</SafeAreaProvider>
</GestureHandlerRootView>
);
}
