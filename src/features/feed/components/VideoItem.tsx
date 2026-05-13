import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient }  from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { VideoPlayer }     from './VideoPlayer';
import { Avatar }          from '../../../shared/components/ui/Avatar';
import { Colors, Spacing, Typography, Radius } from '../../../shared/theme';
import type { Video }      from '../../../shared/api/types';

const { height, width } = Dimensions.get('window');

interface Props {
  video:    Video;
  isActive: boolean;
  onLike:   (id: string) => void;
  onVote:   (id: string) => void;
  onSave:   (id: string) => void;
}

function ActionBtn({
  icon, iconActive, label, count, active, onPress, activeColor,
}: {
  icon: string; iconActive: string; label: string;
  count: number; active: boolean;
  onPress: () => void; activeColor?: string;
}) {
  const scale = useRef(new (require('react-native').Animated.Value)(1)).current;
  const Animated = require('react-native').Animated;

  const handle = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.8, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  };

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M`
    : n >= 1000    ? `${(n/1000).toFixed(1)}k`
    : String(n);

  return (
    <TouchableOpacity
      onPress={handle}
      activeOpacity={0.8}
      hitSlop={{ top:10, bottom:10, left:14, right:14 }}
    >
      <Animated.View style={[st.actionBtn, { transform:[{ scale }] }]}>
        <Ionicons
          name={(active ? iconActive : icon) as any}
          size={32}
          color={active ? (activeColor ?? Colors.primary) : '#fff'}
        />
        <Text style={[st.actionCount, active && { color: activeColor ?? Colors.primary }]}>
          {fmt(count)}
        </Text>
        <Text style={st.actionLabel}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function VideoItem({ video, isActive, onLike, onVote, onSave }: Props) {
  const [isPaused,   setIsPaused]   = useState(false);
  const [showHeart,  setShowHeart]  = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const lastTap    = useRef(0);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const Animated = require('react-native').Animated;
  const heartScale   = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  // نقر مزدوج → إعجاب
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onLike(video.id);
      // Heart animation
      heartScale.setValue(0);
      heartOpacity.setValue(1);
      Animated.parallel([
        Animated.spring(heartScale,   { toValue:1.4, damping:8, useNativeDriver:true }),
        Animated.sequence([
          Animated.timing(heartOpacity, { toValue:1, duration:100, useNativeDriver:true }),
          Animated.timing(heartOpacity, { toValue:1, duration:300, useNativeDriver:true }),
          Animated.timing(heartOpacity, { toValue:0, duration:300, useNativeDriver:true }),
        ]),
      ]).start();
    }
    lastTap.current = now;
  }, [video.id, onLike]);

  const handlePressIn = useCallback(() => {
    pressTimer.current = setTimeout(() => setIsPaused(true), 300);
  }, []);

  const handlePressOut = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setIsPaused(false);
  }, []);

  const BG: [string,string,string][] = [
    ['#1a1a2e','#16213e','#0f2460'],
    ['#0d1b2a','#1b2838','#0a3d62'],
    ['#1a0a00','#2d1500','#0f0800'],
    ['#0a1628','#0d2137','#051020'],
    ['#111111','#1a1a1a','#0a0a0a'],
  ];
  const bgIdx = parseInt(video.id.replace(/\D/g,'') || '0') % 5;

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M`
    : n >= 1000    ? `${(n/1000).toFixed(1)}k`
    : String(n);

  return (
    <TouchableOpacity
      style={st.container}
      activeOpacity={1}
      onPress={handleTap}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={300}
    >
      {/* ── الفيديو الحقيقي أو Placeholder ── */}
      {video.url
        ? <VideoPlayer
            url={video.url}
            videoId={video.id}
            isActive={isActive}
            isPaused={isPaused}
            duration={video.duration}
          />
        : <LinearGradient colors={BG[bgIdx]} style={StyleSheet.absoluteFill} />
      }

      {/* Pause Overlay */}
      {isPaused && (
        <View style={st.pauseOverlay} pointerEvents="none">
          <Ionicons name="pause" size={60} color="rgba(255,255,255,0.8)" />
        </View>
      )}

      {/* Winner */}
      {video.isWinner && (
        <>
          <View style={st.winnerBorder} pointerEvents="none" />
          <View style={st.winnerBadge}>
            <Text style={st.winnerCrown}>👑</Text>
            <Text style={st.winnerText}>فائز اليوم</Text>
          </View>
        </>
      )}

      {/* Sponsored */}
      {video.isSponsored && (
        <View style={st.sponsoredBadge}>
          <Text style={st.sponsoredText}>ممول</Text>
        </View>
      )}

      {/* Views */}
      {!video.isSponsored && (
        <View style={st.viewsBadge}>
          <Ionicons name="eye-outline" size={13} color="rgba(255,255,255,0.85)" />
          <Text style={st.viewsText}>{fmt(video.views)}</Text>
        </View>
      )}

      {/* Bottom Gradient */}
      <LinearGradient
        colors={['transparent','rgba(0,0,0,0.45)','rgba(0,0,0,0.95)']}
        style={st.bottomGradient}
        pointerEvents="none"
      />

      {/* Actions */}
      <View style={st.actionsCol}>
        <ActionBtn
          icon="heart-outline"            iconActive="heart"
          label="إعجاب" count={video.likes} active={video.isLiked}
          onPress={() => onLike(video.id)} activeColor="#00B4D8"
        />
        <ActionBtn
          icon="checkmark-circle-outline" iconActive="checkmark-circle"
          label="تصويت" count={video.votes} active={video.isVoted}
          onPress={() => onVote(video.id)} activeColor={Colors.primary}
        />
        <ActionBtn
          icon="chatbubble-outline"       iconActive="chatbubble"
          label="تعليق" count={video.comments} active={false}
          onPress={() => {}}
        />
        <ActionBtn
          icon="bookmark-outline"         iconActive="bookmark"
          label="حفظ" count={video.saves} active={video.isSaved}
          onPress={() => onSave(video.id)} activeColor={Colors.primary}
        />
        <TouchableOpacity
          onPress={() => setIsFollowed(f => !f)}
          hitSlop={{ top:10, bottom:10, left:14, right:14 }}
        >
          <View style={st.actionBtn}>
            <Ionicons
              name={isFollowed ? 'person-check' : 'person-add-outline'}
              size={28}
              color={isFollowed ? Colors.primary : '#fff'}
            />
            <Text style={st.actionLabel}>{isFollowed ? 'متابَع' : 'متابعة'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{ top:10, bottom:10, left:14, right:14 }}>
          <View style={st.actionBtn}>
            <Ionicons name="share-social-outline" size={28} color="#fff" />
            <Text style={st.actionLabel}>مشاركة</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={st.userInfo}>
        <View style={st.userRow}>
          <Avatar uri={video.userAvatar} name={video.userName} size={42} />
          <View style={st.userTexts}>
            <View style={st.userNameRow}>
              <Text style={st.userName}>{video.userName}</Text>
              <Ionicons name="checkmark-circle" size={15} color="#1D9BF0" />
            </View>
            <Text style={st.userHandle}>@{video.userName?.toLowerCase().replace(' ','_')}</Text>
          </View>
        </View>
        <Text style={st.caption} numberOfLines={2}>{video.title}</Text>
        {video.isWinner && (
          <View style={st.challengeLink}>
            <Ionicons name="trophy" size={13} color={Colors.gold} />
            <Text style={st.challengeLinkText}>تحدي اليوم</Text>
          </View>
        )}
      </View>

      {/* Heart Burst */}
      <Animated.View
        style={[st.heartBurst, { opacity: heartOpacity, transform:[{ scale: heartScale }] }]}
        pointerEvents="none"
      >
        <Ionicons name="heart" size={90} color={Colors.error} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  container:    { width, height, overflow:'hidden' },
  pauseOverlay: { ...StyleSheet.absoluteFillObject, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0,0.3)', zIndex:8 },
  winnerBorder: { ...StyleSheet.absoluteFillObject, borderWidth:3, borderColor:Colors.gold, zIndex:2 },
  winnerBadge:  { position:'absolute', top:110, left:Spacing.md, flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(0,0,0,0.75)', paddingHorizontal:Spacing.sm, paddingVertical:5, borderRadius:Radius.full, borderWidth:1, borderColor:Colors.gold, zIndex:5 },
  winnerCrown:  { fontSize:14 },
  winnerText:   { color:Colors.gold, fontSize:Typography.sizes.xs, fontWeight:Typography.weights.bold },
  sponsoredBadge:{ position:'absolute', top:110, right:Spacing.md, backgroundColor:'rgba(255,107,44,0.85)', paddingHorizontal:Spacing.sm, paddingVertical:4, borderRadius:Radius.full, zIndex:5 },
  sponsoredText: { color:'#fff', fontSize:Typography.sizes.xs, fontWeight:Typography.weights.bold },
  viewsBadge:   { position:'absolute', top:110, right:Spacing.md, flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(0,0,0,0.55)', paddingHorizontal:Spacing.sm, paddingVertical:4, borderRadius:Radius.full, zIndex:5 },
  viewsText:    { color:'rgba(255,255,255,0.9)', fontSize:Typography.sizes.xs },
  bottomGradient:{ position:'absolute', bottom:0, left:0, right:0, height:height*0.52 },
  actionsCol:   { position:'absolute', right:Spacing.md, bottom:110, gap:Spacing.lg, alignItems:'center', zIndex:10 },
  actionBtn:    { alignItems:'center', gap:2 },
  actionCount:  { color:'#fff', fontSize:Typography.sizes.sm, fontWeight:Typography.weights.semibold, textShadowColor:'rgba(0,0,0,0.9)', textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  actionLabel:  { color:'rgba(255,255,255,0.78)', fontSize:10, fontWeight:Typography.weights.medium },
  userInfo:     { position:'absolute', bottom:95, left:Spacing.md, right:85, gap:Spacing.xs, zIndex:10 },
  userRow:      { flexDirection:'row', alignItems:'center', gap:Spacing.sm },
  userTexts:    { flex:1, gap:2 },
  userNameRow:  { flexDirection:'row', alignItems:'center', gap:4 },
  userName:     { color:'#fff', fontSize:Typography.sizes.base, fontWeight:Typography.weights.bold, textShadowColor:'rgba(0,0,0,0.9)', textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  userHandle:   { color:'rgba(255,255,255,0.6)', fontSize:Typography.sizes.xs },
  caption:      { color:'rgba(255,255,255,0.92)', fontSize:Typography.sizes.sm, fontWeight:Typography.weights.medium, lineHeight:20, textShadowColor:'rgba(0,0,0,0.9)', textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  challengeLink:{ flexDirection:'row', alignItems:'center', gap:4, alignSelf:'flex-start', backgroundColor:'rgba(255,215,0,0.15)', paddingHorizontal:8, paddingVertical:3, borderRadius:Radius.full, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  challengeLinkText:{ color:Colors.gold, fontSize:10, fontWeight:Typography.weights.bold },
  heartBurst:   { position:'absolute', top:height/2-45, left:width/2-45, zIndex:50 },
});
