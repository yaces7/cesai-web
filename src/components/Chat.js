import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaArrowDown, FaPaperclip, FaThumbsUp, FaThumbsDown, FaInfoCircle, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { useFirebase } from '../contexts/FirebaseContext';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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
  padding: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  
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

const MessageWrapper = styled.div`
  display: flex;
  margin-bottom: 1rem;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  background: ${props => props.isUser 
    ? 'var(--accent-color)' 
    : props.error 
      ? 'rgba(255, 107, 107, 0.1)' 
      : 'var(--bg-secondary)'};
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
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
  padding: 1rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
`;

const Input = styled.input`
  flex: 1;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: var(--accent-color);
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const EmptyStateText = styled.p`
  max-width: 500px;
  line-height: 1.6;
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
  gap: 8px;
  margin-top: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const FeedbackButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  padding: 2px 4px;
  border-radius: 4px;
  
  &:hover {
    background: var(--bg-hover);
    color: ${props => props.positive ? 'var(--accent-color)' : '#ff6b6b'};
  }
  
  &.active {
    color: ${props => props.positive ? 'var(--accent-color)' : '#ff6b6b'};
  }
`;

const MessageAnalysis = styled.div`
  font-size: 0.75rem;
  margin-top: 4px;
  color: var(--text-secondary);
  font-style: italic;
  max-width: 90%;
`;

const ConnectionStatus = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  color: ${props => props.offline ? '#ff6b6b' : '#4caf50'};
  background: ${props => props.offline ? 'rgba(255, 107, 107, 0.1)' : 'rgba(76, 175, 80, 0.1)'};
  border: 1px solid ${props => props.offline ? 'rgba(255, 107, 107, 0.3)' : 'rgba(76, 175, 80, 0.3)'};
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.3s;
`;

