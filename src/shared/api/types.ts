// ── API Wrappers ──
export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
}

export interface PagedResponse<T> {
  success: boolean;
  data:    T[];
  total:   number;
  page:    number;
  hasMore: boolean;
}

// ── User ──
export interface User {
# ── src/shared/api/types.ts ──
cat > src/shared/api/types.ts << 'EOF'
// ── API Wrappers ──
export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
}

export interface PagedResponse<T> {
  success: boolean;
  data:    T[];
  total:   number;
  page:    number;
  hasMore: boolean;
}

// ── User ──
export interface User {
  id:           string;
  name:         string;
  username:     string;
  avatar:       string;
  role:         'user' | 'moderator' | 'admin';
  points:       number;
  weeklyPoints: number;
  streak:       number;
  graceUsed:    boolean;
  isOnline:     boolean;
  createdAt:    string;
}

// ── Video ──
export interface Video {
  id:           string;
  userId:       string;
  userName:     string;
  userAvatar:   string;
  url:          string;
  thumbnail:    string;
  title:        string;
  description?: string;
  challengeId?: string;
  likes:        number;
  votes:        number;
  comments:     number;
  saves:        number;
  views:        number;
  duration:     number;
  isLiked:      boolean;
  isVoted:      boolean;
  isSaved:      boolean;
  isWinner:     boolean;
  isSponsored:  boolean;
  feedType:     FeedType;
  createdAt:    string;
}

export type FeedType = 'for_you' | 'challenge' | 'sponsored' | 'friends';

// ── Challenge ──
export interface Challenge {
  id:           string;
  title:        string;
  description:  string;
  date:         string;
  status:       'active' | 'locked' | 'finished';
  winnerVideoId?: string;
  createdAt:    string;
}

export interface ChallengeIdea {
  id:          string;
  challengeId: string;
  userId:      string;
  userName:    string;
  userAvatar:  string;
  content:     string;
  votesCount:  number;
  isVoted:     boolean;
  isMine:      boolean;
  createdAt:   string;
}

export interface DailyLimits {
  suggestionsLeft: number;
  votesLeft:       number;
}

// ── Leaderboard ──
export interface LeaderEntry {
  userId:  string;
  name:    string;
  avatar:  string;
  points:  number;
  rank:    number;
}

// ── Notification ──
export type NotifType =
  | 'rank_up' | 'near_win' | 'win'
  | 'badge_earned' | 'grace_day'
  | 'follow' | 'comment' | 'vote';

export interface Notification {
  id:        string;
  userId:    string;
  type:      NotifType;
  title:     string;
  body:      string;
  isRead:    boolean;
  readAt?:   string;
  refId?:    string;
  createdAt: string;
}

// ── Sponsorship ──
export interface SponsoredState {
  isActive:             boolean;
  lockNormalChallenges: boolean;
  pinToFeed:            boolean;
  campaign?:            Campaign;
}

export interface Campaign {
  id:          string;
  sponsorName: string;
  title:       string;
  description: string;
  logoUrl:     string;
  themeColor:  string;
  endAt:       string;
}

// ── Auth ──
export interface AuthResponse {
  token:        string;
  refreshToken: string;
  user:         User;
}

// ── Stats (Admin) ──
export interface AdminStats {
  dailyViews:  number;
  dailyVideos: number;
  dailyVotes:  number;
  activeUsers: number;
}
