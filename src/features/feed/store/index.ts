import { create }  from 'zustand';
import type { Video } from '../../../shared/api/types';

interface FeedState {
  videos:       Video[];
  activeIndex:  number;
  hasMore:      boolean;
  winner:       Video | null;

  setVideos:    (v: Video[]) => void;
  appendVideos: (v: Video[]) => void;
  setActiveIndex: (i: number) => void;
  setWinner:    (v: Video)   => void;

  // Optimistic Updates
  likeVideo:    (id: string) => void;
  voteVideo:    (id: string) => void;
  saveVideo:    (id: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  videos:      [],
  activeIndex: 0,
  hasMore:     true,
  winner:      null,

  setVideos:    (videos)   => set({ videos, hasMore: videos.length >= 10 }),
  appendVideos: (newVideos)=> set(s => ({
    videos:  [...s.videos, ...newVideos],
    hasMore: newVideos.length >= 10,
  })),
  setActiveIndex: (activeIndex) => set({ activeIndex }),
  setWinner:    (winner) => set(s => ({
    winner,
    // الفائز يُثبَّت في أعلى الفيد
    videos: s.videos.some(v => v.id === winner.id)
      ? s.videos
      : [{ ...winner, isWinner: true }, ...s.videos],
  })),

  likeVideo: (id) => set(s => ({
    videos: s.videos.map(v =>
      v.id === id
        ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes-1 : v.likes+1 }
        : v
    ),
  })),

  voteVideo: (id) => set(s => ({
    videos: s.videos.map(v =>
      v.id === id
        ? { ...v, isVoted: !v.isVoted, votes: v.isVoted ? v.votes-1 : v.votes+1 }
        : v
    ),
  })),

  saveVideo: (id) => set(s => ({
    videos: s.videos.map(v =>
      v.id === id ? { ...v, isSaved: !v.isSaved } : v
    ),
  })),
}));
