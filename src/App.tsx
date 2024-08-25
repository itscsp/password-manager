import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Nav, Footer, GeneratePass } from './_components';
import { AccountLayout } from './Account';
import { Home } from './Home';
import { restoreSession } from './features/auth/authSlice'; // Import the restoreSession action

import './App.css';
import { AppDispatch } from './app/store'; // Import the AppDispatch and RootState types
import { PasswordLayout } from './Passwords/PasswordLayout';
import { showNotification } from './features/notifications/notificationSlice';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Ensure dispatch is correctly typed
  const location = useLocation();
  

  useEffect(() => {
    const checkAndRestoreSession = async () => {
      const hasVisitedBefore = localStorage.getItem('hasVisited');

      if (!hasVisitedBefore) {
        // Set the flag to indicate that the user has visited
        localStorage.setItem('hasVisited', 'true');
        return;
      }

      console.log("Before calling session API");
      const result = await dispatch(restoreSession());

      if (result.payload === "Session has expired.") {
        dispatch(showNotification("Your session has expired. Please log in again."));
      }

      console.log("After calling session API");
    };

    checkAndRestoreSession();
  }, [location, dispatch]);

  return (
    <div className="app-container bg-opblack400 gap-5">
      <Nav />
      <div className={`onepass-container`}>
    
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="account/*" element={<AccountLayout />} />
            <Route path="password-generator" element={<GeneratePass />} />

            {/* Private Routes */}
            <Route path="passwords/*" element={<PasswordLayout />} />
          </Routes>
        
      </div>
      <Footer />
    </div>
  );
};

export default App;
