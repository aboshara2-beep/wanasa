import React, {
  useRef, useCallback, useState, useEffect,
} from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Dimensions, ViewToken,
  StatusBar, Animated, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import { useFeedStore } from '../../src/features/feed/store';
import { useAuthStore } from '../../src/store/authStore';
import { Avatar } from '../../src/components/ui/Avatar';
import { CountdownTimer } from '../../src/components/ui/CountdownTimer';
import { Video } from '../../src/types';

const { height, width } = Dimensions.get('window');

const MOCK_VIDEOS: Video[] = Array.from({ length: 10 }, (_, i) => ({
  id:          `v${i}`,
  userId:      `u${i}`,
  user: {
    id:       `u${i}`,
    name:     ['سارة محمد', 'أحمد علي', 'فاطمة حسن', 'خالد عمر', 'منى سعيد'][i % 5],
    username: ['sara_m', 'ahmed_x', 'fatma_h', 'khaled_o', 'mona_s'][i % 5],
    avatar:   `https://i.pravatar.cc/150?img=${i + 1}`,
  },
  url:         '',
  thumbnail:   '',
  title: [
    'أحلى تحدي الرقص! 🔥 #تحدي_اليوم',
    'ردة فعلي على التحدي 😂',
    'شاركت وفزت! 🏆',
    'جربت التحدي ده 😅',
    'لازم تشوف ده! 👀 #ونسة',
  ][i % 5],
  likes:    [33, 1200, 540, 87, 320][i % 5],
  votes:    [291, 87, 412, 156, 234][i % 5],
  comments: [46, 23, 91, 12, 67][i % 5],
  saves:    [12, 8, 34, 5, 19][i % 5],
  views:    [4800, 12300, 7600, 2100, 9400][i % 5],
  isLiked:     i === 1,
  isVoted:     false,
  isSaved:     false,
  isWinner:    i === 0,
  isSponsored: i === 3,
  feedType:    'for_you',
  duration:    [15, 30, 45, 60, 22][i % 5],
  createdAt:   new Date().toISOString(),
}));

const NEAR_WIN = { active: true, rank: 2, gapVotes: 3 };

// ─────────────────────────────────────────
// ❤️ Heart Burst — Animated API فقط
// ─────────────────────────────────────────
function HeartBurst({ visible }: { visible: boolean }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      opacity.setValue(1);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1.4, damping: 8, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1,   duration: 100, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1,   duration: 300, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.heartBurst, { opacity, transform: [{ scale }] }]}
      pointerEvents="none"
    >
      <Ionicons name="heart" size={90} color={Colors.error} />
    </Animated.View>
  );
}

// ─────────────────────────────────────────
// ⭐ Near Win Pulse — Animated.loop
// ─────────────────────────────────────────
function NearWinBanner() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.nearWinWrapper, { transform: [{ scale: pulse }] }]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['rgba(255,215,0,0.25)', 'rgba(255,215,0,0.08)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      />
      <Ionicons name="trophy" size={16} color={Colors.gold} />
      <Text style={styles.nearWinText}>
        أنت في المركز #{NEAR_WIN.rank}… باقي {NEAR_WIN.gapVotes} أصوات 🔥
      </Text>
    </Animated.View>
  );
}

