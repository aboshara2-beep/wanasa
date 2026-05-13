import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Dimensions,
  Alert, Platform,
} from 'react-native';
import { SafeAreaView }    from 'react-native-safe-area-context';
import { LinearGradient }  from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker    from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing, Typography, Radius } from '../src/shared/theme';
import { useAuthStore }    from '../src/features/auth/store';
import { CountdownTimer }  from '../src/components/ui/CountdownTimer';

const { height, width } = Dimensions.get('window');

// ── Upload لـ Cloudflare R2 ──
async function uploadToR2(
  uri:         string,
  token:       string,
  onProgress:  (p: number) => void,
): Promise<string> {
  const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

  // 1. جلب Signed URL من الـ Backend
  const sigRes = await fetch(`${API_URL}/uploads/sign`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename:    `video_${Date.now()}.mp4`,
      contentType: 'video/mp4',
    }),
  });

  if (!sigRes.ok) throw new Error('فشل الحصول على رابط الرفع');
  const { uploadUrl, publicUrl } = await sigRes.json();

  // 2. رفع الفيديو مباشرة لـ R2
  const fileRes  = await fetch(uri);
  const blob     = await fileRes.blob();
  const total    = blob.size;
  let   uploaded = 0;

  // Simulate progress (XMLHttpRequest للـ progress الحقيقي)
  const xhr = new XMLHttpRequest();
  await new Promise<void>((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      uploaded = e.loaded;
      onProgress(Math.floor((e.loaded / e.total) * 100));
    };
    xhr.onload  = () => resolve();
    xhr.onerror = () => reject(new Error('فشل الرفع'));
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', 'video/mp4');
    xhr.send(blob);
  });

  return publicUrl;
}

