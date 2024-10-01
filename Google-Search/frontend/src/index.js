import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { createRoot } from 'react-dom/client'; // For the new React render method
import App from './App'; // Ensure App is imported

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement); // Create a root for the React tree

  root.render(
    <React.StrictMode>
      <Router>
        <App />  {/* App handles all routes */}
      </Router>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}
