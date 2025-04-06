import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import ChatContainer from './components/ChatContainer';
import Sidebar from './components/Sidebar';
import Login from './pages/login';
import Register from './pages/register';
import { FirebaseProvider } from './contexts/FirebaseContext';
import './App.css';
import Chat from './components/Chat';
import Settings from './pages/settings';
import { GlobalStyles, darkTheme, lightTheme } from './styles/globalStyles';

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

const MainContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const ChatContainer = styled.div`
  flex: 1;
  margin-left: ${props => props.showSidebar ? '260px' : '0'};
  transition: margin-left 0.3s ease;
  position: relative;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(100);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState('dark');

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

  // Tema değişikliğini localStorage'dan al
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
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

  // Tema değiştiğinde uygula
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <GlobalStyles />
      <FirebaseProvider>
        <Router>
          <AppContainer>
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/settings" element={<Settings toggleTheme={toggleTheme} />} />
              <Route
                path="/*"
                element={
                  <MainContainer>
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
                      showSidebar={showSidebar}
                      setShowSidebar={setShowSidebar}
                    />
                    <ChatContainer showSidebar={showSidebar}>
                      <Chat />
                    </ChatContainer>
                  </MainContainer>
                }
              />
            </Routes>
          </AppContainer>
        </Router>
      </FirebaseProvider>
    </ThemeProvider>
  );
}

export default App;