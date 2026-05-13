import { useState, useCallback, useRef } from 'react';
import { GET }         from '../api/interceptors';
import { parseError }  from '../api/errors';

interface SearchResult {
  users:  UserResult[];
  videos: VideoResult[];
}

interface UserResult {
  id: string; name: string; username: string;
  avatar: string; points: number; isFollowing: boolean;
}

interface VideoResult {
  id: string; title: string; thumbnail: string;
  userName: string; views: number; likes: number;
}

export function useSearch() {
  const [results,  setResults]  = useState<SearchResult>({ users:[], videos:[] });
  const [loading,  setLoading]  = useState(false);
  const [query,    setQuery]    = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback((q: string, type = 'all') => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setResults({ users:[], videos:[] });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await GET<{ success: boolean; data: SearchResult }>(
          `/search?q=${encodeURIComponent(q)}&type=${type}`
        );
        setResults(res.data ?? { users:[], videos:[] });
      } catch (err) {
        console.error(parseError(err).message);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults({ users:[], videos:[] });
  }, []);

  return { results, loading, query, search, clear };
}
