import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FaRobot, FaUser, FaCopy } from 'react-icons/fa';

const MessageContainer = styled(motion.div)`
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  background: ${props => props.isUser ? 'transparent' : 'rgba(64,65,79, 0.9)'};
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const IconContainer = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser ? '#4F9BFF' : '#10A37F'};
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
  color: #E8DFD8;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
  position: relative;
  max-width: 800px;
`;

const CopyButton = styled(motion.button)`
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 0.5rem;
  display: none;
  
  ${MessageContainer}:hover & {
    display: block;
  }
  
  &:hover {
    color: #E8DFD8;
  }
`;

const messageVariants = {
  hidden: { 
    opacity: 0,
    y: 10
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

const ChatMessage = ({ message, isUser }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  return (
    <MessageContainer
      isUser={isUser}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
    >
      <IconContainer isUser={isUser}>
        {isUser ? <FaUser size={16} /> : <FaRobot size={16} />}
      </IconContainer>
      <MessageContent>
        {message}
        {!isUser && (
          <CopyButton
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaCopy size={16} />
          </CopyButton>
        )}
      </MessageContent>
    </MessageContainer>
  );
};

export default ChatMessage; 