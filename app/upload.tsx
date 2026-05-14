import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView }   from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }       from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker   from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing, Typography, Radius } from '../src/shared/theme';
import { useFeedStore }   from '../src/features/feed/store';
import { useAuthStore }   from '../src/features/auth/store';
import { uploadVideo }    from '../src/shared/api/upload';

const { height } = Dimensions.get('window');

export default function UploadScreen() {
  const { challengeTitle, fromChallenge } = useLocalSearchParams<{
    challengeTitle?: string; fromChallenge?: string;
  }>();

  const isFromChallenge = fromChallenge === '1';
  const addVideo = useFeedStore(s => s.addVideo);
  const user     = useAuthStore(s => s.user);

  const [videoUri,  setVideoUri]  = useState<string | null>(null);
  const [title,     setTitle]     = useState(
    isFromChallenge ? `#${challengeTitle ?? 'تحدي اليوم'} ` : ''
  );
  const [desc,      setDesc]      = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const player = useVideoPlayer(videoUri ?? '', p => {
    p.loop = true; p.muted = false;
  });

  const pickVideo = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('صلاحية مطلوبة', 'نحتاج المعرض'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'], allowsEditing: true,
      videoMaxDuration: 60, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setVideoUri(result.assets[0].uri);
  }, []);

  const recordVideo = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('صلاحية مطلوبة', 'نحتاج الكاميرا'); return; }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'], videoMaxDuration: 60, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setVideoUri(result.assets[0].uri);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!title.trim()) { Alert.alert('ناقص', 'أضف عنواناً'); return; }
    if (!videoUri)     { Alert.alert('ناقص', 'اختر فيديو');  return; }

    setUploading(true);
    setProgress(10);

    try {
      // ── رفع للـ Backend الحقيقي ──
      setProgress(40);
      const result = await uploadVideo({
        videoUri, title: title.trim(),
        description: desc, duration: 30,
      });
      setProgress(100);

      // ── إضافة للفيد محلياً فوراً ──
      addVideo({
        id:          result.id,
        userId:      user?.id ?? 'me',
        userName:    user?.name ?? 'أنت',
        userAvatar:  user?.avatar ?? '',
        url:         videoUri,
        thumbnail:   '',
        title:       title.trim(),
        description: desc,
        likes:0, votes:0, comments:0, saves:0, views:0,
        duration: 30,
        isLiked:false, isVoted:false, isSaved:false,
        isWinner:false, isSponsored:false,
        feedType: 'for_you',
        createdAt: new Date().toISOString(),
      });

      Alert.alert('✅ تم!', result.message ?? 'تم رفع الفيديو بنجاح!');
      router.back();

    } catch (err: any) {
      // ── Fallback: حفظ محلي إذا Backend غير متاح ──
      setProgress(100);
      addVideo({
        id:          `v_${Date.now()}`,
        userId:      user?.id ?? 'me',
        userName:    user?.name ?? 'أنت',
        userAvatar:  user?.avatar ?? '',
        url:         videoUri,
        thumbnail:   '',
        title:       title.trim(),
        description: desc,
        likes:0, votes:0, comments:0, saves:0, views:0,
        duration: 30,
        isLiked:false, isVoted:false, isSaved:false,
        isWinner:false, isSponsored:false,
        feedType: 'for_you',
        createdAt: new Date().toISOString(),
      });
      router.back();
    } finally {
      setUploading(false);
    }
  }, [videoUri, title, desc, user, addVideo]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}
          hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Ionicons name="close" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>فيديو جديد</Text>
        <View style={{ width:26 }} />
      </View>

      <ScrollView contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {videoUri ? (
          <View style={s.previewWrap}>
            <VideoView player={player} style={StyleSheet.absoluteFill}
              contentFit="cover" nativeControls={false} />
            <TouchableOpacity style={s.changeBtn} onPress={pickVideo}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={s.changeBtnText}>تغيير</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.pickArea}>
            <LinearGradient colors={['#1a1a2e','#0f2460']} style={StyleSheet.absoluteFill} />
            <View style={s.pickBtns}>
              <TouchableOpacity style={s.pickBtn} onPress={recordVideo}>
                <View style={s.pickIcon}>
                  <Ionicons name="videocam" size={28} color={Colors.primary} />
                </View>
                <Text style={s.pickText}>تسجيل</Text>
              </TouchableOpacity>
              <View style={s.pickDiv} />
              <TouchableOpacity style={s.pickBtn} onPress={pickVideo}>
                <View style={s.pickIcon}>
                  <Ionicons name="images" size={28} color={Colors.primary} />
                </View>
                <Text style={s.pickText}>اختيار</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.pickHint}>15 – 60 ثانية</Text>
          </View>
        )}

        {isFromChallenge && (
          <View style={s.challengeTag}>
            <LinearGradient
              colors={['rgba(255,107,44,0.2)','rgba(255,107,44,0.05)']}
              style={StyleSheet.absoluteFill} />
            <Ionicons name="flame" size={18} color={Colors.primary} />
            <View style={{flex:1}}>
              <Text style={s.challengeTagLabel}>تحدي اليوم</Text>
              <Text style={s.challengeTagTitle} numberOfLines={1}>{challengeTitle}</Text>
            </View>
            <View style={s.pointsBadge}>
              <Text style={s.pointsBadgeText}>+3 نقاط</Text>
            </View>
          </View>
        )}

        <View style={s.field}>
          <Text style={s.fieldLabel}>العنوان *</Text>
          <TextInput
            style={s.input} value={title} onChangeText={setTitle}
            placeholder="أضف عنواناً..." placeholderTextColor={Colors.textMuted}
            maxLength={80} multiline textAlign="right"
          />
          <Text style={s.charCount}>{title.length}/80</Text>
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>الوصف (اختياري)</Text>
          <TextInput
            style={[s.input, s.inputMulti]} value={desc} onChangeText={setDesc}
            placeholder="أضف وصفاً..." placeholderTextColor={Colors.textMuted}
            maxLength={200} multiline numberOfLines={3}
            textAlign="right" textAlignVertical="top"
          />
        </View>

        {uploading && (
          <View style={s.progressWrap}>
            <View style={s.progressTrack}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={[s.progressFill, {width:`${progress}%` as any}]}
                start={{x:0,y:0}} end={{x:1,y:0}}
              />
            </View>
            <Text style={s.progressText}>{progress}% — جاري الرفع...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.uploadBtn, (uploading||!videoUri) && s.uploadDisabled]}
          onPress={handleUpload} disabled={uploading||!videoUri}
          activeOpacity={0.85}
        >
          {uploading
            ? <><Ionicons name="cloud-upload" size={20} color="#fff" />
               <Text style={s.uploadBtnText}>جاري الرفع... {progress}%</Text></>
            : <><Ionicons name="cloud-upload" size={20} color="#fff" />
               <Text style={s.uploadBtnText}>رفع الفيديو</Text></>
          }
        </TouchableOpacity>
        <View style={{height:40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:         { flex:1, backgroundColor:Colors.background },
  header:            { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:Spacing.md, paddingVertical:Spacing.sm, borderBottomWidth:1, borderBottomColor:Colors.border },
  headerTitle:       { fontSize:Typography.sizes.md, fontWeight:Typography.weights.bold, color:Colors.textPrimary },
  content:           { padding:Spacing.md, gap:Spacing.md },
  previewWrap:       { height:height*0.35, borderRadius:Radius.lg, overflow:'hidden', position:'relative', backgroundColor:'#000' },
  changeBtn:         { position:'absolute', bottom:Spacing.sm, right:Spacing.sm, flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(0,0,0,0.7)', paddingHorizontal:Spacing.sm, paddingVertical:6, borderRadius:Radius.full },
  changeBtnText:     { color:'#fff', fontSize:Typography.sizes.xs, fontWeight:Typography.weights.bold },
  pickArea:          { height:height*0.28, borderRadius:Radius.lg, overflow:'hidden', alignItems:'center', justifyContent:'center', gap:Spacing.md, borderWidth:1, borderColor:Colors.border },
  pickBtns:          { flexDirection:'row', alignItems:'center', gap:Spacing.xl },
  pickBtn:           { alignItems:'center', gap:Spacing.xs },
  pickIcon:          { width:56, height:56, borderRadius:28, backgroundColor:'rgba(255,107,44,0.15)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,107,44,0.3)' },
  pickText:          { color:'#fff', fontSize:Typography.sizes.sm, fontWeight:Typography.weights.medium },
  pickDiv:           { width:1, height:40, backgroundColor:'rgba(255,255,255,0.15)' },
  pickHint:          { color:Colors.textMuted, fontSize:Typography.sizes.xs, position:'absolute', bottom:Spacing.sm },
  challengeTag:      { flexDirection:'row', alignItems:'center', gap:Spacing.sm, borderRadius:Radius.md, overflow:'hidden', padding:Spacing.md, borderWidth:1, borderColor:'rgba(255,107,44,0.3)' },
  challengeTagLabel: { color:Colors.primary, fontSize:Typography.sizes.xs, fontWeight:Typography.weights.bold },
  challengeTagTitle: { color:Colors.textPrimary, fontSize:Typography.sizes.sm, fontWeight:Typography.weights.medium },
  pointsBadge:       { backgroundColor:'rgba(255,107,44,0.2)', paddingHorizontal:Spacing.sm, paddingVertical:4, borderRadius:Radius.full },
  pointsBadgeText:   { color:Colors.primary, fontSize:Typography.sizes.xs, fontWeight:Typography.weights.bold },
  field:             { gap:6 },
  fieldLabel:        { color:Colors.textSecondary, fontSize:Typography.sizes.sm, fontWeight:Typography.weights.medium },
  input:             { backgroundColor:Colors.surface, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border, padding:Spacing.md, color:Colors.textPrimary, fontSize:Typography.sizes.base },
  inputMulti:        { minHeight:80, textAlignVertical:'top' },
  charCount:         { color:Colors.textMuted, fontSize:Typography.sizes.xs, textAlign:'left' },
  progressWrap:      { gap:6 },
  progressTrack:     { height:8, backgroundColor:Colors.surfaceElevated, borderRadius:Radius.full, overflow:'hidden' },
  progressFill:      { height:8, borderRadius:Radius.full },
  progressText:      { color:Colors.primary, fontSize:Typography.sizes.sm, textAlign:'center', fontWeight:Typography.weights.bold },
  uploadBtn:         { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:Spacing.sm, backgroundColor:Colors.primary, paddingVertical:16, borderRadius:Radius.md },
  uploadDisabled:    { opacity:0.4 },
  uploadBtnText:     { color:'#fff', fontSize:Typography.sizes.md, fontWeight:Typography.weights.bold },
});
