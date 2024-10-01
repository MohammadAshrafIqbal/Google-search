Drive Search App

Overview
The Drive Search App is a React-based web application that allows users to search for files in their Google Drive. The app uses the Google Drive API to list files and provides a secure way to handle sensitive information through encryption.

Features
Search Functionality: Users can search for files in their Google Drive using keywords.
Load More Results: The application supports pagination, allowing users to load more results.
Secure File Links: File links are encrypted for security and decrypted upon redirection.
User-Friendly Interface: The application has a simple and intuitive UI for easy navigation.
Technologies Used
Frontend: React, Axios, React Router, Lodash, CryptoJS
Backend: Node.js, Express, Google Drive API
Styling: CSS
Setup Instructions
Prerequisites
Node.js and npm installed
A Google Cloud Platform project with the Drive API enabled
Environment variables for your Google API credentials
Steps to Set Up the Project
Clone the Repository:

bash
Copy code
git clone https://github.com/MohammadAshrafIqbal/Google-search.git
cd drive-search-app
Install Dependencies: For both frontend and backend, install the required packages:

bash
Copy code
# For the backend
cd backend
npm install

# For the frontend
cd ../frontend
npm install
Create a .env File: In the root of the backend directory, create a .env file and add the following variables:

makefile
Copy code
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ACCESS_TOKEN=your_access_token
REFRESH_TOKEN=your_refresh_token
PORT=3001
In the frontend directory, create a .env file:

makefile
Copy code
REACT_APP_SECRET_KEY=your_secret_key
Run the Backend: Start the backend server:

bash
Copy code
cd backend
node server.js
Run the Frontend: Open a new terminal and start the frontend:

bash
Copy code
cd frontend
npm start
Access the Application: Open your browser and go to http://localhost:3000.

Usage
Searching for Files: Enter your search query in the input box and hit enter or click the "Search" button. The app will display matching files from your Google Drive.
View File Links: Click on the "View" button next to a file to be redirected to its link. If the URL fails to decrypt, you will be navigated back to the home page.
File Structure
bash
Copy code
drive-search-app/
├── backend/
│   ├── server.js          # Main server file
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── other backend files...
└── frontend/
    ├── src/
    │   ├── App.js         # Main React component
    │   ├── LoadingPage.js  # Loading page component
    │   ├── other React components...
    ├── public/
    │   ├── index.html     # Main HTML file
    ├── .env               # Frontend environment variables
    └── package.json       # Frontend dependencies
Console Logs
Throughout the application, you may encounter the following console log messages:

Decryption Logs:
Decrypted URL: {decrypted}
Failed to decrypt URL. Navigating to home.
Redirect Logs:
Redirecting to: {url}
URL is not available, navigating back to home.
Error Handling Logs:
Error fetching search results: {error}
Error fetching more results: {error}
Error getting file link: {error}
These logs can assist in debugging and provide insight into the app's functionality during development.

Contributing
Contributions are welcome! Please fork the repository and create a pull request for any changes or improvements.