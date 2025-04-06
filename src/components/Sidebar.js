import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegClock, FaChevronDown, FaChevronUp, FaPlus, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
  transform: translateX(${props => props.showSidebar ? '0' : '-100%'});
  
  @media (max-width: 768px) {
    transform: translateX(${props => props.showSidebar ? '0' : '-100%'});
  }
`;

const SidebarTop = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #646cff, #8b3dff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    background: linear-gradient(90deg, #646cff, #8b3dff);
  }
`;

const NewChatDropdown = styled(motion.div)`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const NewChatOption = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.8rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: var(--input-bg);
  }
`;

const SidebarMiddle = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 1rem;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  cursor: pointer;
`;

const ConversationsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0 0.5rem;
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.6rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.active ? 'var(--input-bg)' : 'transparent'};
  color: var(--text-primary);
  transition: background 0.2s;
  
  &:hover {
    background: var(--input-bg);
  }
`;

const ConversationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.8rem;
  color: var(--text-secondary);
`;

const ConversationText = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
`;

const SidebarBottom = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border-color);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 0.8rem;
  font-size: 0.9rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 0.9rem;
  color: var(--text-primary);
`;

const UserStatus = styled.div`
  font-size: 0.7rem;
  color: var(--text-secondary);
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: var(--text-primary);
    background: var(--border-color);
  }
`;

const UsageInfo = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.8rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: var(--input-bg);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 0.3rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #646cff, #8b3dff);
  width: ${props => `${props.percentage}%`};
  transition: width 0.3s ease;
`;

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const [conversationsOpen, setConversationsOpen] = useState(true);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const { user, logout } = useFirebase();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };
  
  const handleSettings = () => {
    navigate('/settings');
  };
  
  const handleNewChat = () => {
    setShowNewChatDropdown(!showNewChatDropdown);
  };
  
  const createNewChat = () => {
    // Yeni sohbet oluşturma mantığı
    console.log('Yeni sohbet oluşturuldu');
    setShowNewChatDropdown(false);
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
    <SidebarContainer showSidebar={showSidebar}>
      <SidebarTop>
        <SidebarHeader>
          <Logo>CesAI</Logo>
          <NewChatButton onClick={handleNewChat}>
            <FaPlus />
          </NewChatButton>
        </SidebarHeader>
        
        <AnimatePresence>
          {showNewChatDropdown && (
            <NewChatDropdown
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <NewChatOption onClick={createNewChat}>
                <FaPlus style={{ marginRight: '8px' }} /> Yeni Sohbet Oluştur
              </NewChatOption>
            </NewChatDropdown>
          )}
        </AnimatePresence>
      </SidebarTop>
      
      <SidebarMiddle>
        <SidebarSection>
          <SectionTitle onClick={() => setConversationsOpen(!conversationsOpen)}>
            <span>Sohbetler</span>
            {conversationsOpen ? <FaChevronUp /> : <FaChevronDown />}
          </SectionTitle>
          
          <AnimatePresence>
            {conversationsOpen && (
              <ConversationsList
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {Array.from({ length: 7 }).map((_, index) => (
                  <ConversationItem key={index} active={index === 0}>
                    <ConversationIcon>
                      <FaRegClock />
                    </ConversationIcon>
                    <ConversationText>Yeni Sohbet {index + 1}</ConversationText>
                  </ConversationItem>
                ))}
              </ConversationsList>
            )}
          </AnimatePresence>
        </SidebarSection>
      </SidebarMiddle>
      
      <SidebarBottom>
        <UserInfo>
          <UserAvatar>{user ? getInitials(user.name || user.email) : '?'}</UserAvatar>
          <UserDetails>
            <UserName>{user ? (user.name || user.email) : 'Misafir'}</UserName>
            <UserStatus>{user ? 'Aktif' : 'Giriş yapılmadı'}</UserStatus>
          </UserDetails>
        </UserInfo>
        
        <OptionsContainer>
          <IconButton onClick={handleSettings}>
            <FaCog />
          </IconButton>
          <IconButton onClick={handleLogout}>
            <FaSignOutAlt />
          </IconButton>
        </OptionsContainer>
        
        <UsageInfo>
          <FaRegClock size={12} />
          <div>
            <div>Bugün kalan istek: {user ? '100/100' : '0'}</div>
            <ProgressBar>
              <ProgressFill percentage={100} />
            </ProgressBar>
          </div>
        </UsageInfo>
      </SidebarBottom>
    </SidebarContainer>
  );
};

export default Sidebar; 