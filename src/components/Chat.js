import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaArrowDown, FaPaperclip, FaThumbsUp, FaThumbsDown, FaInfoCircle, FaWifi, FaExclamationTriangle, FaRegCopy, FaSync, FaRegComment, FaBook } from 'react-icons/fa';
import { useFirebase } from '../contexts/FirebaseContext';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot, addDoc, collection, arrayUnion } from 'firebase/firestore';
import { message } from 'antd';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { auth } from '../firebase/config';

// Styled Components
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  flex: 1;
  margin-left: 260px;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  
  h1 {
    margin: 0;
    font-size: 1.25rem;
    background: linear-gradient(90deg, #646cff, #8b3dff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  
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

const MessageActions = styled.div`
  position: absolute;
  bottom: -30px;
  ${props => props.isUser ? 'left: 0;' : 'right: 0;'}
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  z-index: 10;
`;

const MessageWrapper = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  position: relative;
  
  &:hover ${MessageActions} {
    opacity: 1;
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.8rem 1rem;
  border-radius: 0.7rem;
  background: ${props => props.isUser 
    ? 'var(--accent-color)' 
    : props.error 
      ? 'rgba(255, 107, 107, 0.1)' 
      : 'var(--bg-hover)'};
  color: ${props => props.isUser 
    ? '#ffffff' 
    : props.error 
      ? '#ff6b6b' 
      : 'var(--text-primary)'};
  margin: ${props => props.isUser ? '0 0 0 1rem' : '0 1rem 0 0'};
  border: 1px solid ${props => props.isUser 
    ? 'rgba(100, 108, 255, 0.4)' 
    : props.error 
      ? 'rgba(255, 107, 107, 0.3)' 
      : 'var(--border-color)'};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  
  .code-blocks {
    margin-top: 0.5rem;
  }
  
  .code-block {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.5rem;
    border-radius: 0.3rem;
    font-family: monospace;
    white-space: pre-wrap;
    overflow-x: auto;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  
  .security-insights {
    margin-top: 0.5rem;
    border-left: 3px solid #ff9900;
    padding-left: 0.5rem;
    
    h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.85rem;
      color: #ff9900;
    }
    
    p {
      margin: 0;
      font-size: 0.85rem;
    }
  }
`;

const MessageTime = styled.div`
  font-size: 0.7rem;
  text-align: ${props => props.isUser ? 'right' : 'left'};
  margin-top: 0.3rem;
  color: var(--text-secondary);
`;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.8rem 1rem;
  border-radius: 1.2rem;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.1);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const AttachButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  margin-right: 0.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: var(--accent-color);
    background: var(--input-bg);
  }
`;

const SendButton = styled(motion.button)`
  background: linear-gradient(135deg, #646cff, #8b3dff);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 8px rgba(100, 108, 255, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: scale(1);
    box-shadow: none;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ScrollToBottomButton = styled(motion.button)`
  position: absolute;
  right: 1.5rem;
  bottom: 5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const CopyNotification = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  padding: 8px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 0.85rem;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &.show {
    opacity: 1;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem;
  background: var(--bg-primary);
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.6;
    color: var(--accent-color);
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const EmptyStateText = styled.p`
  max-width: 500px;
  line-height: 1.6;
  opacity: 0.8;
  font-size: 0.95rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #ff6b6b;
  text-align: center;
`;

const FeedbackButtons = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const FeedbackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: 1px solid ${props => props.positive ? 'var(--accent-color)' : 'var(--text-secondary)'};
  color: ${props => props.positive ? 'var(--accent-color)' : 'var(--text-secondary)'};
  border-radius: 1rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.positive ? 'rgba(100, 108, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  }
  
  &.active {
    background: ${props => props.positive ? 'rgba(100, 108, 255, 0.2)' : 'rgba(255, 107, 107, 0.1)'};
    border-color: ${props => props.positive ? 'var(--accent-color)' : '#ff6b6b'};
    color: ${props => props.positive ? 'var(--accent-color)' : '#ff6b6b'};
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const MessageAnalysis = styled.div`
  margin-top: 0.5rem;
  font-size: 0.7rem;
  opacity: 0.7;
  font-style: italic;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
`;

const ConnectionStatus = ({ status, onRetryClick }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      fontSize: '0.8rem',
      color: status === 'error' ? '#ff6b6b' : status === 'connecting' ? '#ffbb33' : '#4caf50',
      gap: '5px'
    }}>
      {status === 'connected' && <FaWifi />}
      {status === 'connecting' && <FaSpinner className="spinner" />}
      {status === 'error' && <FaExclamationTriangle />}
      
      <span>
        {status === 'connected' && 'Bağlı'}
        {status === 'connecting' && 'Bağlanıyor...'}
        {status === 'error' && 'Bağlantı hatası'}
      </span>
      
      {status === 'error' && (
        <button 
          onClick={onRetryClick}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b3dff',
            cursor: 'pointer',
            marginLeft: '5px'
          }}
        >
          <FaSync />
        </button>
      )}
    </div>
  );
};