// ─────────────────────────────────────────
// 🃏 Challenge Card
// ─────────────────────────────────────────
function FloatingChallengeCard({
  topInset,
  scrollY,
}: {
  topInset: number;
  scrollY:  Animated.Value;
}) {
  const todayMidnight = (() => {
    const d = new Date();
    d.setHours(23, 59, 59, 0);
    return d.toISOString();
  })();

  const [votesLeft] = useState(3);

  const opacity = scrollY.interpolate({
    inputRange: [0, height * 0.25], outputRange: [1, 0], extrapolate: 'clamp',
  });
  const translateY = scrollY.interpolate({
    inputRange: [0, height * 0.25], outputRange: [0, -24], extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.challengeFloat, { top: topInset + 58, opacity, transform: [{ translateY }] }]}>
      <View style={styles.challengeGlass}>
        <LinearGradient
          colors={['rgba(255,107,44,0.22)', 'rgba(0,0,0,0.65)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.challengeHeader}>
          <View style={styles.challengeTitleRow}>
            <Ionicons name="flame" size={14} color={Colors.primary} />
            <Text style={styles.challengeLabel}>تحدي اليوم</Text>
          </View>
          <View style={styles.votesLeftPill}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
            <Text style={styles.votesLeftText}>{votesLeft}/5 أصوات</Text>
          </View>
        </View>

        <Text style={styles.challengeTitle} numberOfLines={1}>
          ارقص على أغنيتك المفضلة 🎵
        </Text>

        <View style={styles.challengeFooter}>
          <CountdownTimer endsAt={todayMidnight} />
          <TouchableOpacity
            style={styles.challengeBtn}
            activeOpacity={0.85}
            onPress={() => router.push({
              pathname: '/upload',
              params: { challengeId: 'challenge_today', challengeTitle: 'ارقص على أغنيتك المفضلة', fromChallenge: '1' },
            })}
          >
            <Ionicons name="videocam" size={13} color="#fff" />
            <Text style={styles.challengeBtnText}>شارك</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────
// 🎮 Action Button — نبضة بـ Animated
// ─────────────────────────────────────────
function ActionBtn({
  icon, iconActive, label, count,
  active, onPress, activeColor,
}: {
  icon: string; iconActive: string; label: string;
  count: number; active: boolean;
  onPress: () => void; activeColor?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.8, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  };

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000    ? `${(n / 1000).toFixed(1)}k`
    : String(n);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 14, right: 14 }}
    >
      <Animated.View style={[styles.actionBtn, { transform: [{ scale }] }]}>
        <Ionicons
          name={(active ? iconActive : icon) as any}
          size={32}
          color={active ? (activeColor ?? Colors.primary) : '#fff'}
        />
        <Text style={[styles.actionCount, active && { color: activeColor ?? Colors.primary }]}>
          {fmt(count)}
        </Text>
        <Text style={styles.actionLabel}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// 🎬 Video Item — إيماءات بـ TouchableOpacity فقط
// ─────────────────────────────────────────
function VideoItem({ video, isActive }: { video: Video; isActive: boolean }) {
  const likeVideo = useFeedStore((s) => s.likeVideo);
  const voteVideo = useFeedStore((s) => s.voteVideo);
  const saveVideo = useFeedStore((s) => s.saveVideo);

  const [showHeart,  setShowHeart]  = useState(false);
  const [isPaused,   setIsPaused]   = useState(false);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);

  const lastTap    = useRef(0);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isActive) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  // نقر مزدوج يدوي
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // double tap
      likeVideo(video.id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
    lastTap.current = now;
  };

  // ضغط مطول
  const handlePressIn  = () => {
    pressTimer.current = setTimeout(() => setIsPaused(true), 300);
  };
  const handlePressOut = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setIsPaused(false);
  };

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000    ? `${(n / 1000).toFixed(1)}k`
    : String(n);

  const BG: [string, string, string][] = [
    ['#1a1a2e', '#16213e', '#0f2460'],
    ['#0d1b2a', '#1b2838', '#0a3d62'],
    ['#1a0a00', '#2d1500', '#0f0800'],
    ['#0a1628', '#0d2137', '#051020'],
    ['#111111', '#1a1a1a', '#0a0a0a'],
  ];
  const bgIdx = parseInt(video.id.replace('v', '')) % 5;

  return (
    <TouchableOpacity
      style={styles.videoItem}
      activeOpacity={1}
      onPress={handleTap}
      onLongPress={() => setIsPaused(true)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={300}
    >
      <LinearGradient colors={BG[bgIdx]} style={StyleSheet.absoluteFill} />

      {/* Loading */}
      {isLoading && isActive && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Pause */}
      {isPaused && (
        <View style={styles.pauseOverlay} pointerEvents="none">
          <Ionicons name="pause" size={60} color="rgba(255,255,255,0.8)" />
        </View>
      )}

      {/* Winner */}
      {video.isWinner && (
        <>
          <View style={styles.winnerBorder} pointerEvents="none" />
          <View style={styles.winnerBadge}>
            <Text style={styles.winnerCrown}>👑</Text>
            <Text style={styles.winnerText}>فائز اليوم</Text>
          </View>
        </>
      )}

      {/* Sponsored */}
      {video.isSponsored && (
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>ممول</Text>
        </View>
      )}

      {/* Views */}
      {!video.isSponsored && (
        <View style={styles.viewsBadge}>
          <Ionicons name="eye-outline" size={13} color="rgba(255,255,255,0.85)" />
          <Text style={styles.viewsText}>{fmt(video.views)}</Text>
        </View>
      )}

      {/* Near Win */}
      {NEAR_WIN.active && video.isWinner && <NearWinBanner />}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.92)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Actions */}
      <View style={styles.actionsCol}>
        <ActionBtn
          icon="heart-outline" iconActive="heart"
          label="إعجاب" count={video.likes} active={video.isLiked}
          onPress={() => likeVideo(video.id)} activeColor="#00B4D8"
        />
        <ActionBtn
          icon="checkmark-circle-outline" iconActive="checkmark-circle"
          label="تصويت" count={video.votes} active={video.isVoted}
          onPress={() => voteVideo(video.id)} activeColor={Colors.primary}
        />
        <ActionBtn
          icon="chatbubble-outline" iconActive="chatbubble"
          label="تعليق" count={video.comments} active={false}
          onPress={() => {}}
        />
        <ActionBtn
          icon="bookmark-outline" iconActive="bookmark"
          label="حفظ" count={video.saves} active={video.isSaved}
          onPress={() => saveVideo(video.id)} activeColor={Colors.primary}
        />
        <TouchableOpacity
          onPress={() => setIsFollowed(!isFollowed)}
          hitSlop={{ top: 10, bottom: 10, left: 14, right: 14 }}
        >
          <View style={styles.actionBtn}>
            <Ionicons
              name={isFollowed ? 'person-check' : 'person-add-outline'}
              size={28}
              color={isFollowed ? Colors.primary : '#fff'}
            />
            <Text style={styles.actionLabel}>{isFollowed ? 'متابَع' : 'متابعة'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 14, right: 14 }}>
          <View style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={28} color="#fff" />
            <Text style={styles.actionLabel}>مشاركة</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.userRow}>
          <Avatar uri={video.user.avatar} name={video.user.name} size={42} />
          <View style={styles.userTexts}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{video.user.name}</Text>
              <Ionicons name="checkmark-circle" size={15} color="#1D9BF0" />
            </View>
            <Text style={styles.userHandle}>@{video.user.username}</Text>
          </View>
        </View>
        <Text style={styles.caption} numberOfLines={2}>{video.title}</Text>
        {video.isWinner && (
          <View style={styles.challengeLink}>
            <Ionicons name="trophy" size={13} color={Colors.gold} />
            <Text style={styles.challengeLinkText}>تحدي: ارقص على أغنيتك المفضلة</Text>
          </View>
        )}
      </View>

      <HeartBurst visible={showHeart} />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// 🔝 AppBar
