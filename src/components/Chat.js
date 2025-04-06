import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSpinner, FaArrowDown, FaImage, FaPaperclip } from 'react-icons/fa';
import { useFirebase } from '../contexts/FirebaseContext';

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

// Chat Component
const Chat = () => {
  const { user, updateApiUsage } = useFirebase();
  const [messages, setMessages] = useState([
    { text: "Merhaba! Size nasıl yardımcı olabilirim?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
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
    
    if (!input.trim() || loading) return;
    
    // Kullanıcı mesajını göster
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // API kullanım sınırlarını kontrol et
      if (user) {
        await updateApiUsage(user.uid);
      }
      
      // API isteği gönder (örnek olarak)
      setTimeout(() => {
        // Yapay cevap (gerçek uygulamada API'ye istek gönderilecek)
        const botResponse = { 
          text: `"${input}" mesajınızı aldım. Bu bir örnek cevaptır. Gerçek uygulamada API'ye bağlanarak gerçek cevaplar alınacaktır.`, 
          isUser: false 
        };
        
        setMessages(prev => [...prev, botResponse]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Mesaj gönderilirken hata oluştu:', error);
      setLoading(false);
      
      // Hata mesajı
      setMessages(prev => [...prev, { 
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 
        isUser: false 
      }]);
    }
  };
  
  return (
    <ChatContainer>
      <ChatHeader>
        <h1>CesAI</h1>
      </ChatHeader>
      
      <MessagesContainer ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <MessageWrapper key={index} isUser={message.isUser}>
            <MessageBubble isUser={message.isUser}>
              {message.text}
            </MessageBubble>
          </MessageWrapper>
        ))}
        
        {loading && (
          <MessageWrapper isUser={false}>
            <MessageBubble isUser={false}>
              <FaSpinner className="spinner" />
            </MessageBubble>
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