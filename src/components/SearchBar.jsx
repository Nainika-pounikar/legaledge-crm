import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchModules, searchSettings } from '../config/searchConfig';
import SearchDropdown from './SearchDropdown';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [settingsResults, setSettingsResults] = useState([]);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const filteredModules = searchModules.filter(m =>
      m.name.toLowerCase().includes(query.toLowerCase())
    );
    const filteredSettings = searchSettings.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filteredModules);
    setSettingsResults(filteredSettings);
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResults = results.length + settingsResults.length;

  const handleKeyDown = (e) => {
    if (!totalResults && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % totalResults);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + totalResults) % totalResults);
    } else if (e.key === 'Enter') {
      const allResults = [...results, ...settingsResults];
      if (allResults[activeIndex]) {
        handleSelect(allResults[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    navigate(item.path);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="topbar-search-wrapper" ref={searchRef}>
      <div className={`topbar-search ${isOpen ? 'focused' : ''}`}>
        <i className="fa fa-search"></i>
        <input
          type="text"
          placeholder="Search tools, settings..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <SearchDropdown
          results={results}
          settingsResults={settingsResults}
          query={query}
          activeIndex={activeIndex}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};

export default SearchBar;
