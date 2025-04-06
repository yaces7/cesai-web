import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Login from './pages/login';
import Register from './pages/register';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [remainingRequests, setRemainingRequests] = useState(100);

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const updateRemainingRequests = (requests) => {
    setRemainingRequests(requests);
  };

  return (
    <FirebaseProvider>
      <ThemeProvider initialTheme={darkMode ? 'dark' : 'light'}>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/chat/:chatId" element={
                <>
                  <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
                  <Chat />
                </>
              } />
              <Route path="/" element={<Navigate to="/chat/new" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </FirebaseProvider>
  );
}

export default App;