import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FeedAPI } from '../../../shared/api/feed';

const { width, height } = Dimensions.get('window');

interface Props {
  url:       string;
  videoId:   string;
  isActive:  boolean;
  isPaused:  boolean;
  duration:  number;
}

export function VideoPlayer({ url, videoId, isActive, isPaused, duration }: Props) {
  const viewRef      = useRef<VideoView>(null);
  const watchStart   = useRef<number>(0);
  const reported     = useRef(false);

  const player = useVideoPlayer(url, p => {
    p.loop   = true;
    p.muted  = false;
  });

  // تشغيل / إيقاف حسب isActive
  useEffect(() => {
    if (!player) return;
    if (isActive && !isPaused) {
      player.play();
      watchStart.current = Date.now();
      reported.current   = false;
    } else {
      player.pause();
      // إرسال وقت المشاهدة للـ Backend
      if (isActive && watchStart.current > 0 && !reported.current) {
        const watchTime = Math.floor((Date.now() - watchStart.current) / 1000);
        reported.current = true;
        FeedAPI.view(videoId, watchTime).catch(() => {});
      }
    }
  }, [isActive, isPaused, player]);

  // إيقاف مؤقت
  useEffect(() => {
    if (!player) return;
    if (isPaused) player.pause();
    else if (isActive) player.play();
  }, [isPaused]);

  // إرسال وقت المشاهدة عند تغيير الفيديو
  useEffect(() => {
    return () => {
      if (watchStart.current > 0 && !reported.current) {
        const watchTime = Math.floor((Date.now() - watchStart.current) / 1000);
        FeedAPI.view(videoId, watchTime).catch(() => {});
      }
    };
  }, [videoId]);

  if (!url) return <View style={styles.placeholder} />;

  return (
    <VideoView
      ref={viewRef}
      player={player}
      style={styles.video}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width,
    height,
    position: 'absolute',
    top: 0, left: 0,
  },
  placeholder: {
    width,
    height,
    backgroundColor: '#111',
  },
});
