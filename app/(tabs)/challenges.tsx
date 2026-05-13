import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Animated,
  Dimensions, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import { Avatar } from '../../src/components/ui/Avatar';
import { CountdownTimer } from '../../src/components/ui/CountdownTimer';

const { height } = Dimensions.get('window');

type Tab = 'all' | 'friends' | 'top';

interface Idea {
  id:        string;
  userId:    string;
  userName:  string;
  avatar:    string;
  title:     string;
  desc?:     string;
  votes:     number;
  isVoted:   boolean;
  isMine:    boolean;
}

const MOCK_IDEAS: Idea[] = [
  { id:'1', userId:'u1', userName:'سارة محمد',  avatar:'https://i.pravatar.cc/150?img=1', title:'تحدي الطبخ السوداني 🍲',      desc:'كل واحد يطبخ أكلة سودانية ويشارك', votes:42, isVoted:false, isMine:false },
  { id:'2', userId:'u2', userName:'أحمد علي',   avatar:'https://i.pravatar.cc/150?img=2', title:'تحدي التقليد 😂',              desc:'قلّد شخصية مشهورة',                 votes:38, isVoted:true,  isMine:false },
  { id:'3', userId:'me', userName:'أنت',         avatar:'https://i.pravatar.cc/150?img=3', title:'تحدي الرسم السريع 🎨',        desc:'ارسم صورة في 60 ثانية',             votes:21, isVoted:false, isMine:true  },
  { id:'4', userId:'u4', userName:'فاطمة حسن',  avatar:'https://i.pravatar.cc/150?img=4', title:'تحدي الغناء بدون موسيقى 🎤',  desc:'',                                   votes:17, isVoted:false, isMine:false },
  { id:'5', userId:'u5', userName:'خالد عمر',   avatar:'https://i.pravatar.cc/150?img=5', title:'تحدي التعليم الممتع 📚',      desc:'علّم شيئاً مفيداً في 30 ثانية',    votes:14, isVoted:false, isMine:false },
];

// ── Sponsored Card ──
function SponsoredCard() {
  return (
    <View style={sp.card}>
      <LinearGradient colors={['#1a0a00','#2d1500']} style={StyleSheet.absoluteFill} />
      <View style={sp.header}>
        <Ionicons name="star" size={14} color={Colors.gold} />
        <Text style={sp.label}>تحدي برعاية</Text>
      </View>
      <Text style={sp.title}>تحدي شركة سودانيز تيك 🏢</Text>
      <Text style={sp.sub}>الاقتراحات مغلقة — هذا التحدي برعاية</Text>
      <View style={sp.lockRow}>
        <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
        <Text style={sp.lockText}>مغلق للاقتراحات</Text>
      </View>
    </View>
  );
}

const sp = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    borderRadius: Radius.lg, overflow: 'hidden',
    padding: Spacing.md, gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  header: { flexDirection:'row', alignItems:'center', gap:4 },
  label:  { color: Colors.gold, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },
  title:  { color: '#fff', fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
  sub:    { color: Colors.textSecondary, fontSize: Typography.sizes.sm },
  lockRow:{ flexDirection:'row', alignItems:'center', gap:4, marginTop:4 },
  lockText:{ color: Colors.textMuted, fontSize: Typography.sizes.xs },
});

