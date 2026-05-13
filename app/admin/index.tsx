import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/shared/theme';

export default function AdminDashboard() {
  return (
    <SafeAreaView style={st.container}>
      <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        <Text style={st.backText}>رجوع</Text>
      </TouchableOpacity>
      <Ionicons name="settings" size={48} color={Colors.primary} />
      <Text style={st.title}>لوحة التحكم (مؤقتة)</Text>
      <Text style={st.subtitle}>سيتم تطويرها قريباً</Text>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex:1, backgroundColor:Colors.background, alignItems:'center', justifyContent:'center', padding:20, gap:16 },
  backBtn:   { position:'absolute', top:50, left:20, flexDirection:'row', alignItems:'center', gap:4 },
  backText:  { color:Colors.textPrimary, fontSize:16 },
  title:     { color:Colors.textPrimary, fontSize:20, fontWeight:'bold' },
  subtitle:  { color:Colors.textSecondary, fontSize:14 },
});
