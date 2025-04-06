import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaMoon, FaSun, FaUserEdit, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { useTheme } from '../contexts/ThemeContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 0 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 1rem;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(90deg, #646cff, #8b3dff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
`;

const OptionText = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 1rem;
    color: var(--accent-color);
  }
`;

const OptionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
`;

const OptionDescription = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const ThemeSwitch = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 30px;
  border-radius: 15px;
  background: ${props => props.isDark ? 'var(--accent-color)' : '#f0f0f0'};
  position: relative;
  cursor: pointer;
  border: none;
  transition: background 0.3s;
`;

const SwitchKnob = styled(motion.div)`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  position: absolute;
  left: ${props => props.isDark ? 'calc(100% - 27px)' : '3px'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 14px;
    color: ${props => props.isDark ? '#8b3dff' : '#f39c12'};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: ${props => props.danger ? '#ff6b6b' : 'var(--accent-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.danger ? '#ff5252' : '#535bf2'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const ProfileInfo = styled.div`
  text-align: center;
`;

const ProfileName = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
`;

const ProfileEmail = styled.p`
  margin: 0.3rem 0 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useFirebase();
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleThemeToggle = () => {
    toggleTheme();
  };
  
  const handleEditProfile = () => {
    // Bu işlevsellik ileride eklenebilir
    console.log('Profil düzenlemeyi burada yapabilirsiniz');
  };
  
  const handleLogout = async () => {
    if (showConfirmLogout) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Çıkış yapılırken hata oluştu:', error);
      }
    } else {
      setShowConfirmLogout(true);
      setTimeout(() => setShowConfirmLogout(false), 3000);
    }
  };
  
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
        </BackButton>
        <Title>Ayarlar</Title>
      </Header>
      
      {user && (
        <ProfileContainer>
          <Avatar>{getInitials(user.name || user.email)}</Avatar>
          <ProfileInfo>
            <ProfileName>{user.name || 'Kullanıcı'}</ProfileName>
            <ProfileEmail>{user.email}</ProfileEmail>
            <Button onClick={handleEditProfile}>
              <FaUserEdit /> Profili Düzenle
            </Button>
          </ProfileInfo>
        </ProfileContainer>
      )}
      
      <Section>
        <SectionTitle>Görünüm</SectionTitle>
        <OptionContainer>
          <OptionText>
            {isDarkTheme ? <FaMoon /> : <FaSun />}
            <div>
              <OptionTitle>Tema</OptionTitle>
              <OptionDescription>
                {isDarkTheme ? 'Koyu tema aktif' : 'Açık tema aktif'}
              </OptionDescription>
            </div>
          </OptionText>
          <ThemeSwitch isDark={isDarkTheme} onClick={handleThemeToggle}>
            <SwitchKnob 
              isDark={isDarkTheme}
              initial={{ x: 0 }}
              animate={{ x: isDarkTheme ? 0 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {isDarkTheme ? <FaMoon /> : <FaSun />}
            </SwitchKnob>
          </ThemeSwitch>
        </OptionContainer>
      </Section>
      
      <Section>
        <SectionTitle>Hesap</SectionTitle>
        <OptionContainer>
          <OptionText>
            <FaSignOutAlt style={{ color: '#ff6b6b' }} />
            <div>
              <OptionTitle>Çıkış Yap</OptionTitle>
              <OptionDescription>
                Hesabınızdan güvenli bir şekilde çıkış yapın
              </OptionDescription>
            </div>
          </OptionText>
          <Button danger onClick={handleLogout}>
            {showConfirmLogout ? 'Emin misiniz?' : 'Çıkış Yap'}
          </Button>
        </OptionContainer>
      </Section>
    </Container>
  );
};

export default Settings; 