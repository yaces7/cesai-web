import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import { FaPaperPlane, FaImage, FaGift, FaGlobe, FaMicrophone, FaBars } from 'react-icons/fa';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 13, 61, 0.9);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const MobileMenuButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  cursor: pointer;
  margin-right: 1rem;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  @media (max-width: 768px) {
    display: block;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const AnimatedTitle = styled(motion.h1)`
  font-size: 1.2rem;
  color: #E8DFD8;
  margin: 0;
  background: linear-gradient(90deg, #E8DFD8, #4F9BFF);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 3s linear infinite;

  @keyframes shine {
    to {
      background-position: 200% center;
    }
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  margin-top: 60px;
  margin-bottom: 180px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
  }
`;

const InputSection = styled.div`
  padding: 1.5rem;
  padding-top: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(10, 26, 61, 0.95) 0%, transparent 100%);
  z-index: 1000;
`;

const InputContainer = styled.form`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  background: rgba(64,65,79, 0.9);
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
`;

const Input = styled.textarea`
  width: 100%;
  padding: 1rem;
  padding-right: 3rem;
  background: transparent;
  border: none;
  color: #E8DFD8;
  font-size: 1rem;
  resize: none;
  min-height: 52px;
  max-height: 200px;
  line-height: 1.5;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: rgba(255,255,255,0.5);
  }
`;

const SendButton = styled(motion.button)`
  position: absolute;
  right: 1rem;
  bottom: 0.8rem;
  background: transparent;
  border: none;
  color: #E8DFD8;
  cursor: pointer;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const ToolButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 0.5rem;
  background: rgba(64,65,79, 0.9);
  color: #E8DFD8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: rgba(255,255,255,0.1);
    
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
    }
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 1rem;
  opacity: 0.8;
  margin-left: 60px;
`;

const Dot = styled(motion.span)`
  width: 8px;
  height: 8px;
  background: #E8DFD8;
  border-radius: 50%;
  display: inline-block;
`;

const ToolsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const LimitWarning = styled.div`
  text-align: center;
  color: #FF5252;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 82, 82, 0.1);
  border-radius: 0.5rem;
`;

const ChatContainer = ({ conversationId, toggleSidebar, updateRemainingRequests }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(100);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load conversation history when conversationId changes
  useEffect(() => {
    if (conversationId) {
      // This would be replaced with actual API call
      // fetchConversationHistory(conversationId);
      
      // For now, use mock data
      setMessages([
        { text: "Merhaba! Size nasıl yardımcı olabilirim?", isUser: false }
      ]);
    }
  }, [conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const streamResponse = async (response) => {
    const sentences = response.match(/[^.!?]+[.!?]+/g) || [response];
    
    for (let sentence of sentences) {
      sentence = sentence.trim();
      if (sentence) {
        const delay = Math.min(sentence.length * 20, 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        setMessages(prev => [...prev, { text: sentence, isUser: false }]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Check if user has reached the request limit
    if (remainingRequests <= 0) {
      setMessages(prev => [...prev, { 
        text: "Günlük istek limitinize ulaştınız. Yarın tekrar deneyin.", 
        isUser: false,
        isError: true
      }]);
      return;
    }

    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px';
    }

    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Kimlik doğrulama gerekli');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        mode: 'cors',
        body: JSON.stringify({ 
          message: input,
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
        throw new Error('API yanıt hatası: ' + response.status);
      }

      const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsTyping(false);
      
      await streamResponse(data.response);
      
      // Update remaining requests
      const newRemainingRequests = remainingRequests - 1;
      setRemainingRequests(newRemainingRequests);
      updateRemainingRequests(newRemainingRequests);
      
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      
      let errorMessage = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
      
      if (error.message.includes('Kimlik doğrulama gerekli') || error.message.includes('Oturum süresi doldu')) {
        errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
        // Kullanıcıyı login sayfasına yönlendir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.message.includes('CORS')) {
        errorMessage = "Sunucu bağlantısında bir sorun oluştu. CORS hatası.";
      } else if (error.message.includes('API yanıt hatası')) {
        errorMessage = `Sunucu yanıt hatası: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { 
        text: errorMessage, 
        isUser: false,
        isError: true
      }]);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <MobileMenuButton onClick={toggleSidebar}>
            <FaBars />
          </MobileMenuButton>
          <AnimatedTitle>CesAI</AnimatedTitle>
        </HeaderLeft>
        <HeaderRight>
          <ToolButton data-tooltip="Dil Seçimi">
            <FaGlobe />
          </ToolButton>
        </HeaderRight>
      </Header>

      <MessagesContainer>
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            text={message.text} 
            isUser={message.isUser} 
            isError={message.isError}
          />
        ))}
        
        {isTyping && (
          <TypingIndicator>
            <Dot
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0 }}
            />
            <Dot
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            />
            <Dot
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            />
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputSection>
        <InputContainer onSubmit={handleSubmit}>
          <Input
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Bir mesaj yazın..."
            rows={1}
          />
          <SendButton
            type="submit"
            whileTap={{ scale: 0.9 }}
            disabled={!input.trim()}
          >
            <FaPaperPlane />
          </SendButton>
        </InputContainer>
        
        <ToolsContainer>
          <ToolButton data-tooltip="Resim Yükle">
            <FaImage />
          </ToolButton>
          <ToolButton data-tooltip="Ses ile Konuş">
            <FaMicrophone />
          </ToolButton>
          <ToolButton data-tooltip="Özellikler">
            <FaGift />
          </ToolButton>
        </ToolsContainer>
        
        {remainingRequests <= 10 && (
          <LimitWarning>
            Dikkat: Bugün sadece {remainingRequests} istek hakkınız kaldı.
          </LimitWarning>
        )}
      </InputSection>
    </Container>
  );
};

export default ChatContainer;