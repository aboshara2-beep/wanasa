import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';

type NType = 'rank_up' | 'near_win' | 'win' | 'badge_earned' | 'grace_day';

interface Notif {
  id: string; type: NType; title: string;
  body: string; time: string; isRead: boolean;
}

const MOCK_NOTIFS: Notif[] = [
  { id:'1', type:'win',         title:'🏆 فزتَ اليوم!',                  body:'فيديوك فاز بتحدي الرقص — أنت نجم اليوم!',     time:'منذ 2 ساعة',   isRead:false },
  { id:'2', type:'near_win',    title:'🔥 أنت قريب جداً!',               body:'فرق 3 نقاط فقط عن المركز الأول — استمر!',     time:'منذ 4 ساعات',  isRead:false },
  { id:'3', type:'rank_up',     title:'⬆️ ارتفع ترتيبك!',               body:'وصلت للمركز #3 في المتصدرين هذا الأسبوع',      time:'منذ 6 ساعات',  isRead:false },
  { id:'4', type:'badge_earned',title:'💡 شارة جديدة!',                  body:'حصلت على شارة "الملهم" بعد 5 اقتراحات مقبولة',time:'أمس',          isRead:true  },
  { id:'5', type:'grace_day',   title:'🛡️ يوم النعمة!',                  body:'استخدمت يوم النعمة — streak محفوظ هذا الأسبوع', time:'منذ يومين',    isRead:true  },
  { id:'6', type:'rank_up',     title:'⬆️ ارتفع ترتيبك!',               body:'تجاوزت خالد عمر في الترتيب',                  time:'منذ 3 أيام',   isRead:true  },
  { id:'7', type:'badge_earned',title:'🎬 شارة صانع المحتوى!',           body:'نشرت 10 فيديوهات — رائع جداً!',               time:'منذ أسبوع',    isRead:true  },
];

const TYPE_COLORS: Record<NType, string> = {
  win:          Colors.gold,
  near_win:     Colors.primary,
  rank_up:      Colors.success,
  badge_earned: '#A855F7',
  grace_day:    Colors.info,
};

const TYPE_BG: Record<NType, string> = {
  win:          'rgba(255,215,0,0.12)',
  near_win:     'rgba(255,107,44,0.12)',
  rank_up:      'rgba(34,197,94,0.12)',
  badge_earned: 'rgba(168,85,247,0.12)',
  grace_day:    'rgba(59,130,246,0.12)',
};

function NotifCard({
  notif, onRead,
}: {
  notif: Notif;
  onRead: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[nc.card, !notif.isRead && nc.cardUnread]}
      onPress={() => onRead(notif.id)}
      activeOpacity={0.8}
    >
      {/* تمييز غير مقروء */}
      {!notif.isRead && <View style={nc.dot} />}

      {/* أيقونة النوع */}
      <View style={[nc.iconWrap, { backgroundColor: TYPE_BG[notif.type] }]}>
        <Text style={{ fontSize:20 }}>
          {{ win:'🏆', near_win:'🔥', rank_up:'⬆️', badge_earned:'🎖️', grace_day:'🛡️' }[notif.type]}
        </Text>
      </View>

      {/* النص */}
      <View style={{ flex:1, gap:3 }}>
        <Text style={[nc.title, !notif.isRead && { color: TYPE_COLORS[notif.type] }]}>
          {notif.title}
        </Text>
        <Text style={nc.body} numberOfLines={2}>{notif.body}</Text>
        <Text style={nc.time}>{notif.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const nc = StyleSheet.create({
  card: {
    flexDirection:'row', alignItems:'center', gap: Spacing.md,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth:1, borderColor: Colors.border,
    position:'relative',
  },
  cardUnread: { borderColor: 'rgba(255,107,44,0.3)', backgroundColor: 'rgba(255,107,44,0.05)' },
  dot: {
    position:'absolute', top:12, right:12,
    width:8, height:8, borderRadius:4,
    backgroundColor: Colors.primary,
  },
  iconWrap: {
    width:44, height:44, borderRadius: Radius.md,
    alignItems:'center', justifyContent:'center',
  },
  title: { color: Colors.textPrimary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  body:  { color: Colors.textSecondary, fontSize: Typography.sizes.xs, lineHeight:18 },
  time:  { color: Colors.textMuted, fontSize: 10 },
});

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const unread = notifs.filter(n => !n.isRead).length;

  const markRead = (id: string) =>
    setNotifs(prev => prev.map(n => n.id===id ? {...n, isRead:true} : n));

  const markAllRead = () =>
    setNotifs(prev => prev.map(n => ({...n, isRead:true})));

  return (
    <SafeAreaView style={ns.container} edges={['top']}>

      {/* AppBar */}
      <View style={ns.appBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top:8,bottom:8,left:8,right:8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={ns.appBarTitle}>
          الإشعارات {unread > 0 ? `(${unread})` : ''}
        </Text>
        {unread > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={ns.markAll}>قراءة الكل</Text>
          </TouchableOpacity>
        ) : <View style={{ width:60 }} />}
      </View>

      <FlatList
        data={notifs}
        keyExtractor={n => n.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NotifCard notif={item} onRead={markRead} />
        )}
        ListEmptyComponent={
          <View style={ns.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
            <Text style={ns.emptyText}>لا توجد إشعارات</Text>
          </View>
        }
        contentContainerStyle={{ paddingTop: Spacing.md, paddingBottom:100 }}
      />
    </SafeAreaView>
  );
}

const ns = StyleSheet.create({
  container:   { flex:1, backgroundColor: Colors.background },
  appBar: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth:1, borderBottomColor: Colors.border,
  },
  appBarTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  markAll:     { color: Colors.primary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  empty:       { alignItems:'center', gap: Spacing.md, marginTop:80 },
  emptyText:   { color: Colors.textMuted, fontSize: Typography.sizes.base },
});
