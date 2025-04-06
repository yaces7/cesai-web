import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaArrowDown, FaPaperclip } from 'react-icons/fa';
import { useFirebase } from '../contexts/FirebaseContext';
import { useParams, Navigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

// Styled Components
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
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

// Chat Component
const Chat = () => {
  const { chatId } = useParams();
  const { user, updateApiUsage, db } = useFirebase();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Firestore'dan sohbeti çek
  useEffect(() => {
    if (!user || !chatId) return;
    
    const fetchConversation = async () => {
      try {
        const conversationRef = doc(db, 'conversations', chatId);
        
        const unsubscribe = onSnapshot(conversationRef, (docSnap) => {
          if (!docSnap.exists()) {
            setNotFound(true);
            return;
          }
          
          const conversationData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          // Kullanıcıya ait sohbet mi kontrol et
          if (conversationData.userId !== user.uid) {
            setNotFound(true);
            return;
          }
          
          setConversation(conversationData);
          setMessages(conversationData.messages || []);
          setNotFound(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Sohbet yüklenirken hata oluştu:', error);
        setNotFound(true);
      }
    };
    
    fetchConversation();
  }, [db, user, chatId]);
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading || !user || !chatId) return;
    
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
      
      // Yapay zeka cevabı oluştur (gerçek uygulamada API'ye istek gönderilecek)
      setTimeout(async () => {
        const aiResponse = {
          text: `"${input}" mesajınızı aldım. Bu bir örnek cevaptır. Gerçek uygulamada API'ye bağlanarak gerçek cevaplar alınacaktır.`,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        const finalMessages = [...updatedMessages, aiResponse];
        
        await updateDoc(conversationRef, {
          messages: finalMessages,
          updatedAt: new Date().toISOString()
        });
        
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata oluştu:', error);
      setLoading(false);
      
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
  
  if (notFound) {
    return <Navigate to="/" replace />;
  }
  
  if (!conversation && !notFound) {
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
            <MessageWrapper key={index} isUser={message.isUser}>
              <div>
                <MessageBubble isUser={message.isUser}>
                  {message.text}
                </MessageBubble>
                <MessageTime isUser={message.isUser}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              </div>
            </MessageWrapper>
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
          disabled={loading}
        />
        
        <SendButton
          type="submit"
          disabled={!input.trim() || loading}
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