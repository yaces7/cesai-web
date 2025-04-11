import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegClock, FaChevronDown, FaChevronUp, FaPlus, FaSignOutAlt, FaCog, FaTrash, FaEdit, FaArchive, FaSpinner, FaThumbtack, FaUnlink } from 'react-icons/fa';
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

const ConversationItemWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.6rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.active ? 'var(--input-bg)' : 'transparent'};
  color: var(--text-primary);
  transition: all 0.2s;
  position: relative;
  margin-bottom: 2px;
  
  &:hover {
    background: var(--input-bg);
  }
  
  /* Yeni oluşturulan sohbeti vurgulama stili */
  &.highlight {
    animation: pulse 1s ease-in-out;
    background: var(--bg-hover);
    border: 1px solid var(--accent-color);
  }
  
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(100, 108, 255, 0.4); }
    50% { transform: scale(1.02); box-shadow: 0 0 0 5px rgba(100, 108, 255, 0.2); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(100, 108, 255, 0); }
  }
`;

const ConversationDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ConversationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: var(--text-secondary);
  font-size: 14px;
`;

const ConversationTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
`;

const ConversationTime = styled.div`
  font-size: 11px;
  opacity: 0.7;
  margin-top: 2px;
`;

const ErrorMessage = styled.div`
  padding: 0.5rem;
  color: #ff6b6b;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 0.5rem;
`;

const BottomButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const BottomButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: var(--text-primary);
    background: var(--border-color);
  }
`;

const RenameModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
`;

const RenameModalContent = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const RenameModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--text-primary);
`;

const RenameInput = styled.input`
  width: 100%;
  padding: 0.7rem;
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

const RenameModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const RenameModalButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => props.primary ? 'var(--accent-color)' : 'var(--bg-hover)'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  border: 1px solid ${props => props.primary ? 'var(--accent-color)' : 'var(--border-color)'};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const ContextMenu = styled.div`
  position: fixed;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
  min-width: 200px;
`;

const ContextMenuItem = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${props => props.danger ? 'var(--error-color)' : 'var(--text-color)'};
  
  &:hover {
    background-color: var(--bg-hover);
  }
  
  svg {
    font-size: 14px;
  }
`;

const ContextMenuDivider = styled.div`
  height: 1px;
  background-color: var(--border-color);
  margin: 4px 0;
`;

