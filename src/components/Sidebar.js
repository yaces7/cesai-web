import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegClock, FaChevronDown, FaChevronUp, FaPlus, FaSignOutAlt, FaCog, FaTrash, FaEdit, FaArchive, FaSpinner } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

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
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  position: relative;
  
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

const ContextMenu = styled.div`
  position: absolute;
  top: ${props => props.position.y}px;
  left: ${props => props.position.x}px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow);
  z-index: 1000;
  min-width: 150px;
  overflow: hidden;
`;

const ContextMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
  
  svg {
    margin-right: 0.8rem;
    color: var(--text-secondary);
  }
  
  &:hover {
    background: var(--input-bg);
  }
  
  &.danger {
    color: #ff6b6b;
    
    svg {
      color: #ff6b6b;
    }
  }
`;

const RenameInput = styled.input`
  width: 100%;
  padding: 0.6rem;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
  
  &:focus {
    border-color: var(--accent-color);
  }
`;

const EmptyStateMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  padding: 0.5rem;
  color: #ff6b6b;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 0.5rem;
`;

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const [conversationsOpen, setConversationsOpen] = useState(true);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [renaming, setRenaming] = useState({ id: null, title: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user, logout, db } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();
  const contextMenuRef = useRef(null);
  
  // Firestore'dan sohbetleri çek
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    
    const fetchConversations = async () => {
      try {
        const q = query(
          collection(db, 'conversations'),
          where('userId', '==', user.uid),
          where('archived', '==', false),
          orderBy('updatedAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const conversationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setConversations(conversationsData);
          
          // URL'den aktif sohbeti belirle
          const chatId = location.pathname.split('/chat/')[1];
          if (chatId && conversationsData.some(conv => conv.id === chatId)) {
            setActiveConversation(chatId);
          } else if (conversationsData.length > 0 && !activeConversation) {
            // Eğer aktif sohbet yoksa ve sohbetler varsa ilkini seç
            setActiveConversation(conversationsData[0].id);
            navigate(`/chat/${conversationsData[0].id}`);
          }
        });
          
        return () => unsubscribe();
      } catch (error) {
        console.error('Sohbetler yüklenirken hata oluştu:', error);
      }
    };
    
    fetchConversations();
  }, [db, user, location.pathname, navigate, activeConversation]);
  
  // Dışarı tıklandığında context menüyü kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
  
  const createNewChat = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const newChat = {
        title: 'Yeni Sohbet',
        userId: user.uid,
        messages: [{
          text: 'Merhaba! Size nasıl yardımcı olabilirim?',
          isUser: false,
          timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false
      };
      
      const conversationsRef = collection(db, 'conversations');
      const docRef = await addDoc(conversationsRef, newChat);
      
      setShowNewChatDropdown(false);
      navigate(`/chat/${docRef.id}`);
      setActiveConversation(docRef.id);
    } catch (error) {
      console.error('Sohbet oluşturulurken hata oluştu:', error);
      setError('Sohbet oluşturulurken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConversationClick = (id) => {
    setActiveConversation(id);
    navigate(`/chat/${id}`);
  };
  
  const handleContextMenu = (e, conversation) => {
    e.preventDefault();
    setContextMenu({
      id: conversation.id,
      position: { x: e.clientX, y: e.clientY }
    });
  };
  
  const handleRename = (id, currentTitle) => {
    setRenaming({ id, title: currentTitle });
    setContextMenu(null);
  };
  
  const submitRename = async () => {
    if (!renaming.id || !renaming.title.trim()) return;
    
    try {
      const conversationRef = doc(db, 'conversations', renaming.id);
      await updateDoc(conversationRef, {
        title: renaming.title.trim(),
        updatedAt: new Date().toISOString()
      });
      setRenaming({ id: null, title: '' });
    } catch (error) {
      console.error('Sohbet yeniden adlandırılırken hata oluştu:', error);
    }
  };
  
  const handleArchive = async (id) => {
    try {
      const conversationRef = doc(db, 'conversations', id);
      await updateDoc(conversationRef, {
        archived: true,
        updatedAt: new Date().toISOString()
      });
      
      if (activeConversation === id) {
        // Arşivlenen sohbet aktifse başka bir sohbete yönlendir
        if (conversations.length > 1) {
          const nextConversation = conversations.find(conv => conv.id !== id);
          if (nextConversation) {
            navigate(`/chat/${nextConversation.id}`);
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      }
      
      setContextMenu(null);
    } catch (error) {
      console.error('Sohbet arşivlenirken hata oluştu:', error);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) return;
    
    try {
      const conversationRef = doc(db, 'conversations', id);
      await deleteDoc(conversationRef);
      
      if (activeConversation === id) {
        // Silinen sohbet aktifse başka bir sohbete yönlendir
        if (conversations.length > 1) {
          const nextConversation = conversations.find(conv => conv.id !== id);
          if (nextConversation) {
            navigate(`/chat/${nextConversation.id}`);
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      }
      
      setContextMenu(null);
    } catch (error) {
      console.error('Sohbet silinirken hata oluştu:', error);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    }
  };
  
  return (
    <SidebarContainer showSidebar={showSidebar}>
      <SidebarTop>
        <SidebarHeader>
          <Logo>CesAI</Logo>
          <NewChatButton onClick={handleNewChat} disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : <FaPlus />}
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
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
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
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      active={activeConversation === conversation.id}
                      onClick={() => handleConversationClick(conversation.id)}
                      onContextMenu={(e) => handleContextMenu(e, conversation)}
                    >
                      <ConversationIcon>
                        <FaRegClock />
                      </ConversationIcon>
                      {renaming.id === conversation.id ? (
                        <RenameInput
                          value={renaming.title}
                          onChange={(e) => setRenaming({ ...renaming, title: e.target.value })}
                          onBlur={submitRename}
                          onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <ConversationText>{conversation.title}</ConversationText>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {formatDate(conversation.updatedAt)}
                          </div>
                        </>
                      )}
                    </ConversationItem>
                  ))
                ) : (
                  <EmptyStateMessage>
                    Henüz hiç sohbet yok. Yeni bir sohbet başlatın!
                  </EmptyStateMessage>
                )}
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
            <div>Bugün kalan istek: {user ? (user.usageLimit || 100) : 0}</div>
            <ProgressBar>
              <ProgressFill percentage={user ? ((user.usageLimit || 100) / 100) * 100 : 0} />
            </ProgressBar>
          </div>
        </UsageInfo>
      </SidebarBottom>
      
      {contextMenu && (
        <ContextMenu position={contextMenu.position} ref={contextMenuRef}>
          <ContextMenuItem onClick={() => handleRename(
            contextMenu.id,
            conversations.find(c => c.id === contextMenu.id)?.title || 'Yeni Sohbet'
          )}>
            <FaEdit /> Yeniden Adlandır
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleArchive(contextMenu.id)}>
            <FaArchive /> Arşivle
          </ContextMenuItem>
          <ContextMenuItem className="danger" onClick={() => handleDelete(contextMenu.id)}>
            <FaTrash /> Sil
          </ContextMenuItem>
        </ContextMenu>
      )}
    </SidebarContainer>
  );
};

export default Sidebar; 