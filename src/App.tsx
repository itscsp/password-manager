import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { Nav, Footer, GeneratePass } from './_components';
import { AccountLayout } from './Account';
import { Home } from './Home';
import { restoreSession } from './features/auth/authSlice'; // Import the restoreSession action

import './App.css';
import { AppDispatch } from './app/store'; // Import the AppDispatch type
import { PasswordLayout } from './Passwords/PasswordLayout';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Ensure dispatch is correctly typed

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const firstName = sessionStorage.getItem('firstName');
    const token = sessionStorage.getItem('token');
    const lastActive = sessionStorage.getItem('lastActive');
    const sessionToken = sessionStorage.getItem('sessionToken');

    const currentTime = new Date().getTime();

    if (username && firstName && token && lastActive) {
      if (currentTime - parseInt(lastActive) < 10 * 60 * 1000) {
        // User is still active
        const userData = { username, firstName, token, sessionToken };
        dispatch(restoreSession(userData));
      } else {
        sessionStorage.clear(); // Clear session if inactive for more than 10 minutes
      }
    }
  }, [dispatch]);

  return (
    <div className="app-container bg-opblack400 gap-5">
      <Nav />
      <div className="onepass-container">
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
