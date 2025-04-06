import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useFirebase } from '../contexts/FirebaseContext';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaUserCircle, FaSignOutAlt, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

const SettingsPage = ({ toggleTheme }) => {
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
      
      // Temayı uygula ve ana bileşene bildir
      document.documentElement.setAttribute('data-theme', theme);
      if (toggleTheme) toggleTheme(theme);
      
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
          <BackButton onClick={() => navigate('/')}>
            <FaArrowLeft /> Geri
          </BackButton>
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
  background: var(--bg-primary);
  color: var(--text-primary);
`;

const SettingsCard = styled.div`
  width: 100%;
  max-width: 800px;
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 30px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--input-bg);
  color: var(--text-secondary);
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--border-color);
    color: var(--text-primary);
  }
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: 28px;
  margin: 0;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(220, 53, 69, 0.1);
  color: #ff6b6b;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(220, 53, 69, 0.2);
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 12px;
  background: var(--input-bg);
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  background: var(--bg-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
  
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
  color: var(--text-primary);
  font-size: 20px;
  margin: 0 0 5px 0;
`;

const UserEmail = styled.p`
  color: var(--text-secondary);
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
  background: rgba(25, 135, 84, 0.1);
  color: #28a745;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 6px;
`;

const UnverifiedBadge = styled.span`
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 6px;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 500;
`;

const ThemeOptions = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const ThemeOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  background: ${props => props.active ? 'var(--accent-color)' : 'var(--input-bg)'};
  color: ${props => props.active ? '#ffffff' : 'var(--text-primary)'};
  border: 1px solid ${props => props.active ? 'var(--accent-color)' : 'var(--border-color)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--accent-color)' : 'var(--border-color)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: var(--input-bg);
  border-radius: 8px;
`;

const StatLabel = styled.span`
  color: var(--text-secondary);
  font-size: 14px;
`;

const StatValue = styled.span`
  color: var(--text-primary);
  font-weight: 500;
`;

const Notification = styled.div`
  padding: 12px 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  background: ${props => props.type === 'success' ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  color: ${props => props.type === 'success' ? '#28a745' : '#dc3545'};
  text-align: center;
`;

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 18px;
`;

export default SettingsPage; 