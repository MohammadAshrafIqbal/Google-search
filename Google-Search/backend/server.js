const path = require('path');
const fs = require('fs');
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Load environment variables from .env

// Initialize express app
const app = express();

// CORS configuration for local only
app.use(cors({
  origin: 'http://localhost:3000', // Allow only localhost
  credentials: true,  // Allow credentials (cookies, authorization headers)
}));

app.use(express.json());

// Load tokens from .env
let accessToken = process.env.ACCESS_TOKEN || null;
let refreshToken = process.env.REFRESH_TOKEN || null;

// Initialize OAuth2 Client using environment variables
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/callback' // Redirect URI for localhost
);

// Set the credentials if tokens are available
if (accessToken) {
  oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
}

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Helper function to update the .env file with new tokens
const updateEnvToken = (newAccessToken, newRefreshToken) => {
  const envPath = path.resolve(__dirname, '.env'); // Path to .env file
  let envVars = fs.readFileSync(envPath, 'utf8').split('\n');
  let updatedEnv = envVars.map((line) => {
    if (line.startsWith('ACCESS_TOKEN=')) {
      return `ACCESS_TOKEN=${newAccessToken}`;
    } else if (line.startsWith('REFRESH_TOKEN=')) {
      return `REFRESH_TOKEN=${newRefreshToken}`;
    }
    return line;
  });

  if (!updatedEnv.some(line => line.startsWith('ACCESS_TOKEN='))) {
    updatedEnv.push(`ACCESS_TOKEN=${newAccessToken}`);
  }
  if (!updatedEnv.some(line => line.startsWith('REFRESH_TOKEN='))) {
    updatedEnv.push(`REFRESH_TOKEN=${newRefreshToken}`);
  }

  fs.writeFileSync(envPath, updatedEnv.join('\n'), 'utf8');
};

// Rate limiting middleware
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
}));

// Route to initiate OAuth2 authentication
app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  res.redirect(authUrl);
});

// Callback route for OAuth2 after authentication
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token;
    
    // Store the access and refresh tokens in .env file
    updateEnvToken(accessToken, refreshToken);

    res.send('Authentication successful! You can now search files.');
  } catch (error) {
    console.error('Error during authentication:', error.response ? error.response.data : error);
    res.status(500).send('Error during authentication.');
  }
});

// Helper function to filter out duplicate files by name
const filterDuplicateFiles = (files) => {
  const seen = new Set();
  return files.filter(file => {
    if (seen.has(file.name)) {
      return false;
    }
    seen.add(file.name);
    return true;
  });
};

// Route to search files in Google Drive
app.post('/api/search', async (req, res) => {
  const query = req.body.query;
  const pageToken = req.body.pageToken || null;

  // Refresh access token if needed
  if (!accessToken && refreshToken) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      accessToken = credentials.access_token;
      refreshToken = credentials.refresh_token;

      // Update the refreshed tokens in the .env file
      updateEnvToken(accessToken, refreshToken);
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return res.status(500).json({ error: 'Error refreshing access token.' });
    }
  }

  try {
    const response = await drive.files.list({
      q: `name contains '${query}' and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'nextPageToken, files(id, name, size)',
      pageSize: 10,
      pageToken: pageToken,
    });

    const uniqueFiles = filterDuplicateFiles(response.data.files);

    res.json({
      files: uniqueFiles,
      nextPageToken: response.data.nextPageToken,
    });
  } catch (error) {
    console.error('Error fetching files:', error.response ? error.response.data : error);
    res.status(500).json({ error: 'Error fetching files.' });
  }
});

// Route to get a signed URL for viewing a file
app.get('/api/file/:id', async (req, res) => {
  const fileId = req.params.id;

  try {
    const response = await drive.files.get({
      fileId,
      fields: 'webViewLink',
    });

    const fileLink = response.data.webViewLink;

    // For demonstration, just send the link directly
    res.json({ fileLink });
  } catch (error) {
    console.error('Error getting file link:', error.response ? error.response.data : error);
    res.status(500).json({ error: 'Error getting file link.' });
  }
});

// Serve static files from the public directory
app.use(express.static(path.resolve(__dirname, '../public')));

// Handle all other requests by serving the main index.html file
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

const PORT = process.env.PORT || 3001; // Use environment variable for port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
