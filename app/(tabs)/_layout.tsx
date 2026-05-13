import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet, View, TouchableOpacity,
  Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../src/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const { width } = Dimensions.get('window');

// 4 tabs — الزر + في المنتصف عائم منفصل
const TABS = [
  { name: 'home',        title: 'الرئيسية',  icon: 'home-outline'  as IconName, iconOn: 'home'   as IconName },
  { name: 'challenges',  title: 'التحديات',  icon: 'flame-outline'  as IconName, iconOn: 'flame'  as IconName },
  // فراغ للزر العائم
  { name: 'leaderboard', title: 'المتصدرين', icon: 'trophy-outline'  as IconName, iconOn: 'trophy' as IconName },
  { name: 'profile',     title: 'حسابي',     icon: 'person-outline'  as IconName, iconOn: 'person' as IconName },
];

// زر + العائم في منتصف الـ TabBar
function UploadFAB({ bottomInset }: { bottomInset: number }) {
  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: bottomInset + 12 }]}
      onPress={() => router.push('/upload')}
      activeOpacity={0.85}
    >
      <View style={styles.fabInner}>
        <Ionicons name="add" size={30} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const TAB_HEIGHT = 56 + Math.max(insets.bottom, 20);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return {
            headerShown: false,

            // Tab Bar شفاف تقريباً — بدون خلفية صلبة
            tabBarStyle: [
              styles.tabBar,
              {
                height:        TAB_HEIGHT,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ],

            tabBarActiveTintColor:   Colors.primary,
            tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
            tabBarLabelStyle:        styles.label,

            tabBarIcon: ({ focused, color }) => {
              // فراغ للزر العائم في المنتصف
              if (route.name === 'leaderboard' && !focused) {
                return (
                  <View style={{ width: 32 }}>
                    <Ionicons name={tab!.icon} size={25} color={color} />
                  </View>
                );
              }
              return (
                <Ionicons
                  name={focused ? tab!.iconOn : tab!.icon}
                  size={25}
                  color={color}
                />
              );
            },
          };
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ title: tab.title }}
          />
        ))}
        {/* مخفية من Tab Bar */}
        <Tabs.Screen name="notifications" options={{ href: null }} />
      </Tabs>

      {/* زر + عائم في منتصف Tab Bar */}
      <UploadFAB bottomInset={Math.max(insets.bottom, 20)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(8,8,8,0.92)',
    borderTopWidth:  1,
    borderTopColor:  'rgba(255,255,255,0.08)',
    paddingTop:      6,
    // إخفاء أزرار الهاتف الافتراضية على Android
    elevation:       0,
  },
  label: {
    fontSize:   10,
    fontWeight: '600',
    marginTop:  2,
  },

  // زر + العائم
  fab: {
    position:   'absolute',
    alignSelf:  'center',
    left:       (width / 2) - 28,
    zIndex:     50,
  },
  fabInner: {
    width:           56,
    height:          56,
    borderRadius:    Radius.full,
    backgroundColor: Colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
    // glow effect
    shadowColor:     Colors.primary,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.5,
    shadowRadius:    12,
    elevation:       10,
  },
});
