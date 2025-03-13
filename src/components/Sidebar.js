import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FaPlus, FaSignOutAlt, FaUser, FaRobot, FaHistory, FaInfoCircle } from 'react-icons/fa';

const SidebarContainer = styled(motion.div)`
  width: 280px;
  height: 100%;
  background: rgba(30, 13, 61, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 100;
  
  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
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
  
  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4F9BFF, #9D4EDD);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .user-name {
    font-size: 14px;
    font-weight: 500;
  }
  
  .user-email {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const LogoutButton = styled.button`
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

const Sidebar = ({ 
  user, 
  conversations, 
  currentConversation, 
  setCurrentConversation, 
  createNewConversation, 
  onLogout,
  isMobileOpen,
  setIsMobileOpen,
  remainingRequests,
  isMobile
}) => {
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
    <SidebarContainer 
      initial={false}
      animate={isMobileOpen ? "open" : "closed"}
      variants={isMobile ? variants : {}}
      transition={{ duration: 0.3 }}
    >
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
                if (window.innerWidth <= 768) {
                  setIsMobileOpen(false);
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
        <UserInfo>
          <div className="user-avatar">
            <FaUser />
          </div>
          <div>
            <div className="user-name">{user?.name || 'Kullanıcı'}</div>
            <div className="user-email">{user?.email || 'kullanici@example.com'}</div>
          </div>
        </UserInfo>
        <LogoutButton onClick={onLogout}>
          <FaSignOutAlt />
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar; 