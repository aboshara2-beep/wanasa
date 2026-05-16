import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, StatusBar, FlatList, Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient }        from 'expo-linear-gradient';
import { Ionicons }              from '@expo/vector-icons';
import { useSafeAreaInsets }     from 'react-native-safe-area-context';
import { router }                from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAuthStore }          from '../../src/features/auth/store';
import { useFeedStore }          from '../../src/features/feed/store';
import { useFeed }               from '../../src/shared/hooks/useFeed';
import { Avatar }                from '../../src/components/ui/Avatar';
import { CountdownTimer }        from '../../src/components/ui/CountdownTimer';
import type { Video }            from '../../src/features/feed/store';

type IName = React.ComponentProps<typeof Ionicons>['name'];
const { height: H, width: W } = Dimensions.get('window');
const C = {
  primary:'#FF6B2C', primaryLight:'#FF8F5E', gold:'#FFD700',
  success:'#22C55E',
};

// ── VideoCard ──
function VideoCard({ url, isActive }: { url:string; isActive:boolean }) {
  const player = useVideoPlayer(url||'', p => { p.loop=true; p.muted=false; });
  useEffect(() => {
    if (url) { if (isActive) player.play(); else player.pause(); }
    return () => { player.pause(); };
  }, [isActive, url]);

  if (!url) return <LinearGradient colors={['#1a1a2e','#16213e']} style={StyleSheet.absoluteFill}/>;
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false}/>;
}

// ── Action Button ──
function ActionBtn({ icon, iconActive, count, active, onPress, color='#FF6B2C', label }: {
  icon:IName; iconActive:IName; count:number; active:boolean;
  onPress:()=>void; color?:string; label:string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue:1.35, useNativeDriver:true, speed:50 }),
      Animated.spring(scale, { toValue:1,    useNativeDriver:true, speed:20 }),
    ]).start();
    onPress();
  };

  const fmt = (n:number) =>
    n>=1_000_000 ? `${(n/1_000_000).toFixed(1)}M`
    : n>=1000    ? `${(n/1000).toFixed(1)}k`
    : String(n||0);

  return (
    <TouchableOpacity onPress={press} activeOpacity={1}
      hitSlop={{top:10,bottom:10,left:12,right:12}}>
      <Animated.View style={[ab.wrap, { transform:[{ scale }] }]}>
        <View style={[ab.glass, active && { backgroundColor:`${color}22` }]}>
          <Ionicons
            name={active ? iconActive : icon}
            size={28}
            color={active ? color : 'rgba(255,255,255,0.9)'}
          />
        </View>
        <Text style={[ab.count, active && { color }]}>{fmt(count)}</Text>
        <Text style={ab.label}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const ab = StyleSheet.create({
  wrap:  { alignItems:'center', gap:2 },
  glass: {
    width:52, height:52, borderRadius:26,
    backgroundColor:'rgba(0,0,0,0.45)',
    alignItems:'center', justifyContent:'center',
    borderWidth:1, borderColor:'rgba(255,255,255,0.12)',
    shadowColor:'#000', shadowOffset:{width:0,height:4},
    shadowOpacity:0.4, shadowRadius:8, elevation:8,
  },
  count: {
    color:'rgba(255,255,255,0.9)', fontSize:11, fontWeight:'700',
    textShadowColor:'rgba(0,0,0,0.9)',
    textShadowOffset:{width:0,height:1}, textShadowRadius:4,
  },
  label: { color:'rgba(255,255,255,0.45)', fontSize:9 },
});

// ── LimitModal ──
function LimitModal({ visible, type, onClose }: {
  visible:boolean; type:'votes'|'suggestions'; onClose:()=>void;
}) {
  const scale   = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale,   { toValue:1, useNativeDriver:true, damping:15, stiffness:180 }),
        Animated.timing(opacity, { toValue:1, duration:180,          useNativeDriver:true }),
      ]).start();
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible]);

  const tomorrow = new Date(); tomorrow.setHours(23,59,59,0);
  const isVotes  = type==='votes';

  if (!visible) return null;

  return (
    <View style={lm.backdrop}>
      <Animated.View style={[lm.card, { transform:[{scale}], opacity }]}>
        <LinearGradient
          colors={isVotes ? ['rgba(255,107,44,0.2)','rgba(0,0,0,0.97)'] : ['rgba(168,85,247,0.2)','rgba(0,0,0,0.97)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[lm.iconWrap, { backgroundColor: isVotes?'rgba(255,107,44,0.2)':'rgba(168,85,247,0.2)' }]}>
          <Text style={{ fontSize:42 }}>{isVotes?'🗳️':'💡'}</Text>
        </View>
        <Text style={lm.title}>{isVotes?'انتهت أصواتك اليوم!':'انتهت اقتراحاتك اليوم!'}</Text>
        <Text style={lm.body}>{isVotes?'استخدمت أصواتك الـ 5.\nعود غداً! 🌅':'استخدمت اقتراحاتك الـ 3.\nعود غداً! 🌅'}</Text>
        <View style={lm.timerRow}>
          <Text style={lm.timerLabel}>يتجدد بعد</Text>
          <CountdownTimer endsAt={tomorrow.toISOString()} />
        </View>
        <TouchableOpacity style={lm.btn} onPress={onClose} activeOpacity={0.85}>
          <LinearGradient
            colors={isVotes ? ['#FF8F5E','#FF6B2C'] : ['#A855F7','#7C3AED']}
            style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:0}}
          />
          <Text style={lm.btnText}>حسناً 👍</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const lm = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.82)', alignItems:'center', justifyContent:'center', padding:32, zIndex:100 },
  card:     { width:'100%', borderRadius:24, overflow:'hidden', padding:32, gap:16, alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', backgroundColor:'rgba(12,12,12,0.99)' },
  iconWrap: { width:88, height:88, borderRadius:44, alignItems:'center', justifyContent:'center' },
  title:    { color:'#fff', fontSize:22, fontWeight:'800', textAlign:'center' },
  body:     { color:'rgba(255,255,255,0.65)', fontSize:15, textAlign:'center', lineHeight:24 },
  timerRow: { alignItems:'center', gap:4 },
  timerLabel:{ color:'rgba(255,255,255,0.35)', fontSize:11 },
  btn:      { width:'100%', height:52, borderRadius:14, overflow:'hidden', alignItems:'center', justifyContent:'center' },
  btnText:  { color:'#fff', fontSize:17, fontWeight:'700' },
});

