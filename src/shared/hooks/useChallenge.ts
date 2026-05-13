import { useState, useCallback, useEffect } from 'react';
import { ChallengesAPI }    from '../api/challenges';
import { parseError }       from '../api/errors';
import { socket }           from '../api/websocket';
import { useChallengeStore }from '../../features/challenges/store';
import type { IdeaTab }     from '../api/challenges';

export function useChallenge() {
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const {
    activeChallenge, ideas, remainingSuggestions, remainingVotes,
    activeTab, setChallenge, setIdeas, setActiveTab,
    voteIdea, addIdea, removeIdea,
  } = useChallengeStore();

  // ── تحميل التحدي النشط ──
  const loadChallenge = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ChallengesAPI.getActive();
      if (res.data.challenge) {
        setChallenge(res.data.challenge);
        // الانضمام لـ WS room الخاص بالتحدي
        socket.joinRoom(`challenge:${res.data.challenge.id}`);
      }
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, [setChallenge]);

  // ── تحميل الأفكار ──
  const loadIdeas = useCallback(async (tab: IdeaTab = 'all') => {
    if (!activeChallenge) return;
    setLoading(true);
    try {
      const res = await ChallengesAPI.getIdeas(activeChallenge.id, tab);
      setIdeas(res.data ?? []);
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, [activeChallenge, setIdeas]);

  // ── اقتراح فكرة ──
  const submitIdea = useCallback(async (content: string) => {
    if (!activeChallenge || remainingSuggestions <= 0) return;
    setSubmitting(true);
    try {
      const res = await ChallengesAPI.submitIdea(activeChallenge.id, content);
      addIdea(res.data);
    } catch (err) {
      throw parseError(err);
    } finally {
      setSubmitting(false);
    }
  }, [activeChallenge, remainingSuggestions, addIdea]);

  // ── التصويت — Optimistic ──
  const handleVoteIdea = useCallback(async (ideaId: string) => {
    if (remainingVotes <= 0) return;
    voteIdea(ideaId); // Optimistic
    try {
      await ChallengesAPI.voteIdea(ideaId);
    } catch {
      voteIdea(ideaId); // Rollback
    }
  }, [remainingVotes, voteIdea]);

  // ── حذف فكرة ──
  const handleDeleteIdea = useCallback(async (ideaId: string) => {
    removeIdea(ideaId); // Optimistic
    try {
      await ChallengesAPI.deleteIdea(ideaId);
    } catch {
      await loadIdeas(activeTab); // Rollback
    }
  }, [removeIdea, loadIdeas, activeTab]);

  // ── تغيير الـ Tab ──
  const handleTabChange = useCallback((tab: IdeaTab) => {
    setActiveTab(tab);
    loadIdeas(tab);
  }, [setActiveTab, loadIdeas]);

  // ── WS: فكرة جديدة من مستخدم آخر ──
  useEffect(() => {
    if (!activeChallenge) return;

    const unsub = socket.on('new_idea', (idea) => {
      // فقط إذا كانت الفكرة من مستخدم آخر
      const myId = require('../../features/auth/store')
        .useAuthStore.getState().user?.id;
      if (idea.userId !== myId) {
        addIdea(idea);
      }
    });

    const unsubEnd = socket.on('challenge_end', () => {
      loadChallenge();
    });

    return () => { unsub(); unsubEnd(); };
  }, [activeChallenge, addIdea, loadChallenge]);

  useEffect(() => {
    loadChallenge();
    return () => {
      if (activeChallenge)
        socket.leaveRoom(`challenge:${activeChallenge.id}`);
    };
  }, []);

  useEffect(() => {
    if (activeChallenge) loadIdeas(activeTab);
  }, [activeChallenge]);

  return {
    activeChallenge,
    ideas,
    loading,
    submitting,
    error,
    activeTab,
    remainingSuggestions,
    remainingVotes,
    loadIdeas,
    submitIdea,
    handleVoteIdea,
    handleDeleteIdea,
    handleTabChange,
  };
}
