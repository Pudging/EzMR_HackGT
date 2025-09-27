"use client";

import { useState, useEffect, useCallback } from "react";

interface SearchResult {
  element: HTMLElement;
  index: number;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const highlightText = useCallback((text: string, searchQuery: string): string => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded search-highlight">$1</mark>');
  }, []);

  const clearHighlights = useCallback(() => {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize();
      }
    });
  }, []);

  const searchInElement = useCallback((element: HTMLElement, searchQuery: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    let index = 0;
    while (node = walker.nextNode()) {
      const textNode = node as Text;
      const text = textNode.textContent || '';
      
      if (text.toLowerCase().includes(searchQuery.toLowerCase())) {
        const parent = textNode.parentElement;
        if (parent && !parent.classList.contains('search-highlight')) {
          results.push({ element: parent, index });
          index++;
        }
      }
    }

    return results;
  }, []);

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      clearHighlights();
      setSearchResults([]);
      setTotalMatches(0);
      setCurrentMatch(0);
      setIsSearching(false);
      return;
    }

    clearHighlights();
    
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    const results = searchInElement(mainContent, searchQuery);
    
    // Highlight all matches
    results.forEach(({ element }) => {
      const textContent = element.textContent || '';
      if (textContent.toLowerCase().includes(searchQuery.toLowerCase())) {
        const highlightedHTML = highlightText(textContent, searchQuery);
        element.innerHTML = highlightedHTML;
      }
    });

    setSearchResults(results);
    setTotalMatches(results.length);
    setCurrentMatch(results.length > 0 ? 1 : 0);
    setIsSearching(true);
  }, [clearHighlights, searchInElement, highlightText]);

  const navigateToMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;

    const newIndex = direction === 'next' 
      ? (currentMatch % searchResults.length) + 1
      : currentMatch === 1 
        ? searchResults.length 
        : currentMatch - 1;

    setCurrentMatch(newIndex);
    
    const targetElement = searchResults[newIndex - 1]?.element;
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add a temporary highlight to the current match
      targetElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        targetElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
      }, 2000);
    }
  }, [searchResults, currentMatch]);

  const clearSearch = useCallback(() => {
    clearHighlights();
    setQuery("");
    setSearchResults([]);
    setTotalMatches(0);
    setCurrentMatch(0);
    setIsSearching(false);
  }, [clearHighlights]);

  // Clean up highlights when component unmounts
  useEffect(() => {
    return () => {
      clearHighlights();
    };
  }, [clearHighlights]);

  return {
    query,
    setQuery,
    currentMatch,
    totalMatches,
    isSearching,
    performSearch,
    navigateToMatch,
    clearSearch
  };
}