const UserName = styled.div`
  font-size: 0.9rem;
  color: var(--text-color);
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
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const SidebarBottom = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border-color);
`;

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const [conversationsOpen, setConversationsOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [renaming, setRenaming] = useState({ id: null, title: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pinnedConversations, setPinnedConversations] = useState([]);
  const [showPinnedSection, setShowPinnedSection] = useState(true);
  
  const { user, logout, db, createConversation } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();
  const contextMenuRef = useRef(null);
  
  // Firestore'dan sohbetleri çek
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setPinnedConversations([]);
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
          
          // Sabitlenmiş sohbetleri ayır
          const pinned = conversationsData.filter(c => c.pinned);
          const unpinned = conversationsData.filter(c => !c.pinned);
          
          setPinnedConversations(pinned);
          setConversations(unpinned);
          
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
    await logout();
    navigate('/login');
  };
  
  const handleSettings = () => {
    navigate('/settings');
  };
  
  const createNewChat = async (initialMessage = "") => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const now = new Date();
      const timestamp = now.toISOString();
      
      // İlk mesajdan başlık oluştur
      const title = initialMessage 
        ? initialMessage.substring(0, 30) + (initialMessage.length > 30 ? "..." : "") 
        : "Yeni Sohbet";
      
      const docRef = await addDoc(collection(db, "conversations"), {
        userId: user.uid,
        title: title,
        createdAt: timestamp,
        updatedAt: timestamp,
        pinned: false,
        archived: false,
        messages: initialMessage ? [{
          id: Date.now().toString(),
          text: initialMessage,
          sender: "user",
          timestamp: timestamp
        }] : []
      });
      
      // Yeni oluşturulan sohbeti vurgula
      setActiveConversation(docRef.id);
      
      // Yeni sohbete yönlendir
      navigate(`/chat/${docRef.id}`);
      
      return docRef.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError('Sohbet oluşturulamadı: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConversationClick = (id) => {
    if (!id) {
      console.error('Geçersiz sohbet ID\'si');
      return;
    }
    
    console.log(`Sohbet tıklandı: ${id}`);
    
    try {
      // Eski ve yeni ID aynıysa sadece UI'ı güncelle
      if (activeConversation === id) {
        console.log(`Zaten ${id} ID'li sohbetteyiz, sayfayı yenilemeden UI güncelleniyor`);
        
        // Sohbet öğesini vurgula
        const chatElement = document.getElementById(`chat-${id}`);
        if (chatElement) {
          chatElement.classList.add('highlight');
          setTimeout(() => {
            chatElement.classList.remove('highlight');
          }, 500);
        }
        
        return;
      }
      
      // Aktif sohbeti güncelle
      setActiveConversation(id);
      
      // Tarayıcı yönlendirme API'sinin stale state sorunlarını önlemek için
      // window.location.href kullanarak tam sayfa yenileme yapıyoruz
      window.location.href = `/chat/${id}`;
      
      // Mobil görünümde sidebar'ı kapat
      if (window.innerWidth <= 768) {
        setShowSidebar(false);
      }
      
    } catch (error) {
      console.error('Sohbet yönlendirmesi yapılırken hata oluştu:', error);
      
      // Herhangi bir hata durumunda son çare olarak window.location ile yönlendir
      window.location.href = `/chat/${id}`;
    }
  };
  
  const handleContextMenu = (e, conversation) => {
    e.preventDefault();
    setContextMenu({
      id: conversation.id,
      position: { x: e.clientX, y: e.clientY },
      isPinned: conversation.pinned || false
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
  
  const handlePin = async (id, currentPin) => {
    try {
      const conversationRef = doc(db, 'conversations', id);
      await updateDoc(conversationRef, {
        pinned: !currentPin,
        updatedAt: new Date().toISOString()
      });
      
      setContextMenu(null);
    } catch (error) {
      console.error('Sohbet sabitleme durumu değiştirilirken hata oluştu:', error);
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
        if (conversations.length > 1 || pinnedConversations.length > 0) {
          const allConvs = [...pinnedConversations, ...conversations];
          const nextConversation = allConvs.find(conv => conv.id !== id);
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
        if (conversations.length > 1 || pinnedConversations.length > 0) {
          const allConvs = [...pinnedConversations, ...conversations];
          const nextConversation = allConvs.find(conv => conv.id !== id);
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

  // Tarihleri gruplamak için yardımcı fonksiyonlar
  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  };
  
  const isYesterday = (dateString) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = new Date(dateString);
    return date.toDateString() === yesterday.toDateString();
  };
  
  const isThisWeek = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 7 && diffDays > 1;
  };
  
  const isOlder = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  };
  
  // Sohbetleri tarihe göre grupla
  const groupConversationsByDate = (conversations) => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];
    
    conversations.forEach(conv => {
      const updatedAt = conv.updatedAt || conv.createdAt;
      
      if (isToday(updatedAt)) {
        today.push(conv);
      } else if (isYesterday(updatedAt)) {
        yesterday.push(conv);
      } else if (isThisWeek(updatedAt)) {
        thisWeek.push(conv);
      } else {
        older.push(conv);
      }
    });
    
    return { today, yesterday, thisWeek, older };
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
  
  // Sohbetleri grupla
  const groupedConversations = groupConversationsByDate(conversations);
  
  // Konversasyon listeleri renderı için ayrı bir bileşen oluşturalım
  const RenderConversation = ({ conversation, active, onClick, onContextMenu }) => {
    // Doğrudan click handler ekleyelim
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Conversation ID kontrolü
      if (!conversation || !conversation.id) {
        console.error('Geçersiz konversasyon ID\'si:', conversation);
        return;
      }
      
      // ID'yi doğrudan ileterek tıklama işleyicisini çağır
      console.log(`Sohbet öğesine tıklandı: ${conversation.id}`);
      onClick(conversation.id);
    };
    
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!conversation) {
        console.error('Geçersiz konversasyon:', conversation);
        return;
      }
      
      onContextMenu(e, conversation);
    };
    
    if (!conversation || !conversation.id) {
      console.error('Render edilemeyen konversasyon:', conversation);
      return null;
    }
    
    return (
      <ConversationItemWrapper
        id={`chat-${conversation.id}`}
        key={conversation.id}
        active={active}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        data-testid={`conversation-item-${conversation.id}`}
        className="conversation-item"
      >
        <ConversationIcon>
          {conversation.pinned ? <FaThumbtack /> : <FaRegClock />}
        </ConversationIcon>
        <ConversationDetails>
          <ConversationTitle>
            {conversation.title || 'İsimsiz Sohbet'}
          </ConversationTitle>
          <ConversationTime>
            {formatDate(conversation.updatedAt || conversation.createdAt)}
          </ConversationTime>
        </ConversationDetails>
      </ConversationItemWrapper>
    );
  };
  
  // Context menü içeriği
  const renderContextMenu = () => {
    if (!contextMenu) return null;
    
    const conversation = [...pinnedConversations, ...conversations].find(
      conv => conv.id === contextMenu.id
    );
    
    if (!conversation) return null;
    
    return (
      <ContextMenu 
        ref={contextMenuRef}
        style={{ 
          top: `${contextMenu.position.y}px`, 
          left: `${contextMenu.position.x}px` 
        }}
      >
        <ContextMenuItem onClick={() => handleRename(contextMenu.id, conversation.title)}>
          <FaEdit /> Yeniden Adlandır
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handlePin(contextMenu.id, contextMenu.isPinned)}>
          {contextMenu.isPinned ? <FaUnlink /> : <FaThumbtack />}
          {contextMenu.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleArchive(contextMenu.id)}>
          <FaArchive /> Arşivle
        </ContextMenuItem>
        <ContextMenuDivider />
        <ContextMenuItem onClick={() => handleDelete(contextMenu.id)} danger>
          <FaTrash /> Sil
        </ContextMenuItem>
      </ContextMenu>
    );
  };
  
  return (
    <SidebarContainer showSidebar={showSidebar}>
      <SidebarTop>
        <SidebarHeader>
          <Logo>CesAI</Logo>
        </SidebarHeader>
      </SidebarTop>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <SidebarMiddle>
        {/* Sabitlenmiş Sohbetler */}
        {pinnedConversations.length > 0 && (
          <SidebarSection>
            <SectionTitle onClick={() => setShowPinnedSection(!showPinnedSection)}>
              <span>Sabitlenmiş</span>
              {showPinnedSection ? <FaChevronUp /> : <FaChevronDown />}
            </SectionTitle>
            
            <AnimatePresence>
              {showPinnedSection && (
                <ConversationsList
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {pinnedConversations.map((conversation) => (
                    <RenderConversation 
                      key={conversation.id}
                      conversation={conversation}
                      active={activeConversation === conversation.id}
                      onClick={handleConversationClick}
                      onContextMenu={handleContextMenu}
                    />
                  ))}
                </ConversationsList>
              )}
            </AnimatePresence>
          </SidebarSection>
        )}
        
        {/* Bugünkü Sohbetler */}
        {groupedConversations.today.length > 0 && (
          <SidebarSection>
            <SectionTitle>
              <span>Bugün</span>
            </SectionTitle>
            <ConversationsList>
              {groupedConversations.today.map((conversation) => (
                <RenderConversation 
                  key={conversation.id}
                  conversation={conversation}
                  active={activeConversation === conversation.id}
                  onClick={handleConversationClick}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </ConversationsList>
          </SidebarSection>
        )}
        
        {/* Dünkü Sohbetler */}
        {groupedConversations.yesterday.length > 0 && (
          <SidebarSection>
            <SectionTitle>
              <span>Dün</span>
            </SectionTitle>
            <ConversationsList>
              {groupedConversations.yesterday.map((conversation) => (
                <RenderConversation 
                  key={conversation.id}
                  conversation={conversation}
                  active={activeConversation === conversation.id}
                  onClick={handleConversationClick}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </ConversationsList>
          </SidebarSection>
        )}
        
        {/* Bu Haftaki Sohbetler */}
        {groupedConversations.thisWeek.length > 0 && (
          <SidebarSection>
            <SectionTitle>
              <span>Son 7 Gün</span>
            </SectionTitle>
            <ConversationsList>
              {groupedConversations.thisWeek.map((conversation) => (
                <RenderConversation 
                  key={conversation.id}
                  conversation={conversation}
                  active={activeConversation === conversation.id}
                  onClick={handleConversationClick}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </ConversationsList>
          </SidebarSection>
        )}
        
        {/* Daha Eski Sohbetler */}
        {groupedConversations.older.length > 0 && (
          <SidebarSection>
            <SectionTitle>
              <span>Daha Eski</span>
            </SectionTitle>
            <ConversationsList>
              {groupedConversations.older.map((conversation) => (
                <RenderConversation 
                  key={conversation.id}
                  conversation={conversation}
                  active={activeConversation === conversation.id}
                  onClick={handleConversationClick}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </ConversationsList>
          </SidebarSection>
        )}
      </SidebarMiddle>
      
      <SidebarBottom>
        <UserInfo>
          <UserAvatar>
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || user.email} />
            ) : (
              getInitials(user?.displayName || user?.email)
            )}
          </UserAvatar>
          <UserName>{user?.displayName || user?.email}</UserName>
        </UserInfo>
        <BottomButtons>
          <BottomButton onClick={handleSettings} title="Ayarlar">
            <FaCog />
          </BottomButton>
          <BottomButton onClick={handleLogout} title="Oturumu Kapat">
            <FaSignOutAlt />
          </BottomButton>
        </BottomButtons>
      </SidebarBottom>
      
      {renderContextMenu()}
      
      {renaming.id && (
        <RenameModal>
          <RenameModalContent>
            <RenameModalTitle>Sohbeti Yeniden Adlandır</RenameModalTitle>
            <RenameInput
              type="text"
              value={renaming.title}
              onChange={(e) => setRenaming({ ...renaming, title: e.target.value })}
              autoFocus
            />
            <RenameModalButtons>
              <RenameModalButton onClick={() => setRenaming({ id: null, title: '' })}>
                İptal
              </RenameModalButton>
              <RenameModalButton primary onClick={submitRename}>
                Kaydet
              </RenameModalButton>
            </RenameModalButtons>
          </RenameModalContent>
        </RenameModal>
      )}
    </SidebarContainer>
  );
};

export default Sidebar; 