import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router }         from 'expo-router';
import { Ionicons }       from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../src/shared/theme';
import { useAuthStore }   from '../../src/features/auth/store';

const { height } = Dimensions.get('window');

const MOCK_USERS = [
  {
    id:'u1', name:'محمد أحمد', username:'mohammed_a',
    avatar:'https://i.pravatar.cc/150?img=3',
    role:'user' as const, points:247, weeklyPoints:87,
    streak:5, graceUsed:false, isOnline:true,
    createdAt: new Date().toISOString(),
  },
  {
    id:'admin1', name:'أدمن ونسة', username:'wanasa_admin',
    avatar:'https://i.pravatar.cc/150?img=8',
    role:'admin' as const, points:999, weeklyPoints:999,
    streak:30, graceUsed:false, isOnline:true,
    createdAt: new Date().toISOString(),
  },
];

export default function LoginScreen() {
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(0);
  const setUser  = useAuthStore(s => s.setUser);
  const setToken = useAuthStore(s => s.setToken);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const user = MOCK_USERS[selected];
    setToken(`mock_token_${user.id}`);
    setUser(user);
    setLoading(false);

    if (user.role === 'admin') {
      router.replace('/admin/index');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <LinearGradient
      colors={[Colors.background, '#150800', Colors.background]}
      style={s.container}
    >
      <View style={s.glow} />
      <View style={s.logo}>
        <Text style={s.logoAr}>وَنَسَة</Text>
        <Text style={s.logoEn}>WANASA</Text>
        <View style={s.devBadge}>
          <Text style={s.devText}>DEV MODE</Text>
        </View>
      </View>

      <View style={s.selector}>
        <Text style={s.selectorLabel}>اختر مستخدم للتجربة</Text>
        {MOCK_USERS.map((u, i) => (
          <TouchableOpacity
            key={u.id}
            style={[s.userCard, selected === i && s.userCardActive]}
            onPress={() => setSelected(i)}
            activeOpacity={0.8}
          >
            <View style={[s.roleIcon, u.role === 'admin' && s.roleIconAdmin]}>
              <Ionicons
                name={u.role === 'admin' ? 'shield-checkmark' : 'person'}
                size={20}
                color={u.role === 'admin' ? Colors.gold : Colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{u.name}</Text>
              <Text style={s.userRole}>
                {u.role === 'admin' ? '👑 مدير' : '👤 مستخدم'} · {u.points} نقطة
              </Text>
            </View>
            {selected === i && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.bottom}>
        <TouchableOpacity
          style={s.loginBtn}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="play-circle" size={22} color="#fff" />
                <Text style={s.loginText}>ابدأ التجربة</Text>
              </>
          }
        </TouchableOpacity>
        <Text style={s.note}>
          * سيتم إضافة Facebook Login قبل الإطلاق
        </Text>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:      { flex:1, alignItems:'center', justifyContent:'space-between', paddingVertical:60 },
  glow:           { position:'absolute', top:height*0.15, width:250, height:250, borderRadius:125, backgroundColor:Colors.primary, opacity:0.07 },
  logo:           { alignItems:'center', gap:Spacing.xs },
  logoAr:         { fontSize:52, fontWeight:Typography.weights.extrabold, color:Colors.primary },
  logoEn:         { fontSize:Typography.sizes.md, color:Colors.textSecondary, letterSpacing:6, fontWeight:Typography.weights.bold },
  devBadge:       { backgroundColor:'rgba(255,107,44,0.2)', paddingHorizontal:12, paddingVertical:4, borderRadius:Radius.full, borderWidth:1, borderColor:Colors.primary, marginTop:4 },
  devText:        { color:Colors.primary, fontSize:10, fontWeight:Typography.weights.bold, letterSpacing:2 },
  selector:       { width:'100%', paddingHorizontal:Spacing.xl, gap:Spacing.sm },
  selectorLabel:  { color:Colors.textSecondary, fontSize:Typography.sizes.sm, textAlign:'center', marginBottom:4 },
  userCard:       { flexDirection:'row', alignItems:'center', gap:Spacing.md, backgroundColor:Colors.surface, padding:Spacing.md, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border },
  userCardActive: { borderColor:Colors.primary, backgroundColor:'rgba(255,107,44,0.08)' },
  roleIcon:       { width:44, height:44, borderRadius:22, backgroundColor:'rgba(255,107,44,0.1)', alignItems:'center', justifyContent:'center' },
  roleIconAdmin:  { backgroundColor:'rgba(255,215,0,0.1)' },
  userName:       { color:Colors.textPrimary, fontSize:Typography.sizes.base, fontWeight:Typography.weights.bold },
  userRole:       { color:Colors.textSecondary, fontSize:Typography.sizes.xs, marginTop:2 },
  bottom:         { width:'100%', paddingHorizontal:Spacing.xl, gap:Spacing.sm, alignItems:'center' },
  loginBtn:       { width:'100%', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:Spacing.sm, backgroundColor:Colors.primary, paddingVertical:16, borderRadius:Radius.md },
  loginText:      { color:'#fff', fontSize:Typography.sizes.md, fontWeight:Typography.weights.bold },
  note:           { color:Colors.textMuted, fontSize:Typography.sizes.xs, textAlign:'center' },
});
