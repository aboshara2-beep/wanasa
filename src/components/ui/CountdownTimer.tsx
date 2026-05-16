import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../shared/theme';

export function CountdownTimer({ endsAt }: { endsAt: string }) {
  const calc = () => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return { h:'00', m:'00', s:'00' };
    const h = Math.floor(diff/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    return {
      h: String(h).padStart(2,'0'),
      m: String(m).padStart(2,'0'),
      s: String(s).padStart(2,'0'),
    };
  };

  const [t, setT] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <View style={ct.row}>
      {[t.h, t.m, t.s].map((v,i) => (
        <React.Fragment key={i}>
          <View style={ct.block}>
            <Text style={ct.num}>{v}</Text>
          </View>
          {i < 2 && <Text style={ct.colon}>:</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

const ct = StyleSheet.create({
  row:   { flexDirection:'row', alignItems:'center', gap:2 },
  block: {
    backgroundColor:'rgba(255,107,44,0.2)',
    paddingHorizontal:6, paddingVertical:3,
    borderRadius:6,
    borderWidth:1, borderColor:'rgba(255,107,44,0.3)',
    minWidth:28, alignItems:'center',
  },
  num:   { ...Typography.label, color:Colors.primary, fontVariant:['tabular-nums'] as any },
  colon: { ...Typography.label, color:Colors.primary, marginBottom:2 },
});
