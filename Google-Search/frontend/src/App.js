import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import CryptoJS from 'crypto-js';
import './App.css';
import LoadingPage from './LoadingPage';

// API base URL set to localhost only
const API_BASE_URL = 'http://localhost:3001/api'; // Your local backend URL

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'your-secret-key';

const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/loading" element={<LoadingPage />} />
    </Routes>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);

  const navigate = useNavigate();

  const handleSearch = useCallback(
    _.debounce(async (query) => {
      if (!query.trim()) {
        setFiles([]);
        setNextPageToken(null);
        setNoResults(false);
        return;
      }

      setError('');
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/search`, { query });
        if (response.status === 401) {
          navigate('/auth');
        } else {
          if (response.data.files.length === 0) {
            setNoResults(true);
          } else {
            setFiles(response.data.files);
            setNextPageToken(response.data.nextPageToken);
            setNoResults(false);
          }
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('An error occurred while fetching search results. Please try again.');
      }
      setLoading(false);
    }, 300),
    [navigate]
  );

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  const loadMore = async () => {
    if (!query.trim() || !nextPageToken) {
      return; // Prevent loading more if query is empty or no more pages
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/search`, { query, pageToken: nextPageToken });
      setFiles((prevFiles) => [...prevFiles, ...response.data.files]);
      setNextPageToken(response.data.nextPageToken);
      setNoResults(false);
    } catch (error) {
      console.error('Error fetching more results:', error);
      setError('An error occurred while loading more results. Please try again.');
    }
    setLoading(false);
  };

  const formatSize = (size) => {
    if (size) {
      return (size / (1024 ** 3)).toFixed(2) + ' GB';
    }
    return 'N/A';
  };

  const handleViewClick = async (fileId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/file/${fileId}`);
      const fileLink = response.data.fileLink;
      const encryptedLink = encrypt(fileLink);
      const newTab = window.open(`/loading?url=${encodeURIComponent(encryptedLink)}`, '_blank');
      if (newTab) {
        newTab.focus();
      }
    } catch (error) {
      console.error('Error fetching file link:', error);
      setError('An error occurred while fetching the file link.');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Search Anything Related</h1>
        <div className='para'>
          <p>Movies || Software || Courses || TV Shows || Games || Much More</p>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search files...& Get Drive Link"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            aria-label="Search files"
          />
          <button onClick={() => handleSearch(query)} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <div className="error-popup">{error}</div>}
        {noResults && !loading && !files.length && <p>No files match your search. Try a different query.</p>}
        <div className="telegram-container">
          <a href="https://t.me/+v7yk1fppgwMwNDM1" target="_blank" rel="noopener noreferrer" className="telegram-link">
            Join us on Telegram
          </a>
        </div>
      </header>

      <div className="results-container">
        {loading && <p>Loading results...</p>}
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-info">
                <h3>{file.name}</h3>
                <p>Size: {formatSize(file.size)}</p>
                <button onClick={() => handleViewClick(file.id)}>View</button>
              </div>
            </div>
          ))
        ) : null}
      </div>

      {nextPageToken && query.trim() && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
