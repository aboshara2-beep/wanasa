import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../shared/theme';

interface Props {
  uri?: string; name?: string; size?: number;
  showBorder?: boolean; borderColor?: string;
}

export function Avatar({ uri, name, size=40, showBorder=false, borderColor=Colors.primary }: Props) {
  const initials = (name ?? 'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const fontSize = size * 0.38;

  return (
    <View style={[
      av.wrap,
      { width:size, height:size, borderRadius:size/2 },
      showBorder && { borderWidth:2, borderColor, padding:2 },
    ]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width:size-(showBorder?4:0), height:size-(showBorder?4:0), borderRadius:size/2 }}
          defaultSource={{ uri:`https://ui-avatars.com/api/?name=${encodeURIComponent(name??'U')}&background=FF6B2C&color=fff&size=${size}` }}
        />
      ) : (
        <View style={[av.placeholder, { width:size, height:size, borderRadius:size/2 }]}>
          <Text style={[av.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

const av = StyleSheet.create({
  wrap:        { overflow:'hidden' },
  placeholder: { backgroundColor:'rgba(255,107,44,0.25)', alignItems:'center', justifyContent:'center' },
  initials:    { color:Colors.primary, fontWeight:'700' },
});