// API URL'sini ortam değişkeninden al veya varsayılan değeri kullan
const API_URL = 'https://cesai-production.up.railway.app';

// API istekleri için yardımcı fonksiyon
const callApi = async (endpoint, method = 'GET', data = null, token = null, timeoutMs = 10000) => {
  try {
    // API URL'sini oluştur
    const url = `${API_URL}${endpoint}`;
    
    console.log(`API isteği yapılıyor: ${method} ${url}`);
    
    // İstek yapılandırması
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    // Token varsa ekle
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // POST, PUT veya PATCH için body ekle
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }
    
    // Zaman aşımı için
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    config.signal = controller.signal;
    
    // Fetch isteği gönder
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    // Yanıtı işle
    if (response.ok) {
      // İçerik varsa JSON olarak işle
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return { success: true, data };
      }
      // JSON olmayan başarılı yanıt
      return { success: true };
    }
    
    // Hata yanıtı
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // JSON içeriği yoksa
    }
    
    return {
      success: false,
      status: response.status,
      message: errorData.message || errorData.detail || `Sunucu hatası: ${response.status}`
    };
  } catch (error) {
    // Zaman aşımı veya ağ hatası
    console.error('API isteği sırasında hata:', error);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'İstek zaman aşımına uğradı. Sunucu yanıt vermiyor.'
      };
    }
    
    return {
      success: false,
      message: `İstek hatası: ${error.message}`
    };
  }
};

