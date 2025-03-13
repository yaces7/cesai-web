import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from '@emotion/styled';
import ChatContainer from './components/ChatContainer';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1e0d3d 0%, #0a1a3d 100%);
  color: #ffffff;
`;

const MainContent = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(100);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      // Fetch conversations from API
      fetchConversations(token);
    }
    
    // Ekran boyutunu izle
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchConversations = async (token) => {
    try {
      // This would be replaced with actual API call
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/conversations`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setConversations(data.conversations);
      
      // For now, use mock data
      setConversations([
        { id: '1', title: 'Yeni Sohbet', createdAt: new Date().toISOString() }
      ]);
      setCurrentConversation('1');
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    fetchConversations(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setConversations([]);
    setCurrentConversation(null);
  };

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'Yeni Sohbet',
      createdAt: new Date().toISOString()
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation.id);
  };

  const updateRemainingRequests = (count) => {
    setRemainingRequests(count);
  };

  return (
    <Router>
      <AppContainer>
        {isAuthenticated && (
          <Sidebar 
            user={user}
            conversations={conversations}
            currentConversation={currentConversation}
            setCurrentConversation={setCurrentConversation}
            createNewConversation={createNewConversation}
            onLogout={handleLogout}
            isMobileOpen={isMobile ? isMobileSidebarOpen : true}
            setIsMobileOpen={setIsMobileSidebarOpen}
            remainingRequests={remainingRequests}
            isMobile={isMobile}
          />
        )}
        <MainContent>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <ChatContainer 
                    conversationId={currentConversation}
                    toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    updateRemainingRequests={updateRemainingRequests}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login onLogin={handleLogin} />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <Register />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;