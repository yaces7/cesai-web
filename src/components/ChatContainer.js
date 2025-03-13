import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import { FaPaperPlane, FaImage, FaPlus, FaMicrophone, FaBars, FaArrowDown, FaTimes } from 'react-icons/fa';

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
  display: none;
  
  @media (max-width: 768px) {
    display: block;
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
  height: calc(100vh - 240px);
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  
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
  display: flex;
  align-items: center;
`;

const Input = styled.textarea`
  width: 100%;
  padding: 1rem;
  padding-right: 3rem;
  padding-left: ${props => props.hasAttachment ? '3rem' : '1rem'};
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

const AttachButton = styled(motion.button)`
  position: absolute;
  left: 1rem;
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

const ScrollToBottomButton = styled(motion.button)`
  position: fixed;
  bottom: 180px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(79, 155, 255, 0.8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
  
  &:hover {
    background: rgba(79, 155, 255, 1);
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  margin-top: 10px;
  margin-bottom: 10px;
  max-width: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.2);
`;

const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  max-height: 100px;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 10px;
  
  &:hover {
    background: rgba(255,0,0,0.8);
  }
`;

const AttachmentOptions = styled(motion.div)`
  position: absolute;
  bottom: 60px;
  left: 1rem;
  background: rgba(30, 30, 40, 0.95);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 100;
`;

const AttachmentOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #E8DFD8;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }
`;

// Daktilo efekti yerine fade-in efekti kullanacağız
const TypewriterText = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 1rem;
  user-select: text;
`;

const ChatContainer = ({ conversationId, toggleSidebar, updateRemainingRequests }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(100);
  const [isUploading, setIsUploading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fare tekerleği ile kaydırma için event listener
  useEffect(() => {
    const handleWheel = (e) => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop += e.deltaY;
      }
    };

    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('wheel', handleWheel, { passive: true });
    }

    return () => {
      if (messagesContainer) {
        messagesContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  // Scroll pozisyonunu kontrol et
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // 200px'den fazla yukarı kaydırıldığında butonu göster
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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  // Daktilo efekti yerine fade-in efekti kullanacağız
  const fadeInEffect = async (response, messageId) => {
    // Mesajı direkt olarak ekle, animasyon ChatMessage bileşeninde yapılacak
    setMessages(prev => 
      prev.map((msg, idx) => 
        idx === messageId ? { ...msg, text: response, isTyping: true } : msg
      )
    );
    
    // Kısa bir gecikme sonra isTyping'i false yap
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMessages(prev => 
      prev.map((msg, idx) => 
        idx === messageId ? { ...msg, isTyping: false } : msg
      )
    );
  };

  // Cümle cümle yanıt gösterme fonksiyonu
  const streamResponse = async (response) => {
    // Tüm yanıtı tek seferde göster
    setMessages(prev => [...prev, { 
      text: response, 
      isUser: false,
      isTyping: true
    }]);
    
    // Kısa bir gecikme sonra isTyping'i false yap
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMessages(prev => 
      prev.map((msg, idx) => 
        idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    // Check if user has reached the request limit
    if (remainingRequests <= 0) {
      setMessages(prev => [...prev, { 
        text: "Günlük istek limitinize ulaştınız. Yarın tekrar deneyin.", 
        isUser: false,
        isError: true
      }]);
      return;
    }

    // Eğer seçili bir görüntü varsa
    if (selectedImage) {
      // Kullanıcı mesajını ekle
      setMessages(prev => [...prev, { 
        text: input.trim() ? input : '[Görüntü yüklendi]', 
        isUser: true,
        isImage: true,
        imageData: selectedImage
      }]);
      
      setInput('');
      setSelectedImage(null);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = '52px';
      }

      setIsUploading(true);
      
      try {
        // CORS hatalarını önlemek için mode: 'cors' ve credentials: 'include' ekleyelim
        const response = await fetch(`${process.env.REACT_APP_API_URL}/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            image: selectedImage,
            message: input.trim(),
            conversation_id: conversationId
          }),
          mode: 'cors',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Yükleme durumunu kaldır
        setIsUploading(false);
        
        // Bot yanıtını ekle
        setMessages(prev => [...prev, { 
          text: data.response, 
          isUser: false,
          isImageAnalysis: true
        }]);
        
        // Kalan istek sayısını güncelle
        const newRemainingRequests = data.remaining_requests;
        setRemainingRequests(newRemainingRequests);
        updateRemainingRequests(newRemainingRequests);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        setIsUploading(false);
        setMessages(prev => [...prev, { 
          text: "Üzgünüm, görüntü yüklenirken bir hata oluştu. Lütfen tekrar deneyin. Hata: " + error.message, 
          isUser: false,
          isError: true
        }]);
      }
      
      return;
    }

    // Normal metin mesajı gönderme
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px';
    }

    setIsTyping(true);

    try {
      // CORS hatalarını önlemek için mode: 'cors' ve credentials: 'include' ekleyelim
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          message: input,
          conversation_id: conversationId
        }),
        mode: 'cors',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsTyping(false);
      
      // Check if it's a math response
      if (data.is_math) {
        // For math responses, don't stream, show the full response at once
        setMessages(prev => [...prev, { 
          text: data.response, 
          isUser: false,
          isMath: true
        }]);
      } else {
        // Daktilo efekti yerine fade-in efekti kullan
        setMessages(prev => [...prev, { 
          text: data.response, 
          isUser: false,
          isTyping: true
        }]);
        
        // Kısa bir gecikme sonra isTyping'i false yap
        setTimeout(() => {
          setMessages(prev => 
            prev.map((msg, idx) => 
              idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
            )
          );
        }, 1000);
      }
      
      // Update remaining requests
      const newRemainingRequests = data.remaining_requests;
      setRemainingRequests(newRemainingRequests);
      updateRemainingRequests(newRemainingRequests);
      
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin. Hata: " + error.message, 
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Dosya türünü kontrol et
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görüntü dosyası seçin (JPEG, PNG, vb.)');
      return;
    }
    
    // Dosya boyutunu kontrol et (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu çok büyük. Lütfen 5MB\'dan küçük bir dosya seçin.');
      return;
    }
    
    // Dosyayı base64'e dönüştür
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const base64Image = event.target.result;
        
        // Base64 formatını kontrol et
        if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image/')) {
          throw new Error('Geçersiz görüntü formatı');
        }
        
        // Görüntü boyutunu kontrol et (base64 olarak)
        if (base64Image.length > 7 * 1024 * 1024) { // ~7MB (base64 daha büyük olur)
          throw new Error('Görüntü boyutu çok büyük');
        }
        
        setSelectedImage(base64Image);
        setShowAttachOptions(false);
      } catch (error) {
        console.error('Görüntü yükleme hatası:', error);
        alert(`Görüntü yüklenirken bir hata oluştu: ${error.message}`);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Dosya okuma hatası:', error);
      alert('Dosya okuma hatası. Lütfen tekrar deneyin.');
    };
    
    // Hata yakalama ile dosyayı oku
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Dosya okuma hatası:', error);
      alert(`Dosya okuma hatası: ${error.message}`);
    }
    
    // Dosya seçiciyi sıfırla (aynı dosyayı tekrar seçebilmek için)
    e.target.value = null;
  };

  const triggerImageUpload = () => {
    fileInputRef.current.click();
  };
  
  const removeSelectedImage = () => {
    setSelectedImage(null);
  };
  
  const toggleAttachOptions = () => {
    setShowAttachOptions(prev => !prev);
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <MobileMenuButton onClick={toggleSidebar}>
            <FaBars />
          </MobileMenuButton>
          <AnimatedTitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            CesAI
          </AnimatedTitle>
        </HeaderLeft>
        <HeaderRight>
          {/* Dil değiştirme düğmesi kaldırıldı */}
        </HeaderRight>
      </Header>

      <MessagesContainer ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <ChatMessage 
            key={index}
            text={message.text}
            isUser={message.isUser}
            isError={message.isError}
            isImage={message.isImage}
            imageData={message.imageData}
            isImageAnalysis={message.isImageAnalysis}
            isTyping={message.isTyping}
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
        
        {isUploading && (
          <TypingIndicator>
            Görüntü yükleniyor ve analiz ediliyor...
          </TypingIndicator>
        )}
        
        {/* Görünmez referans noktası */}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Aşağı kaydırma düğmesi */}
      {showScrollButton && (
        <ScrollToBottomButton
          onClick={scrollToBottom}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowDown />
        </ScrollToBottomButton>
      )}

      <InputSection>
        {selectedImage && (
          <ImagePreviewContainer>
            <ImagePreview src={selectedImage} alt="Yüklenecek görüntü" />
            <RemoveImageButton onClick={removeSelectedImage}>
              <FaTimes />
            </RemoveImageButton>
          </ImagePreviewContainer>
        )}
        
        <InputContainer onSubmit={handleSubmit}>
          <AttachButton 
            type="button"
            onClick={toggleAttachOptions}
            whileTap={{ scale: 0.9 }}
          >
            <FaPlus />
          </AttachButton>
          
          {showAttachOptions && (
            <AttachmentOptions
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <AttachmentOption onClick={triggerImageUpload}>
                <FaImage /> Fotoğraf Yükle
              </AttachmentOption>
            </AttachmentOptions>
          )}
          
          <Input
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Bir mesaj yazın..."
            rows={1}
            hasAttachment={true}
          />
          <SendButton
            type="submit"
            whileTap={{ scale: 0.9 }}
            disabled={!input.trim() && !selectedImage}
          >
            <FaPaperPlane />
          </SendButton>
        </InputContainer>
        
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleImageUpload}
        />
        
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