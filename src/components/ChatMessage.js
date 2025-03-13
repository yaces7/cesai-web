import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaRobot, FaExclamationTriangle, FaCopy, FaCheck } from 'react-icons/fa';

const MessageContainer = styled(motion.div)`
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #4F9BFF, #9D4EDD)' 
    : props.isError 
      ? 'linear-gradient(135deg, #FF5252, #FF9800)'
      : 'linear-gradient(135deg, #2ED573, #4F9BFF)'
  };
  
  color: white;
  font-size: 1.2rem;
`;

const MessageContent = styled.div`
  background: ${props => props.isUser 
    ? 'rgba(79, 155, 255, 0.1)' 
    : props.isError 
      ? 'rgba(255, 82, 82, 0.1)'
      : 'rgba(46, 213, 115, 0.1)'
  };
  
  border: 1px solid ${props => props.isUser 
    ? 'rgba(79, 155, 255, 0.2)' 
    : props.isError 
      ? 'rgba(255, 82, 82, 0.2)'
      : 'rgba(46, 213, 115, 0.2)'
  };
  
  border-radius: 0.8rem;
  padding: 1rem;
  color: #E8DFD8;
  max-width: 80%;
  position: relative;
  
  @media (max-width: 768px) {
    max-width: 90%;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SenderName = styled.div`
  font-weight: bold;
  font-size: 0.9rem;
  color: ${props => props.isUser ? '#4F9BFF' : '#2ED573'};
`;

const MessageText = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 1rem;
  user-select: text;
  
  a {
    color: #4F9BFF;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    font-family: 'Fira Code', monospace;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
    font-size: 0.9rem;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
    
    code {
      background: transparent;
      padding: 0;
    }
  }
`;

const FadeInText = styled(motion.div)`
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 1rem;
  user-select: text;
  
  a {
    color: #4F9BFF;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    font-family: 'Fira Code', monospace;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.2rem 0.4rem;
    border-radius: 0.2rem;
    font-size: 0.9rem;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1rem 0;
    
    code {
      background: transparent;
      padding: 0;
    }
  }
`;

const CopyButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.3);
    color: rgba(255, 255, 255, 0.9);
  }
  
  ${MessageContent}:hover & {
    opacity: 1;
  }
`;

const MathContent = styled.div`
  font-family: 'Fira Code', monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  overflow-x: auto;
  white-space: pre;
`;

const ImageContainer = styled.div`
  margin-top: 8px;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
`;

const UploadedImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
`;

const AnalysisContent = styled.div`
  margin-top: 8px;
  background-color: rgba(30, 41, 59, 0.9);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #4F9BFF;
  color: #E8DFD8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle at top right, rgba(79, 155, 255, 0.2), transparent 70%);
    z-index: 0;
  }
`;

const AnalysisTitle = styled.div`
  font-weight: bold;
  margin-bottom: 12px;
  color: #4F9BFF;
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '📊';
    margin-right: 8px;
    font-size: 1.2rem;
  }
`;

const AnalysisText = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  
  /* Sayısal verileri vurgula */
  .number {
    color: #F39C12;
    font-weight: 500;
  }
  
  /* Grafik analizi bölümlerini vurgula */
  .section-title {
    color: #2ECC71;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
  }
  
  /* Önemli bilgileri vurgula */
  .highlight {
    background-color: rgba(46, 204, 113, 0.2);
    padding: 2px 4px;
    border-radius: 3px;
  }
  
  /* Çıkarılan metin kutusu */
  .extracted-text {
    background-color: rgba(52, 152, 219, 0.1);
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
    border-left: 3px solid #3498db;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
  }
  
  /* Satır sonlarını düzgün göster */
  br {
    display: block;
    content: "";
    margin-top: 8px;
  }
`;

const MathProblem = styled.div`
  margin-top: 8px;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #9b59b6;
`;

const MathProblemTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: #9b59b6;
`;

const MathProblemText = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;
`;

const MathSolution = styled.div`
  margin-top: 12px;
  background-color: #f0fff0;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #2ecc71;
`;

const MathSolutionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: #2ecc71;
`;

