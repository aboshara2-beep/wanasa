import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, withRepeat, withTiming, useAnimatedStyle,
} from 'react-native-reanimated';

const { height: H } = Dimensions.get('window');

export function SkeletonFeed() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration:800 }), -1, true);
  }, []);

  const s = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={sk.container}>
      <Animated.View style={[sk.video, s]} />
      <View style={sk.actions}>
        {[0,1,2,3].map(i => (
          <Animated.View key={i} style={[sk.actionBtn, s]} />
        ))}
      </View>
      <View style={sk.info}>
        <Animated.View style={[sk.line1, s]} />
        <Animated.View style={[sk.line2, s]} />
        <Animated.View style={[sk.line3, s]} />
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  container: { flex:1, backgroundColor:'#080808' },
  video:     { flex:1, backgroundColor:'#1a1a1a' },
  actions:   { position:'absolute', right:12, bottom:110, gap:24 },
  actionBtn: { width:52, height:52, borderRadius:26, backgroundColor:'rgba(255,255,255,0.1)' },
  info:      { position:'absolute', bottom:95, left:16, gap:8 },
  line1:     { width:120, height:14, borderRadius:7, backgroundColor:'rgba(255,255,255,0.1)' },
  line2:     { width:200, height:12, borderRadius:6, backgroundColor:'rgba(255,255,255,0.07)' },
  line3:     { width:150, height:12, borderRadius:6, backgroundColor:'rgba(255,255,255,0.07)' },
});
