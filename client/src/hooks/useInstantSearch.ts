import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface UseInstantSearchOptions {
  debounceMs?: number;
  minSearchLength?: number;
  enabled?: boolean;
}

export function useInstantSearch({
  debounceMs = 150,
  minSearchLength = 0,
  enabled = true
}: UseInstantSearchOptions = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
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

  const shouldSearch = useMemo(() => {
    return enabled && (debouncedTerm.length >= minSearchLength || debouncedTerm === '');
  }, [enabled, debouncedTerm, minSearchLength]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    shouldSearch,
    clearSearch,
    isSearching: searchTerm !== debouncedTerm
  };
}