import { create } from 'zustand';

export interface Video {
  id: string; userId: string; userName: string; userAvatar: string;
  url: string; thumbnail: string; title: string; description?: string;
  likes: number; votes: number; comments: number; saves: number; views: number;
  duration: number; isLiked: boolean; isVoted: boolean; isSaved: boolean;
  isWinner: boolean; isSponsored: boolean; feedType: string; createdAt: string;
}

interface FeedState {
  videos: Video[]; activeIndex: number;
  hasMore: boolean; isLoading: boolean;
  setVideos:      (v: Video[]) => void;
  appendVideos:   (v: Video[]) => void;
  setActiveIndex: (i: number)  => void;
  setLoading:     (l: boolean) => void;
  setWinner:      (v: Video)   => void;
  addVideo:       (v: Video)   => void;
  likeVideo:      (id: string) => void;
  voteVideo:      (id: string) => void;
  saveVideo:      (id: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  videos: [], activeIndex: 0, hasMore: true, isLoading: false,
  setVideos:      (videos)    => set({ videos, hasMore: videos.length >= 10 }),
  appendVideos:   (newVideos) => set(s => ({ videos:[...s.videos,...newVideos], hasMore:newVideos.length>=10 })),
  setActiveIndex: (i)         => set({ activeIndex: i }),
  setLoading:     (l)         => set({ isLoading: l }),
  setWinner: (winner) => set(s => ({
    videos: s.videos.some(v => v.id===winner.id)
      ? s.videos.map(v => v.id===winner.id ? {...v,isWinner:true} : v)
      : [{...winner,isWinner:true},...s.videos],
  })),
  addVideo:  (video) => set(s => ({ videos: [video, ...s.videos] })),
  likeVideo: (id) => set(s => ({
    videos: s.videos.map(v =>
      v.id===id ? {...v,isLiked:!v.isLiked,likes:v.isLiked?v.likes-1:v.likes+1} : v),
  })),
  voteVideo: (id) => set(s => ({
    videos: s.videos.map(v =>
      v.id===id ? {...v,isVoted:!v.isVoted,votes:v.isVoted?v.votes-1:v.votes+1} : v),
  })),
  saveVideo: (id) => set(s => ({
    videos: s.videos.map(v =>
      v.id===id ? {...v,isSaved:!v.isSaved} : v),
  })),
}));
