import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Login from './pages/login';
import Register from './pages/register';
import Settings from './components/Settings';
import './App.css';

// Giriş gerektiren sayfalar için özel bir Route bileşeni
const PrivateRoute = ({ children }) => {
  const { user, loading } = useFirebase();
  
  // Kimlik doğrulama yükleniyorsa, yükleme göster
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg-color)',
        color: 'var(--text-color)' 
      }}>
        <h2>Yükleniyor...</h2>
      </div>
    );
  }
  
  // Kullanıcı oturum açmamışsa, giriş sayfasına yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Kullanıcı oturum açmışsa, çocuk bileşenleri render et
  return children;
};

function App() {
  return (
    <FirebaseProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Ana uygulama yolları */}
            <Route path="/chat" element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            } />
            <Route path="/chat/:id" element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </FirebaseProvider>
  );
}

// Ana uygulama düzeni
function AppLayout() {
  const [showSidebar, setShowSidebar] = useState(true);
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  return (
    <div className="app">
      <Sidebar show={showSidebar} />
      <Chat toggleSidebar={toggleSidebar} sidebarVisible={showSidebar} />
    </div>
  );
}

export default App;