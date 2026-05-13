import { GET, POST, DELETE } from './interceptors';
import {
  ApiResponse, PagedResponse,
  Challenge, ChallengeIdea, DailyLimits,
} from './types';

export type IdeaTab = 'all' | 'friends' | 'top';

export const ChallengesAPI = {
  // التحدي النشط + الحدود اليومية
  getActive: () =>
    GET<ApiResponse<{ challenge: Challenge; limits: DailyLimits }>>('/challenges/active'),

  // قائمة الأفكار
  getIdeas: (challengeId: string, tab: IdeaTab = 'all') =>
    GET<ApiResponse<ChallengeIdea[]>>(
      `/challenges/ideas?challengeId=${challengeId}&tab=${tab}`
    ),

  // اقتراح فكرة
  submitIdea: (challengeId: string, content: string, description?: string) =>
    POST<ApiResponse<ChallengeIdea>>('/challenges/ideas', {
      challengeId,
      content,
      description,
    }),

  // تصويت على فكرة
  voteIdea: (ideaId: string) =>
    POST<ApiResponse<{ voted: boolean }>>(`/challenges/ideas/${ideaId}/vote`),

  // حذف فكرة (لصاحبها)
  deleteIdea: (ideaId: string) =>
    DELETE<ApiResponse<null>>(`/challenges/ideas/${ideaId}`),
};
