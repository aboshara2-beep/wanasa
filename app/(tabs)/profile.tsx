import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList, Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import { Avatar } from '../../src/components/ui/Avatar';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');
const THUMB = (width - Spacing.md * 2 - 4) / 3;

type ProfileTab = 'videos' | 'badges';

interface BadgeItem {
  id: string; icon: string; title: string; desc: string; earned: boolean;
}

const BADGES: BadgeItem[] = [
  { id:'1', icon:'🎬', title:'صانع محتوى',   desc:'نشر فيديوهات',        earned:true  },
  { id:'2', icon:'💡', title:'الملهم',        desc:'اقتراح أفكار',        earned:true  },
  { id:'3', icon:'❤️', title:'المساهم النشط', desc:'التفاعل مع المحتوى',  earned:false },
  { id:'4', icon:'⭐', title:'النجم الأسبوعي',desc:'Top leaderboard',    earned:false },
];

const MOCK_VIDEOS = Array.from({ length:9 }, (_,i) => ({ id:`v${i}`, thumb: i }));

export default function ProfileScreen() {
  const user      = useAuthStore(s => s.user);
  const logout    = useAuthStore(s => s.logout);
  const [tab,     setTab]     = useState<ProfileTab>('videos');
  const [showBlock, setShowBlock] = useState(false);

  const isOwner = true; // صاحب الحساب

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* AppBar */}
        <View style={s.appBar}>
          <Text style={s.appBarTitle}>حسابي</Text>
          <View style={s.appBarActions}>
            <TouchableOpacity hitSlop={{ top:8,bottom:8,left:8,right:8 }}>
              <Ionicons name="settings-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={logout}
              hitSlop={{ top:8,bottom:8,left:8,right:8 }}
            >
              <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Header */}
        <LinearGradient
          colors={['rgba(255,107,44,0.12)','transparent']}
          style={s.header}
        >
          {/* صورة + اسم */}
          <View style={s.avatarRow}>
            <View style={s.avatarWrap}>
              <Avatar uri={user?.avatar} name={user?.name} size={80} isOnline={user?.isOnline} />
              {/* نقاط الـ streak */}
              <View style={s.streakBadge}>
                <Text style={s.streakText}>🔥{user?.streak ?? 5}</Text>
              </View>
            </View>
            <View style={s.headerInfo}>
              <Text style={s.userName}>{user?.name ?? 'محمد أحمد'}</Text>
              <Text style={s.userHandle}>@{user?.username ?? 'mohammed'}</Text>
              {/* نقاط */}
              <View style={s.pointsRow}>
                <Ionicons name="star" size={14} color={Colors.gold} />
                <Text style={s.pointsText}>{user?.points ?? 247} نقطة</Text>
              </View>
            </View>
          </View>

          {/* إحصائيات */}
          <View style={s.statsRow}>
            {[
              { label:'متابِع',   value: user?.stats.followers ?? 340 },
              { label:'متابَع',   value: user?.stats.following ?? 89  },
              { label:'فيديو',    value: user?.stats.videos    ?? 12  },
              { label:'فوز',      value: user?.stats.wins      ?? 3   },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                <View style={s.stat}>
                  <Text style={s.statValue}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
                {i < 3 && <View style={s.statDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Block/Unblock — للمستخدمين الآخرين */}
          {!isOwner && (
            <TouchableOpacity
              style={s.blockBtn}
              onPress={() => setShowBlock(true)}
            >
              <Ionicons name="ban-outline" size={16} color={Colors.error} />
              <Text style={s.blockText}>حظر</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Tabs: الفيديوهات / الشارات */}
        <View style={s.tabsRow}>
          {(['videos','badges'] as ProfileTab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={s.tabBtn}
              onPress={() => setTab(t)}
            >
              <Ionicons
                name={t==='videos' ? 'videocam-outline' : 'ribbon-outline'}
                size={20}
                color={tab===t ? Colors.primary : Colors.textMuted}
              />
              <Text style={[s.tabText, tab===t && s.tabActive]}>
                {t==='videos' ? 'الفيديوهات' : 'الشارات'}
              </Text>
              {tab===t && <View style={s.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* المحتوى */}
        {tab === 'videos' ? (
          <View style={s.videosGrid}>
            {MOCK_VIDEOS.map(v => (
              <TouchableOpacity key={v.id} style={s.thumbWrap} activeOpacity={0.8}>
                <LinearGradient
                  colors={[['#1a1a2e','#16213e'],['#0d1b2a','#1b2838'],['#1a0a00','#2d1500']][v.thumb % 3]}
                  style={s.thumb}
                />
                {v.thumb === 0 && (
                  <View style={s.thumbWinner}>
                    <Text style={{ fontSize:12 }}>👑</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={s.badgesGrid}>
            {BADGES.map(b => (
              <View key={b.id} style={[s.badgeCard, !b.earned && s.badgeCardLocked]}>
                <LinearGradient
                  colors={b.earned
                    ? ['rgba(255,107,44,0.2)','rgba(0,0,0,0)']
                    : ['rgba(255,255,255,0.03)','rgba(0,0,0,0)']
                  }
                  style={StyleSheet.absoluteFill}
                />
                <Text style={s.badgeIcon}>{b.icon}</Text>
                <Text style={[s.badgeTitle, !b.earned && s.badgeLocked]}>{b.title}</Text>
                <Text style={s.badgeDesc}>{b.desc}</Text>
                {!b.earned && (
                  <View style={s.lockedRow}>
                    <Ionicons name="lock-closed" size={11} color={Colors.textMuted} />
                    <Text style={s.lockedText}>غير مكتسبة</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height:100 }} />

      </ScrollView>

      {/* زر + العائم — لصاحب الحساب فقط */}
      {isOwner && (
        <TouchableOpacity
          style={s.fab}
          onPress={() => router.push('/upload')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={s.fabGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Block Modal */}
      <Modal transparent visible={showBlock} animationType="fade" onRequestClose={() => setShowBlock(false)}>
        <TouchableOpacity style={bl.backdrop} onPress={() => setShowBlock(false)} activeOpacity={1} />
        <View style={bl.card}>
          <LinearGradient colors={[Colors.surfaceElevated, Colors.surface]} style={StyleSheet.absoluteFill} />
          <Text style={bl.title}>حظر المستخدم؟</Text>
          <Text style={bl.sub}>لن يتمكن من رؤية محتواك أو التفاعل معك</Text>
          <TouchableOpacity style={bl.blockBtn} onPress={() => setShowBlock(false)}>
            <Text style={bl.blockText}>حظر</Text>
          </TouchableOpacity>
          <TouchableOpacity style={bl.cancelBtn} onPress={() => setShowBlock(false)}>
            <Text style={bl.cancelText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const bl = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.6)' },
  card: {
    position:'absolute', bottom:0, left:0, right:0,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    overflow:'hidden', padding: Spacing.xl, gap: Spacing.md, paddingBottom:40,
    alignItems:'center',
  },
  title:     { color: Colors.textPrimary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  sub:       { color: Colors.textSecondary, fontSize: Typography.sizes.sm, textAlign:'center' },
  blockBtn:  { width:'100%', padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.error, alignItems:'center' },
  blockText: { color:'#fff', fontWeight: Typography.weights.bold },
  cancelBtn: { width:'100%', padding: Spacing.md, borderRadius: Radius.md, borderWidth:1, borderColor: Colors.border, alignItems:'center' },
  cancelText:{ color: Colors.textSecondary },
});

const s = StyleSheet.create({
  container:  { flex:1, backgroundColor: Colors.background },
  appBar: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth:1, borderBottomColor: Colors.border,
  },
  appBarTitle:   { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  appBarActions: { flexDirection:'row', gap: Spacing.md },
  header:     { padding: Spacing.md, gap: Spacing.md },
  avatarRow:  { flexDirection:'row', alignItems:'center', gap: Spacing.md },
  avatarWrap: { position:'relative' },
  streakBadge:{
    position:'absolute', bottom:-4, right:-4,
    backgroundColor: Colors.surface, borderRadius: Radius.full,
    paddingHorizontal:6, paddingVertical:2,
    borderWidth:1, borderColor: Colors.border,
  },
  streakText:  { fontSize:11, fontWeight: Typography.weights.bold },
  headerInfo:  { flex:1, gap:4 },
  userName:    { color: Colors.textPrimary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extrabold },
  userHandle:  { color: Colors.textSecondary, fontSize: Typography.sizes.sm },
  pointsRow:   { flexDirection:'row', alignItems:'center', gap:4 },
  pointsText:  { color: Colors.gold, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  statsRow:    { flexDirection:'row', alignItems:'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth:1, borderColor: Colors.border },
  stat:        { flex:1, alignItems:'center', gap:2 },
  statValue:   { color: Colors.textPrimary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.extrabold },
  statLabel:   { color: Colors.textSecondary, fontSize: Typography.sizes.xs },
  statDivider: { width:1, height:30, backgroundColor: Colors.border },
  blockBtn:    { flexDirection:'row', alignItems:'center', gap:4, alignSelf:'flex-start', padding: Spacing.sm, borderRadius: Radius.full, borderWidth:1, borderColor: Colors.error },
  blockText:   { color: Colors.error, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  tabsRow:     { flexDirection:'row', borderBottomWidth:1, borderBottomColor: Colors.border },
  tabBtn:      { flex:1, alignItems:'center', paddingVertical: Spacing.sm, gap:4, position:'relative' },
  tabText:     { color: Colors.textMuted, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  tabActive:   { color: Colors.primary, fontWeight: Typography.weights.bold },
  tabIndicator:{ position:'absolute', bottom:0, height:2, width:40, backgroundColor: Colors.primary, borderRadius: Radius.full },
  videosGrid:  { flexDirection:'row', flexWrap:'wrap', gap:2, padding: Spacing.md, paddingTop: Spacing.sm },
  thumbWrap:   { width: THUMB, height: THUMB, borderRadius: Radius.sm, overflow:'hidden', position:'relative' },
  thumb:       { width:'100%', height:'100%' },
  thumbWinner: { position:'absolute', top:4, left:4 },
  badgesGrid:  { flexDirection:'row', flexWrap:'wrap', gap: Spacing.sm, padding: Spacing.md },
  badgeCard: {
    width: (width - Spacing.md * 2 - Spacing.sm) / 2,
    borderRadius: Radius.lg, overflow:'hidden',
    padding: Spacing.md, gap:6,
    borderWidth:1, borderColor: Colors.border,
    backgroundColor: Colors.surface, alignItems:'center',
  },
  badgeCardLocked: { opacity:0.6 },
  badgeIcon:    { fontSize:32 },
  badgeTitle:   { color: Colors.textPrimary, fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold },
  badgeLocked:  { color: Colors.textMuted },
  badgeDesc:    { color: Colors.textSecondary, fontSize: Typography.sizes.xs, textAlign:'center' },
  lockedRow:    { flexDirection:'row', alignItems:'center', gap:3 },
  lockedText:   { color: Colors.textMuted, fontSize: 10 },
  fab: { position:'absolute', bottom:90, right: Spacing.md, zIndex:10 },
  fabGradient: {
    width:56, height:56, borderRadius: Radius.full,
    alignItems:'center', justifyContent:'center',
    shadowColor: Colors.primary, shadowOffset:{width:0,height:4},
    shadowOpacity:0.5, shadowRadius:12, elevation:10,
  },
});

// ── Dev Only: Admin Link ──
// احذف هذا في الـ Production
export function AdminLink() {
  return (
    <TouchableOpacity
      style={{ flexDirection:'row', alignItems:'center', gap:8,
        margin:16, padding:12, borderRadius:12,
        backgroundColor:'rgba(255,107,44,0.1)',
        borderWidth:1, borderColor:'rgba(255,107,44,0.3)' }}
      onPress={() => router.push('/admin')}
    >
      <Ionicons name="shield-outline" size={18} color={Colors.primary} />
      <Text style={{ color: Colors.primary, fontWeight:'700' }}>
        لوحة التحكم (Dev)
      </Text>
    </TouchableOpacity>
  );
}

// ── إضافة زر Admin للمستخدمين Admin ──
// ضعه داخل ScrollView قبل </ScrollView>
