import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './LoadingPage.css'; // Ensure this path is correct

const SECRET_KEY = 'your-secret-key';

const decrypt = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log("Decrypted URL:", decrypted); // Add this log
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const encryptedUrl = queryParams.get('url');

  useEffect(() => {
    const handleRedirect = () => {
      if (encryptedUrl) {
        const url = decrypt(encryptedUrl);
        if (url) {
          console.log("Redirecting to:", url);
          const timer = setTimeout(() => {
            window.location.href = url;
          }, 5000);

          return () => clearTimeout(timer);
        } else {
          console.error("Failed to decrypt URL. Navigating to home.");
          navigate('/');
        }
      } else {
        console.log("URL is not available, navigating back to home.");
        navigate('/');
      }
    };

    handleRedirect();
  }, [encryptedUrl, navigate]);

  const generateProtectedLink = (url) => {
    return `data:text/plain;base64,${btoa(url)}`;
  };

  const protectedLink = encryptedUrl ? generateProtectedLink(encryptedUrl) : '#';

  return (
    <div className="loader-container">
      <div className="loader"></div>
      <h2>Loading...</h2>
      <p>
        Please wait while we redirect you to the file. If you are not redirected automatically,
        <a href={protectedLink} target="_blank" rel="noopener noreferrer" className="link-protected">
          click here
        </a>.
      </p>
    </div>
  );
}

export default LoadingPage;
