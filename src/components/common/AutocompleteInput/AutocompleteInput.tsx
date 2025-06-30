import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import './AutocompleteInput.css';

interface AutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  type?: string;
  suggestions: string[];
  disabled?: boolean;
  className?: string;
  fetchSuggestions?: (query: string) => void;
  debounceTime?: number;
  required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  value,
  onChange,
  onSelect,
  placeholder = '',
  type = 'text',
  suggestions = [],
  disabled = false,
  className = '',
  fetchSuggestions,
  debounceTime = 300,
  required = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [lastFetchedValue, setLastFetchedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsListRef = useRef<HTMLUListElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Reset suggestions when input value changes
  useEffect(() => {
    if (value.trim().length > 0 && fetchSuggestions && value !== lastFetchedValue) {
      // Debounce API calls
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = window.setTimeout(() => {
        fetchSuggestions(value);
        setLastFetchedValue(value);
      }, debounceTime);
    }
  }, [value, fetchSuggestions, debounceTime, lastFetchedValue]);

  // Update filtered suggestions when suggestions prop changes
  useEffect(() => {
    setFilteredSuggestions(suggestions);
  }, [suggestions]);

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const userInput = e.target.value;
    onChange(userInput);
    
    if (userInput.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    setActiveIndex(-1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setActiveIndex(-1);
    setLastFetchedValue(suggestion); // Prevent refetching the same value
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Arrow up
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
        scrollToItem(activeIndex - 1);
      }
    }
    // Arrow down
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex < filteredSuggestions.length - 1) {
        setActiveIndex(activeIndex + 1);
        scrollToItem(activeIndex + 1);
      }
    }
    // Enter
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
        handleSuggestionClick(filteredSuggestions[activeIndex]);
      }
    }
    // Escape
    else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Scroll to active item in suggestions list
  const scrollToItem = (index: number) => {
    if (suggestionsListRef.current && filteredSuggestions.length > 0) {
      const items = suggestionsListRef.current.querySelectorAll('li');
      if (items[index]) {
        items[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  };

  // Handle blur event
  const handleBlur = () => {
    // Use a timeout to allow click events on suggestions to fire first
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`autocomplete-container ${className}`}>
      <input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(value.length > 0)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="autocomplete-input"
        autoComplete="off"
        required={required}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul 
          ref={suggestionsListRef}
          className="suggestions-list"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
