import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import { FaPaperPlane, FaImage, FaPlus, FaMicrophone, FaBars, FaArrowDown, FaTimes, FaExclamationTriangle, FaUpload, FaPaperclip, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  margin-top: 60px;
  margin-bottom: 180px;
  height: calc(100vh - 240px);
  max-height: calc(100vh - 240px);
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  position: relative;
  -webkit-overflow-scrolling: touch; /* iOS için daha iyi kaydırma */
  
  /* Kaydırma çubuğu stillerini güncelliyoruz */
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    border: 2px solid rgba(0, 0, 0, 0.1);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
  
  /* Firefox için kaydırma çubuğu stilleri */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1);
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

const AttachmentOptions = styled.div`
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

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  margin: 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  svg {
    margin-right: 8px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #721c24;
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
`;

const ImagePreviewActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 10px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 15px;
  border-radius: 5px;
  border: none;
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #357ae8;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      // Daha güçlü bir kaydırma yöntemi
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
      
      // Yedek yöntem (bazı tarayıcılarda scrollTo çalışmayabilir)
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fare tekerleği ile kaydırma için event listener
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    
    if (!messagesContainer) return;
    
    // Fare tekerleği olayını dinleyen fonksiyon
    const handleWheel = (e) => {
      // Varsayılan davranışı engelleme
      e.preventDefault();
      
      // Kaydırma miktarını ayarlama
      const scrollAmount = e.deltaY * 0.5; // Kaydırma hızını ayarla
      messagesContainer.scrollTop += scrollAmount;
    };
    
    // Pasif olmayan bir event listener ekle (preventDefault kullanabilmek için)
    messagesContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    // Temizleme fonksiyonu
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

  // Dokunmatik ekranlar ve trackpad'ler için kaydırma işlevi
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    
    if (!messagesContainer) return;
    
    let touchStartY = 0;
    let touchEndY = 0;
    
    // Dokunma başlangıcı
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    
    // Dokunma hareketi
    const handleTouchMove = (e) => {
      touchEndY = e.touches[0].clientY;
      const touchDiff = touchStartY - touchEndY;
      messagesContainer.scrollTop += touchDiff * 0.5;
      touchStartY = touchEndY;
    };
    
    // Event listener'ları ekle
    messagesContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    messagesContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Temizleme fonksiyonu
    return () => {
      messagesContainer.removeEventListener('touchstart', handleTouchStart);
      messagesContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Otomatik kaydırma mantığını iyileştir
  useEffect(() => {
    // Yeni mesaj eklendiğinde otomatik olarak aşağı kaydır
    if (messages.length > 0) {
      // Küçük bir gecikme ile kaydırma işlemini gerçekleştir
      // Bu, DOM'un güncellenme şansı verir
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

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
    
    if (!input.trim() && !selectedImage) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setIsTyping(true);
    setShowScrollButton(false);
    
    const newMessageId = Date.now().toString();
    const userMessage = {
      id: newMessageId,
      text: input.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    adjustTextareaHeight();
    
    try {
      if (selectedImage) {
        await handleImageUpload();
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input.trim(),
          conversation_id: conversationId,
          model_preferences: {
            temperature: 0.7,
            max_length: 2000
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          setError(`API kullanım limitine ulaştınız. ${data.retry_after} saniye sonra tekrar deneyin.`);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.remaining_requests !== undefined) {
        updateRemainingRequests(data.remaining_requests);
      }

      const botMessage = {
        id: Date.now().toString(),
        text: data.main_response || data.response,
        isUser: false,
        timestamp: new Date().toISOString(),
        isCode: data.is_code,
        language: data.language,
        isMath: data.is_math
      };

      await fadeInEffect(botMessage, newMessageId);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsTyping(false);
      setSelectedImage(null);
      scrollToBottom();
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: base64Image,
            message: input.trim(),
            conversation_context: messages.slice(-5).map(msg => ({
              text: msg.text,
              isUser: msg.isUser
            })),
            model_preferences: {
              analysis_type: 'detailed',
              extract_text: true,
              detect_objects: true
            }
          })
        });

        if (!response.ok) {
          if (response.status === 429) {
            const data = await response.json();
            setError(`API kullanım limitine ulaştınız. ${data.retry_after} saniye sonra tekrar deneyin.`);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const botMessage = {
          id: Date.now().toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date().toISOString(),
          isImageAnalysis: true
        };

        setMessages(prev => [...prev, botMessage]);
        
      };
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error('Error:', error);
      setError('Görüntü işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSelectedImage(null);
      scrollToBottom();
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      console.log("Dosya seçildi:", file.name, "Boyut:", file.size, "Tip:", file.type);
      
      // Dosya türünü kontrol et
      if (!file.type.startsWith('image/')) {
        setError("Lütfen sadece resim dosyası yükleyin.");
        e.target.value = null; // Dosya seçimini sıfırla
        return;
      }
      
      // Dosya boyutunu kontrol et (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
        e.target.value = null; // Dosya seçimini sıfırla
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const base64 = event.target.result;
          
          // Base64 formatını kontrol et
          if (!base64 || !base64.startsWith('data:image/')) {
            throw new Error("Geçersiz görüntü formatı.");
          }
          
          // Base64 boyutunu kontrol et (yaklaşık 7MB)
          if (base64.length > 7 * 1024 * 1024) {
            throw new Error("Görüntü boyutu çok büyük.");
          }
          
          setSelectedImage(base64);
          console.log("Görüntü base64'e dönüştürüldü. Uzunluk:", base64.length);
        } catch (error) {
          console.error("Base64 dönüşüm hatası:", error);
          setError(`Görüntü işlenirken hata oluştu: ${error.message}`);
          setSelectedImage(null);
        }
      };
      
      reader.onerror = (error) => {
        console.error("Dosya okuma hatası:", error);
        setError("Dosya okunamadı. Lütfen tekrar deneyin.");
        setSelectedImage(null);
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Dosya okuma hatası:", error);
        setError(`Dosya okunamadı: ${error.message}`);
      }
      
      // Dosya seçimini sıfırla (aynı dosyayı tekrar seçebilmek için)
      e.target.value = null;
    } catch (error) {
      console.error("Genel hata:", error);
      setError(`Beklenmeyen bir hata oluştu: ${error.message}`);
      setSelectedImage(null);
      e.target.value = null; // Dosya seçimini sıfırla
    }
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
            message={message}
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

      {error && (
        <ErrorMessage>
          <FaExclamationTriangle /> {error}
          <CloseButton onClick={() => setError(null)}>×</CloseButton>
        </ErrorMessage>
      )}
      
      {selectedImage && (
        <ImagePreviewContainer>
          <ImagePreview src={selectedImage} alt="Yüklenecek görüntü" />
          <ImagePreviewActions>
            <Button onClick={handleImageUpload} disabled={loading}>
              {loading ? <FaSpinner className="spinner" /> : <FaUpload />} 
              {loading ? 'Yükleniyor...' : 'Gönder'}
            </Button>
            <Button onClick={() => setSelectedImage(null)} disabled={loading}>
              <FaTimes /> İptal
            </Button>
          </ImagePreviewActions>
        </ImagePreviewContainer>
      )}
      
      <InputSection>
        <InputContainer onSubmit={handleSubmit}>
          <AttachButton 
            type="button"
            onClick={toggleAttachOptions}
            whileTap={{ scale: 0.9 }}
          >
            <FaPaperclip />
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
            disabled={!input.trim() && !selectedImage || loading}
          >
            {loading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
          </SendButton>
        </InputContainer>
        
        <input
          id="file-input"
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
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