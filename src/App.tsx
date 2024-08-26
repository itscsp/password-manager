import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Nav, Footer, GeneratePass } from './_components';
import { AccountLayout } from './Account';
import { Home } from './Home';
import { restoreSession } from './features/auth/authSlice'; // Import the restoreSession action

import './App.css';
import { AppDispatch, RootState } from './app/store'; // Import the AppDispatch and RootState types
import { PasswordLayout } from './Passwords/PasswordLayout';
import { showNotification } from './features/notifications/notificationSlice';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Ensure dispatch is correctly typed
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state: RootState) => state.auth); // Use RootState type for useSelector



  const checkAndRestoreSession = async () => {
    // console.log("checkAndRestoreSession: Function called");


    const hasVisitedBefore = localStorage.getItem('hasVisited');
    // console.log("hasVisitedBefore:", hasVisitedBefore);

    if (!hasVisitedBefore) {
      // console.log("First visit. Setting 'hasVisited' flag.");
      localStorage.setItem('hasVisited', 'true');
      return;
    }

    // console.log("Before calling restoreSession API");
    const result = await dispatch(restoreSession());
    // console.log("Result from restoreSession:", result);

    if (result.payload === "Session has expired.") {
      // console.log("Session expired. Dispatching showNotification.");
      dispatch(showNotification("Your session has expired. Please log in again."));
      navigate("/");
    }

    // console.log("After calling restoreSession API");
  };

  useEffect(() => {
    // console.log("useEffect: Initial check and restore session");

    checkAndRestoreSession();
    if (isLoggedIn) {
      // Set up an interval to check the session every 3 minutes (180,000 milliseconds)
      // console.log("Setting up interval to check session every 3 minutes");
      const intervalId = setInterval(() => {
        // console.log("Interval triggered. Checking session.");

        checkAndRestoreSession();
      }, 180000);

      // Cleanup the interval on component unmount
      return () => {
        // console.log("Cleaning up interval on component unmount");
        clearInterval(intervalId);
      };
    }

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
