import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaRobot } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1e0d3d 0%, #0a1a3d 100%);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  
  .logo-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #4F9BFF, #9D4EDD);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    color: white;
    font-size: 24px;
  }
  
  .logo-text {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(90deg, #E8DFD8, #4F9BFF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const FormContainer = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 24px;
  color: #E8DFD8;
  font-size: 24px;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid ${props => props.error ? '#FF5252' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: #E8DFD8;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4F9BFF;
    box-shadow: 0 0 0 2px rgba(79, 155, 255, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ErrorMessage = styled.div`
  color: #FF5252;
  font-size: 12px;
  margin-top: 5px;
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4F9BFF, #9D4EDD);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  
  a {
    color: #4F9BFF;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This would be replaced with actual API call
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      
      // For now, simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUserData = {
        id: '1',
        name: 'Test Kullanıcı',
        email: formData.email
      };
      
      const mockToken = 'mock-jwt-token';
      
      onLogin(mockUserData, mockToken);
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        form: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container>
      <Logo>
        <div className="logo-icon">
          <FaRobot />
        </div>
        <div className="logo-text">CesAI</div>
      </Logo>
      
      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Giriş Yap</Title>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">E-posta Adresi</Label>
            <InputContainer>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="E-posta adresinizi girin"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
            </InputContainer>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Şifre</Label>
            <InputContainer>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Şifrenizi girin"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
            </InputContainer>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>
          
          {errors.form && <ErrorMessage style={{ marginBottom: '15px' }}>{errors.form}</ErrorMessage>}
          
          <SubmitButton
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </SubmitButton>
        </form>
        
        <RegisterLink>
          Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
        </RegisterLink>
      </FormContainer>
    </Container>
  );
};

export default Login; 