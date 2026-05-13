// ===================================
// 📦 Wanasa — Core Types
// ===================================

// --- User ---
export interface User {
  id:            string;
  name:          string;
  username:      string;
  avatar:        string;
  facebookId:    string;
  points:        number;
  weeklyPoints:  number;
  streak:        number;
  graceUsed:     boolean;
  isOnline:      boolean;
  rank:          number;
  badges:        Badge[];
  stats: {
    videos:      number;
    followers:   number;
    following:   number;
    wins:        number;
  };
  blockedUsers:  string[];
  createdAt:     string;
}

// --- Video ---
export interface Video {
  id:            string;
  userId:        string;
  user:          Pick<User, 'id'|'name'|'username'|'avatar'>;
  url:           string;
  thumbnail:     string;
  title:         string;
  description?:  string;
  challengeId?:  string;
  likes:         number;
  votes:         number;
  comments:      number;
  saves:         number;
  views:         number;
  isLiked:       boolean;
  isVoted:       boolean;
  isSaved:       boolean;
  isWinner:      boolean;
  isSponsored:   boolean;
  feedType:      FeedType;
  duration:      number;
  createdAt:     string;
}

// --- Challenge ---
export interface Challenge {
  id:            string;
  title:         string;
  description:   string;
  isSponsored:   boolean;
  sponsor?:      string;
  sponsorLogo?:  string;
  startsAt:      string;
  endsAt:        string;
  participantsCount: number;
  votesRemaining:    number;
  status:        'active' | 'voting' | 'ended';
}

// --- Challenge Idea ---
export interface ChallengeIdea {
  id:            string;
  userId:        string;
  user:          Pick<User, 'id'|'name'|'avatar'>;
  title:         string;
  description?:  string;
  votes:         number;
  isVoted:       boolean;
  createdAt:     string;
}

// --- Badge ---
export interface Badge {
  id:            string;
  type:          BadgeType;
  title:         string;
  description:   string;
  icon:          string;
  earnedAt:      string;
}

// --- Notification ---
export interface Notification {
  id:            string;
  type:          NotificationType;
  title:         string;
  body:          string;
  isRead:        boolean;
  userId:        string;
  relatedId?:    string;
  createdAt:     string;
}

// --- Enums ---
export type FeedType       = 'for_you' | 'challenge' | 'sponsored' | 'friends';
export type BadgeType      = 'creator' | 'inspirer' | 'contributor' | 'weekly_star';
export type NotificationType = 'rank_up' | 'near_win' | 'win' | 'badge_earned' | 'grace_day';
export type LeaderboardPeriod = 'weekly' | 'alltime';

// --- API ---
export interface ApiResponse<T> {
  data:    T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data:       T[];
  total:      number;
  page:       number;
  hasMore:    boolean;
}

// --- Points ---
export const POINTS = {
  UPLOAD_VIDEO:   3,
  SUGGEST_IDEA:   2,
  VOTE:           1,
  COMMENT:        1,
  DAILY_WIN:      10,
} as const;

// --- Limits ---
export const LIMITS = {
  DAILY_SUGGESTIONS: 3,
  DAILY_VOTES:       5,
  NEAR_WIN_RANK:     5,
  NEAR_WIN_GAP:      5,
} as const;
