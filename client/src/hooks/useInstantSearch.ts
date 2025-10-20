import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/api/search';

interface UseInstantSearchOptions {
  debounceMs?: number;
  minSearchLength?: number;
  enabled?: boolean;
  maxSuggestions?: number;
}

export function useInstantSearch({
  debounceMs = 150,
  minSearchLength = 2,
  enabled = true,
  maxSuggestions = 10
}: UseInstantSearchOptions = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Optimized debouncing with cleanup
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, debounceMs]);

  // Fetch search suggestions
  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery({
    queryKey: ['search-suggestions', debouncedTerm],
    queryFn: () => searchApi.getSuggestions(debouncedTerm, maxSuggestions),
    enabled: enabled && debouncedTerm.length >= minSearchLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const shouldSearch = useMemo(() => {
    return enabled && (debouncedTerm.length >= minSearchLength || debouncedTerm === '');
  }, [enabled, debouncedTerm, minSearchLength]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedTerm('');
    setShowSuggestions(false);
  }, []);

  const selectSuggestion = useCallback((suggestion: string) => {
    setSearchTerm(suggestion);
    setDebouncedTerm(suggestion);
    setShowSuggestions(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    shouldSearch,
    clearSearch,
    isSearching: searchTerm !== debouncedTerm,
    suggestions,
    loadingSuggestions,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion
  };
}