import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
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
  background-color: #f0f7ff;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
`;

const AnalysisTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: #3498db;
`;

const AnalysisText = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;
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

const ChatMessage = ({ text, isUser, isError, isImage, imageData, isImageAnalysis }) => {
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
          <AnalysisText>{text}</AnalysisText>
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
          <SenderName>{isUser ? 'Sen' : 'CesAI'}</SenderName>
          {!isUser && !isImage && (
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