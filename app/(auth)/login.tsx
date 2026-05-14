import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { LinearGradient }  from 'expo-linear-gradient';
import { router }          from 'expo-router';
import { Ionicons }        from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../src/shared/theme';
import { useAuthStore }    from '../../src/features/auth/store';
import { loginWithFacebook } from '../../src/features/auth/services/facebook';
import { API_CONFIG }      from '../../src/shared/api/config';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const setUser  = useAuthStore(s => s.setUser);
  const setToken = useAuthStore(s => s.setToken);

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      // ── 1. الحصول على Facebook Token ──
      const fbToken = await loginWithFacebook();

      // ── 2. إرساله للـ Backend ──
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/facebook`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ accessToken: fbToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'فشل تسجيل الدخول');
      }

      // ── 3. حفظ البيانات ──
      setToken(data.data.token);
      setUser({
        ...data.data.user,
        weeklyPoints: 0,
        graceUsed:    false,
        isOnline:     true,
        blockedUsers: [],
        badges:       [],
        stats: { videos:0, followers:0, following:0, wins:0 },
      });

      // ── 4. التوجيه ──
      if (data.data.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)/home');
      }

    } catch (err: any) {
      if (err.message !== 'تم إلغاء تسجيل الدخول') {
        Alert.alert('خطأ', err.message ?? 'فشل تسجيل الدخول — تأكد من الاتصال');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.background, '#150800', Colors.background]}
      style={s.container}
    >
      <View style={s.glow} />

      {/* Logo */}
      <View style={s.logo}>
        <Text style={s.logoAr}>وَنَسَة</Text>
        <Text style={s.logoEn}>WANASA</Text>
        <Text style={s.tagline}>اللعبة الاجتماعية الأولى 🎬</Text>
      </View>

      {/* Features */}
      <View style={s.features}>
        {[
          { icon:'flame',   text:'تحديات يومية ممتعة' },
          { icon:'trophy',  text:'تنافس وفز نقاط' },
          { icon:'people',  text:'مجتمع عربي حقيقي' },
        ].map(f => (
          <View key={f.text} style={s.featureRow}>
            <Ionicons name={f.icon as any} size={20} color={Colors.primary} />
            <Text style={s.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Login Button */}
      <View style={s.bottom}>
        <TouchableOpacity
          style={s.fbBtn}
          onPress={handleFacebookLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="logo-facebook" size={24} color="#fff" />
                <Text style={s.fbText}>تسجيل الدخول بفيسبوك</Text>
              </>
          }
        </TouchableOpacity>

        <Text style={s.terms}>
          بالدخول توافق على شروط الاستخدام وسياسة الخصوصية
        </Text>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:   { flex:1, alignItems:'center', justifyContent:'space-between', paddingVertical:70 },
  glow:        { position:'absolute', top:height*0.12, width:300, height:300, borderRadius:150, backgroundColor:Colors.primary, opacity:0.07 },
  logo:        { alignItems:'center', gap:Spacing.sm },
  logoAr:      { fontSize:60, fontWeight:Typography.weights.extrabold, color:Colors.primary },
  logoEn:      { fontSize:Typography.sizes.md, color:Colors.textSecondary, letterSpacing:6, fontWeight:Typography.weights.bold },
  tagline:     { color:Colors.textSecondary, fontSize:Typography.sizes.base, marginTop:4 },
  features:    { gap:Spacing.md, width:'100%', paddingHorizontal:Spacing.xl*2 },
  featureRow:  { flexDirection:'row', alignItems:'center', gap:Spacing.md },
  featureText: { color:Colors.textPrimary, fontSize:Typography.sizes.base },
  bottom:      { width:'100%', paddingHorizontal:Spacing.xl, gap:Spacing.md, alignItems:'center' },
  fbBtn:       { width:'100%', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:Spacing.md, backgroundColor:'#1877F2', paddingVertical:16, borderRadius:Radius.md },
  fbText:      { color:'#fff', fontSize:Typography.sizes.md, fontWeight:Typography.weights.bold },
  terms:       { color:Colors.textMuted, fontSize:Typography.sizes.xs, textAlign:'center', lineHeight:18 },
});
