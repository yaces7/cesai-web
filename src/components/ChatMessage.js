import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaRobot, FaExclamationTriangle, FaCopy, FaCheck, FaCode, FaCalculator, FaImage, FaFileAlt, FaChartBar } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MessageContainer = styled(motion.div)`
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start;
  opacity: ${props => props.isTyping ? 0.7 : 1};
  filter: ${props => props.isError ? 'grayscale(100%)' : 'none'};
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
  
  background: ${props => props.isUser ? '#4F9BFF' : '#10a37f'};
  
  color: white;
  font-size: 1.2rem;
`;

const MessageContent = styled.div`
  background: ${props => props.isUser ? 'rgba(79, 155, 255, 0.1)' : 'rgba(16, 163, 127, 0.1)'};
  
  border: 1px solid ${props => props.isUser ? 'rgba(79, 155, 255, 0.2)' : 'rgba(16, 163, 127, 0.2)'};
  
  border-radius: 0.8rem;
  padding: 1rem;
  color: #E8DFD8;
  max-width: 80%;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    max-width: 90%;
  }
  
  pre {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 0.5rem;
    background: rgba(0, 0, 0, 0.3) !important;
    overflow-x: auto;
  }
  
  code {
    font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
  }
  
  p {
    margin: 0.5rem 0;
    &:first-of-type {
      margin-top: 0;
    }
    &:last-of-type {
      margin-bottom: 0;
    }
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
  color: ${props => props.isUser ? '#4F9BFF' : '#10a37f'};
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

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
`;

const formatAnalysisText = (text) => {
  if (!text) return '';
  
  // Sayısal değerleri vurgula
  text = text.replace(/(\d+(\.\d+)?)/g, '**$1**');
  
  // Başlıkları emoji ile güzelleştir
  text = text.replace(/Görüntü özellikleri/g, '🖼️ **Görüntü özellikleri**');
  text = text.replace(/Görüntüden çıkarılan metin/g, '📄 **Görüntüden çıkarılan metin**');
  text = text.replace(/Metin istatistikleri/g, '📊 **Metin istatistikleri**');
  text = text.replace(/Grafik analizi/g, '📈 **Grafik analizi**');
  text = text.replace(/Matematiksel formüller/g, '🔢 **Matematiksel formüller**');
  
  // Özellik: Değer formatını düzenle
  text = text.replace(/(\w+):\s*([^\n]+)/g, '**$1:** $2');
  
  // Çıkarılan metni özel bir kutu içinde göster
  if (text.includes('Görüntüden çıkarılan metin')) {
    text = text.replace(
      /(Görüntüden çıkarılan metin[:\s]*)([\s\S]*?)(\n\n|$)/,
      '$1\n\n```text\n$2\n```$3'
    );
  }
  
  return text;
};

const ChatMessage = ({ message, isTyping }) => {
  const {
    text,
    isUser,
    isError,
    isCode,
    language,
    isMath,
    isImageAnalysis,
    imageData
  } = message;

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

  const renderContent = () => {
    if (isImageAnalysis) {
      return (
        <ReactMarkdown
          children={formatAnalysisText(text)}
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        />
      );
    }

    if (isCode) {
      return (
        <SyntaxHighlighter
          language={language || 'javascript'}
          style={atomDark}
          showLineNumbers={true}
        >
          {text}
        </SyntaxHighlighter>
      );
    }

    if (isMath) {
      return (
        <ReactMarkdown
          children={text}
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        />
      );
    }

    return (
      <ReactMarkdown
        children={text}
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      />
    );
  };

  return (
    <MessageContainer
      ref={messageRef}
      isUser={isUser}
      isError={isError}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      isTyping={isTyping}
    >
      <Avatar isUser={isUser}>
        {isUser ? <FaUser /> : <FaRobot />}
      </Avatar>
      <MessageContent isUser={isUser}>
        <MessageHeader>
          <SenderName isUser={isUser}>{isUser ? 'Sen' : 'CesAI'}</SenderName>
          {!isUser && !isImageAnalysis && !isTyping && (
            <CopyButton onClick={copyToClipboard}>
              {copied ? <FaCheck /> : <FaCopy />}
            </CopyButton>
          )}
        </MessageHeader>
        {imageData && (
          <ImagePreview src={imageData} alt="Uploaded" />
        )}
        {renderContent()}
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage; 