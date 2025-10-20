import React, { useRef, useEffect } from 'react';
import { Search, X, Loader2, TrendingUp } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useInstantSearch } from '@/hooks/useInstantSearch';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/api/search';

interface AdvancedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  showPopular?: boolean;
}

export function AdvancedSearchInput({ 
  value, 
  onChange, 
  onSearch,
  placeholder = "Search items, SKUs, or descriptions...", 
  className,
  showSuggestions = true,
  showPopular = true
}: AdvancedSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    suggestions,
    loadingSuggestions,
    showSuggestions: showSuggestionsState,
    setShowSuggestions,
    selectSuggestion
  } = useInstantSearch({
    enabled: showSuggestions
  });

  // Get popular searches when input is focused and empty
  const { data: popularSearches = [] } = useQuery({
    queryKey: ['popular-searches'],
    queryFn: () => searchApi.getPopularSearches(8),
    enabled: showPopular,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (showSuggestions && newValue.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(value);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    selectSuggestion(suggestion);
    onChange(suggestion);
    onSearch?.(suggestion);
  };

  const handlePopularClick = (term: string) => {
    onChange(term);
    onSearch?.(term);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  const showDropdown = showSuggestionsState && (suggestions.length > 0 || (value === '' && popularSearches.length > 0));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (showSuggestions && (value.length >= 2 || (value === '' && popularSearches.length > 0))) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loadingSuggestions && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {onSearch && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => onSearch(value)}
            >
              <Search className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto shadow-lg">
          <div className="p-2">
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="h-3 w-3 text-gray-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {value === '' && popularSearches.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-1 px-2">
                  {popularSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-gray-200 text-xs"
                      onClick={() => handlePopularClick(search.term)}
                    >
                      {search.term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}