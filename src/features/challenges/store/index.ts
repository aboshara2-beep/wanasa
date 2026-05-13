import { create } from 'zustand';
import { Challenge, ChallengeIdea } from '../types';
import { LIMITS } from '../types';

interface ChallengeState {
  activeChallenge:    Challenge | null;
  ideas:              ChallengeIdea[];
  remainingSuggestions: number;
  remainingVotes:     number;
  activeTab:          'all' | 'friends' | 'top';
  isSubmitting:       boolean;

  setChallenge:       (c: Challenge) => void;
  setIdeas:           (ideas: ChallengeIdea[]) => void;
  setActiveTab:       (tab: 'all' | 'friends' | 'top') => void;

  // Optimistic
  voteIdea:           (ideaId: string) => void;
  addIdea:            (idea: ChallengeIdea) => void;
  removeIdea:         (ideaId: string) => void;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  activeChallenge:      null,
  ideas:                [],
  remainingSuggestions: LIMITS.DAILY_SUGGESTIONS,
  remainingVotes:       LIMITS.DAILY_VOTES,
  activeTab:            'all',
  isSubmitting:         false,

  setChallenge: (activeChallenge) => set({ activeChallenge }),

  setIdeas: (ideas) => set({ ideas }),

  setActiveTab: (activeTab) => set({ activeTab }),

  voteIdea: (ideaId) =>
    set((state) => ({
      ideas: state.ideas.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              isVoted: !idea.isVoted,
              votes:   idea.isVoted ? idea.votes - 1 : idea.votes + 1,
            }
          : idea
      ),
      remainingVotes: state.remainingVotes > 0
        ? state.remainingVotes - 1
        : state.remainingVotes,
    })),

  addIdea: (idea) =>
    set((state) => ({
      ideas:                [idea, ...state.ideas],
      remainingSuggestions: state.remainingSuggestions - 1,
    })),

  removeIdea: (ideaId) =>
    set((state) => ({
      ideas: state.ideas.filter((i) => i.id !== ideaId),
    })),
}));
