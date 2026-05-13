import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import { Avatar } from '../../src/components/ui/Avatar';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

interface LeaderUser {
  id: string; name: string; avatar: string;
  points: number; rank: number;
  badge?: string;
}

const MOCK_LEADERS: LeaderUser[] = [
  { id:'u1',  name:'محمد أحمد',  avatar:'https://i.pravatar.cc/150?img=8',  points:347, rank:1, badge:'⭐' },
  { id:'u2',  name:'سارة خالد',  avatar:'https://i.pravatar.cc/150?img=9',  points:312, rank:2, badge:'🎬' },
  { id:'me',  name:'أنت',        avatar:'https://i.pravatar.cc/150?img=3',  points:309, rank:3, badge:'💡' },
  { id:'u4',  name:'فاطمة علي',  avatar:'https://i.pravatar.cc/150?img=11', points:290, rank:4 },
  { id:'u5',  name:'خالد عمر',   avatar:'https://i.pravatar.cc/150?img=12', points:275, rank:5 },
  { id:'u6',  name:'منى سعيد',   avatar:'https://i.pravatar.cc/150?img=13', points:261, rank:6 },
  { id:'u7',  name:'أحمد حسن',   avatar:'https://i.pravatar.cc/150?img=14', points:248, rank:7 },
  { id:'u8',  name:'ليلى إبراهيم',avatar:'https://i.pravatar.cc/150?img=15',points:233, rank:8 },
  { id:'u9',  name:'يوسف محمد',  avatar:'https://i.pravatar.cc/150?img=16', points:220, rank:9 },
  { id:'u10', name:'هند عبدالله', avatar:'https://i.pravatar.cc/150?img=17', points:205, rank:10},
  { id:'u11', name:'عمر إسماعيل', avatar:'https://i.pravatar.cc/150?img=18', points:191, rank:11},
  { id:'u12', name:'رنا يوسف',    avatar:'https://i.pravatar.cc/150?img=19', points:178, rank:12},
  { id:'u13', name:'تامر حسين',   avatar:'https://i.pravatar.cc/150?img=20', points:163, rank:13},
  { id:'u14', name:'دينا أحمد',   avatar:'https://i.pravatar.cc/150?img=21', points:149, rank:14},
  { id:'u15', name:'كريم مصطفى', avatar:'https://i.pravatar.cc/150?img=22', points:134, rank:15},
  { id:'u16', name:'نادية علي',   avatar:'https://i.pravatar.cc/150?img=23', points:120, rank:16},
  { id:'u17', name:'وليد حسن',    avatar:'https://i.pravatar.cc/150?img=24', points:107, rank:17},
  { id:'u18', name:'سمر خالد',    avatar:'https://i.pravatar.cc/150?img=25', points:94,  rank:18},
  { id:'u19', name:'باسم عمر',    avatar:'https://i.pravatar.cc/150?img=26', points:81,  rank:19},
  { id:'u20', name:'نور إبراهيم', avatar:'https://i.pravatar.cc/150?img=27', points:68,  rank:20},
];

const MY_RANK    = 3;
const LEADER_PTS = 347;
const MY_PTS     = 309;
const GAP        = LEADER_PTS - MY_PTS;
const IS_NEAR_WIN = MY_RANK <= 5 && GAP <= 5;

// ── الميدالية ──
function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={{ fontSize:20 }}>🥇</Text>;
  if (rank === 2) return <Text style={{ fontSize:20 }}>🥈</Text>;
  if (rank === 3) return <Text style={{ fontSize:20 }}>🥉</Text>;
  return (
    <View style={med.circle}>
      <Text style={med.text}>{rank}</Text>
    </View>
  );
}
const med = StyleSheet.create({
  circle: {
    width:32, height:32, borderRadius:16,
    backgroundColor: Colors.surfaceElevated,
    alignItems:'center', justifyContent:'center',
    borderWidth:1, borderColor: Colors.border,
  },
  text: { color: Colors.textSecondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
});

// ── Near Win Banner ──
function NearWinBanner() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue:1.015, duration:800, useNativeDriver:true }),
        Animated.timing(pulse, { toValue:1,     duration:800, useNativeDriver:true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[nw.wrap, { transform:[{ scale: pulse }] }]}>
      <LinearGradient
        colors={['rgba(255,215,0,0.2)','rgba(255,107,44,0.1)']}
        style={StyleSheet.absoluteFill}
        start={{ x:0, y:0 }} end={{ x:1, y:0 }}
      />
      <Ionicons name="flash" size={18} color={Colors.gold} />
      <View style={{ flex:1 }}>
        <Text style={nw.title}>أنت قريب جداً من المركز الأول! 🔥</Text>
        <Text style={nw.sub}>فرق {GAP} نقاط فقط — استمر!</Text>
      </View>
      <Text style={nw.rank}>#{MY_RANK}</Text>
    </Animated.View>
  );
}
const nw = StyleSheet.create({
  wrap: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    borderRadius: Radius.lg, overflow:'hidden',
    flexDirection:'row', alignItems:'center', gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth:1, borderColor:'rgba(255,215,0,0.35)',
  },
  title: { color: Colors.gold, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  sub:   { color: Colors.textSecondary, fontSize: Typography.sizes.xs },
  rank:  { color: Colors.gold, fontSize: Typography.sizes.xl, fontWeight: Typography.weights.extrabold },
});