// Chat Component
const Chat = () => {
  const { chatId } = useParams();
  const { user, updateApiUsage, db, mesajCoz, createConversation, getFirebaseToken } = useFirebase();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [apiStatus, setApiStatus] = useState('connecting');
  const navigate = useNavigate();
  
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // URL'den chatId doğrudan al (useParams bazen eski değer dönebiliyor)
  const urlChatId = window.location.pathname.includes('/chat/') 
    ? window.location.pathname.split('/chat/')[1] 
    : null;
  
  // Kullanılacak chatId, URL'den gelen veya useParams'tan gelen
  const currentChatId = urlChatId || chatId;
  
  // Boş sohbet durumu için kontrol
  const isNewChat = !currentChatId || currentChatId === 'new';
  
  // Mesaj container scroll işlemi için
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // Scroll durumunu güncelle
    setShowScrollButton(!isNearBottom);
    
    // Son scroll pozisyonunu kontrol et
    if (messagesContainerRef.current._lastScrollTop !== undefined) {
      setIsScrollingUp(scrollTop < messagesContainerRef.current._lastScrollTop);
    }
    
    // Son scroll pozisyonunu kaydet
    messagesContainerRef.current._lastScrollTop = scrollTop;
  };
  
  // Sohbeti yükleme fonksiyonu
  const fetchConversation = async (id = currentChatId) => {
    if (!id || id === 'new' || !user) return null;
    
    try {
    setLoadingConversation(true);
    setError(null);
    
      // Firestore'dan sohbet verisini al
      const conversationRef = doc(db, "conversations", id);
      console.log(`Sohbet ID '${id}' için veri alınıyor...`);
      
      // Önce belgeyi kontrol et
      const docSnap = await getDoc(conversationRef);
      if (!docSnap.exists()) {
        console.error(`Sohbet ID '${id}' bulunamadı.`);
        setNotFound(true);
          setLoadingConversation(false);
        return null;
      }
      
      const data = docSnap.data();
      
      // Kullanıcıya ait olup olmadığını kontrol et
      if (data.userId !== user.uid) {
        console.error(`Sohbet '${id}' bu kullanıcıya ait değil.`);
            setNotFound(true);
        setLoadingConversation(false);
        return null;
          }
          
      // Realtime güncelleme için onSnapshot kullanılıyor
      const unsubscribe = onSnapshot(conversationRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          setConversation(data);
          
          // Mesajları işle
          if (data.messages && Array.isArray(data.messages)) {
            const processedMessages = processMessages(data.messages);
            setMessages(processedMessages);
            
            // Yeni mesaj geldiğinde otomatik kaydırma
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          } else {
            setMessages([]);
          }
          
          setLoadingConversation(false);
        } else {
          console.error(`Realtime update: Sohbet ID '${id}' artık bulunamıyor.`);
          setNotFound(true);
          setLoadingConversation(false);
        }
      }, (error) => {
        console.error("Realtime update hatası:", error);
        setError(`Sohbet verileri dinlenirken hata oluştu: ${error.message}`);
          setLoadingConversation(false);
        });
        
      return unsubscribe;
      } catch (error) {
      console.error("Sohbet yükleme hatası:", error);
      setError(`Sohbet yüklenirken bir hata oluştu: ${error.message}`);
        setLoadingConversation(false);
      return null;
    }
  };
  
  // İnternet bağlantısı durumunu izle
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowConnectionStatus(true);
      setTimeout(() => setShowConnectionStatus(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowConnectionStatus(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // İnternet bağlantısı durumunu izle
  useEffect(() => {
    // Başlangıçta kontrol et ve sonra periyodik olarak yeniden dene
    const tryConnection = async () => {
      await checkApiConnection();
    };
    
    tryConnection();
    
    // Sayfada görünür olduğunda ve çevrimiçi olduğunda tekrar dene
    window.addEventListener('online', tryConnection);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        tryConnection();
      }
    });
    
    return () => {
      window.removeEventListener('online', tryConnection);
    };
  }, []);
  
  // Mesajlar değiştiğinde aşağı kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Kaydırma pozisyonunu kontrol et
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 200;
      setShowScrollButton(isScrolledUp);
    };
    
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (messagesContainer) {
        messagesContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Sıkıştırılmış mesajları çözümleme
  const processMessages = (messages) => {
    if (!messages || !Array.isArray(messages)) {
      console.error('Geçersiz mesaj dizisi:', messages);
      return [];
    }
    
    console.log(`${messages.length} mesaj çözümleniyor...`);
    
    return messages.map((msg, index) => {
      if (!msg) {
        console.error(`Geçersiz mesaj #${index}:`, msg);
        return {
          text: 'Geçersiz mesaj',
          isUser: false,
          timestamp: new Date().toISOString(),
          error: true
        };
      }
      
      try {
        // Eğer mesaj sıkıştırılmışsa ve mesajCoz fonksiyonu varsa çözümle
        if (msg.isCompressed && mesajCoz) {
          console.log(`Mesaj #${index} sıkıştırılmış, çözümleniyor...`);
          const decompressedText = mesajCoz(msg.text);
          return {
            ...msg,
            text: decompressedText || msg.text,
            _originalCompressed: msg.text // Debug için orijinal sıkıştırılmış metni saklayalım
          };
        }

        // isUser tanımlanmamışsa, sender alanına bakarak düzeltelim
        if (msg.isUser === undefined && msg.sender) {
          return {
            ...msg,
            isUser: msg.sender === "user"
          };
        }
        
        return msg;
      } catch (error) {
        console.error(`Mesaj #${index} çözümlenirken hata:`, error, msg);
        // Hata durumunda orijinal mesajı döndür
        return {
          ...msg,
          text: msg.text || 'Mesaj çözümlenirken hata oluştu',
          _processingError: true
        };
      }
    });
  };
  
  // Mesaj gönderme fonksiyonu
  const sendMessage = async (text) => {
    try {
      // İnternet bağlantısını kontrol et
      if (!navigator.onLine) {
        throw new Error('İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.');
      }
      
      // API durumunu güncelle
      setApiStatus('connecting');
      
      // Firebase kimlik doğrulama token'ını al
      let token = '';
      try {
        // Context'teki getFirebaseToken fonksiyonunu kullan
        if (typeof getFirebaseToken !== 'function') {
          console.error('getFirebaseToken fonksiyonu tanımlı değil!');
          throw new Error('Kimlik doğrulama fonksiyonu bulunamadı');
        }
        
        token = await getFirebaseToken();
        
        if (!token) {
          console.warn('Token alınamadı veya boş');
          throw new Error('Kimlik doğrulama bilgisi alınamadı');
        }
      } catch (tokenError) {
        console.error('Token alınamadı:', tokenError);
        throw new Error('Kimlik doğrulama hatası: ' + tokenError.message);
      }
      
      console.log('Mesaj gönderiliyor...');
      
      // API'ye istek gönder
      const response = await callApi('/chat', 'POST', {
        message: text,
        conversation_id: currentChatId || 'new',
        model: 'gpt-3.5-turbo'
      }, token);
      
      // API yanıtını güncelle
      setApiStatus(response.success ? 'connected' : 'error');
      
      if (!response.success) {
        throw new Error(response.message || 'API yanıt vermedi');
      }
      
      // Gelen veriyi işle
      if (!response.data) {
        console.warn('API yanıtı boş');
        return {
          text: 'Yanıt alınamadı. Lütfen daha sonra tekrar deneyin.',
          isUser: false,
          timestamp: new Date().toISOString(),
          error: true
        };
      }
      
      // Doğru yapıyı oluştur
      return {
        text: response.data.response || response.data.message || 'Yanıt alınamadı.',
        isUser: false,
        timestamp: new Date().toISOString(),
        analysis: response.data.analysis || null,
        code_blocks: response.data.code_blocks || [],
        security_insights: response.data.security_insights || null
      };
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      setApiStatus('error');
      
      return {
        text: `Üzgünüm, bir hata oluştu: ${error.message}`,
        isUser: false,
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  };
  
  // Mesaj geri bildirimi gönder
  const sendFeedback = async (messageId, message, response, score) => {
    try {
      if (!user) return;
      
      // Zaten bu mesaja geri bildirim verilmiş mi kontrol et
      if (feedbackState[messageId] !== undefined) return;
      
      // Geri bildirim durumunu güncelle
      setFeedbackState(prev => ({
        ...prev,
        [messageId]: score
      }));
      
      // Firebase kimlik doğrulama token'ını al
      let token = '';
      try {
        token = await getFirebaseToken(); // Context'ten gelen fonksiyonu kullan
      } catch (tokenError) {
        console.error('Geri bildirim için token alınamadı:', tokenError);
        return;
      }
      
      console.log('Geri bildirim gönderiliyor', { messageId, score });
      
      // callApi yardımcı fonksiyonunu kullan
      const result = await callApi('/api/learn', 'POST', {
        message: message,
        response: response,
        feedback_score: score,
        preferences: {
          conversation_id: currentChatId
        }
      }, token, 10000);
      
      if (!result.success) {
        console.error('Geri bildirim gönderilirken API hatası:', result.message, result.status);
      } else {
        console.log('Geri bildirim başarıyla gönderildi');
      }
      
    } catch (error) {
      console.error('Geri bildirim gönderilirken hata oluştu:', error);
    }
  };
  
  // API bağlantısını yeniden dene
  const retryApiConnection = async () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
    
    try {
      const isConnected = await checkApiConnection();
      
      if (isConnected) {
        setLoading(false);
        
        // Yeniden mesaj göndermeyi dene
        if (messages.length > 0 && messages[messages.length - 1].isUser) {
          try {
            const lastUserMessage = messages[messages.length - 1].text;
            const aiResponseData = await sendMessage(lastUserMessage);
            
            const aiMessage = {
              text: aiResponseData.text,
          isUser: false,
              timestamp: new Date().toISOString(),
              analysis: aiResponseData.analysis,
              context: aiResponseData.context,
              code_blocks: aiResponseData.code_blocks,
              security_insights: aiResponseData.security_insights
            };
            
            const conversationRef = doc(db, 'conversations', currentChatId);
        await updateDoc(conversationRef, {
              messages: [...messages, aiMessage],
          updatedAt: new Date().toISOString()
        });
        
          } catch (error) {
            console.error('Yeniden gönderim sırasında hata:', error);
            setError('Yeniden gönderim sırasında hata oluştu: ' + error.message);
          }
        }
      } else {
        setLoading(false);
        setError('API sunucusuna bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      setLoading(false);
      setError('Bağlantı yeniden sağlanamadı: ' + error.message);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    try {
      setLoading(true);
      setError(null);
      
      // Boş sohbet ise (veya id='new' ise) önce yeni sohbet oluştur
      let currentId = currentChatId;
      let initialMessage = false;
      
      if (currentChatId === "new") {
        initialMessage = true;
        
        // Geçici olarak kullanıcı mesajını göster
        setMessages([{
          id: Date.now().toString(),
          text: userMessage,
          isUser: true,
          timestamp: new Date().toISOString()
        }]);
        
        try {
          // Yeni sohbet oluştur
          const now = new Date();
          const timestamp = now.toISOString();
          
          // İlk mesajdan başlık oluştur
          const title = userMessage
            ? userMessage.substring(0, 30) + (userMessage.length > 30 ? "..." : "") 
            : "Yeni Sohbet";
          
          const docRef = await addDoc(collection(db, "conversations"), {
            userId: user.uid,
            title: title,
            createdAt: timestamp,
            updatedAt: timestamp,
            pinned: false,
            archived: false,
            messages: [{
              id: Date.now().toString(),
              text: userMessage,
              isUser: true,
              timestamp: timestamp
            }]
          });
          
          currentId = docRef.id;
          
          // URL'yi güncelle ama sayfayı yenileme
          navigate(`/chat/${currentId}`, { replace: true });
          
          // Yeni konuşmayı izlemeye başla
          fetchConversation(currentId);
        } catch (firebaseError) {
          console.error("Yeni sohbet oluşturulurken hata:", firebaseError);
          setError("Yeni sohbet oluşturulamadı: " + firebaseError.message);
          setLoading(false);
          return;
        }
      } else {
        // Mevcut sohbete mesaj ekle
        const userMessageObj = {
          id: Date.now().toString(),
          text: userMessage,
          isUser: true,
          timestamp: new Date().toISOString()
        };
        
        // UI'ı hemen güncelle
        setMessages(prevMessages => [...prevMessages, userMessageObj]);
        
        // Firestore'a kullanıcı mesajını kaydet
        try {
          await safeFirestoreUpdate(currentId, {
            messages: arrayUnion(userMessageObj),
            updatedAt: new Date().toISOString()
          });
        } catch (updateError) {
          console.error("Kullanıcı mesajı Firestore'a kaydedilemedi:", updateError);
          // Devam et - UI zaten güncellendi
        }
      }
      
      // Otomatik kaydırma
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      // AI yanıtını al
      try {
        // API'ye istek gönder
        const aiResponse = await sendMessage(userMessage);
        
        if (aiResponse.error) {
          // Hata mesajını göster ama yanıt olarak ekle
          setMessages(prevMessages => [...prevMessages, aiResponse]);
          await safeFirestoreUpdate(currentId, {
            messages: arrayUnion(aiResponse),
            updatedAt: new Date().toISOString()
          });
        } else {
          // AI yanıtını Firestore'a kaydet ve ekrana göster
          try {
            // Mevcut mesajları al
            const conversationRef = doc(db, 'conversations', currentId);
            const docSnap = await getDoc(conversationRef);
            
            if (docSnap.exists()) {
              // Var olan mesajları güncelle
              const conversationData = docSnap.data();
              const currentMessages = conversationData.messages || [];
              
              // Yeni mesajı ekle
              const updatedMessages = [...currentMessages, {
                id: Date.now().toString(),
                ...aiResponse
              }];
              
              // Firestore'u güncelle
              await updateDoc(conversationRef, {
                messages: updatedMessages,
                updatedAt: new Date().toISOString()
              });
            } else {
              console.error("Sohbet kaydı bulunamadı:", currentId);
              // Yine de mesajı UI'da göster  
              setMessages(prevMessages => [...prevMessages, aiResponse]);
            }
          } catch (firestoreError) {
            console.error("AI yanıtı Firestore'a kaydedilemedi:", firestoreError);
            // Yine de mesajı UI'da göster  
            setMessages(prevMessages => [...prevMessages, aiResponse]);
          }
        }
      } catch (apiError) {
        console.error("AI yanıtı alınamadı:", apiError);
        
        // Hata mesajı ekle
        const errorMessage = {
          id: Date.now().toString(),
          text: `Üzgünüm, bir hata oluştu: ${apiError.message}`,
          isUser: false,
          timestamp: new Date().toISOString(),
          error: true
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
        
        // Hata mesajını Firestore'a kaydet
        await safeFirestoreUpdate(currentId, {
          messages: arrayUnion(errorMessage),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Mesaj gönderilirken hata:", error);
      setError("API İsteği Hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Mesaj bileşeni
  const Message = ({ message, index }) => {
    if (!message) {
      console.error(`Geçersiz mesaj verisi, indeks: ${index}`);
      return null;
    }
    
    const { text, isUser, timestamp, analysis, context, code_blocks, security_insights, error } = message;
    const messageId = `msg-${index}-${timestamp || Date.now()}`;
    const hasAnalysis = analysis && typeof analysis === 'string' && analysis.length > 0;
    const hasContext = context && typeof context === 'object' && Object.keys(context).length > 0;
    const hasCodeBlocks = Array.isArray(code_blocks) && code_blocks.length > 0;
    const hasSecurityInsights = security_insights && typeof security_insights === 'string' && security_insights.length > 0;
    const isErrorMessage = !!error;
    
    // Mesajı panoya kopyalama fonksiyonu
    const copyToClipboard = () => {
      navigator.clipboard.writeText(text)
        .then(() => {
          // Başarılı olduğunda bildirim göster
          setShowCopyNotification(true);
          // 2 saniye sonra bildirimi kapat
          setTimeout(() => {
            setShowCopyNotification(false);
          }, 2000);
        })
        .catch(err => {
          console.error('Kopyalama işlemi başarısız:', err);
        });
    };
    
    // Mesajı yeniden oluşturma işlemi
    const regenerateMessage = () => {
      if (isUser || index === 0) return;
      
      // Bir önceki kullanıcı mesajını bul
      const previousUserMessage = messages
        .slice(0, index)
        .reverse()
        .find(msg => msg.isUser);
      
      if (previousUserMessage) {
        // Önceki kullanıcı mesajını input alanına ekle
        setInput(previousUserMessage.text);
        
        // Otomatik odaklanma
        document.querySelector('input[type="text"]').focus();
      }
    };
    
    return (
      <MessageWrapper isUser={isUser}>
        <div>
          <MessageBubble isUser={isUser} error={isErrorMessage}>
            {text || 'Boş mesaj'}
            
            {/* Kod blokları varsa göster */}
            {hasCodeBlocks && (
              <div className="code-blocks">
                {code_blocks.map((block, i) => (
                  <pre key={i} className="code-block">
                    <code>{block}</code>
                  </pre>
                ))}
              </div>
            )}
            
            {/* Güvenlik değerlendirmesi varsa göster */}
            {hasSecurityInsights && (
              <div className="security-insights">
                <h4>Güvenlik Değerlendirmesi:</h4>
                <p>{security_insights}</p>
              </div>
            )}
            
            {/* Analiz veya bağlam bilgisi varsa göster */}
            {(hasAnalysis || hasContext) && (
              <MessageAnalysis>
                {hasContext && context.emotion && <span>Duygu: {context.emotion} </span>}
                {hasContext && Array.isArray(context.topics) && context.topics.length > 0 && (
                  <span>Konular: {context.topics.join(', ')} </span>
                )}
                {hasAnalysis && <span>{analysis}</span>}
              </MessageAnalysis>
            )}
            
            {/* Mesaj Aksiyonları - Hover durumunda görünecek */}
            <MessageActions isUser={isUser}>
              <ActionButton onClick={copyToClipboard}>
                <FaRegCopy /> Kopyala
              </ActionButton>
              {!isUser && !isErrorMessage && (
                <ActionButton onClick={regenerateMessage}>
                  <FaSync /> Yeniden Oluştur
                </ActionButton>
              )}
            </MessageActions>
          </MessageBubble>
          
          <MessageTime isUser={isUser}>
            {formatTime(timestamp || Date.now())}
          </MessageTime>
          
          {/* Sadece AI mesajları için geri bildirim butonları göster */}
          {!isUser && !isErrorMessage && (
            <FeedbackButtons>
              <FeedbackButton 
                positive
                className={feedbackState[messageId] === 5 ? 'active' : ''}
                onClick={() => sendFeedback(messageId, messages[index-1]?.text || '', text || '', 5)}
              >
                <FaThumbsUp /> İyi
              </FeedbackButton>
              <FeedbackButton 
                className={feedbackState[messageId] === 1 ? 'active' : ''}
                onClick={() => sendFeedback(messageId, messages[index-1]?.text || '', text || '', 1)}
              >
                <FaThumbsDown /> Kötü
              </FeedbackButton>
            </FeedbackButtons>
          )}
        </div>
      </MessageWrapper>
    );
  };
  
  // Firestore'a yazma işlemi için güvenli fonksiyon
  const safeFirestoreUpdate = async (conversationId, updatedData) => {
    if (!conversationId || !db || !updatedData) {
      console.error('Firestore güncellemesi için gerekli parametreler eksik');
      return false;
    }
    
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, updatedData);
      console.log('Firestore başarıyla güncellendi');
      return true;
    } catch (error) {
      console.error('Firestore güncellenirken hata:', error);
      return false;
    }
  };
  
  // Firestore'dan sohbeti yükleme
  useEffect(() => {
    if (!user || !currentChatId) return;
    
    // Eğer chatId "new" ise, yükleme göstermeyin
    if (currentChatId === "new") {
      setConversation(null);
      setMessages([]);
      setNotFound(false);
      setLoadingConversation(false);
      return;
    }
    
    console.log(`Sohbet ID '${currentChatId}' için Firestore dinleyicisi ayarlanıyor...`);
    setLoadingConversation(true);
    
    // fetchConversation fonksiyonunu çağır ve unsubscribe fonksiyonunu al
    const unsubscribePromise = fetchConversation(currentChatId);
    
    // Cleanup function
    return () => {
      // Unsubscribe fonksiyonunu çağır (eğer varsa)
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          console.log(`Sohbet ID '${currentChatId}' için Firestore dinleyicisi kaldırılıyor...`);
          unsubscribe();
        }
      });
    };
  }, [db, user, currentChatId]);
  
  // Sohbet yükleme durumlarını yönetmek için etkilenme durumları
  useEffect(() => {
    // Eğer chatId yoksa veya "new" ise, diğer durumları temizle
    if (!currentChatId || currentChatId === "new") {
      setLoadingConversation(false);
      setNotFound(false);
      setError(null);
    }
  }, [currentChatId]);
  
  // API bağlantı durumunu kontrol etme (artık hiç sağlık kontrolü yapmıyoruz, direkt çalışıyoruz)
  const checkApiConnection = async () => {
    // API durumu zaten bağlı ise, tekrar kontrol etme
    if (apiStatus === 'connected') return true;
    
    // API durumunu güncelle
    setApiStatus('connecting');
    
    try {
      // API durumu test edildi olarak say ve devam et
      setApiStatus('connected');
      return true;
    } catch (error) {
      console.error('API bağlantı kontrolü başarısız:', error);
      setApiStatus('error');
      return false;
    }
  };
  
  // Bileşen render kısmı
  // chatId yok veya "new" değilse, ve hiçbir conversation yüklenmemişse
  if (!currentChatId && !window.location.pathname.includes('/chat/')) {
    return (
      <ChatContainer>
        <ChatHeader>
          <h1>CesAI</h1>
        </ChatHeader>
        <EmptyStateContainer>
          <EmptyStateTitle>Henüz sohbet seçilmedi</EmptyStateTitle>
          <EmptyStateText>
            Sol menüden bir sohbet seçin veya yeni bir sohbet başlatın.
          </EmptyStateText>
        </EmptyStateContainer>
      </ChatContainer>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <ChatContainer>
        <ChatHeader>
          <h1>CesAI</h1>
        </ChatHeader>
        <ErrorContainer>
          <FaExclamationTriangle size={40} />
          <h2>Bir hata oluştu</h2>
          <p>{error}</p>
          {apiStatus === 'error' && (
            <p>API sunucusuna bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.</p>
          )}
          {retryCount < 3 && (
            <RetryButton onClick={retryApiConnection}>
              <FaSync /> Yeniden Dene
            </RetryButton>
          )}
        </ErrorContainer>
      </ChatContainer>
    );
  }
  
  // Render fonksiyonu
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Sayfa yükleniyor
  if (!isNewChat && !conversation && loading) {
    return (
      <ChatContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <FaSpinner className="spinner" size={24} />
        </div>
      </ChatContainer>
    );
  }
  
  return (
    <ChatContainer>
      <CopyNotification className={showCopyNotification ? 'show' : ''}>
        <FaRegCopy /> Mesaj panoya kopyalandı
      </CopyNotification>
      
      <ChatHeader>
        <h1>
          {isNewChat ? "Yeni Sohbet" : conversation?.title || "Yükleniyor..."}
        </h1>
        <ConnectionStatus 
          status={apiStatus} 
          onRetryClick={retryApiConnection} 
        />
      </ChatHeader>
      
      <MessagesContainer 
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {isNewChat && messages.length === 0 ? (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <FaBook size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h2>Yeni bir sohbet başlatın</h2>
            <p>Merak ettiğiniz bir konuyu sorun veya bir şey yapmak istediğinizi belirtin</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message key={message.id || index} message={message} index={index} />
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer onSubmit={handleSubmit}>
        <AttachButton type="button">
          <FaPaperclip />
        </AttachButton>
        <Input
          type="text"
          placeholder={isNewChat ? "Yeni sohbet başlatmak için bir şeyler yazın..." : "Mesajınızı yazın..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <SendButton type="submit" disabled={loading || !input.trim()}>
          {loading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat; 