// ── VideoItem ──
function VideoItem({ video, isActive, onLimit }: {
  video:Video; isActive:boolean; onLimit:(t:'votes'|'suggestions')=>void;
}) {
  const likeVideo = useFeedStore(s => s.likeVideo);
  const voteVideo = useFeedStore(s => s.voteVideo);
  const saveVideo = useFeedStore(s => s.saveVideo);
  const [followed,  setFollowed]  = useState(false);
  const [votesUsed, setVotesUsed] = useState(0);
  const lastTap    = useRef(0);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity=useRef(new Animated.Value(0)).current;
  const [heartPos, setHeartPos] = useState({ x:0, y:0 });

  const handleTap = (e:any) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const { locationX, locationY } = e.nativeEvent;
      setHeartPos({ x:locationX-45, y:locationY-45 });
      heartScale.setValue(0);
      heartOpacity.setValue(1);
      Animated.parallel([
        Animated.spring(heartScale,   { toValue:1.4, useNativeDriver:true, damping:8 }),
        Animated.sequence([
          Animated.timing(heartOpacity, { toValue:1,   duration:100, useNativeDriver:true }),
          Animated.timing(heartOpacity, { toValue:1,   duration:300, useNativeDriver:true }),
          Animated.timing(heartOpacity, { toValue:0,   duration:300, useNativeDriver:true }),
        ]),
      ]).start();
      likeVideo(video.id);
    }
    lastTap.current = now;
  };

  const handleVote = () => {
    if (votesUsed >= 5) { onLimit('votes'); return; }
    setVotesUsed(v=>v+1);
    voteVideo(video.id);
  };

  return (
    <View style={vi.container}>
      <VideoCard url={video.url??''} isActive={isActive} />

      {video.isWinner && <View style={vi.winnerBorder} pointerEvents="none" />}

      <LinearGradient colors={['rgba(0,0,0,0.5)','transparent']} style={vi.topGrad} pointerEvents="none"/>
      <LinearGradient colors={['transparent','rgba(0,0,0,0.3)','rgba(0,0,0,0.95)']} style={vi.bottomGrad} pointerEvents="none"/>

      {/* Double tap zone */}
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleTap} activeOpacity={1}>
        <Animated.View style={[vi.heartBurst, { left:heartPos.x, top:heartPos.y, transform:[{scale:heartScale}], opacity:heartOpacity }]} pointerEvents="none">
          <Ionicons name="heart" size={90} color="#FF3B6B" />
        </Animated.View>
      </TouchableOpacity>

      {/* Badges */}
      <View style={vi.topRow} pointerEvents="none">
        {video.isWinner && <View style={vi.badge}><Text style={vi.badgeText}>👑 فائز اليوم</Text></View>}
        {video.isSponsored && <View style={[vi.badge,{borderColor:'rgba(255,107,44,0.5)'}]}><Text style={vi.badgeText}>ممول</Text></View>}
        <View style={vi.viewsBadge}>
          <Ionicons name="eye-outline" size={11} color="rgba(255,255,255,0.8)"/>
          <Text style={vi.viewsText}>{(video.views??0)>=1000?`${((video.views??0)/1000).toFixed(1)}k`:String(video.views??0)}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={vi.actionsCol}>
        <View style={{ position:'relative' }}>
          <Avatar uri={video.userAvatar??''} name={video.userName??''} size={48}/>
          <TouchableOpacity
            style={[vi.followBtn, followed && vi.followBtnOn]}
            onPress={() => setFollowed(f=>!f)}
          >
            <Ionicons name={followed?'checkmark':'add'} size={12} color={followed?C.primary:'#fff'}/>
          </TouchableOpacity>
        </View>
        <ActionBtn icon="heart-outline"            iconActive="heart"              label="إعجاب" count={video.likes??0}    active={video.isLiked} onPress={()=>likeVideo(video.id)} color="#FF3B6B"/>
        <ActionBtn icon="checkmark-circle-outline" iconActive="checkmark-circle"  label="تصويت" count={video.votes??0}    active={video.isVoted} onPress={handleVote}              color={C.primary}/>
        <ActionBtn icon="chatbubble-outline"       iconActive="chatbubble"         label="تعليق" count={video.comments??0} active={false}         onPress={()=>{}}/>
        <ActionBtn icon="bookmark-outline"         iconActive="bookmark"           label="حفظ"   count={video.saves??0}   active={video.isSaved} onPress={()=>saveVideo(video.id)} color={C.primary}/>
        <ActionBtn icon="share-social-outline"     iconActive="share-social"       label="مشاركة"count={0}                active={false}         onPress={()=>{}}/>
      </View>

      {/* Info */}
      <View style={vi.infoBottom}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
          <Text style={vi.userName}>{video.userName??'مستخدم'}</Text>
          <Ionicons name="checkmark-circle" size={14} color="#1D9BF0"/>
        </View>
        <Text style={vi.caption} numberOfLines={2}>{video.title??''}</Text>
        {video.isWinner && (
          <View style={vi.chip}>
            <Ionicons name="trophy" size={11} color={C.gold}/>
            <Text style={vi.chipText}>تحدي اليوم</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const vi = StyleSheet.create({
  container:   { width:W, height:H },
  topGrad:     { position:'absolute', top:0, left:0, right:0, height:H*0.25 },
  bottomGrad:  { position:'absolute', bottom:0, left:0, right:0, height:H*0.55 },
  winnerBorder:{ ...StyleSheet.absoluteFillObject, borderWidth:2.5, borderColor:'#FFD700', opacity:0.8, zIndex:2 },
  heartBurst:  { position:'absolute', width:90, height:90, alignItems:'center', justifyContent:'center', zIndex:50 },
  topRow:      { position:'absolute', top:108, left:16, right:16, flexDirection:'row', alignItems:'center', gap:8 },
  badge:       { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(0,0,0,0.65)', paddingHorizontal:8, paddingVertical:4, borderRadius:999, borderWidth:1, borderColor:'rgba(255,215,0,0.4)' },
  badgeText:   { fontSize:10, fontWeight:'700', color:'#fff' },
  viewsBadge:  { flexDirection:'row', alignItems:'center', gap:3, marginLeft:'auto' as any, backgroundColor:'rgba(0,0,0,0.55)', paddingHorizontal:8, paddingVertical:3, borderRadius:999 },
  viewsText:   { fontSize:10, color:'rgba(255,255,255,0.9)' },
  actionsCol:  { position:'absolute', right:12, bottom:110, alignItems:'center', gap:20, zIndex:10 },
  followBtn:   { position:'absolute', bottom:-8, left:12, width:22, height:22, borderRadius:11, backgroundColor:'#FF6B2C', alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'#000' },
  followBtnOn: { backgroundColor:'#000', borderColor:'#FF6B2C' },
  infoBottom:  { position:'absolute', bottom:95, left:16, right:82, gap:4, zIndex:10 },
  userName:    { fontSize:13, fontWeight:'700', color:'#fff', textShadowColor:'rgba(0,0,0,0.9)', textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  caption:     { fontSize:14, color:'rgba(255,255,255,0.9)', lineHeight:20, textShadowColor:'rgba(0,0,0,0.9)', textShadowOffset:{width:0,height:1}, textShadowRadius:4 },
  chip:        { flexDirection:'row', alignItems:'center', gap:4, alignSelf:'flex-start', backgroundColor:'rgba(255,215,0,0.15)', paddingHorizontal:8, paddingVertical:3, borderRadius:999, borderWidth:1, borderColor:'rgba(255,215,0,0.3)' },
  chipText:    { fontSize:10, fontWeight:'700', color:'#FFD700' },
});

// ── HomeScreen ──
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [limitModal,  setLimitModal]  = useState<{visible:boolean;type:'votes'|'suggestions'}>({ visible:false, type:'votes' });
  const { videos, isLoading, refresh, loadMore } = useFeed();
  const user = useAuthStore(s => s.user);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold:75 });

  const onViewable = useCallback(({ viewableItems }:any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  return (
    <View style={{ flex:1, backgroundColor:'#000' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content"/>

      {isLoading && videos.length===0 ? (
        <View style={{ flex:1, backgroundColor:'#080808', alignItems:'center', justifyContent:'center' }}>
          <ActivityIndicator size="large" color="#FF6B2C"/>
          <Text style={{ color:'rgba(255,255,255,0.5)', marginTop:16, fontSize:13 }}>جاري تحميل الفيد...</Text>
        </View>
      ) : videos.length===0 ? (
        <View style={{ flex:1, backgroundColor:'#080808', alignItems:'center', justifyContent:'center', gap:16, padding:32 }}>
          <Ionicons name="videocam-outline" size={64} color="#FF6B2C"/>
          <Text style={{ color:'#fff', fontSize:22, fontWeight:'800' }}>ونسة بتنتظرك! 🎬</Text>
          <Text style={{ color:'rgba(255,255,255,0.5)', textAlign:'center', lineHeight:22 }}>
            كن أول من يرفع فيديو اليوم
          </Text>
          <TouchableOpacity
            style={{ backgroundColor:'#FF6B2C', paddingHorizontal:32, paddingVertical:14, borderRadius:14 }}
            onPress={() => router.push('/upload')}
          >
            <Text style={{ color:'#fff', fontSize:16, fontWeight:'700' }}>ارفع فيديو الآن</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={v => v.id}
          renderItem={({ item, index }) => (
            <VideoItem
              video={item} isActive={index===activeIndex}
              onLimit={type => setLimitModal({ visible:true, type })}
            />
          )}
          snapToInterval={H}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={viewConfig.current}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          onRefresh={refresh}
          refreshing={isLoading}
          removeClippedSubviews={false}
        />
      )}

      {/* AppBar */}
      <View style={[{ position:'absolute', top:0, left:0, right:0, zIndex:30, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingBottom:8 }, { paddingTop:insets.top+8 }]}>
        <Text style={{ fontSize:22, fontWeight:'800', color:'#FF6B2C', textShadowColor:'rgba(0,0,0,0.9)', textShadowOffset:{width:0,height:1}, textShadowRadius:6 }}>
          وَنَسَة
        </Text>
        <View style={{ flexDirection:'row', alignItems:'center', gap:16 }}>
          <TouchableOpacity hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <Ionicons name="search-outline" size={22} color="rgba(255,255,255,0.85)"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')} hitSlop={{top:8,bottom:8,left:8,right:8}}>
            <Ionicons name="notifications-outline" size={22} color="rgba(255,255,255,0.85)"/>
          </TouchableOpacity>
          <Avatar uri={user?.avatar??''} name={user?.name??''} size={30}/>
        </View>
      </View>

      {limitModal.visible && (
        <LimitModal
          visible={limitModal.visible} type={limitModal.type}
          onClose={() => setLimitModal(m => ({ ...m, visible:false }))}
        />
      )}
    </View>
  );
}
