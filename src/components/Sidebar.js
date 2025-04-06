import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlus, FaSignOutAlt, FaUser, FaRobot, FaHistory, FaInfoCircle, FaCog, FaTimes, FaBars, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';

const SidebarContainer = styled(motion.div)`
  width: 260px;
  height: 100%;
  background: rgba(30, 13, 61, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  
  @media (max-width: 768px) {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  }
`;

const NewChatButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 16px;
  padding: 12px;
  background: rgba(79, 155, 255, 0.2);
  border: 1px solid rgba(79, 155, 255, 0.5);
  border-radius: 8px;
  color: #E8DFD8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(79, 155, 255, 0.3);
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 16px;
  
  h3 {
    padding: 0 16px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }
`;

const ModelSelector = styled.div`
  margin: 0 16px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  .model-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4F9BFF, #9D4EDD);
    border-radius: 6px;
    color: white;
  }
  
  .model-info {
    flex: 1;
    
    .model-name {
      font-size: 14px;
      font-weight: 500;
    }
    
    .model-version {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  max-height: calc(100vh - 350px);
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

const ConversationItem = styled(motion.div)`
  padding: 10px 16px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${props => props.active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)'};
  background: ${props => props.active ? 'rgba(79, 155, 255, 0.2)' : 'transparent'};
  
  &:hover {
    background: ${props => props.active ? 'rgba(79, 155, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  }
  
  .conversation-icon {
    color: ${props => props.active ? '#4F9BFF' : 'rgba(255, 255, 255, 0.6)'};
  }
  
  .conversation-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .conversation-date {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const UserSection = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F9BFF, #9D4EDD);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
`;

const UserControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
`;

const LoginButton = styled(Link)`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
`;

const UsageInfo = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  
  .usage-count {
    font-weight: 500;
    color: ${props => props.count > 50 ? '#4F9BFF' : props.count > 20 ? '#FFB74D' : '#FF5252'};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
`;

const MenuButton = styled.button`
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 99;
  background: rgba(30, 13, 61, 0.8);
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background: rgba(30, 13, 61, 1);
    color: rgba(255, 255, 255, 0.9);
  }
`;

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const { user, logout, updateApiUsage } = useFirebase();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [remainingRequests, setRemainingRequests] = useState(100);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Ekran boyutunu izle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Kullanıcı varsa sohbetleri getir
  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      // Örnek sohbetler (gerçek API'den alınması gerekir)
      setConversations([
        { id: '1', title: 'Yeni Sohbet', createdAt: new Date().toISOString() }
      ]);
      setCurrentConversation('1');

      // Kullanıcının API kullanım limitini kontrol et
      if (user) {
        try {
          const usageLimit = user.usageLimit || 100;
          setRemainingRequests(usageLimit);
        } catch (error) {
          console.error('API kullanımı kontrol edilirken hata oluştu:', error);
        }
      }
    } catch (error) {
      console.error('Sohbetler alınırken hata oluştu:', error);
    }
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  };
  
  // Animation variants for mobile sidebar
  const variants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };
  
  return (
    <>
      <SidebarContainer 
        initial={false}
        animate={showSidebar ? "open" : "closed"}
        variants={isMobile ? variants : {}}
        transition={{ duration: 0.3 }}
        showSidebar={showSidebar}
      >
        <CloseButton onClick={() => setShowSidebar(false)}>
          <FaTimes />
        </CloseButton>
        
        <NewChatButton 
          whileTap={{ scale: 0.95 }}
          onClick={createNewConversation}
        >
          <FaPlus /> Yeni Sohbet
        </NewChatButton>
        
        <SidebarSection>
          <h3>Model</h3>
          <ModelSelector>
            <div className="model-icon">
              <FaRobot />
            </div>
            <div className="model-info">
              <div className="model-name">CesAI</div>
              <div className="model-version">v1.0</div>
            </div>
          </ModelSelector>
        </SidebarSection>
        
        <SidebarSection>
          <h3>Sohbetler</h3>
          <ConversationList>
            {conversations.map(conversation => (
              <ConversationItem 
                key={conversation.id}
                active={conversation.id === currentConversation}
                onClick={() => {
                  setCurrentConversation(conversation.id);
                  if (isMobile) {
                    setShowSidebar(false);
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <FaHistory className="conversation-icon" />
                <div className="conversation-title">{conversation.title}</div>
                <div className="conversation-date">{formatDate(conversation.createdAt)}</div>
              </ConversationItem>
            ))}
          </ConversationList>
        </SidebarSection>
        
        <UsageInfo count={remainingRequests}>
          <FaInfoCircle style={{ marginRight: '5px' }} />
          Bugün kalan istek: <span className="usage-count">{remainingRequests}</span>/100
        </UsageInfo>
        
        <UserSection>
          {user ? (
            <>
              <UserInfo>
                <UserAvatar>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Kullanıcı" />
                  ) : (
                    <FaUserCircle />
                  )}
                </UserAvatar>
                <UserName>{user.name || user.displayName || 'Kullanıcı'}</UserName>
              </UserInfo>
              <UserControls>
                <IconButton as={Link} to="/settings" title="Ayarlar">
                  <FaCog />
                </IconButton>
                <IconButton onClick={handleLogout} title="Çıkış Yap">
                  <FaSignOutAlt />
                </IconButton>
              </UserControls>
            </>
          ) : (
            <LoginButton to="/login">Giriş Yap</LoginButton>
          )}
        </UserSection>
      </SidebarContainer>
      
      {!showSidebar && (
        <MenuButton onClick={() => setShowSidebar(true)}>
          <FaBars />
        </MenuButton>
      )}
    </>
  );
};

export default Sidebar; 