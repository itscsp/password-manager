import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { Nav, Footer, GeneratePass } from './_components';
import { AccountLayout } from './Account';
import { Home } from './Home';
import { restoreSession } from "./features/auth/authSlice.ts"; // Import the restoreSession action
import { clearNotification, showNotification } from './features/notifications/notificationSlice.ts'; // Import showNotification

import './App.css';

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const firstName = sessionStorage.getItem('firstName');
    const token = sessionStorage.getItem('token');
    const lastActive = sessionStorage.getItem('lastActive');
    const currentTime = new Date().getTime();

    if (username && firstName && token && lastActive) {
      if (currentTime - parseInt(lastActive) < 10 * 60 * 1000) {
        // User is still active
        const userData = { username, firstName, token };
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
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
