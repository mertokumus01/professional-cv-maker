import React, { useState, useCallback } from 'react';

export default function SearchFilter({ onSearch, templates = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [createdDateFrom, setCreatedDateFrom] = useState('');
  const [createdDateTo, setCreatedDateTo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = useCallback(() => {
    const filters = {
      q: searchQuery,
      template: selectedTemplate,
      createdDateFrom,
      createdDateTo,
    };

    onSearch(filters);
  }, [searchQuery, selectedTemplate, createdDateFrom, createdDateTo, onSearch]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedTemplate('');
    setCreatedDateFrom('');
    setCreatedDateTo('');
    onSearch({
      q: '',
      template: '',
      createdDateFrom: '',
      createdDateTo: '',
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Search & Filter CVs</h2>

      {/* Basic Search */}
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by CV title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          style={styles.searchInput}
        />
        <button
          onClick={handleSearch}
          style={styles.searchButton}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
        >
          Search
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={styles.advancedToggle}
      >
        {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={styles.advancedFilters}>
          {/* Template Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Template:</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              style={styles.select}
            >
              <option value="">All Templates</option>
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="creative">Creative</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Created From:</label>
            <input
              type="date"
              value={createdDateFrom}
              onChange={(e) => setCreatedDateFrom(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.label}>Created To:</label>
            <input
              type="date"
              value={createdDateTo}
              onChange={(e) => setCreatedDateTo(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={styles.resetButton}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#e0e0e0')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  searchBox: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  searchButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  advancedToggle: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '10px',
  },
  advancedFilters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#555',
  },
  select: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  input: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  resetButton: {
    padding: '8px 12px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};
