import React, { useState } from 'react';
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

const ChatMessage = ({ text, isUser, isError }) => {
  const [copied, setCopied] = useState(false);
  
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
  
  // Format the message text
  const formattedText = formatText(text);
  
  // Copy message text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <MessageContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}
    >
      {!isUser && (
        <Avatar isUser={isUser} isError={isError}>
          {isError ? <FaExclamationTriangle /> : <FaRobot />}
        </Avatar>
      )}
      
      <MessageContent isUser={isUser} isError={isError}>
        <MessageText dangerouslySetInnerHTML={{ __html: formattedText }} />
        
        {!isUser && (
          <CopyButton onClick={copyToClipboard}>
            {copied ? <FaCheck /> : <FaCopy />}
          </CopyButton>
        )}
      </MessageContent>
      
      {isUser && (
        <Avatar isUser={isUser}>
          <FaUser />
        </Avatar>
      )}
    </MessageContainer>
  );
};

export default ChatMessage; 