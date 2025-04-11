import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaArrowDown, FaPaperclip, FaThumbsUp, FaThumbsDown, FaInfoCircle } from 'react-icons/fa';
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
  background: ${props => props.isUser ? 'var(--accent-color)' : 'var(--bg-secondary)'};
  color: ${props => props.isUser ? '#ffffff' : 'var(--text-primary)'};
  margin: ${props => props.isUser ? '0 0 0 1rem' : '0 1rem 0 0'};
  border: 1px solid ${props => props.isUser ? 'rgba(100, 108, 255, 0.4)' : 'var(--border-color)'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

// API URL'sini ortam değişkeninden al veya varsayılan değeri kullan
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Chat Component
const Chat = () => {
  const { chatId } = useParams();
  const { user, updateApiUsage, db, mesajCoz, createConversation } = useFirebase();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const navigate = useNavigate();
  
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
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
      // Firebase kimlik doğrulama token'ını al
      const token = await user.getIdToken();
      
      const response = await fetch(`${API_URL}/api/chat`, {
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
      
      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }
      
      const data = await response.json();
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
      const token = await user.getIdToken();
      
      // Geri bildirimi API'ye gönder
      const response = await fetch(`${API_URL}/api/learn`, {
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
      
      if (!response.ok) {
        console.error('Geri bildirim gönderilirken API hatası oluştu');
      }
      
    } catch (error) {
      console.error('Geri bildirim gönderilirken hata oluştu:', error);
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
    const { text, isUser, timestamp, analysis, context } = message;
    const messageId = `msg-${index}-${timestamp}`;
    const hasAnalysis = analysis && analysis.length > 0;
    const hasContext = context && Object.keys(context).length > 0;
    
    return (
      <MessageWrapper isUser={isUser}>
        <div>
          <MessageBubble isUser={isUser}>
            {text}
            {(hasAnalysis || hasContext) && (
              <MessageAnalysis>
                {hasContext && context.emotion && <span>Duygu: {context.emotion} </span>}
                {hasAnalysis && <span>{analysis}</span>}
              </MessageAnalysis>
            )}
          </MessageBubble>
          
          <MessageTime isUser={isUser}>
            {formatTime(timestamp)}
          </MessageTime>
          
          {!isUser && (
            <FeedbackButtons>
              <FeedbackButton 
                positive
                className={feedbackState[messageId] === 5 ? 'active' : ''}
                onClick={() => sendFeedback(messageId, messages[index-1]?.text, text, 5)}
              >
                <FaThumbsUp /> Yararlı
              </FeedbackButton>
              <FeedbackButton 
                className={feedbackState[messageId] === 1 ? 'active' : ''}
                onClick={() => sendFeedback(messageId, messages[index-1]?.text, text, 1)}
              >
                <FaThumbsDown /> Yararlı değil
              </FeedbackButton>
            </FeedbackButtons>
          )}
        </div>
      </MessageWrapper>
    );
  };
  
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
        <ErrorContainer>
          <h2>Bir hata oluştu</h2>
          <p>{error}</p>
        </ErrorContainer>
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