// ── Idea Card ──
function IdeaCard({
  idea, onVote, onDelete,
}: {
  idea: Idea;
  onVote:   (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handleVote = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 20 }),
    ]).start();
    onVote(idea.id);
  };

  return (
    <View style={ic.card}>
      <LinearGradient
        colors={['rgba(255,255,255,0.04)','rgba(255,255,255,0.01)']}
        style={StyleSheet.absoluteFill}
      />
      {/* User */}
      <View style={ic.header}>
        <Avatar uri={idea.avatar} name={idea.userName} size={36} />
        <View style={{ flex:1 }}>
          <Text style={ic.name}>{idea.userName}</Text>
          {idea.isMine && (
            <Text style={ic.mineTag}>فكرتك</Text>
          )}
        </View>
        {/* حذف لصاحب الفكرة */}
        {idea.isMine && (
          <TouchableOpacity
            onPress={() => onDelete(idea.id)}
            hitSlop={{ top:8, bottom:8, left:8, right:8 }}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* الفكرة */}
      <Text style={ic.title}>{idea.title}</Text>
      {idea.desc ? <Text style={ic.desc}>{idea.desc}</Text> : null}

      {/* Footer: أصوات + زر */}
      <View style={ic.footer}>
        <View style={ic.votesRow}>
          <Ionicons name="arrow-up" size={14} color={Colors.primary} />
          <Text style={ic.votesCount}>{idea.votes} صوت</Text>
        </View>
        <TouchableOpacity
          onPress={handleVote}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              ic.voteBtn,
              idea.isVoted && ic.voteBtnActive,
              { transform: [{ scale }] },
            ]}
          >
            <Ionicons
              name={idea.isVoted ? 'checkmark-circle' : 'arrow-up-circle-outline'}
              size={18}
              color={idea.isVoted ? '#fff' : Colors.primary}
            />
            <Text style={[ic.voteBtnText, idea.isVoted && { color:'#fff' }]}>
              {idea.isVoted ? 'صوّتَ' : 'صوّت'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ic = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: Radius.lg, overflow:'hidden',
    padding: Spacing.md, gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  header:    { flexDirection:'row', alignItems:'center', gap: Spacing.sm },
  name:      { color: Colors.textPrimary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  mineTag:   { color: Colors.primary, fontSize: 10, fontWeight: Typography.weights.semibold },
  title:     { color: Colors.textPrimary, fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
  desc:      { color: Colors.textSecondary, fontSize: Typography.sizes.sm },
  footer:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  votesRow:  { flexDirection:'row', alignItems:'center', gap:4 },
  votesCount:{ color: Colors.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  voteBtn: {
    flexDirection:'row', alignItems:'center', gap:4,
    borderWidth:1, borderColor: Colors.primary,
    paddingHorizontal: Spacing.sm, paddingVertical:5,
    borderRadius: Radius.full,
  },
  voteBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  voteBtnText:   { color: Colors.primary, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },
});

// ── Bottom Sheet: اقترح فكرة ──
function SuggestSheet({
  visible, onClose, onSubmit, remaining,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, desc: string) => void;
  remaining: number;
}) {
  const [title, setTitle] = useState('');
  const [desc,  setDesc]  = useState('');
  const slideY = useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    Animated.spring(slideY, {
      toValue:         visible ? 0 : height,
      useNativeDriver: true,
      damping:         20,
      stiffness:       200,
    }).start();
  }, [visible]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title.trim(), desc.trim());
    setTitle(''); setDesc('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity style={bs.backdrop} onPress={onClose} activeOpacity={1} />
      <Animated.View style={[bs.sheet, { transform:[{ translateY: slideY }] }]}>
        <LinearGradient colors={[Colors.surfaceElevated, Colors.surface]} style={StyleSheet.absoluteFill} />

        {/* Handle */}
        <View style={bs.handle} />

        <Text style={bs.title}>اقترح فكرة تحدي</Text>
        <Text style={bs.sub}>متبقي {remaining} اقتراح اليوم</Text>

        <TextInput
          style={bs.input}
          value={title}
          onChangeText={setTitle}
          placeholder="عنوان الفكرة *"
          placeholderTextColor={Colors.textMuted}
          maxLength={80}
          textAlign="right"
        />
        <TextInput
          style={[bs.input, bs.inputMulti]}
          value={desc}
          onChangeText={setDesc}
          placeholder="وصف الفكرة (اختياري)"
          placeholderTextColor={Colors.textMuted}
          maxLength={200}
          multiline
          numberOfLines={3}
          textAlign="right"
          textAlignVertical="top"
        />

        <View style={bs.row}>
          <TouchableOpacity style={bs.cancelBtn} onPress={onClose}>
            <Text style={bs.cancelText}>إلغاء</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[bs.submitBtn, !title.trim() && bs.submitDisabled]}
            onPress={handleSubmit}
            disabled={!title.trim()}
          >
            <Text style={bs.submitText}>إرسال +2 نقطة</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const bs = StyleSheet.create({
  backdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.6)' },
  sheet: {
    position:'absolute', bottom:0, left:0, right:0,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    overflow:'hidden', padding: Spacing.lg, gap: Spacing.md,
    paddingBottom: 40,
  },
  handle: {
    width:40, height:4, borderRadius:2,
    backgroundColor: Colors.border,
    alignSelf:'center', marginBottom: Spacing.xs,
  },
  title:  { color: Colors.textPrimary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, textAlign:'center' },
  sub:    { color: Colors.textSecondary, fontSize: Typography.sizes.sm, textAlign:'center' },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth:1, borderColor: Colors.border,
    padding: Spacing.md, color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
  },
  inputMulti: { minHeight:80, textAlignVertical:'top' },
  row: { flexDirection:'row', gap: Spacing.sm },
  cancelBtn: {
    flex:1, padding: Spacing.md, borderRadius: Radius.md,
    borderWidth:1, borderColor: Colors.border, alignItems:'center',
  },
  cancelText: { color: Colors.textSecondary, fontWeight: Typography.weights.medium },
  submitBtn: {
    flex:2, padding: Spacing.md, borderRadius: Radius.md,
    backgroundColor: Colors.primary, alignItems:'center',
  },
  submitDisabled: { opacity:0.4 },
  submitText: { color:'#fff', fontWeight: Typography.weights.bold },
});

// ── Challenges Screen ──
const TABS: { key: Tab; label: string }[] = [
  { key:'all',     label:'الكل' },
  { key:'friends', label:'الأصدقاء' },
  { key:'top',     label:'الأعلى تصويت' },
];