// ── Top 3 Podium ──
function Podium({ leaders }: { leaders: LeaderUser[] }) {
  const top3 = leaders.slice(0,3);
  const order = [top3[1], top3[0], top3[2]]; // ترتيب المنصة: 2-1-3
  const heights = [100, 130, 85];
  const sizes   = [44, 56, 40];

  return (
    <View style={pd.wrap}>
      {order.map((u, i) => (
        <View key={u.id} style={pd.col}>
          {/* شارة */}
          {u.badge && <Text style={pd.badge}>{u.badge}</Text>}
          <Avatar uri={u.avatar} name={u.name} size={sizes[i]} />
          <Text style={pd.name} numberOfLines={1}>{u.name}</Text>
          <Text style={pd.pts}>{u.points} نقطة</Text>
          {/* منصة */}
          <LinearGradient
            colors={
              u.rank===1 ? ['#FFD700','#FFA500']
              : u.rank===2 ? ['#C0C0C0','#A0A0A0']
              : ['#CD7F32','#A0522D']
            }
            style={[pd.podium, { height: heights[i] }]}
          >
            <Text style={pd.podiumRank}>#{u.rank}</Text>
          </LinearGradient>
        </View>
      ))}
    </View>
  );
}
const pd = StyleSheet.create({
  wrap: {
    flexDirection:'row', alignItems:'flex-end',
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  col:    { flex:1, alignItems:'center', gap:4 },
  badge:  { fontSize:18 },
  name:   { color:'#fff', fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold, textAlign:'center' },
  pts:    { color: Colors.textSecondary, fontSize: 10 },
  podium: { width:'100%', borderTopLeftRadius: Radius.sm, borderTopRightRadius: Radius.sm, alignItems:'center', justifyContent:'center' },
  podiumRank: { color:'#fff', fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extrabold },
});

// ── Row ──
function LeaderRow({ user, isMe }: { user: LeaderUser; isMe: boolean }) {
  return (
    <View style={[lr.row, isMe && lr.rowMe]}>
      {isMe && <LinearGradient colors={['rgba(255,107,44,0.15)','transparent']} style={StyleSheet.absoluteFill} />}
      <RankMedal rank={user.rank} />
      <Avatar uri={user.avatar} name={user.name} size={38} />
      <View style={{ flex:1 }}>
        <Text style={[lr.name, isMe && lr.nameMe]}>
          {user.name}{isMe ? ' (أنت)' : ''}
        </Text>
        {user.badge && <Text style={lr.badge}>{user.badge}</Text>}
      </View>
      <Text style={[lr.pts, isMe && lr.ptsMe]}>{user.points} نقطة</Text>
    </View>
  );
}
const lr = StyleSheet.create({
  row: {
    flexDirection:'row', alignItems:'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md, marginBottom: 4,
    borderRadius: Radius.md, overflow:'hidden',
    backgroundColor: Colors.surface,
    borderWidth:1, borderColor: Colors.border,
  },
  rowMe:  { borderColor: Colors.primary },
  name:   { color: Colors.textPrimary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  nameMe: { color: Colors.primary },
  badge:  { fontSize: 12 },
  pts:    { color: Colors.textSecondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  ptsMe:  { color: Colors.primary },
});

export default function LeaderboardScreen() {
  const rest = MOCK_LEADERS.slice(3);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: Colors.background }} edges={['top']}>

      {/* AppBar */}
      <View style={lb.appBar}>
        <Text style={lb.appBarTitle}>المتصدرون</Text>
        <View style={lb.weekBadge}>
          <Ionicons name="calendar-outline" size={12} color={Colors.primary} />
          <Text style={lb.weekText}>هذا الأسبوع</Text>
        </View>
      </View>

      <FlatList
        data={rest}
        keyExtractor={u => u.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Near Win */}
            {IS_NEAR_WIN && <NearWinBanner />}

            {/* Podium */}
            <Podium leaders={MOCK_LEADERS} />

            {/* Divider */}
            <View style={lb.divider}>
              <Text style={lb.dividerText}>المراكز 4–20</Text>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <LeaderRow user={item} isMe={item.id === 'me'} />
        )}
        ListFooterComponent={() => (
          /* المستخدم الحالي — دائماً في الأسفل */
          <View style={lb.stickyMe}>
            <LinearGradient
              colors={[Colors.background, Colors.surface]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={lb.stickyLabel}>موقعك</Text>
            <LeaderRow
              user={MOCK_LEADERS.find(u => u.id === 'me')!}
              isMe
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const lb = StyleSheet.create({
  appBar: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth:1, borderBottomColor: Colors.border,
  },
  appBarTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  weekBadge: {
    flexDirection:'row', alignItems:'center', gap:4,
    backgroundColor: 'rgba(255,107,44,0.15)',
    paddingHorizontal: Spacing.sm, paddingVertical:4,
    borderRadius: Radius.full,
  },
  weekText:  { color: Colors.primary, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  divider: {
    marginHorizontal: Spacing.md, marginVertical: Spacing.sm,
    borderBottomWidth:1, borderBottomColor: Colors.border,
    alignItems:'center', paddingBottom: Spacing.xs,
  },
  dividerText: { color: Colors.textMuted, fontSize: Typography.sizes.xs },
  stickyMe: {
    overflow:'hidden', paddingTop: Spacing.xs,
    borderTopWidth:1, borderTopColor: Colors.border,
    marginTop: Spacing.sm,
  },
  stickyLabel: {
    color: Colors.primary, fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    textAlign:'center', marginBottom:4,
  },
});
