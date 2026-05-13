export interface Campaign {  
  id:          string;  
  sponsorName: string;  
  title:       string;  
  description: string;  
  logoUrl:     string;  
  themeColor:  string;  
  budget:      number;  
  status:      'draft' | 'active' | 'ended';  
  priority:    number;  
  startAt:     string;  
  endAt:       string;  
  createdAt:   string;  
}  
  
export interface SponsoredState {  
  isActive:             boolean;  
  lockNormalChallenges: boolean;  
  pinToFeed:            boolean;  
  campaign:             Campaign | null;  
}  
  
export interface CampaignMetrics {  
  campaignId:      string;  
  impressions:     number;  
  clicks:          number;  
  submissions:     number;  
  votes:           number;  
  watchTime:       number;  
  engagementRate:  number;  
}  
EOF  
  
echo "✅ sponsorship types"
.exit
# ── src/shared/types/sponsorship.ts ──  
cat > src/shared/types/sponsorship.ts << 'EOF'  
export interface Campaign {  
  id:          string;  
  sponsorName: string;  
  title:       string;  
  description: string;  
  logoUrl:     string;  
  themeColor:  string;  
  budget:      number;  
  status:      'draft' | 'active' | 'ended';  
  priority:    number;  
  startAt:     string;  
  endAt:       string;  
  createdAt:   string;  
}  
  
export interface SponsoredState {  
  isActive:             boolean;  
  lockNormalChallenges: boolean;  
  pinToFeed:            boolean;  
  campaign:             Campaign | null;  
}  
  
export interface CampaignMetrics {  
  campaignId:      string;  
  impressions:     number;  
  clicks:          number;  
  submissions:     number;  
  votes:           number;  
  watchTime:       number;  
  engagementRate:  number;  
}  
EOF  
  
echo "✅ sponsorship types"
# ── src/shared/realtime/socket.ts ──  
cat > src/shared/realtime/socket.ts << 'EOF'  
import { useAuthStore } from '../../features/auth/store';  
import { shared } from '../constants';  
  
type WSHandler = (payload: any) => void;  
  
class WanasaSocket {  
  private ws:       WebSocket | null = null;  
  private handlers: Map<string, WSHandler[]> = new Map();  
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;  
  private reconnectDelay = 3000;  
  
  connect() {  
    const token = useAuthStore.getState().token;  
    if (!token) return;  
  
    const url = `${shared.WS_URL}?token=${token}`;  
    this.ws = new WebSocket(url);  
  
    this.ws.onopen = () => {  
      console.log('🔌 WS connected');  
      this.reconnectDelay = 3000;  
    };  
  
    this.ws.onmessage = (e) => {  
      try {  
        const { type, payload } = JSON.parse(e.data);  
        this.emit(type, payload);  
      } catch {}  
    };  
  
    this.ws.onclose = () => {  
      console.log('🔌 WS disconnected — reconnecting...');  
      this.scheduleReconnect();  
    };  
  
    this.ws.onerror = () => {  
      this.ws?.close();  
    };  
  }  
  
  disconnect() {  
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);  
    this.ws?.close();  
    this.ws = null;  
  }  
  
  on(event: string, handler: WSHandler) {  
    const list = this.handlers.get(event) ?? [];  
    list.push(handler);  
    this.handlers.set(event, list);  
    return () => this.off(event, handler);  
  }  
  
  off(event: string, handler: WSHandler) {  
    const list = this.handlers.get(event) ?? [];  
    this.handlers.set(event, list.filter(h => h !== handler));  
  }  
  
  send(type: string, payload: any) {  
    if (this.ws?.readyState === WebSocket.OPEN) {  
      this.ws.send(JSON.stringify({ type, payload }));  
    }  
  }  
  
  private emit(event: string, payload: any) {  
    (this.handlers.get(event) ?? []).forEach(h => h(payload));  
    (this.handlers.get('*') ?? []).forEach(h => h({ event, payload }));  
  }  
  
  private scheduleReconnect() {  
    this.reconnectTimer = setTimeout(() => {  
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);  
      this.connect();  
    }, this.reconnectDelay);  
  }  
}  
  
export const socket = new WanasaSocket();  
EOF  
  
echo "✅ realtime/socket.ts"
# ── src/shared/realtime/events/campaignEvents.ts ──  
cat > src/shared/realtime/events/campaignEvents.ts << 'EOF'  
import { socket } from '../socket';  
import { useSponsorshipStore } from '../../stores/sponsorshipStore';  
  
// يستمع لأحداث الحملة الممولة القادمة من الـ Backend عبر WS  
export function subscribeCampaignEvents() {  
  // التفعيل اللحظي للحملة  
  const unsubActivate = socket.on('sponsored_update', (payload) => {  
    useSponsorshipStore.getState().setSponsored(payload);  
  });  
  
  // إنهاء الحملة — يرجع كل شيء لطبيعته  
  const unsubEnd = socket.on('sponsored_ended', () => {  
    useSponsorshipStore.getState().clearSponsored();  
  });  
  
  return () => {  
    unsubActivate();  
    unsubEnd();  
  };  
}  
EOF  
  
cat > src/shared/realtime/events/feedEvents.ts << 'EOF'  
import { socket } from '../socket';  
import { useFeedStore } from '../../../features/feed/store';  
  
export function subscribeFeedEvents() {  
  // فيديو جديد فائز — يُثبَّت أعلى الفيد  
  const unsubWinner = socket.on('new_winner', (payload) => {  
    useFeedStore.getState().setWinner(payload);  
  });  
  
  return () => { unsubWinner(); };  
}  
EOF  
  
cat > src/shared/realtime/events/challengeEvents.ts << 'EOF'  
import { socket } from '../socket';  
  
export function subscribeChallengeEvents(  
  onEnd:     (payload: any) => void,  
  onNewIdea: (payload: any) => void,  
) {  
  const unsubEnd  = socket.on('challenge_end', onEnd);  
  const unsubIdea = socket.on('new_idea',      onNewIdea);  
  return () => { unsubEnd(); unsubIdea(); };  
}  
EOF  
  
echo "✅ realtime events"
# ── src/shared/stores/sponsorshipStore.ts ──  
cat > src/shared/stores/sponsorshipStore.ts << 'EOF'  
import { create } from 'zustand';  
import { SponsoredState, Campaign } from '../types/sponsorship';  
  
interface SponsorshipStore {  
  state:           SponsoredState;  
  setSponsored:    (campaign: Campaign & Partial<SponsoredState>) => void;  
  clearSponsored:  () => void;  
  updateMetric:    (key: string, value: number) => void;  
}  
  
const DEFAULT_STATE: SponsoredState = {  
  isActive:             false,  
  lockNormalChallenges: false,  
  pinToFeed:            false,  
  campaign:             null,  
};  
  
export const useSponsorshipStore = create<SponsorshipStore>((set) => ({  
  state: DEFAULT_STATE,  
  
  setSponsored: (data) =>  
    set({  
      state: {  
        isActive:             true,  
        lockNormalChallenges: data.lockNormalChallenges ?? true,  
        pinToFeed:            data.pinToFeed            ?? true,  
        campaign:             data as Campaign,  
      },  
    }),  
  
  clearSponsored: () => set({ state: DEFAULT_STATE }),  
  
  updateMetric: (_key, _value) => {  
    // يُستخدم لتحديث الـ metrics محلياً  
  },  
}));  
EOF  
  
