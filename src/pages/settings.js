import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useFirebase } from '../contexts/FirebaseContext';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaUserCircle, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

const SettingsPage = () => {
  const { user, loading, updateTheme, logout } = useFirebase();
  const navigate = useNavigate();
  const [userTheme, setUserTheme] = useState('dark');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
    
    if (user?.theme) {
      setUserTheme(user.theme);
    }
  }, [user, loading, navigate]);

  const handleThemeChange = async (theme) => {
    if (!user) return;
    
    try {
      setSaving(true);
      setUserTheme(theme);
      await updateTheme(user.uid, theme);
      
      // Temayı uygula
      document.documentElement.setAttribute('data-theme', theme);
      
      setNotification({
        type: 'success',
        message: `Tema ${theme === 'dark' ? 'koyu' : 'açık'} olarak güncellendi`
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Tema güncellenirken bir hata oluştu'
      });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  if (loading) {
    return <LoadingScreen>Yükleniyor...</LoadingScreen>;
  }

  return (
    <Container>
      <SettingsCard>
        <Header>
          <Title>Kullanıcı Ayarları</Title>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Çıkış Yap
          </LogoutButton>
        </Header>
        
        {notification && (
          <Notification type={notification.type}>
            {notification.message}
          </Notification>
        )}
        
        <UserSection>
          <UserAvatar>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profil" />
            ) : (
              <FaUserCircle size={80} />
            )}
          </UserAvatar>
          <UserInfo>
            <UserName>{user?.name || user?.displayName || 'Kullanıcı'}</UserName>
            <UserEmail>{user?.email}</UserEmail>
            <UserStatus>
              {user?.emailVerified ? (
                <VerifiedBadge>Doğrulanmış <FaShieldAlt /></VerifiedBadge>
              ) : (
                <UnverifiedBadge>Doğrulanmamış</UnverifiedBadge>
              )}
            </UserStatus>
          </UserInfo>
        </UserSection>
        
        <Section>
          <SectionTitle>Tema Seçenekleri</SectionTitle>
          <ThemeOptions>
            <ThemeOption 
              active={userTheme === 'light'} 
              onClick={() => handleThemeChange('light')}
              disabled={saving}
            >
              <FaSun /> Açık Tema
            </ThemeOption>
            <ThemeOption 
              active={userTheme === 'dark'} 
              onClick={() => handleThemeChange('dark')}
              disabled={saving}
            >
              <FaMoon /> Koyu Tema
            </ThemeOption>
          </ThemeOptions>
        </Section>
        
        <Section>
          <SectionTitle>Kullanım İstatistikleri</SectionTitle>
          <Stats>
            <StatItem>
              <StatLabel>API Kullanımı:</StatLabel>
              <StatValue>{user?.usageLimit || 100} istek / gün</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Üyelik:</StatLabel>
              <StatValue>{user?.isPlus ? 'Plus Üye' : 'Ücretsiz Üye'}</StatValue>
            </StatItem>
          </Stats>
        </Section>
      </SettingsCard>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
`;

const SettingsCard = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 28px;
  margin: 0;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(220, 53, 69, 0.2);
  color: #ff6b6b;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(220, 53, 69, 0.3);
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  color: #ffffff;
  font-size: 20px;
  margin: 0 0 5px 0;
`;

const UserEmail = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 10px 0;
`;

const UserStatus = styled.div`
  display: flex;
  align-items: center;
`;

const VerifiedBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(25, 135, 84, 0.2);
  color: #28a745;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 6px;
`;

const UnverifiedBadge = styled.span`
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 6px;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
`;

const SectionTitle = styled.h3`
  color: #ffffff;
  font-size: 18px;
  margin: 0 0 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
`;

const ThemeOptions = styled.div`
  display: flex;
  gap: 20px;
`;

const ThemeOption = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: ${props => props.active ? 'rgba(100, 108, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#646cff' : '#ffffff'};
  border: 1px solid ${props => props.active ? '#646cff' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'rgba(100, 108, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const StatValue = styled.span`
  color: #ffffff;
  font-weight: 500;
`;

const Notification = styled.div`
  margin-bottom: 20px;
  padding: 12px 15px;
  border-radius: 8px;
  background: ${props => props.type === 'success' ? 'rgba(25, 135, 84, 0.2)' : 'rgba(220, 53, 69, 0.2)'};
  color: ${props => props.type === 'success' ? '#28a745' : '#dc3545'};
  text-align: center;
`;

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #ffffff;
  font-size: 20px;
`;

export default SettingsPage; 