const RetryButton = styled.button`
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

// API URL'sini ortam değişkeninden al veya varsayılan değeri kullan
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
  const navigate = useNavigate();
  
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
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
  
  // API bağlantısını kontrol eden fonksiyon
  const checkApiConnection = async () => {
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Zaman aşımı')), 5000)
      );
      
      const fetchPromise = fetch(`${API_URL}/health`);
      
      const response = await Promise.race([fetchPromise, timeout]);
      return response.ok;
    } catch (error) {
      console.error('API bağlantı kontrolü başarısız:', error);
      return false;
    }
  };
  
  // Sıkıştırılmış mesajları çözümleme
  const processMessages = (messages) => {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map(msg => {
      // Eğer mesaj sıkıştırılmışsa, çözümle
      if (msg.isCompressed) {
        return {
          ...msg,
          text: mesajCoz(msg.text)
        };
      }
      return msg;
    });
  };
  
  // Firestore'dan sohbeti çek
  useEffect(() => {
    if (!user || !chatId) return;
    
    // Eğer chatId "new" ise, yükleme göstermeyin
    if (chatId === "new") {
      setConversation(null);
      setMessages([]);
      setNotFound(false);
      return;
    }
    
    setLoadingConversation(true);
    setError(null);
    console.log(`Sohbet ID'si ${chatId} için veri çekiliyor...`);
    
    const fetchConversation = async () => {
      try {
        const conversationRef = doc(db, 'conversations', chatId);
        
        // Önce bir kere veriyi çekelim, sonra dinlemeye başlayalım
        const docSnap = await getDoc(conversationRef);
        
        if (!docSnap.exists()) {
          console.error(`Sohbet ID'si ${chatId} bulunamadı.`);
          setNotFound(true);
          setLoadingConversation(false);
          return;
        }
        
        const conversationData = {
          id: docSnap.id,
          ...docSnap.data()
        };
        
        // Kullanıcıya ait sohbet mi kontrol et
        if (conversationData.userId !== user.uid) {
          console.error(`Sohbet ID'si ${chatId} bu kullanıcıya ait değil.`);
          setNotFound(true);
          setLoadingConversation(false);
          return;
        }
        
        console.log(`Sohbet verisi başarıyla çekildi:`, conversationData);
        setConversation(conversationData);
        // Sıkıştırılmış mesajları çözümle
        setMessages(processMessages(conversationData.messages || []));
        setNotFound(false);
        setLoadingConversation(false);
        
        // Şimdi gerçek zamanlı dinlemeye başlayalım
        const unsubscribe = onSnapshot(conversationRef, (docSnap) => {
          if (!docSnap.exists()) {
            setNotFound(true);
            return;
          }
          
          const updatedConversationData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          // Kullanıcıya ait sohbet mi kontrol et
          if (updatedConversationData.userId !== user.uid) {
            setNotFound(true);
            return;
          }
          
          console.log('Sohbet gerçek zamanlı güncellendi:', updatedConversationData);
          setConversation(updatedConversationData);
          // Sıkıştırılmış mesajları çözümle
          setMessages(processMessages(updatedConversationData.messages || []));
          setNotFound(false);
        }, (err) => {
          console.error('Sohbet dinlenirken hata oluştu:', err);
          setError('Firebase erişim hatası: ' + err.message);
          setLoadingConversation(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Sohbet yüklenirken hata oluştu:', error);
        setError('Firebase erişim hatası: ' + error.message);
        setNotFound(true);
        setLoadingConversation(false);
      }
    };
    
    fetchConversation();
  }, [db, user, chatId, mesajCoz]);
  
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
  
  // API'den yapay zeka yanıtı al
  const getAIResponse = async (userMessage) => {
    try {
      // İnternet bağlantısı kontrolü
      if (!navigator.onLine) {
        throw new Error('İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.');
      }
      
      // Firebase kimlik doğrulama token'ını al
      let token = '';
      try {
        token = await getFirebaseToken(true); // Context'ten gelen fonksiyonu kullan
        console.log('Firebase token başarıyla alındı');
      } catch (tokenError) {
        console.error('Token alınırken hata oluştu:', tokenError);
        throw new Error('Kimlik doğrulama hatası: ' + tokenError.message);
      }
      
      console.log('API isteği gönderiliyor:', `${API_URL}/api/chat`);
      
      // Zaman aşımı kontrolü
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API yanıt zaman aşımı. Sunucu yanıt vermiyor.')), 30000)
      );
      
      const fetchPromise = fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: chatId,
          preferences: {
            style: 'casual',
            detailed: true
          }
        })
      });
      
      const response = await Promise.race([fetchPromise, timeout]);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API yanıt hatası:', response.status, errorData);
        throw new Error(`API hatası: ${response.status} - ${errorData.detail || 'Bilinmeyen hata'}`);
      }
      
      const data = await response.json();
      console.log('AI yanıtı alındı:', data);
      return {
        text: data.message || "Üzgünüm, bir yanıt oluşturulamadı.",
        analysis: data.analysis || "",
        context: data.context || {},
        code_blocks: data.code_blocks || [],
        security_insights: data.security_insights || ""
      };
    } catch (error) {
      console.error('AI yanıtı alınırken hata oluştu:', error);
      throw error;
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
      
      // Geri bildirimi API'ye gönder
      const feedbackResponse = await fetch(`${API_URL}/api/learn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: message,
          response: response,
          feedback_score: score,
          preferences: {
            conversation_id: chatId
          }
        })
      });
      
      if (!feedbackResponse.ok) {
        const errorData = await feedbackResponse.json().catch(() => ({}));
        console.error('Geri bildirim gönderilirken API hatası:', feedbackResponse.status, errorData);
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
            const aiResponseData = await getAIResponse(lastUserMessage);
            
            const aiMessage = {
              text: aiResponseData.text,
              isUser: false,
              timestamp: new Date().toISOString(),
              analysis: aiResponseData.analysis,
              context: aiResponseData.context,
              code_blocks: aiResponseData.code_blocks,
              security_insights: aiResponseData.security_insights
            };
            
            const conversationRef = doc(db, 'conversations', chatId);
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
    
    if (!input.trim() || loading || !user) return;
    
    // Eğer chatId "new" ise veya bulunmuyorsa, yeni bir sohbet oluştur
    if (!chatId || chatId === "new") {
      try {
        const newChatId = await createConversation('Yeni Sohbet');
        navigate(`/chat/${newChatId}`);
        return; // Yeni sayfaya yönlendirildikten sonra işlemi durdur
      } catch (error) {
        console.error('Yeni sohbet oluşturulurken hata oluştu:', error);
        setError('Yeni sohbet oluşturulurken hata oluştu: ' + error.message);
        return;
      }
    }
    
    const userMessage = {
      text: input.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };
    
    setInput('');
    setLoading(true);
    
    try {
      // Önce kullanıcı mesajını ekle
      const updatedMessages = [...messages, userMessage];
      
      const conversationRef = doc(db, 'conversations', chatId);
      await updateDoc(conversationRef, {
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      });
      
      // API kullanım sınırlarını kontrol et
      await updateApiUsage(user.uid);
      
      // Yapay zeka cevabı oluştur
      try {
        const aiResponseData = await getAIResponse(input.trim());
        
        const aiMessage = {
          text: aiResponseData.text,
          isUser: false,
          timestamp: new Date().toISOString(),
          analysis: aiResponseData.analysis,
          context: aiResponseData.context,
          code_blocks: aiResponseData.code_blocks,
          security_insights: aiResponseData.security_insights
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        
        await updateDoc(conversationRef, {
          messages: finalMessages,
          updatedAt: new Date().toISOString()
        });
        
      } catch (apiError) {
        console.error('API yanıtı alınırken hata oluştu:', apiError);
        
        // Varsayılan AI yanıtı
        const aiResponse = {
          text: `Üzgünüm, şu anda yanıt oluşturamıyorum. Teknik bir sorun oluştu.`,
          isUser: false,
          timestamp: new Date().toISOString(),
          error: true
        };
        
        const finalMessages = [...updatedMessages, aiResponse];
        
        await updateDoc(conversationRef, {
          messages: finalMessages,
          updatedAt: new Date().toISOString()
        });
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata oluştu:', error);
      setLoading(false);
      setError('Mesaj gönderme hatası: ' + error.message);
      
      // Hata mesajını ekle
      const errorMessage = {
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...messages, errorMessage];
      
      try {
        const conversationRef = doc(db, 'conversations', chatId);
        await updateDoc(conversationRef, {
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Hata mesajı eklenirken sorun oluştu:', error);
      }
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
                <FaThumbsUp /> Yararlı
              </FeedbackButton>
              <FeedbackButton 
                className={feedbackState[messageId] === 1 ? 'active' : ''}
                onClick={() => sendFeedback(messageId, messages[index-1]?.text || '', text || '', 1)}
              >
                <FaThumbsDown /> Yararlı değil
              </FeedbackButton>
            </FeedbackButtons>
          )}
        </div>
      </MessageWrapper>
    );
  };
  
  // Hata oluştuğunda görüntülenecek içerik
  const renderErrorContent = () => (
    <ErrorContainer>
      <FaExclamationTriangle size={40} />
      <h2>Bir hata oluştu</h2>
      <p>{error}</p>
      {retryCount < 3 && (
        <RetryButton onClick={retryApiConnection}>
          <FaWifi /> Yeniden Dene
        </RetryButton>
      )}
    </ErrorContainer>
  );
  
  // chatId yok veya "new" ise, boş içerik göster
  if (!chatId || chatId === "new") {
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
  
  if (notFound) {
    return <Navigate to="/" replace />;
  }
  
  if (error) {
    return (
      <ChatContainer>
        <ChatHeader>
          <h1>CesAI</h1>
        </ChatHeader>
        {renderErrorContent()}
      </ChatContainer>
    );
  }
  
  if (loadingConversation) {
    return (
      <ChatContainer>
        <ChatHeader>
          <h1>CesAI</h1>
        </ChatHeader>
        <EmptyStateContainer>
          <FaSpinner className="spinner" size={30} />
          <EmptyStateTitle>Sohbet yükleniyor...</EmptyStateTitle>
        </EmptyStateContainer>
      </ChatContainer>
    );
  }
  
  return (
    <ChatContainer>
      <ChatHeader>
        <h1>{conversation ? conversation.title : 'CesAI'}</h1>
        {showConnectionStatus && (
          <ConnectionStatus offline={isOffline} visible={showConnectionStatus}>
            {isOffline ? (
              <>
                <FaWifi /> Çevrimdışı
              </>
            ) : (
              <>
                <FaWifi /> Bağlandı
              </>
            )}
          </ConnectionStatus>
        )}
      </ChatHeader>
      
      <MessagesContainer ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <EmptyStateContainer>
            <EmptyStateTitle>Yeni Sohbet</EmptyStateTitle>
            <EmptyStateText>
              CesAI ile sohbete başlamak için aşağıdaki metin kutusuna bir soru yazın veya bir konu hakkında konuşmak istediğinizi belirtin.
            </EmptyStateText>
          </EmptyStateContainer>
        ) : (
          messages.map((message, index) => (
            <Message key={index} message={message} index={index} />
          ))
        )}
        
        {loading && (
          <MessageWrapper isUser={false}>
            <div>
              <MessageBubble isUser={false}>
                <FaSpinner className="spinner" />
              </MessageBubble>
              <MessageTime isUser={false}>
                {formatTime(new Date().toISOString())}
              </MessageTime>
            </div>
          </MessageWrapper>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer onSubmit={handleSubmit}>
        <AttachButton type="button">
          <FaPaperclip />
        </AttachButton>
        
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bir mesaj yazın..."
          disabled={loading || !conversation}
        />
        
        <SendButton
          type="submit"
          disabled={!input.trim() || loading || !conversation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPaperPlane />
        </SendButton>
      </InputContainer>
      
      {showScrollButton && (
        <ScrollToBottomButton
          onClick={scrollToBottom}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowDown />
        </ScrollToBottomButton>
      )}
    </ChatContainer>
  );
};

export default Chat; 