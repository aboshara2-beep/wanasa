import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router }         from 'expo-router';
import { Ionicons }       from '@expo/vector-icons';
import { useAuthStore }   from '../../src/features/auth/store';
import { API_CONFIG }     from '../../src/shared/api/config';

const { height } = Dimensions.get('window');

const C = {
  primary:'#FF6B2C', bg:'#080808', surface:'rgba(255,255,255,0.05)',
  border:'rgba(255,255,255,0.10)', text:'#FFFFFF',
  text2:'rgba(255,255,255,0.65)', text3:'rgba(255,255,255,0.35)',
  gold:'#FFD700',
};

export default function LoginScreen() {
  const [loading,  setLoading]  = useState(false);
  const [name,     setName]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const setUser  = useAuthStore(s => s.setUser);
  const setToken = useAuthStore(s => s.setToken);

  const handleRegister = async () => {
    if (!name.trim() || name.length < 2) {
      Alert.alert('خطأ', 'أدخل اسمك (حرفان على الأقل)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: name.trim().toLowerCase().replace(/\s+/g,'_') + '_' + Date.now().toString().slice(-4),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'فشل التسجيل');
      setToken(data.data.token);
      setUser({
        ...data.data.user,
        weeklyPoints:0, graceUsed:false, isOnline:true,
        blockedUsers:[], badges:[],
        stats:{ videos:0, followers:0, following:0, wins:0 },
      });
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('خطأ', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[C.bg,'#150800',C.bg]} style={s.container}>
      <View style={s.glow} />

      {/* Logo */}
      <View style={s.logoWrap}>
        <Text style={s.logoAr}>وَنَسَة</Text>
        <Text style={s.logoEn}>WANASA</Text>
        <Text style={s.tagline}>اللعبة الاجتماعية الأولى 🎬</Text>
      </View>

      {/* Features */}
      <View style={s.features}>
        {[
          { icon:'flame'  as const, t:'تحديات يومية ممتعة'  },
          { icon:'trophy' as const, t:'تنافس وفز نقاط'     },
          { icon:'people' as const, t:'مجتمع عربي حقيقي'   },
        ].map(f => (
          <View key={f.t} style={s.featureRow}>
            <View style={s.featureIcon}>
              <Ionicons name={f.icon} size={18} color={C.primary} />
            </View>
            <Text style={s.featureText}>{f.t}</Text>
          </View>
        ))}
      </View>

      {/* Form */}
      <View style={s.bottom}>
        {!showForm ? (
          <>
            <TouchableOpacity style={s.startBtn} onPress={() => setShowForm(true)} activeOpacity={0.85}>
              <LinearGradient colors={['#FF8F5E',C.primary,'#E5501A']} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:1}}/>
              <Ionicons name="play-circle" size={22} color="#fff" />
              <Text style={s.startBtnText}>ابدأ مجاناً الآن</Text>
            </TouchableOpacity>
            <Text style={s.note}>لا تحتاج حساب — فقط اسمك</Text>
          </>
        ) : (
          <View style={s.form}>
            <Text style={s.formLabel}>ما اسمك؟ 👋</Text>
            <TextInput
              style={s.input} value={name} onChangeText={setName}
              placeholder="أدخل اسمك..." placeholderTextColor={C.text3}
              autoFocus maxLength={30} textAlign="right"
              returnKeyType="done" onSubmitEditing={handleRegister}
            />
            <TouchableOpacity
              style={[s.startBtn, (!name.trim()||loading) && { opacity:0.5 }]}
              onPress={handleRegister} disabled={!name.trim()||loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#FF8F5E',C.primary]} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:0}}/>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Ionicons name="arrow-forward" size={20} color="#fff" /><Text style={s.startBtnText}>دخول</Text></>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={[s.note, { textDecorationLine:'underline' }]}>رجوع</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={s.fbNote}>* Facebook Login قيد المراجعة من Meta</Text>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:   { flex:1, alignItems:'center', justifyContent:'space-between', paddingVertical:70 },
  glow:        { position:'absolute', top:height*0.1, width:300, height:300, borderRadius:150, backgroundColor:'#FF6B2C', opacity:0.07 },
  logoWrap:    { alignItems:'center', gap:8 },
  logoAr:      { fontSize:56, fontWeight:'800', color:'#FF6B2C' },
  logoEn:      { fontSize:14, color:'rgba(255,255,255,0.65)', letterSpacing:6, fontWeight:'700' },
  tagline:     { color:'rgba(255,255,255,0.65)', fontSize:15, marginTop:4 },
  features:    { gap:16, width:'100%', paddingHorizontal:48 },
  featureRow:  { flexDirection:'row', alignItems:'center', gap:12 },
  featureIcon: {
    width:36, height:36, borderRadius:18,
    backgroundColor:'rgba(255,107,44,0.15)',
    alignItems:'center', justifyContent:'center',
  },
  featureText: { color:'#fff', fontSize:15, fontWeight:'500' },
  bottom:      { width:'100%', paddingHorizontal:32, gap:12, alignItems:'center' },
  startBtn:    {
    width:'100%', flexDirection:'row', alignItems:'center',
    justifyContent:'center', gap:8,
    paddingVertical:16, borderRadius:14, overflow:'hidden', position:'relative',
  },
  startBtnText:{ color:'#fff', fontSize:17, fontWeight:'700' },
  note:        { color:'rgba(255,255,255,0.35)', fontSize:13 },
  form:        { width:'100%', gap:12 },
  formLabel:   { color:'#fff', fontSize:20, fontWeight:'700', textAlign:'center' },
  input:       {
    backgroundColor:'rgba(255,255,255,0.05)',
    borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.12)',
    padding:16, color:'#fff', fontSize:17, textAlign:'right',
  },
  fbNote:      { color:'rgba(255,255,255,0.25)', fontSize:11, textAlign:'center' },
});
