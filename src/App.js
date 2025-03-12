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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const [remainingRequests, setRemainingRequests] = useState(100);

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
  }, []);

  const fetchConversations = async (token) => {
    try {
      // Gerçek API çağrısı yap
      const response = await fetch(`${process.env.REACT_APP_API_URL}/conversations`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Konuşmalar alınamadı');
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
      
      // Eğer konuşma varsa, ilk konuşmayı seç
      if (data.conversations && data.conversations.length > 0) {
        setCurrentConversation(data.conversations[0]._id);
      } else {
        // Konuşma yoksa, yeni bir konuşma oluştur
        createNewConversation();
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Hata durumunda varsayılan bir konuşma oluştur
      setConversations([
        { id: '1', title: 'Yeni Sohbet', createdAt: new Date().toISOString() }
      ]);
      setCurrentConversation('1');
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

  const createNewConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Yeni konuşma oluşturulamadı');
      }
      
      const data = await response.json();
      
      const newConversation = {
        id: data.id,
        title: data.title,
        createdAt: data.created_at
      };
      
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Hata durumunda yerel olarak bir konuşma oluştur
      const newConversation = {
        id: Date.now().toString(),
        title: 'Yeni Sohbet',
        createdAt: new Date().toISOString()
      };
      
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation.id);
    }
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
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            remainingRequests={remainingRequests}
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