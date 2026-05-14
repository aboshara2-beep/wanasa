import { FeedAPI }      from '../api/feed';
import { useFeedStore } from '../../features/feed/store';

export function useVideoActions() {
  const { likeVideo, voteVideo, saveVideo } = useFeedStore();

  const like = async (id: string) => {
    likeVideo(id); // Optimistic
    try { await FeedAPI.like(id); }
    catch { likeVideo(id); } // Rollback
  };

  const vote = async (id: string) => {
    voteVideo(id);
    try { await FeedAPI.vote(id); }
    catch { voteVideo(id); }
  };

  const save = async (id: string) => {
    saveVideo(id);
    try { await FeedAPI.save(id); }
    catch { saveVideo(id); }
  };

  const view = (id: string) => {
    FeedAPI.view(id).catch(() => {});
  };

  return { like, vote, save, view };
}