export default function ChallengesScreen() {
  const [activeTab,   setActiveTab]   = useState<Tab>('all');
  const [ideas,       setIdeas]       = useState<Idea[]>(MOCK_IDEAS);
  const [showSheet,   setShowSheet]   = useState(false);
  const [remaining,   setRemaining]   = useState({ suggestions:3, votes:5 });
  const [isSponsored] = useState(false);

  const tomorrow = new Date(Date.now() + 86_400_000).toISOString();

  const displayedIdeas = activeTab === 'top'
    ? [...ideas].sort((a,b) => b.votes - a.votes)
    : activeTab === 'friends'
    ? ideas.filter(i => ['u1','u4'].includes(i.userId))
    : ideas;

  const handleVote = (id: string) => {
    if (remaining.votes <= 0) return;
    setIdeas(prev => prev.map(i =>
      i.id === id
        ? { ...i, isVoted: !i.isVoted, votes: i.isVoted ? i.votes-1 : i.votes+1 }
        : i
    ));
    setRemaining(r => ({ ...r, votes: r.votes - 1 }));
  };

  const handleDelete = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    setRemaining(r => ({ ...r, suggestions: r.suggestions + 1 }));
  };

  const handleSubmit = (title: string, desc: string) => {
    const newIdea: Idea = {
      id:       Date.now().toString(),
      userId:   'me',
      userName: 'أنت',
      avatar:   'https://i.pravatar.cc/150?img=3',
      title, desc,
      votes:    0,
      isVoted:  false,
      isMine:   true,
    };
    setIdeas(prev => [newIdea, ...prev]);
    setRemaining(r => ({ ...r, suggestions: r.suggestions - 1 }));
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>

      {/* AppBar */}
      <View style={s.appBar}>
        <Text style={s.appBarTitle}>التحديات</Text>
      </View>

      <FlatList
        data={displayedIdeas}
        keyExtractor={i => i.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Sponsored أو كرت عادي */}
            {isSponsored
              ? <SponsoredCard />
              : (
                <View style={s.topCard}>
                  <LinearGradient
                    colors={['rgba(255,107,44,0.15)','rgba(0,0,0,0)']}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Timer + Stats */}
                  <View style={s.topCardHeader}>
                    <View style={s.topCardStat}>
                      <Ionicons name="time-outline" size={14} color={Colors.primary} />
                      <CountdownTimer endsAt={tomorrow} />
                    </View>
                    <View style={s.topCardDivider} />
                    <View style={s.topCardStat}>
                      <Ionicons name="bulb-outline" size={14} color={Colors.primary} />
                      <Text style={s.topCardStatText}>{remaining.suggestions} اقتراحات</Text>
                    </View>
                    <View style={s.topCardDivider} />
                    <View style={s.topCardStat}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={Colors.primary} />
                      <Text style={s.topCardStatText}>{remaining.votes} أصوات</Text>
                    </View>
                  </View>

                  {/* زر اقترح */}
                  <TouchableOpacity
                    style={[s.suggestBtn, remaining.suggestions <= 0 && s.suggestBtnDisabled]}
                    onPress={() => remaining.suggestions > 0 && setShowSheet(true)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={s.suggestBtnText}>اقترح فكرة تحدي الغد</Text>
                  </TouchableOpacity>
                </View>
              )
            }

            {/* Tabs */}
            <View style={s.tabsRow}>
              {TABS.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={s.tab}
                  onPress={() => setActiveTab(t.key)}
                >
                  <Text style={[s.tabText, activeTab === t.key && s.tabActive]}>
                    {t.label}
                  </Text>
                  {activeTab === t.key && <View style={s.tabIndicator} />}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <IdeaCard idea={item} onVote={handleVote} onDelete={handleDelete} />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="bulb-outline" size={40} color={Colors.textMuted} />
            <Text style={s.emptyText}>لا توجد أفكار بعد</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <SuggestSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSubmit={handleSubmit}
        remaining={remaining.suggestions}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex:1, backgroundColor: Colors.background },
  appBar: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth:1, borderBottomColor: Colors.border,
    alignItems:'center',
  },
  appBarTitle:  { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  topCard: {
    marginHorizontal: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: Radius.lg, overflow:'hidden',
    padding: Spacing.md, gap: Spacing.sm,
    borderWidth:1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  topCardHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  topCardStat:   { flexDirection:'row', alignItems:'center', gap:4, flex:1, justifyContent:'center' },
  topCardStatText:{ color: Colors.textPrimary, fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  topCardDivider: { width:1, height:20, backgroundColor: Colors.border },
  suggestBtn: {
    flexDirection:'row', alignItems:'center', justifyContent:'center', gap: Spacing.xs,
    backgroundColor: Colors.primary, paddingVertical:12, borderRadius: Radius.md,
  },
  suggestBtnDisabled: { opacity:0.4 },
  suggestBtnText: { color:'#fff', fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold },
  tabsRow: {
    flexDirection:'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderBottomWidth:1, borderBottomColor: Colors.border,
  },
  tab: { flex:1, alignItems:'center', paddingVertical: Spacing.sm, position:'relative' },
  tabText: { color: Colors.textMuted, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  tabActive: { color: Colors.textPrimary, fontWeight: Typography.weights.bold },
  tabIndicator: {
    position:'absolute', bottom:0, height:2, width:32,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
  },
  empty: { alignItems:'center', gap: Spacing.md, marginTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: Typography.sizes.base },
});
