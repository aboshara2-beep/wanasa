import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../src/shared/theme';
export default function UploadScreen() {
  return (
    <View style={s.container}>
      <Text style={{ color:'#fff' }}>Upload Screen</Text>
    </View>
  );
}
const s = StyleSheet.create({ container: { flex:1, backgroundColor:Colors.bg, padding:Spacing.md } });