echo "✅ sponsorshipStore"
# ── src/shared/constants/index.ts ──  
cat > src/shared/constants/index.ts << 'EOF'  
export const shared = {  
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',  
  WS_URL:  process.env.EXPO_PUBLIC_WS_URL  ?? 'ws://localhost:8080/ws',  
  
  FEED_RATIOS: {  
    FOR_YOU:   0.45,  
    CHALLENGE: 0.30,  
    SPONSORED: 0.15,  
    FRIENDS:   0.10,  
  },  
  
  POINTS: {  
    UPLOAD:  3,  
    SUGGEST: 2,  
    VOTE:    1,  
    COMMENT: 1,  
    WIN:     10,  
  },  
  
  LIMITS: {  
    DAILY_SUGGESTIONS: 3,  
    DAILY_VOTES:       5,  
    NEAR_WIN_RANK:     5,  
    NEAR_WIN_GAP:      5,  
  },  
} as const;  
EOF  
  
echo "✅ constants"
# ── src/features/feed/engine/core/scoring.ts ──  
cat > src/features/feed/engine/core/scoring.ts << 'EOF'  
// محرك التسجيل — Layer 2  
// يُنفَّذ على الـ Backend لكن يُعكس هنا للتوثيق والـ client-side sorting  
  
export interface VideoCandidate {  
  id:          string;  
  likes:       number;  
  votes:       number;  
  comments:    number;  
  views:       number;  
  createdAt:   string;  
  isFollowing: boolean;  
  feedType:    string;  
}  
  
export interface ScoredVideo extends VideoCandidate {  
  score: number;  
}  
  
// معادلة الترتيب الأساسية  
export function scoreVideo(v: VideoCandidate): number {  
  const ageHours = (Date.now() - new Date(v.createdAt).getTime()) / 3_600_000;  
  
  return (  
    v.likes    * 0.30 +  
    v.votes    * 0.40 +  
    v.comments * 0.15 +  
    v.views    * 0.05 +  
    (v.isFollowing ? 10 : 0) +      // دفعة الأصدقاء  
    Math.max(0, 24 - ageHours) * 0.5 // دفعة الحداثة  
  );  
}  
  
export function rankVideos(candidates: VideoCandidate[]): ScoredVideo[] {  
  return candidates  
    .map(v => ({ ...v, score: scoreVideo(v) }))  
    .sort((a, b) => b.score - a.score);  
}  
EOF  
  
cat > src/features/feed/engine/strategies/sessionGuard.ts << 'EOF'  
// Layer 3 — حارس الجلسة: منع تكرار الفيديوهات  
const SESSION_KEY = 'feed_session_seen';  
  
class SessionGuard {  
  private seen = new Set<string>();  
  
  constructor() {  
    // تحميل الجلسة الحالية  
    try {  
      const stored = global.sessionStorage?.getItem(SESSION_KEY);  
      if (stored) JSON.parse(stored).forEach((id: string) => this.seen.add(id));  
    } catch {}  
  }  
  
  hasSeen(videoId: string): boolean {  
    return this.seen.has(videoId);  
  }  
  
  markSeen(videoId: string) {  
    this.seen.add(videoId);  
    // تنظيف تلقائي بعد 100 فيديو  
    if (this.seen.size > 100) {  
      const arr = [...this.seen];  
      this.seen = new Set(arr.slice(arr.length - 50));  
    }  
  }  
  
  filter<T extends { id: string }>(videos: T[]): T[] {  
    return videos.filter(v => !this.hasSeen(v.id));  
  }  
  
  reset() {  
    this.seen.clear();  
  }  
}  
  
export const sessionGuard = new SessionGuard();  
EOF  
  
cat > src/features/feed/engine/strategies/sponsoredInjection.ts << 'EOF'  
import { SponsoredState } from '../../../shared/types/sponsorship';  
  
// Layer 1 — حقن المحتوى الممول في الفيد  
export function injectSponsored<T extends { feedType: string }>(  
  feed:      T[],  
  sponsored: T[],  
  state:     SponsoredState,  
): T[] {  
  if (!state.isActive || !state.pinToFeed || sponsored.length === 0) {  
    return feed;  
  }  
  
  const result = [...feed];  
  // حقن فيديو ممول كل 5 فيديوهات  
  sponsored.forEach((s, i) => {  
    const pos = (i + 1) * 5;  
    if (pos <= result.length) {  
      result.splice(pos, 0, s);  
    } else {  
      result.push(s);  
    }  
  });  
  
  return result;  
}  
EOF  
  
cat > src/features/feed/engine/behavioral.ts << 'EOF'  
// Layer 4 — الحماية السلوكية: اكتشاف الإحباط وتعديل الفيد  
  
export interface BehaviorSignals {  
  skipRate:      number; // نسبة التخطي (0-1)  
  avgWatchTime:  number; // ثواني  
  sessionLength: number; // دقائق  
}  
  
export type FeedAdjustment = 'normal' | 'more_entertaining' | 'reduce_challenge' | 'break_suggested';  
  
export function analyzeBehavior(signals: BehaviorSignals): FeedAdjustment {  
  // تخطي كثير → محتوى أكثر ترفيهاً  
  if (signals.skipRate > 0.7) return 'more_entertaining';  
  
  // وقت مشاهدة قصير جداً  
  if (signals.avgWatchTime < 5) return 'reduce_challenge';  
  
  // جلسة طويلة جداً → اقتراح راحة  
  if (signals.sessionLength > 60) return 'break_suggested';  
  
  return 'normal';  
}  
  
export function adjustFeedRatios(  
  adjustment: FeedAdjustment,  
): Record<string, number> {  
  switch (adjustment) {  
    case 'more_entertaining':  
      return { for_you: 0.60, challenge: 0.20, sponsored: 0.15, friends: 0.05 };  
    case 'reduce_challenge':  
      return { for_you: 0.55, challenge: 0.15, sponsored: 0.20, friends: 0.10 };  
    case 'break_suggested':  
      return { for_you: 0.70, challenge: 0.10, sponsored: 0.10, friends: 0.10 };  
    default:  
      return { for_you: 0.45, challenge: 0.30, sponsored: 0.15, friends: 0.10 };  
  }  
}  
EOF  
  
echo "✅ Feed Engine"
cd ~/wanasa-backend  
  
# ── migrations ──  
cat > migrations/001_init.sql << 'EOF'  
-- ══════════════════════════════════════════  
-- Wanasa Database — Elite ERD  
-- ══════════════════════════════════════════  
  
-- Extensions  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- بحث نصي سريع  
  
-- ══════════════  
-- 1. USERS LAYER  
-- ══════════════  
CREATE TABLE users (  
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  username    VARCHAR(50)  UNIQUE NOT NULL,  
  name        VARCHAR(100) NOT NULL,  
  facebook_id VARCHAR(100) UNIQUE NOT NULL,  
  avatar_url  TEXT,  
  role        VARCHAR(20) NOT NULL DEFAULT 'user'  
              CHECK (role IN ('user','moderator','admin')),  
  status      VARCHAR(20) NOT NULL DEFAULT 'active'  
              CHECK (status IN ('active','banned','shadow_banned')),  
  points         INT NOT NULL DEFAULT 0,  
  weekly_points  INT NOT NULL DEFAULT 0,  
  streak         INT NOT NULL DEFAULT 0,  
  grace_used     BOOL NOT NULL DEFAULT FALSE,  
  is_online      BOOL NOT NULL DEFAULT FALSE,  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  deleted_at  TIMESTAMPTZ  
);  
  