const MathSolutionText = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;
`;

const ChatMessage = ({ text, isUser, isError, isImage, imageData, isImageAnalysis, isTyping }) => {
  const [copied, setCopied] = useState(false);
  const [formattedText, setFormattedText] = useState('');
  const messageRef = useRef(null);
  
  useEffect(() => {
    // Format the message text
    setFormattedText(formatText(text));
  }, [text]);
  
  // Function to convert URLs to clickable links
  const formatText = (text) => {
    // URL regex pattern
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split by newlines to preserve them
    const parts = text.split('\n');
    
    // Process each part
    const formattedParts = parts.map((part, i) => {
      // Replace URLs with links
      const withLinks = part.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });
      
      // Return the processed part
      return withLinks;
    });
    
    // Join back with newlines
    return formattedParts.join('\n');
  };
  
  // Check if the message contains math content
  const containsMathContent = (text) => {
    const mathKeywords = [
      'İşlem:', 'Sonuç:', 'Denklem:', 'Çözüm:', 'türevi:', 'integrali:',
      'limit:', 'faktöriyel', '√', 'Sadeleştirilmiş', 'Genişletilmiş', 'Çarpanlarına'
    ];
    
    return mathKeywords.some(keyword => text.includes(keyword));
  };
  
  // Copy message text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Render math content with special formatting
  const renderMathContent = () => {
    return (
      <MathContent>
        {text.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </MathContent>
    );
  };

  // Görüntü analizi içeriğini formatlayan yardımcı fonksiyon
  const formatAnalysisText = (text) => {
    // Sayısal değerleri vurgula
    let formattedText = text.replace(/(\d+(\.\d+)?%?)/g, '<span class="number">$1</span>');
    
    // Bölüm başlıklarını vurgula ve emoji ekle
    const sectionEmojis = {
      'Görüntü analizi': '🔍',
      'Grafik analizi': '📈',
      'Sonuç': '✅',
      'Metin analizi': '📝',
      'Görüntüden çıkarılan metin': '📄',
      'Tespit edilen matematiksel ifadeler': '🔢',
      'Bu görüntü bir': '🖼️',
      'Sorunuz': '❓',
      'Görüntü özellikleri': '🔎'
    };
    
    Object.entries(sectionEmojis).forEach(([section, emoji]) => {
      const regex = new RegExp(`(${section}):`, 'g');
      formattedText = formattedText.replace(regex, `<div class="section-title">${emoji} $1:</div>`);
    });
    
    // Önemli bilgileri vurgula
    formattedText = formattedText.replace(/(yükselen trend|düşen trend|dalgalı trend|minimum|maksimum|ortalama|medyan|volatilite|fiyat dalgalanmaları|performans değişimi)/gi, 
      '<span class="highlight">$1</span>');
    
    // Görüntü türlerini vurgula
    formattedText = formattedText.replace(/(fotoğraf|belge|çizim veya grafik|matematiksel formül)/g, 
      '<span style="color: #3498db; font-weight: bold;">$1</span>');
    
    // Madde işaretlerini vurgula
    formattedText = formattedText.replace(/^(- .+)$/gm, 
      '<span style="color: #e74c3c;">$1</span>');
    
    // Paragrafları ayır
    formattedText = formattedText.replace(/\n\n/g, '<br><br>');
    
    // Çıkarılan metni özel bir kutu içinde göster
    if (formattedText.includes('Görüntüden çıkarılan metin')) {
      formattedText = formattedText.replace(
        /Görüntüden çıkarılan metin:(.+?)(\n\n|$)/s, 
        '<div class="section-title">📄 Görüntüden çıkarılan metin:</div><div class="extracted-text">$1</div>'
      );
    }
    
    return formattedText;
  };

  const renderContent = () => {
    if (isImage && imageData) {
      return (
        <ImageContainer>
          <UploadedImage src={imageData} alt="Yüklenen görüntü" />
        </ImageContainer>
      );
    }

    if (isImageAnalysis) {
      return (
        <AnalysisContent>
          <AnalysisTitle>Görüntü Analizi</AnalysisTitle>
          <AnalysisText dangerouslySetInnerHTML={{ __html: formatAnalysisText(text) }} />
        </AnalysisContent>
      );
    }

    // Matematik problemleri için özel işleme
    if (text.includes('MATH_PROBLEM:') && text.includes('SOLUTION:')) {
      const parts = text.split('SOLUTION:');
      const problem = parts[0].replace('MATH_PROBLEM:', '').trim();
      const solution = parts[1].trim();
      
      return (
        <>
          <MathProblem>
            <MathProblemTitle>Matematik Problemi:</MathProblemTitle>
            <MathProblemText>{problem}</MathProblemText>
          </MathProblem>
          <MathSolution>
            <MathSolutionTitle>Çözüm:</MathSolutionTitle>
            <MathSolutionText>{solution}</MathSolutionText>
          </MathSolution>
        </>
      );
    }
    
    // Daktilo efekti yerine fade-in animasyonu kullanıyoruz
    if (isTyping && !isUser) {
      return (
        <FadeInText
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {text}
        </FadeInText>
      );
    }
    
    return <MessageText>{text}</MessageText>;
  };

  return (
    <MessageContainer
      ref={messageRef}
      isUser={isUser}
      isError={isError}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Avatar isUser={isUser}>
        {isUser ? <FaUser /> : <FaRobot />}
      </Avatar>
      <MessageContent>
        <MessageHeader>
          <SenderName isUser={isUser}>{isUser ? 'Sen' : 'CesAI'}</SenderName>
          {!isUser && !isImage && !isTyping && (
            <CopyButton onClick={copyToClipboard}>
              {copied ? <FaCheck /> : <FaCopy />}
            </CopyButton>
          )}
        </MessageHeader>
        {renderContent()}
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage; 