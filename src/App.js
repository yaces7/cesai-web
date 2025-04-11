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
  const { user, loading, firebaseError } = useFirebase();
  
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
  
  // Firebase izin hatası kontrolü
  if (firebaseError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-color)',
        color: '#ff5555',
        padding: '2rem'
      }}>
        <h2>Firebase Erişim Hatası</h2>
        <p>{firebaseError}</p>
        <div style={{ marginTop: '2rem', color: 'var(--text-color)', maxWidth: '600px', textAlign: 'center' }}>
          <h3>Yapmanız gerekenler:</h3>
          <ol style={{ textAlign: 'left' }}>
            <li>Firebase Konsoluna gidin (https://console.firebase.google.com/)</li>
            <li>Projenizi seçin</li>
            <li>Firestore Database &gt; Rules bölümünde güvenlik kurallarını düzenleyin</li>
            <li>Aşağıdaki kuralları yapıştırın:</li>
          </ol>
          <pre style={{ 
            background: 'rgba(0,0,0,0.1)', 
            padding: '1rem', 
            borderRadius: '8px',
            overflow: 'auto', 
            textAlign: 'left',
            margin: '1rem 0'
          }}>
            {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    match /conversations/{conversationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /apiLimits/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
          </pre>
          <p>Kuralları kaydedip, sayfayı yeniledikten sonra uygulama çalışacaktır.</p>
        </div>
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
                <AppLayout key="chat-main" />
              </PrivateRoute>
            } />
            <Route path="/chat/:id" element={
              <PrivateRoute>
                <AppLayout key="chat-with-id" />
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
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <Chat toggleSidebar={toggleSidebar} sidebarVisible={showSidebar} />
    </div>
  );
}

export default App;