CREATE TABLE followers (  
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  follower_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  UNIQUE(follower_id, following_id),  
  CHECK(follower_id != following_id)  
);  
  
CREATE TABLE blocks (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  UNIQUE(blocker_id, blocked_id)  
);  
  
CREATE TABLE user_stats (  
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,  
  total_videos INT NOT NULL DEFAULT 0,  
  total_views  INT NOT NULL DEFAULT 0,  
  total_likes  INT NOT NULL DEFAULT 0,  
  total_votes  INT NOT NULL DEFAULT 0,  
  total_points INT NOT NULL DEFAULT 0,  
  wins         INT NOT NULL DEFAULT 0,  
  rank_cache   INT,  
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- ════════════════  
-- 2. VIDEO SYSTEM  
-- ════════════════  
CREATE TABLE daily_challenges (  
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  title           VARCHAR(200) NOT NULL,  
  description     TEXT,  
  date            DATE UNIQUE NOT NULL,  
  status          VARCHAR(20) NOT NULL DEFAULT 'active'  
                  CHECK (status IN ('active','locked','finished')),  
  winner_video_id UUID, -- FK يُضاف بعد إنشاء videos  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE campaigns (  
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  sponsor_name VARCHAR(100) NOT NULL,  
  title        VARCHAR(200) NOT NULL,  
  description  TEXT,  
  logo_url     TEXT,  
  theme_color  VARCHAR(7) DEFAULT '#FF6B2C',  
  budget       DECIMAL(12,2),  
  status       VARCHAR(20) NOT NULL DEFAULT 'draft'  
               CHECK (status IN ('draft','active','ended')),  
  priority     INT NOT NULL DEFAULT 0,  
  start_at     TIMESTAMPTZ,  
  end_at       TIMESTAMPTZ,  
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE videos (  
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  challenge_id  UUID REFERENCES daily_challenges(id),  
  campaign_id   UUID REFERENCES campaigns(id),  
  title         VARCHAR(200) NOT NULL,  
  description   TEXT,  
  video_url     TEXT NOT NULL,  
  thumbnail_url TEXT,  
  duration      INT NOT NULL DEFAULT 0, -- ثواني  
  status        VARCHAR(20) NOT NULL DEFAULT 'processing'  
                CHECK (status IN ('processing','active','rejected','shadowed','deleted')),  
  views_count   INT NOT NULL DEFAULT 0,  
  likes_count   INT NOT NULL DEFAULT 0,  
  votes_count   INT NOT NULL DEFAULT 0,  
  comments_count INT NOT NULL DEFAULT 0,  
  saves_count   INT NOT NULL DEFAULT 0,  
  is_winner     BOOL NOT NULL DEFAULT FALSE,  
  is_pinned     BOOL NOT NULL DEFAULT FALSE,  
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- FK الفائز  
ALTER TABLE daily_challenges  
  ADD CONSTRAINT fk_winner_video  
  FOREIGN KEY (winner_video_id) REFERENCES videos(id);  
  
CREATE TABLE video_views (  
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,  
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,  
  watch_time      INT NOT NULL DEFAULT 0, -- ثواني  
  is_valid_view   BOOL NOT NULL DEFAULT FALSE, -- تجاوز 3ث أو 30%  
  device_hash     VARCHAR(64), -- حماية الغش  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE video_likes (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  UNIQUE(video_id, user_id)  
);  
  
CREATE TABLE video_votes (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  UNIQUE(video_id, user_id)  
);  
  
CREATE TABLE video_comments (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  content    TEXT NOT NULL,  
  parent_id  UUID REFERENCES video_comments(id),  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE video_saves (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  video_id   UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  UNIQUE(video_id, user_id)  
);  
  
-- ═══════════════════  
-- 3. CHALLENGES SYSTEM  
-- ═══════════════════  
CREATE TABLE challenge_ideas (  
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,  
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  content      TEXT NOT NULL,  
  votes_count  INT NOT NULL DEFAULT 0,  
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE challenge_idea_votes (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  idea_id    UUID NOT NULL REFERENCES challenge_ideas(id) ON DELETE CASCADE,  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  UNIQUE(idea_id, user_id)  
);  
  
CREATE TABLE challenge_winners (  
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  challenge_id   UUID NOT NULL REFERENCES daily_challenges(id),  
  video_id       UUID NOT NULL REFERENCES videos(id),  
  user_id        UUID NOT NULL REFERENCES users(id),  
  points_awarded INT NOT NULL DEFAULT 10,  
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- ════════════════════  
-- 4. SPONSORSHIP SYSTEM  
-- ════════════════════  
CREATE TABLE sponsored_challenges (  
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  campaign_id            UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,  
  challenge_id           UUID REFERENCES daily_challenges(id),  
  is_active              BOOL NOT NULL DEFAULT FALSE,  
  is_pinned              BOOL NOT NULL DEFAULT TRUE,  
  lock_normal_challenges BOOL NOT NULL DEFAULT TRUE,  
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- صف واحد يتحكم بالحالة العامة للتطبيق  
CREATE TABLE sponsored_state (  
  id                     INT PRIMARY KEY DEFAULT 1  
                         CHECK (id = 1), -- صف واحد فقط  
  is_active              BOOL NOT NULL DEFAULT FALSE,  
  campaign_id            UUID REFERENCES campaigns(id),  
  lock_normal_challenges BOOL NOT NULL DEFAULT FALSE,  
  pin_to_feed            BOOL NOT NULL DEFAULT FALSE,  
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
INSERT INTO sponsored_state VALUES (1, FALSE, NULL, FALSE, FALSE, NOW());  
  
CREATE TABLE campaign_metrics (  
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,  
  impressions     BIGINT NOT NULL DEFAULT 0,  
  clicks          BIGINT NOT NULL DEFAULT 0,  
  submissions     BIGINT NOT NULL DEFAULT 0,  
  votes           BIGINT NOT NULL DEFAULT 0,  
  watch_time      BIGINT NOT NULL DEFAULT 0, -- ثواني  
  engagement_rate DECIMAL(5,2) DEFAULT 0,  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE campaign_pricing (  
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,  
  model           VARCHAR(10) NOT NULL CHECK (model IN ('CPM','CPC','FIXED')),  
  price_per_unit  DECIMAL(10,4) NOT NULL DEFAULT 0,  
  estimated_budget DECIMAL(12,2),  
  actual_cost     DECIMAL(12,2) DEFAULT 0,  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- ═══════════════  
-- 5. POINTS SYSTEM  
-- ═══════════════  
CREATE TABLE points_log (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  type       VARCHAR(20) NOT NULL  
             CHECK (type IN ('video','vote','idea','win','comment','like')),  
  points     INT NOT NULL,  
  ref_id     UUID, -- video_id أو idea_id  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE leaderboard_weekly (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  week_start DATE NOT NULL,  
  week_end   DATE NOT NULL,  
  points     INT NOT NULL DEFAULT 0,  
  rank       INT,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  UNIQUE(user_id, week_start)  
);  
  
CREATE TABLE badges (  
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  name        VARCHAR(100) NOT NULL,  
  description TEXT,  
  icon        VARCHAR(10),  
  rule_type   VARCHAR(50) NOT NULL  
);  
  
CREATE TABLE user_badges (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  badge_id   UUID NOT NULL REFERENCES badges(id),  
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  UNIQUE(user_id, badge_id)  
);  
  
-- ═══════════════════════  
-- 6. NOTIFICATIONS SYSTEM  
-- ═══════════════════════  
CREATE TABLE notifications (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  type       VARCHAR(30) NOT NULL,  
  title      VARCHAR(200) NOT NULL,  
  body       TEXT,  
  is_read    BOOL NOT NULL DEFAULT FALSE,  
  ref_id     UUID,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE device_tokens (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  token      TEXT NOT NULL UNIQUE,  
  platform   VARCHAR(10) NOT NULL CHECK (platform IN ('ios','android','web')),  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- ═════════════════  
-- 7. REALTIME SYSTEM  
-- ═════════════════  
CREATE TABLE websocket_sessions (  
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  connection_id VARCHAR(100) NOT NULL UNIQUE,  
  last_active   TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE realtime_events (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  event_type VARCHAR(50) NOT NULL,  
  payload    JSONB NOT NULL DEFAULT '{}',  
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- ══════════════════  
-- 8. MODERATION SYSTEM  
-- ══════════════════  
CREATE TABLE reports (  
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  reporter_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  target_video_id UUID REFERENCES videos(id) ON DELETE SET NULL,  
  target_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,  
  reason          TEXT NOT NULL,  
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'  
                  CHECK (status IN ('pending','resolved','rejected')),  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE shadow_bans (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  reason     TEXT,  
  active     BOOL NOT NULL DEFAULT TRUE,  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
CREATE TABLE moderation_logs (  
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  content_type VARCHAR(20) NOT NULL,  
  content_id   UUID NOT NULL,  
  ai_result    JSONB,  
  action       VARCHAR(50),  
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- ══════════════════  
-- 9. ANALYTICS SYSTEM  
-- ══════════════════  
CREATE TABLE events (  
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,  
  event_type VARCHAR(50) NOT NULL,  
  metadata   JSONB NOT NULL DEFAULT '{}',  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);  
  
-- ════════════  
-- INDEXES  
-- ════════════  
CREATE INDEX idx_videos_status     ON videos(status, created_at DESC);  
CREATE INDEX idx_videos_challenge  ON videos(challenge_id) WHERE challenge_id IS NOT NULL;  
CREATE INDEX idx_videos_user       ON videos(user_id, created_at DESC);  
CREATE INDEX idx_video_views_valid ON video_views(video_id, is_valid_view);  
CREATE INDEX idx_followers_pair    ON followers(follower_id, following_id);  
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);  
CREATE INDEX idx_points_log_user   ON points_log(user_id, created_at DESC);  
CREATE INDEX idx_leaderboard_week  ON leaderboard_weekly(week_start, points DESC);  
CREATE INDEX idx_events_type       ON events(event_type, created_at DESC);  
CREATE INDEX idx_reports_status    ON reports(status, created_at DESC);  
CREATE INDEX idx_realtime_events   ON realtime_events(event_type, created_at DESC);  
  
-- Badges الأساسية  
INSERT INTO badges (name, description, icon, rule_type) VALUES  
  ('صانع محتوى',   'نشر فيديوهات',        '🎬', 'videos_count'),  
  ('الملهم',        'اقتراح أفكار مقبولة', '💡', 'ideas_count'),  
  ('المساهم النشط','التفاعل مع المحتوى',   '❤️', 'interactions_count'),  
  ('النجم الأسبوعي','Top leaderboard',     '⭐', 'weekly_rank');  
  
COMMIT;  
EOF  
  
echo "✅ migrations/001_init.sql"
# ── internal/websocket/hub.go ──  
cat > internal/websocket/hub.go << 'EOF'  
package websocket  
  
import (  
"context"  
"encoding/json"  
"sync"  
  
"github.com/wanasa/backend/pkg/cache"  
)  
  
// ── Client ──  
type Client struct {  
UserID string  
Send   chan []byte  
}  
  
// ── Hub ──  
type Hub struct {  
mu      sync.RWMutex  
clients map[string][]*Client // userID → clients  
}  
  
var H = &Hub{  
clients: make(map[string][]*Client),  
}  
  
func (h *Hub) Register(c *Client) {  
h.mu.Lock()  
h.clients[c.UserID] = append(h.clients[c.UserID], c)  
h.mu.Unlock()  
}  
  
func (h *Hub) Unregister(c *Client) {  
h.mu.Lock()  
list := h.clients[c.UserID]  
for i, cl := range list {  
if cl == c {  
h.clients[c.UserID] = append(list[:i], list[i+1:]...)  
break  
}  
}  
h.mu.Unlock()  
close(c.Send)  
}  
  
// إرسال لمستخدم محدد  
func (h *Hub) SendToUser(userID string, event string, payload any) {  
b, _ := json.Marshal(map[string]any{"type": event, "payload": payload})  
h.mu.RLock()  
for _, c := range h.clients[userID] {  
select {  
case c.Send <- b:  
default:  
}  
}  
h.mu.RUnlock()  
}  
  
// بث لكل المستخدمين المتصلين  
func (h *Hub) Broadcast(event string, payload any) {  
b, _ := json.Marshal(map[string]any{"type": event, "payload": payload})  
h.mu.RLock()  
for _, clients := range h.clients {  
for _, c := range clients {  
select {  
case c.Send <- b:  
default:  
}  
}  
}  
h.mu.RUnlock()  
}  
  
// ── Redis PubSub Listener ──  
// يستمع لأحداث من الـ workers ويوصلها للـ WebSocket  
func (h *Hub) StartPubSub(ctx context.Context) {  
sub := cache.Subscribe(ctx,  
"notifications",  
"leaderboard",  
"sponsored",  
"challenge",  
)  
defer sub.Close()  
  
for msg := range sub.Channel() {  
var event struct {  
Type    string `json:"type"`  
UserID  string `json:"userId,omitempty"`  
Payload any    `json:"payload"`  
}  
if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {  
continue  
}  
  
if event.UserID != "" {  
// إرسال لمستخدم محدد  
h.SendToUser(event.UserID, event.Type, event.Payload)  
} else {  
// بث لكل المستخدمين  
h.Broadcast(event.Type, event.Payload)  
}  
}  
}  
EOF  
  
echo "✅ websocket/hub.go"
# ── internal/sponsorship/service.go ──  
cat > internal/sponsorship/service.go << 'EOF'  
package sponsorship  
  
import (  
"context"  
"time"  
  
"github.com/wanasa/backend/pkg/cache"  
"github.com/wanasa/backend/pkg/database"  
"github.com/wanasa/backend/internal/websocket"  
)  
  
const StateKey = "sponsored:state"  
  
type State struct {  
IsActive             bool      `json:"isActive"`  
CampaignID           string    `json:"campaignId,omitempty"`  
LockNormalChallenges bool      `json:"lockNormalChallenges"`  
PinToFeed            bool      `json:"pinToFeed"`  
Campaign             *Campaign `json:"campaign,omitempty"`  
UpdatedAt            time.Time `json:"updatedAt"`  
}  
  
type Campaign struct {  
ID          string `json:"id"`  
SponsorName string `json:"sponsorName"`  
Title       string `json:"title"`  
LogoURL     string `json:"logoUrl"`  
ThemeColor  string `json:"themeColor"`  
EndAt       string `json:"endAt"`  
}  
  
// GetState — يجلب الحالة من Redis أولاً ثم DB  
func GetState(ctx context.Context) (*State, error) {  
var state State  
if err := cache.Get(ctx, StateKey, &state); err == nil {  
return &state, nil  
}  
  
// جلب من DB  
row := database.DB.QueryRow(ctx, `  
SELECT ss.is_active, ss.campaign_id,  
       ss.lock_normal_challenges, ss.pin_to_feed,  
       c.sponsor_name, c.title, c.logo_url, c.theme_color, c.end_at  
FROM sponsored_state ss  
LEFT JOIN campaigns c ON c.id = ss.campaign_id  
WHERE ss.id = 1  
`)  
  
var (  
isActive   bool  
campID     *string  
lockChall  bool  
pinFeed    bool  
sponsorName, title, logo, color, endAt *string  
)  
  
if err := row.Scan(&isActive, &campID, &lockChall, &pinFeed,  
&sponsorName, &title, &logo, &color, &endAt); err != nil {  
return &State{IsActive: false}, nil  
}  
  
state = State{  
IsActive:             isActive,  
LockNormalChallenges: lockChall,  
PinToFeed:            pinFeed,  
UpdatedAt:            time.Now(),  
}  
  
if campID != nil {  
state.CampaignID = *campID  
state.Campaign = &Campaign{  
ID:          *campID,  
SponsorName: deref(sponsorName),  
Title:       deref(title),  
LogoURL:     deref(logo),  
ThemeColor:  deref(color),  
EndAt:       deref(endAt),  
}  
}  
  
// كاش 30 ثانية  
cache.Set(ctx, StateKey, state, 30*time.Second)  
return &state, nil  
}  
  
// Activate — تفعيل حملة ممولة لحظياً  
func Activate(ctx context.Context, campaignID string, lockChall, pinFeed bool) error {  
_, err := database.DB.Exec(ctx, `  
UPDATE sponsored_state SET  
  is_active=true, campaign_id=$1,  
  lock_normal_challenges=$2, pin_to_feed=$3,  
  updated_at=NOW()  
WHERE id=1  
`, campaignID, lockChall, pinFeed)  
if err != nil {  
return err  
}  
  
// إبطال الكاش  
cache.Del(ctx, StateKey)  
  
// جلب الحالة الجديدة  
state, _ := GetState(ctx)  
  
// بث فوري لكل المستخدمين عبر WebSocket  
websocket.H.Broadcast("sponsored_update", state)  
  
// نشر على Redis PubSub للـ workers  
cache.Publish(ctx, "sponsored", map[string]any{  
"type":    "sponsored_update",  
"payload": state,  
})  
  
return nil  
}  
  
// End — إنهاء الحملة  
func End(ctx context.Context) error {  
_, err := database.DB.Exec(ctx, `  
UPDATE sponsored_state SET  
  is_active=false, campaign_id=NULL,  
  lock_normal_challenges=false, pin_to_feed=false,  
  updated_at=NOW()  
WHERE id=1  
`)  
if err != nil {  
return err  
}  
  
cache.Del(ctx, StateKey)  
websocket.H.Broadcast("sponsored_ended", map[string]any{"message": "campaign ended"})  
  
return nil  
}  
  
func deref(s *string) string {  
if s == nil { return "" }  
return *s  
}  
EOF  
  
echo "✅ sponsorship/service.go"
# ── internal/leaderboard/service.go ──  
cat > internal/leaderboard/service.go << 'EOF'  
package leaderboard  
  
import (  
"context"  
"fmt"  
"time"  
  
"github.com/wanasa/backend/pkg/cache"  
"github.com/wanasa/backend/pkg/database"  
"github.com/wanasa/backend/internal/websocket"  
"github.com/wanasa/backend/internal/shared"  
)  
  
const (  
WeeklyKey  = "leaderboard:weekly"  
CacheKey   = "leaderboard:top20"  
)  
  
type Entry struct {  
UserID   string  `json:"userId"`  
Name     string  `json:"name"`  
Avatar   string  `json:"avatar"`  
Points   float64 `json:"points"`  
Rank     int     `json:"rank"`  
}  
  
// AddPoints — يضيف نقاط ويتحقق من Near Win  
func AddPoints(ctx context.Context, userID string, points int, reason string) error {  
// تحديث DB  
_, err := database.DB.Exec(ctx,  
`UPDATE users SET points = points + $1, weekly_points = weekly_points + $1,  
        updated_at = NOW() WHERE id = $2`,  
points, userID,  
)  
if err != nil { return err }  
  
// تسجيل في points_log  
database.DB.Exec(ctx,  
`INSERT INTO points_log (user_id, type, points) VALUES ($1, $2, $3)`,  
userID, reason, points,  
)  
  
// تحديث Redis Sorted Set  
cache.ZAdd(ctx, WeeklyKey, float64(points), userID)  
cache.Del(ctx, CacheKey)  
  
// فحص Near Win  
go checkNearWin(ctx, userID)  
  
return nil  
}  
  
// GetTop20 — أفضل 20 مستخدم  
func GetTop20(ctx context.Context) ([]Entry, error) {  
var entries []Entry  
if err := cache.Get(ctx, CacheKey, &entries); err == nil {  
return entries, nil  
}  
  
rows, err := database.DB.Query(ctx, `  
SELECT u.id, u.name, u.avatar_url,  
       u.weekly_points,  
       RANK() OVER (ORDER BY u.weekly_points DESC) AS rank  
FROM users u  
WHERE u.status = 'active'  
ORDER BY u.weekly_points DESC  
LIMIT 20  
`)  
if err != nil { return nil, err }  
defer rows.Close()  
  
for rows.Next() {  
var e Entry  
rows.Scan(&e.UserID, &e.Name, &e.Avatar, &e.Points, &e.Rank)  
entries = append(entries, e)  
}  
  
cache.Set(ctx, CacheKey, entries, 2*time.Minute)  
return entries, nil  
}  
  
// GetUserRank — ترتيب مستخدم محدد  
func GetUserRank(ctx context.Context, userID string) (int, int, error) {  
var rank, points int  
err := database.DB.QueryRow(ctx, `  
SELECT rank, weekly_points FROM (  
  SELECT id,  
         weekly_points,  
         RANK() OVER (ORDER BY weekly_points DESC) AS rank  
  FROM users WHERE status='active'  
) r WHERE id=$1  
`, userID).Scan(&rank, &points)  
return rank, points, err  
}  
  
// checkNearWin — يُشعر المستخدم لو اقترب من القمة  
func checkNearWin(ctx context.Context, userID string) {  
rank, myPts, err := GetUserRank(ctx, userID)  
if err != nil { return }  
  
if rank > shared.NearWinRank { return }  
  
// جلب نقاط المركز الأول  
var leaderPts int  
database.DB.QueryRow(ctx,  
`SELECT weekly_points FROM users WHERE status='active'  
 ORDER BY weekly_points DESC LIMIT 1`,  
).Scan(&leaderPts)  
  
gap := leaderPts - myPts  
if gap <= shared.NearWinGap && gap > 0 {  
// إشعار Near Win  
websocket.H.SendToUser(userID, "near_win", map[string]any{  
"rank": rank,  
"gap":  gap,  
"message": fmt.Sprintf("أنت في المركز #%d… باقي %d نقاط!", rank, gap),  
})  
  
// حفظ الإشعار في DB  
database.DB.Exec(ctx, `  
INSERT INTO notifications (user_id, type, title, body)  
VALUES ($1, 'near_win', '🔥 أنت قريب جداً!', $2)  
`, userID, fmt.Sprintf("فرق %d نقاط فقط عن المركز الأول", gap))  
}  
}  
  
// WeeklyReset — يُشغَّل كل أسبوع (Cron)  
func WeeklyReset(ctx context.Context) error {  
now      := time.Now()  
weekStart := now.AddDate(0, 0, -int(now.Weekday()))  
  
// حفظ الترتيب الأسبوعي  
_, err := database.DB.Exec(ctx, `  
INSERT INTO leaderboard_weekly (user_id, week_start, week_end, points, rank)  
SELECT id,  
       $1::date,  
       $1::date + INTERVAL '6 days',  
       weekly_points,  
       RANK() OVER (ORDER BY weekly_points DESC)  
FROM users WHERE status='active' AND weekly_points > 0  
ON CONFLICT (user_id, week_start) DO UPDATE  
SET points=EXCLUDED.points, rank=EXCLUDED.rank  
`, weekStart)  
if err != nil { return err }  
  
// تصفير النقاط الأسبوعية  
database.DB.Exec(ctx, `UPDATE users SET weekly_points=0, updated_at=NOW()`)  
  
// تنظيف Redis  
cache.Del(ctx, WeeklyKey, CacheKey)  
  
// إشعار الفائز  
var winnerID, winnerName string  
database.DB.QueryRow(ctx, `  
SELECT user_id FROM leaderboard_weekly  
WHERE week_start=$1 ORDER BY rank LIMIT 1  
`, weekStart).Scan(&winnerID)  
  
database.DB.QueryRow(ctx,  
`SELECT name FROM users WHERE id=$1`, winnerID,  
).Scan(&winnerName)  
  
websocket.H.Broadcast("weekly_winner", map[string]any{  
"userId": winnerID,  
"name":   winnerName,  
})  
  
return nil  
}  
EOF  
  
echo "✅ leaderboard/service.go"
# ── cmd/api/main.go ──  
cat > cmd/api/main.go << 'EOF'  
package main  
  
import (  
"context"  
"log"  
"os"  
"time"  
  
"github.com/gofiber/fiber/v2"  
"github.com/gofiber/fiber/v2/middleware/cors"  
fiberlog "github.com/gofiber/fiber/v2/middleware/logger"  
"github.com/gofiber/fiber/v2/middleware/recover"  
"github.com/gofiber/fiber/v2/middleware/limiter"  
gows "github.com/gofiber/websocket/v2"  
"github.com/joho/godotenv"  
  
"github.com/wanasa/backend/internal/auth"  
"github.com/wanasa/backend/internal/feed"  
"github.com/wanasa/backend/internal/challenges"  
"github.com/wanasa/backend/internal/leaderboard"  
"github.com/wanasa/backend/internal/notifications"  
"github.com/wanasa/backend/internal/sponsorship"  
"github.com/wanasa/backend/internal/admin"  
"github.com/wanasa/backend/internal/websocket"  
"github.com/wanasa/backend/pkg/cache"  
"github.com/wanasa/backend/pkg/database"  
"github.com/wanasa/backend/pkg/middleware"  
"github.com/wanasa/backend/pkg/response"  
)  
  
func main() {  
// تحميل .env  
if err := godotenv.Load(); err != nil {  
log.Println("⚠️  .env not found — using system env")  
}  
  
// قاعدة البيانات  
if err := database.Connect(); err != nil {  
log.Fatalf("❌ DB: %v", err)  
}  
defer database.Close()  
log.Println("✅ PostgreSQL connected")  
  
// Redis  
if err := cache.Connect(); err != nil {  
log.Fatalf("❌ Redis: %v", err)  
}  
log.Println("✅ Redis connected")  
  
// WebSocket Hub + PubSub  
go websocket.H.StartPubSub(context.Background())  
  
// Fiber App  
app := fiber.New(fiber.Config{  
AppName:      "Wanasa API v1",  
ReadTimeout:  15 * time.Second,  
WriteTimeout: 15 * time.Second,  
ErrorHandler: func(c *fiber.Ctx, err error) error {  
return response.Err(c, fiber.StatusInternalServerError, err.Error())  
},  
})  
  
// Global Middleware  
app.Use(recover.New())  
app.Use(fiberlog.New(fiberlog.Config{  
Format: "[${time}] ${status} ${method} ${path} ${latency}\n",  
}))  
app.Use(cors.New(cors.Config{  
AllowOrigins: "*",  
AllowHeaders: "Authorization,Content-Type",  
}))  
app.Use(limiter.New(limiter.Config{  
Max:        100,  
Expiration: time.Minute,  
}))  
  
// ══════════════════════  
// Routes  
// ══════════════════════  
api := app.Group("/api/v1")  
  
// Health  
api.Get("/health", func(c *fiber.Ctx) error {  
return response.OK(c, fiber.Map{"status": "ok", "app": "wanasa"})  
})  
  
// ── Auth (Public) ──  
authG := api.Group("/auth")  
authG.Post("/facebook", auth.HandleFacebook)  
authG.Get("/me",        middleware.Auth, auth.HandleMe)  
  
// ── Protected Routes ──  
protected := api.Group("", middleware.Auth)  
  
// Feed  
protected.Get("/feed", feed.HandleFeed)  
  
// Videos  
videos := protected.Group("/videos")  
videos.Post("/:id/like",    feed.HandleLike)  
videos.Post("/:id/vote",    feed.HandleVote)  
videos.Post("/:id/save",    feed.HandleSave)  
videos.Post("/:id/view",    feed.HandleView)  
videos.Post("/:id/comment", feed.HandleComment)  
videos.Post("/:id/report",  feed.HandleReport)  
  
// Challenges  
chall := protected.Group("/challenges")  
chall.Get("/active",          challenges.HandleGetActive)  
chall.Get("/ideas",           challenges.HandleGetIdeas)  
chall.Post("/ideas",          challenges.HandleSubmitIdea)  
chall.Post("/ideas/:id/vote", challenges.HandleVoteIdea)  
chall.Delete("/ideas/:id",    challenges.HandleDeleteIdea)  
  
// Leaderboard  
lb := protected.Group("/leaderboard")  
lb.Get("/", leaderboard.HandleGetTop)  
lb.Get("/me", leaderboard.HandleGetMyRank)  
  
// Notifications  
notif := protected.Group("/notifications")  
notif.Get("/",          notifications.HandleGetAll)  
notif.Patch("/:id/read",notifications.HandleMarkRead)  
notif.Post("/token",     notifications.HandleRegisterToken)  
  
// Sponsorship (public read)  
api.Get("/sponsored/state", sponsorship.HandleGetState)  
  
// ── Admin Routes ──  
adminG := api.Group("/admin", middleware.Auth, middleware.AdminOnly)  
adminG.Get("/stats",              admin.HandleStats)  
adminG.Get("/videos",             admin.HandleVideos)  
adminG.Patch("/videos/:id",       admin.HandleUpdateVideo)  
adminG.Delete("/videos/:id",      admin.HandleDeleteVideo)  
adminG.Get("/reports",            admin.HandleReports)  
adminG.Patch("/reports/:id",      admin.HandleResolveReport)  
adminG.Get("/users",              admin.HandleUsers)  
adminG.Patch("/users/:id/ban",    admin.HandleBanUser)  
adminG.Get("/campaigns",          admin.HandleCampaigns)  
adminG.Post("/campaigns",         admin.HandleCreateCampaign)  
adminG.Post("/campaigns/:id/activate", admin.HandleActivateCampaign)  
adminG.Post("/campaigns/:id/end",      admin.HandleEndCampaign)  
  
// ── WebSocket ──  
app.Use("/ws", func(c *fiber.Ctx) error {  
if gows.IsWebSocketUpgrade(c) {  
return c.Next()  
}  
return fiber.ErrUpgradeRequired  
})  
app.Get("/ws", middleware.Auth, gows.New(handleWS))  
  
// Start  
port := os.Getenv("APP_PORT")  
if port == "" { port = "8080" }  
  
log.Printf("🚀 Wanasa API running on :%s", port)  
log.Fatal(app.Listen(":" + port))  
}  
  
// ── WebSocket Handler ──  
func handleWS(c *gows.Conn) {  
userID, _ := c.Locals("userID").(string)  
client := &websocket.Client{  
UserID: userID,  
Send:   make(chan []byte, 256),  
}  
websocket.H.Register(client)  
defer websocket.H.Unregister(client)  
  
// Goroutine للإرسال  
go func() {  
for msg := range client.Send {  
if err := c.WriteMessage(1, msg); err != nil {  
break  
}  
}  
}()  
  
// استقبال رسائل من العميل  
for {  
_, _, err := c.ReadMessage()  
if err != nil { break }  
}  
}  
EOF  
  
echo "✅ cmd/api/main.go"
cat > Makefile << 'EOF'  
.PHONY: dev build migrate docker-up docker-down  
  
# تشغيل محلي  
dev:  
go run cmd/api/main.go  
  
# بناء  
build:  
go build -o bin/wanasa cmd/api/main.go  
  
# تطبيق migrations  
migrate:  
psql "$$DATABASE_URL" -f migrations/001_init.sql  
  
# Docker  
docker-up:  
docker-compose up -d  
  
docker-down:  
docker-compose down  
  
# تنظيف  
clean:  
rm -rf bin/  
  
# فحص  
lint:  
go vet ./...  
EOF  
  
cat > docker-compose.yml << 'EOF'  
version: '3.8'  
  
services:  
  postgres:  
    image: postgres:16-alpine  
    environment:  
      POSTGRES_DB:       wanasa_db  
      POSTGRES_USER:     wanasa_user  
      POSTGRES_PASSWORD: wanasa_pass  
    ports:  
      - "5432:5432"  
    volumes:  
      - pgdata:/var/lib/postgresql/data  
      - ./migrations/001_init.sql:/docker-entrypoint-initdb.d/init.sql  
    healthcheck:  
      test: ["CMD-SHELL", "pg_isready -U wanasa_user -d wanasa_db"]  
      interval: 5s  
      timeout: 5s  
      retries: 5  
  
  redis:  
    image: redis:7.2-alpine  
    ports:  
      - "6379:6379"  
    volumes:  
      - redisdata:/data  
    command: redis-server --appendonly yes  
    healthcheck:  
      test: ["CMD", "redis-cli", "ping"]  
      interval: 5s  
      timeout: 3s  
      retries: 5  
  
volumes:  
  pgdata:  
  redisdata:  
EOF  
  
echo "✅ Makefile + docker-compose.yml"
# تشغيل قاعدة البيانات وRedis  
cd ~/wanasa-backend  
docker-compose up -d  
  
# انتظر 5 ثواني للتأكد من الجاهزية  
sleep 5  
  
# تطبيق migrations  
docker exec -i $(docker ps -qf "name=postgres") \  
  psql -U wanasa_user -d wanasa_db < migrations/001_init.sql  
  
echo "✅ Database initialized"  
  
# تشغيل الـ Backend  
go mod tidy && go run cmd/api/main.go

# تشغيل قاعدة البيانات وRedis
cd ~/wanasa-backend
docker-compose up -d

# انتظر 5 ثواني للتأكد من الجاهزية
sleep 5

# تطبيق migrations
docker exec -i $(docker ps -qf "name=postgres") \
  psql -U wanasa_user -d wanasa_db < migrations/001_init.sql

echo "✅ Database initialized"

# تشغيل الـ Backend
go mod tidy && go run cmd/api/main.go
# ── internal/challenges/service.go ──
cat > internal/challenges/service.go << 'EOF'
package challenges

import (
"context"
"fmt"
"time"

"github.com/wanasa/backend/pkg/cache"
"github.com/wanasa/backend/pkg/database"
"github.com/wanasa/backend/internal/leaderboard"
"github.com/wanasa/backend/internal/websocket"
"github.com/wanasa/backend/internal/shared"
"github.com/google/uuid"
)

const (
CacheActiveChallenge = "challenge:active"
CacheIdeas           = "challenge:ideas:%s" // tab
KeyDailySuggestions  = "daily:suggestions:%s:%s" // userID:date
KeyDailyVotes        = "daily:votes:%s:%s"       // userID:date
)

type Challenge struct {
ID          string     `json:"id"`
Title       string     `json:"title"`
Description string     `json:"description"`
Date        string     `json:"date"`
Status      string     `json:"status"`
WinnerVideo *string    `json:"winnerVideoId,omitempty"`
CreatedAt   time.Time  `json:"createdAt"`
}

type Idea struct {
ID          string    `json:"id"`
ChallengeID string    `json:"challengeId"`
UserID      string    `json:"userId"`
UserName    string    `json:"userName"`
UserAvatar  string    `json:"userAvatar"`
Content     string    `json:"content"`
VotesCount  int       `json:"votesCount"`
IsVoted     bool      `json:"isVoted"`
IsMine      bool      `json:"isMine"`
CreatedAt   time.Time `json:"createdAt"`
}

type DailyLimits struct {
SuggestionsLeft int `json:"suggestionsLeft"`
VotesLeft       int `json:"votesLeft"`
}

// ── GetActive ──
func GetActive(ctx context.Context) (*Challenge, error) {
var c Challenge
if err := cache.Get(ctx, CacheActiveChallenge, &c); err == nil {
return &c, nil
}

err := database.DB.QueryRow(ctx, `
SELECT id, title, description, date::text, status, winner_video_id, created_at
FROM daily_challenges
WHERE date = CURRENT_DATE AND status IN ('active','locked')
LIMIT 1
`).Scan(&c.ID, &c.Title, &c.Description, &c.Date,
&c.Status, &c.WinnerVideo, &c.CreatedAt)
if err != nil {
return nil, err
}

cache.Set(ctx, CacheActiveChallenge, c, 5*time.Minute)
return &c, nil
}

// ── GetIdeas ──
func GetIdeas(ctx context.Context, challengeID, userID, tab string) ([]Idea, error) {
key := fmt.Sprintf(CacheIdeas, tab)
var ideas []Idea
if err := cache.Get(ctx, key, &ideas); err == nil {
// إضافة isVoted و isMine لكل مستخدم
return enrichIdeas(ctx, ideas, userID), nil
}

query := `
SELECT ci.id, ci.challenge_id, ci.user_id,
       u.name, u.avatar_url,
       ci.content, ci.votes_count, ci.created_at
FROM challenge_ideas ci
JOIN users u ON u.id = ci.user_id
WHERE ci.challenge_id = $1
`
args := []any{challengeID}

switch tab {
case "friends":
query += ` AND ci.user_id IN (
SELECT following_id FROM followers WHERE follower_id = $2
)`
args = append(args, userID)
case "top":
query += ` ORDER BY ci.votes_count DESC`
default:
query += ` ORDER BY ci.created_at DESC`
}

rows, err := database.DB.Query(ctx, query, args...)
if err != nil {
return nil, err
}
defer rows.Close()

for rows.Next() {
var i Idea
rows.Scan(&i.ID, &i.ChallengeID, &i.UserID,
&i.UserName, &i.UserAvatar,
&i.Content, &i.VotesCount, &i.CreatedAt)
ideas = append(ideas, i)
}

cache.Set(ctx, key, ideas, 30*time.Second)
return enrichIdeas(ctx, ideas, userID), nil
}

func enrichIdeas(ctx context.Context, ideas []Idea, userID string) []Idea {
if len(ideas) == 0 || userID == "" {
return ideas
}

// جلب الأفكار التي صوّت عليها المستخدم
rows, _ := database.DB.Query(ctx,
`SELECT idea_id FROM challenge_idea_votes WHERE user_id=$1`,
userID,
)
defer rows.Close()

voted := map[string]bool{}
for rows.Next() {
var id string
rows.Scan(&id)
voted[id] = true
}

result := make([]Idea, len(ideas))
for i, idea := range ideas {
idea.IsVoted = voted[idea.ID]
idea.IsMine  = idea.UserID == userID
result[i] = idea
}
return result
}

// ── GetDailyLimits ──
func GetDailyLimits(ctx context.Context, userID string) (*DailyLimits, error) {
today := time.Now().Format("2006-01-02")

sugKey := fmt.Sprintf(KeyDailySuggestions, userID, today)
votKey := fmt.Sprintf(KeyDailyVotes, userID, today)

sugUsed, _ := cache.RDB.Get(ctx, sugKey).Int()
votUsed, _ := cache.RDB.Get(ctx, votKey).Int()

return &DailyLimits{
SuggestionsLeft: shared.LimitDailySuggestions - sugUsed,
VotesLeft:       shared.LimitDailyVotes - votUsed,
}, nil
}

// ── SubmitIdea ──
func SubmitIdea(ctx context.Context, challengeID, userID, content string) (*Idea, error) {
// فحص الحد اليومي
today  := time.Now().Format("2006-01-02")
sugKey := fmt.Sprintf(KeyDailySuggestions, userID, today)

count, _ := cache.RDB.Get(ctx, sugKey).Int()
if count >= shared.LimitDailySuggestions {
return nil, fmt.Errorf("تجاوزت حد الاقتراحات اليومي")
}

id := uuid.New().String()
_, err := database.DB.Exec(ctx,
`INSERT INTO challenge_ideas (id, challenge_id, user_id, content)
 VALUES ($1,$2,$3,$4)`,
id, challengeID, userID, content,
)
if err != nil {
return nil, err
}

// زيادة العداد في Redis
cache.RDB.Incr(ctx, sugKey)
cache.RDB.Expire(ctx, sugKey, 25*time.Hour)

// منح النقاط
go leaderboard.AddPoints(ctx, userID, shared.PointsSuggestIdea, "idea")

// إبطال كاش الأفكار
cache.Del(ctx, fmt.Sprintf(CacheIdeas, "all"),
fmt.Sprintf(CacheIdeas, "top"))

// بث للمستخدمين المتصلين
var userName, avatar string
database.DB.QueryRow(ctx,
`SELECT name, avatar_url FROM users WHERE id=$1`, userID,
).Scan(&userName, &avatar)

websocket.H.Broadcast("new_idea", Idea{
ID: id, ChallengeID: challengeID, UserID: userID,
UserName: userName, UserAvatar: avatar, Content: content,
})

return &Idea{
ID: id, ChallengeID: challengeID,
UserID: userID, Content: content,
IsMine: true,
}, nil
}

// ── VoteIdea ──
func VoteIdea(ctx context.Context, ideaID, userID string) error {
today  := time.Now().Format("2006-01-02")
votKey := fmt.Sprintf(KeyDailyVotes, userID, today)

count, _ := cache.RDB.Get(ctx, votKey).Int()
if count >= shared.LimitDailyVotes {
return fmt.Errorf("تجاوزت حد الأصوات اليومي")
}

// تصويت أو إلغاء تصويت
var exists bool
database.DB.QueryRow(ctx,
`SELECT EXISTS(SELECT 1 FROM challenge_idea_votes WHERE idea_id=$1 AND user_id=$2)`,
ideaID, userID,
).Scan(&exists)

if exists {
database.DB.Exec(ctx,
`DELETE FROM challenge_idea_votes WHERE idea_id=$1 AND user_id=$2`,
ideaID, userID,
)
database.DB.Exec(ctx,
`UPDATE challenge_ideas SET votes_count = votes_count - 1 WHERE id=$1`,
ideaID,
)
} else {
database.DB.Exec(ctx,
`INSERT INTO challenge_idea_votes (idea_id, user_id) VALUES ($1,$2)`,
ideaID, userID,
)
database.DB.Exec(ctx,
`UPDATE challenge_ideas SET votes_count = votes_count + 1 WHERE id=$1`,
ideaID,
)
cache.RDB.Incr(ctx, votKey)
cache.RDB.Expire(ctx, votKey, 25*time.Hour)

// منح النقاط لصاحب الفكرة
var ideaOwner string
database.DB.QueryRow(ctx,
`SELECT user_id FROM challenge_ideas WHERE id=$1`, ideaID,
).Scan(&ideaOwner)
go leaderboard.AddPoints(ctx, ideaOwner, shared.PointsVote, "vote")
}

cache.Del(ctx,
fmt.Sprintf(CacheIdeas, "all"),
fmt.Sprintf(CacheIdeas, "top"),
)
return nil
}

// ── DeleteIdea ──
func DeleteIdea(ctx context.Context, ideaID, userID string) error {
result, err := database.DB.Exec(ctx,
`DELETE FROM challenge_ideas WHERE id=$1 AND user_id=$2`,
ideaID, userID,
)
if err != nil { return err }

if result.RowsAffected() == 0 {
return fmt.Errorf("غير مصرح بالحذف")
}

// استرداد اقتراح
today  := time.Now().Format("2006-01-02")
sugKey := fmt.Sprintf(KeyDailySuggestions, userID, today)
cache.RDB.Decr(ctx, sugKey)

cache.Del(ctx,
fmt.Sprintf(CacheIdeas, "all"),
fmt.Sprintf(CacheIdeas, "top"),
)
return nil
}

// ── SelectWinner — يُشغَّل في نهاية اليوم ──
func SelectDailyWinner(ctx context.Context) error {
// أعلى فكرة تصبح تحدي الغد
var topIdeaID, topContent string
database.DB.QueryRow(ctx, `
SELECT ci.id, ci.content
FROM challenge_ideas ci
JOIN daily_challenges dc ON dc.id = ci.challenge_id
WHERE dc.date = CURRENT_DATE
ORDER BY ci.votes_count DESC
LIMIT 1
`).Scan(&topIdeaID, &topContent)

if topIdeaID == "" { return nil }

// إنشاء تحدي الغد
_, err := database.DB.Exec(ctx,
`INSERT INTO daily_challenges (title, date, status)
 VALUES ($1, CURRENT_DATE + 1, 'active')
 ON CONFLICT (date) DO UPDATE SET title=EXCLUDED.title`,
topContent,
)
if err != nil { return err }

// إغلاق تحدي اليوم
database.DB.Exec(ctx,
`UPDATE daily_challenges SET status='finished' WHERE date=CURRENT_DATE`,
)

// إبطال الكاش
cache.Del(ctx, CacheActiveChallenge,
fmt.Sprintf(CacheIdeas, "all"),
fmt.Sprintf(CacheIdeas, "top"),
fmt.Sprintf(CacheIdeas, "friends"),
)

// بث نهاية التحدي
websocket.H.Broadcast("challenge_end", map[string]any{
"winnerIdeaId": topIdeaID,
"nextChallenge": topContent,
})

return nil
}