// ─────────────────────────────────────────
function AppBar({ topInset }: { topInset: number }) {
  const user = useAuthStore((s) => s.user);
  return (
    <View style={[styles.appBar, { paddingTop: topInset + 8 }]}>
      <Text style={styles.appBarLogo}>وَنَسَة</Text>
      <View style={styles.appBarRight}>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notifWrapper}
          onPress={() => router.push('/(tabs)/notifications')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={styles.notifBadge}>
            <Text style={styles.notifBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
        <Avatar uri={user?.avatar} name={user?.name} size={32} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// 🏠 Home Screen
// ─────────────────────────────────────────
export default function HomeScreen() {
  const insets  = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 75 });

  const onViewableChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
    }, []
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Animated.FlatList
        data={MOCK_VIDEOS}
        keyExtractor={(v) => v.id}
        renderItem={({ item, index }) => (
          <VideoItem video={item} isActive={index === activeIndex} />
        )}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableChanged}
        viewabilityConfig={viewConfig.current}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: height, offset: height * index, index,
        })}
      />

      <AppBar topInset={insets.top} />
      <FloatingChallengeCard topInset={insets.top} scrollY={scrollY} />
    </View>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  appBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  appBarLogo: {
    fontSize: Typography.sizes.xl, fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  notifWrapper: { position: 'relative' },
  notifBadge: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#000',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: Typography.weights.bold },

  challengeFloat: { position: 'absolute', left: Spacing.md, right: Spacing.md, zIndex: 20 },
  challengeGlass: {
    borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,107,44,0.35)',
    padding: Spacing.sm, gap: 6, backgroundColor: 'rgba(0,0,0,0.38)',
  },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  challengeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  challengeLabel: {
    color: Colors.primary, fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold, letterSpacing: 0.5,
  },
  votesLeftPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,107,44,0.18)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  votesLeftText: { color: Colors.primary, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  challengeTitle: {
    color: '#fff', fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold,
  },
  challengeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  challengeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full,
  },
  challengeBtnText: { color: '#fff', fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },

  videoItem: { width, height, overflow: 'hidden' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 8,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 8,
  },

  winnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3, borderColor: Colors.gold, zIndex: 2,
  },
  winnerBadge: {
    position: 'absolute', top: 110, left: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: Spacing.sm, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.gold, zIndex: 5,
  },
  winnerCrown: { fontSize: 14 },
  winnerText: { color: Colors.gold, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },

  sponsoredBadge: {
    position: 'absolute', top: 110, right: Spacing.md,
    backgroundColor: 'rgba(255,107,44,0.85)',
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full, zIndex: 5,
  },
  sponsoredText: { color: '#fff', fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },

  viewsBadge: {
    position: 'absolute', top: 110, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full, zIndex: 5,
  },
  viewsText: { color: 'rgba(255,255,255,0.9)', fontSize: Typography.sizes.xs },

  nearWinWrapper: {
    position: 'absolute', bottom: 175, left: Spacing.md, right: 85,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    borderRadius: Radius.md, overflow: 'hidden',
    paddingHorizontal: Spacing.sm, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)', zIndex: 10,
  },
  nearWinText: {
    color: Colors.gold, fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold, flex: 1,
  },

  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.52,
  },

  actionsCol: {
    position: 'absolute', right: Spacing.md, bottom: 110,
    gap: Spacing.lg, alignItems: 'center', zIndex: 10,
  },
  actionBtn:   { alignItems: 'center', gap: 2 },
  actionCount: {
    color: '#fff', fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold,
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  actionLabel: {
    color: 'rgba(255,255,255,0.78)', fontSize: 10, fontWeight: Typography.weights.medium,
  },

  userInfo: {
    position: 'absolute', bottom: 95, left: Spacing.md, right: 85,
    gap: Spacing.xs, zIndex: 10,
  },
  userRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  userTexts:   { flex: 1, gap: 2 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userName: {
    color: '#fff', fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold,
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  userHandle: { color: 'rgba(255,255,255,0.6)', fontSize: Typography.sizes.xs },
  caption: {
    color: 'rgba(255,255,255,0.92)', fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium, lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  challengeLink: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  challengeLinkText: { color: Colors.gold, fontSize: 10, fontWeight: Typography.weights.bold },

  heartBurst: {
    position: 'absolute',
    top: height / 2 - 45, left: width / 2 - 45, zIndex: 50,
  },
});