export default function UploadScreen() {
  const { challengeId, challengeTitle, fromChallenge } = useLocalSearchParams<{
    challengeId?:    string;
    challengeTitle?: string;
    fromChallenge?:  string;
  }>();

  const isFromChallenge = fromChallenge === '1';
  const token = useAuthStore(s => s.token);

  const [videoUri,  setVideoUri]  = useState<string | null>(null);
  const [title,     setTitle]     = useState(
    isFromChallenge ? `#${challengeTitle ?? 'تحدي اليوم'}` : ''
  );
  const [desc,      setDesc]      = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [stage,     setStage]     = useState<'idle'|'uploading'|'done'>('idle');

  const player = useVideoPlayer(videoUri ?? '', p => {
    p.loop  = true;
    p.muted = false;
  });

  // ── اختيار فيديو من المعرض ──
  const pickVideo = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('صلاحية مطلوبة', 'نحتاج صلاحية الوصول للمعرض');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:       ImagePicker.MediaTypeOptions.Videos,
      allowsEditing:    true,
      videoMaxDuration: 60,
      quality:          0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if ((asset.duration ?? 0) > 60000) {
        Alert.alert('مدة طويلة', 'الحد الأقصى 60 ثانية');
        return;
      }
      setVideoUri(asset.uri);
      player.replaceCurrentItem(asset.uri);
    }
  }, [player]);

  // ── تسجيل فيديو ──
  const recordVideo = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('صلاحية مطلوبة', 'نحتاج صلاحية الكاميرا');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes:       ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 60,
      quality:          0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      player.replaceCurrentItem(result.assets[0].uri);
    }
  }, [player]);

  // ── رفع الفيديو ──
  const handleUpload = useCallback(async () => {
    if (!videoUri || !title.trim()) {
      Alert.alert('ناقص', 'اختر فيديو وأضف عنواناً');
      return;
    }

    setUploading(true);
    setStage('uploading');
    setProgress(0);

    try {
      let videoUrl = videoUri;

      if (token && !__DEV__) {
        // رفع حقيقي للـ R2
        videoUrl = await uploadToR2(videoUri, token, setProgress);
      } else {
        // Dev: simulate
        for (let i = 0; i <= 100; i += 5) {
          await new Promise(r => setTimeout(r, 80));
          setProgress(i);
        }
      }

      // إرسال بيانات الفيديو للـ Backend
      const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
      if (token) {
        await fetch(`${API_URL}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title:       title.trim(),
            description: desc.trim(),
            videoUrl,
            challengeId: isFromChallenge ? challengeId : null,
          }),
        });
      }

      setStage('done');
      setTimeout(() => router.back(), 1500);

    } catch (err) {
      Alert.alert('خطأ', 'فشل رفع الفيديو — حاول مجدداً');
      setStage('idle');
    } finally {
      setUploading(false);
    }
  }, [videoUri, title, desc, token, challengeId, isFromChallenge]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top:8, bottom:8, left:8, right:8 }}
        >
          <Ionicons name="close" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>فيديو جديد</Text>
        <View style={{ width:26 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Preview أو اختيار */}
        {videoUri ? (
          <View style={s.previewWrap}>
            <VideoView
              player={player}
              style={s.preview}
              contentFit="cover"
              nativeControls={false}
            />
            {/* زر تغيير */}
            <TouchableOpacity
              style={s.changeBtn}
              onPress={pickVideo}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={s.changeBtnText}>تغيير</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.videoArea}>
            <LinearGradient
              colors={['#1a1a2e','#0f2460']}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.videoActions}>
              <TouchableOpacity style={s.videoBtn} onPress={recordVideo}>
                <Ionicons name="videocam" size={32} color="#fff" />
                <Text style={s.videoBtnText}>تسجيل</Text>
              </TouchableOpacity>
              <View style={s.videoDivider} />
              <TouchableOpacity style={s.videoBtn} onPress={pickVideo}>
                <Ionicons name="images" size={32} color="#fff" />
                <Text style={s.videoBtnText}>اختيار</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.videoHint}>15 – 60 ثانية</Text>
          </View>
        )}

        {/* Challenge Tag */}
        {isFromChallenge && (
          <View style={s.challengeTag}>
            <LinearGradient
              colors={['rgba(255,107,44,0.2)','rgba(255,107,44,0.05)']}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="flame" size={18} color={Colors.primary} />
            <View style={{ flex:1 }}>
              <Text style={s.challengeTagLabel}>تحدي اليوم</Text>
              <Text style={s.challengeTagTitle} numberOfLines={1}>
                {challengeTitle}
              </Text>
            </View>
            <View style={s.pointsBadge}>
              <Text style={s.pointsBadgeText}>+3 نقاط</Text>
            </View>
          </View>
        )}

        {/* Title */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>العنوان *</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="أضف عنواناً..."
            placeholderTextColor={Colors.textMuted}
            maxLength={80}
            multiline
            textAlign="right"
          />
          <Text style={s.charCount}>{title.length}/80</Text>
        </View>

        {/* Description */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>الوصف (اختياري)</Text>
          <TextInput
            style={[s.input, s.inputMulti]}
            value={desc}
            onChangeText={setDesc}
            placeholder="أضف وصفاً..."
            placeholderTextColor={Colors.textMuted}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlign="right"
            textAlignVertical="top"
          />
        </View>

        {/* Progress */}
        {uploading && (
          <View style={s.progressWrap}>
            <View style={s.progressTrack}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={[s.progressFill, { width:`${progress}%` }]}
                start={{ x:0, y:0 }} end={{ x:1, y:0 }}
              />
            </View>
            <Text style={s.progressText}>
              {stage === 'done' ? '✅ اكتمل!' : `${progress}% — جاري الرفع...`}
            </Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={[s.uploadBtn, (uploading || !videoUri) && s.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={uploading || !videoUri}
          activeOpacity={0.85}
        >
          {uploading
            ? <Text style={s.uploadBtnText}>
                {stage === 'done' ? '✅ تم بنجاح!' : 'جاري الرفع...'}
              </Text>
            : <>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={s.uploadBtnText}>رفع الفيديو</Text>
              </>
          }
        </TouchableOpacity>

        <View style={{ height:40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:      { flex:1, backgroundColor:Colors.background },
  header:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:Spacing.md, paddingVertical:Spacing.sm, borderBottomWidth:1, borderBottomColor:Colors.border },
  headerTitle:    { fontSize:Typography.sizes.md, fontWeight:Typography.weights.bold, color:Colors.textPrimary },
  content:        { padding:Spacing.md, gap:Spacing.md },
  previewWrap:    { height:height*0.35, borderRadius:Radius.lg, overflow:'hidden', position:'relative' },
  preview:        { width:'100%', height:'100%' },
  changeBtn:      { position:'absolute', bottom:Spacing.sm, right:Spacing.sm, flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(0,0,0,0.7)', paddingHorizontal:Spacing.sm, paddingVertical:6, borderRadius:Radius.full },
  changeBtnText:  { color:'#fff', fontSize:Typography.sizes.xs, fontWeight:Typography.weights.bold },
  videoArea:      { height:height*0.28, borderRadius:Radius.lg, overflow:'hidden', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:Colors.border, gap:Spacing.md },
  videoActions:   { flexDirection:'row', alignItems:'center', gap:Spacing.xl },
  videoBtn:       { alignItems:'center', gap:Spacing.xs },
  videoBtnText:   { color:'#fff', fontSize:Typography.sizes.sm, fontWeight:Typography.weights.medium },
  videoDivider:   { width:1, height:40, backgroundColor:'rgba(255,255,255,0.2)' },
  videoHint:      { color:Colors.textMuted, fontSize:Typography.sizes.xs, position:'absolute', bottom:Spacing.sm },
  challengeTag:   { flexDirection:'row', alignItems:'center', gap:Spacing.sm, borderRadius:Radius.md, overflow:'hidden', padding:Spacing.md, borderWidth:1, borderColor:'rgba(255,107,44,0.3)' },
  challengeTagLabel:{ color:Colors.primary, fontSize:Typography.sizes.xs, fontWeight:Typography.weights.bold },
  challengeTagTitle:{ color:Colors.textPrimary, fontSize:Typography.sizes.sm, fontWeight:Typography.weights.medium },
  pointsBadge:    { backgroundColor:'rgba(255,107,44,0.2)', paddingHorizontal:Spacing.sm, paddingVertical:4, borderRadius:Radius.full },
  pointsBadgeText:{ color:Colors.primary, fontSize:Typography.sizes.xs, fontWeight:Typography.weights.bold },
  field:          { gap:6 },
  fieldLabel:     { color:Colors.textSecondary, fontSize:Typography.sizes.sm, fontWeight:Typography.weights.medium },
  input:          { backgroundColor:Colors.surface, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border, padding:Spacing.md, color:Colors.textPrimary, fontSize:Typography.sizes.base },
  inputMulti:     { minHeight:80, textAlignVertical:'top' },
  charCount:      { color:Colors.textMuted, fontSize:Typography.sizes.xs, textAlign:'left' },
  progressWrap:   { gap:Spacing.xs },
  progressTrack:  { height:6, backgroundColor:Colors.surfaceElevated, borderRadius:Radius.full, overflow:'hidden' },
  progressFill:   { height:6, borderRadius:Radius.full },
  progressText:   { color:Colors.primary, fontSize:Typography.sizes.xs, textAlign:'center', fontWeight:Typography.weights.bold },
  uploadBtn:      { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:Spacing.sm, backgroundColor:Colors.primary, paddingVertical:16, borderRadius:Radius.md, marginTop:Spacing.sm },
  uploadBtnDisabled:{ opacity:0.4 },
  uploadBtnText:  { color:'#fff', fontSize:Typography.sizes.md, fontWeight:Typography.weights.bold },
});
