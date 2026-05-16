import React from 'react';
import { Tabs }              from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient }    from 'expo-linear-gradient';
import { Ionicons }          from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router }            from 'expo-router';

type IName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name:string; icon:IName; iconOn:IName; label:string }[] = [
  { name:'home',        icon:'home-outline',   iconOn:'home',    label:'الرئيسية'  },
  { name:'leaderboard', icon:'trophy-outline', iconOn:'trophy',  label:'المتصدرون' },
  { name:'challenges',  icon:'flame-outline',  iconOn:'flame',   label:'التحديات'  },
  { name:'profile',     icon:'person-outline', iconOn:'person',  label:'حسابي'     },
];

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[tb.container, { paddingBottom:Math.max(insets.bottom,16) }]}>
      <LinearGradient colors={['rgba(8,8,8,0.88)','rgba(8,8,8,0.97)']} style={StyleSheet.absoluteFill}/>
      <LinearGradient
        colors={['transparent','rgba(255,107,44,0.35)','transparent']}
        style={tb.topLine} start={{x:0,y:0}} end={{x:1,y:0}}
      />
      <View style={tb.tabs}>
        {TABS.slice(0,2).map((tab,i) => {
          const focused = state.index===i;
          return (
            <TouchableOpacity key={tab.name} style={tb.tab}
              onPress={() => navigation.navigate(tab.name)} activeOpacity={0.8}>
              {focused && <View style={tb.pill}/>}
              <Ionicons name={focused?tab.iconOn:tab.icon} size={24} color={focused?'#FF6B2C':'rgba(255,255,255,0.4)'}/>
              <Text style={[tb.label, focused && { color:'#FF6B2C' }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Upload Button */}
        <TouchableOpacity style={tb.uploadBtn} onPress={() => router.push('/upload')} activeOpacity={0.88}>
          <LinearGradient colors={['#FF8F5E','#FF6B2C','#E5501A']} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:1}}/>
          <Ionicons name="add" size={26} color="#fff"/>
        </TouchableOpacity>

        {TABS.slice(2,4).map((tab,i) => {
          const focused = state.index===i+2;
          return (
            <TouchableOpacity key={tab.name} style={tb.tab}
              onPress={() => navigation.navigate(tab.name)} activeOpacity={0.8}>
              {focused && <View style={tb.pill}/>}
              <Ionicons name={focused?tab.iconOn:tab.icon} size={24} color={focused?'#FF6B2C':'rgba(255,255,255,0.4)'}/>
              <Text style={[tb.label, focused && { color:'#FF6B2C' }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tb = StyleSheet.create({
  container: { position:'absolute', bottom:0, left:0, right:0, zIndex:100, overflow:'hidden' },
  topLine:   { position:'absolute', top:0, left:0, right:0, height:1 },
  tabs:      { flexDirection:'row', alignItems:'center', paddingTop:8, paddingHorizontal:8 },
  tab:       { flex:1, alignItems:'center', paddingVertical:6, gap:3, position:'relative' },
  pill:      { position:'absolute', top:-2, width:28, height:3, borderRadius:999, backgroundColor:'#FF6B2C' },
  label:     { fontSize:9, fontWeight:'600', color:'rgba(255,255,255,0.4)' },
  uploadBtn: {
    width:52, height:52, borderRadius:26,
    alignItems:'center', justifyContent:'center',
    marginTop:-14, overflow:'hidden',
    shadowColor:'#FF6B2C', shadowOpacity:0.7,
    shadowRadius:16, shadowOffset:{width:0,height:4}, elevation:16,
  },
});

export default function TabsLayout() {
  return (
    <Tabs tabBar={props => <CustomTabBar {...props}/>} screenOptions={{ headerShown:false }}>
      {TABS.map(t => <Tabs.Screen key={t.name} name={t.name}/>)}
      <Tabs.Screen name="notifications" options={{ href:null }}/>
    </Tabs>
  );
}
