import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing } from '../src/constants/theme';
import { useAuthStore } from '../src/store/authStore';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? '/(tabs)/home' : '/(auth)/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <LinearGradient
      colors={[Colors.background, '#1A0A00', Colors.background]}
      style={styles.container}
    >
      <View style={styles.logoWrapper}>
        <Text style={styles.logoAr}>وَنَسَة</Text>
        <Text style={styles.logoEn}>WANASA</Text>
        <Text style={styles.tagline}>العبة الاجتماعية الأولى</Text>
      </View>

      <View style={styles.loaderWrapper}>
        <View style={styles.loaderTrack}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            style={styles.loaderFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    gap:        Spacing.xs,
  },
  logoAr: {
    fontSize:   Typography.sizes.xxxl,
    fontWeight: Typography.weights.extrabold,
    color:      Colors.primary,
    letterSpacing: 2,
  },
  logoEn: {
    fontSize:   Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color:      Colors.textSecondary,
    letterSpacing: 8,
  },
  tagline: {
    fontSize:   Typography.sizes.sm,
    color:      Colors.textMuted,
    marginTop:  Spacing.sm,
  },
  loaderWrapper: {
    position: 'absolute',
    bottom:   80,
    width:    width * 0.5,
  },
  loaderTrack: {
    height:       3,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 99,
    overflow:     'hidden',
  },
  loaderFill: {
    height:  3,
    width:   '70%',
    borderRadius: 99,
  },
});
