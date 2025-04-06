import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import ChatContainer from './components/ChatContainer';
import Sidebar from './components/Sidebar';
import Login from './pages/login';
import Register from './pages/register';
import Chat from './components/Chat';
import Settings from './pages/settings';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { GlobalStyles, darkTheme, lightTheme } from './styles/globalStyles';
import './App.css';

// Ana uygulama bileşeni
function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}

// Uygulama içeriği - Firebase context'ine erişimi olan bileşen
function AppContent() {
  const { user, loading } = useFirebase();
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Tema değişikliğini localStorage'dan al
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Kullanıcı temasını Firebase'den al
  useEffect(() => {
    if (user && user.theme) {
      setTheme(user.theme);
      localStorage.setItem('theme', user.theme);
      document.documentElement.setAttribute('data-theme', user.theme);
    }
  }, [user]);

  // Tema değiştirme fonksiyonu
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (loading) {
    return <LoadingScreen>Yükleniyor...</LoadingScreen>;
  }

  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <GlobalStyles />
      <Router>
        <AppContainer>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/settings" element={<Settings toggleTheme={toggleTheme} />} />
            <Route
              path="/*"
              element={
                <MainContainer>
                  <Sidebar 
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
    </ThemeProvider>
  );
}

// Styled Components
const AppContainer = styled.div`
  height: 100vh;
  overflow: hidden;
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

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  color: #ffffff;
  font-size: 18px;
`;

export default App;