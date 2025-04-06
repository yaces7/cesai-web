import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaEye, FaEyeSlash, FaRobot, FaBrain, FaSpinner, FaUserAstronaut, FaGoogle } from 'react-icons/fa';
import { useFirebase } from '../contexts/FirebaseContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
  overflow: hidden;
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  z-index: 1;
`;

const Title = styled(motion.h1)`
  color: #fff;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #00ff88, #00b8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled(motion.input)`
  width: 100%;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00ff88;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #00ff88;
  }
`;

const Button = styled(motion.button)`
  padding: 15px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(45deg, #00ff88 0%, #00b8ff 100%);
  color: #1a1a2e;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
  }
`;

const ErrorMessage = styled(motion.p)`
  color: #ff4d4d;
  text-align: center;
  margin-top: 10px;
`;

const LoginLink = styled.p`
  color: #fff;
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;

  a {
    color: #00ff88;
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s ease;

    &:hover {
      color: #00b8ff;
    }
  }
`;

const FloatingIcon = styled(motion.div)`
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  font-size: ${props => props.size || '3rem'};
  z-index: 0;
`;

const GoogleButton = styled(Button)`
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: #ffffff;
  margin: 20px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  span {
    padding: 0 10px;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, signInWithGoogle } = useFirebase();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name.trim()) {
      setError('Lütfen ad ve soyad giriniz');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      console.log('Kayıt işlemi başlatılıyor...');
      const user = await register(email, password, name);
      
      console.log('Kayıt başarılı, doğrulama e-postası gönderildi');
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      console.error('Kayıt hatası:', error);
      let errorMessage = 'Kayıt başarısız.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Bu e-posta adresi zaten kullanımda.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Şifre çok zayıf. En az 6 karakter kullanın.';
          break;
        default:
          errorMessage = `Kayıt hatası: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Google ile giriş başlatılıyor...');
      const user = await signInWithGoogle();
      
      if (!user) {
        throw new Error('Google ile giriş başarısız oldu. Kullanıcı bilgisi alınamadı.');
      }
      
      console.log('Google ile giriş/kayıt başarılı:', user.displayName);
      
      navigate('/chat');
    } catch (error) {
      console.error('Google giriş hatası:', error);
      setError(error.message || 'Google ile giriş sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const floatingIcons = [
    { Icon: FaUserAstronaut, size: '4rem', position: { top: '15%', left: '10%' } },
    { Icon: FaBrain, size: '5rem', position: { bottom: '20%', right: '15%' } },
    { Icon: FaRobot, size: '3rem', position: { top: '40%', right: '25%' } },
  ];

  if (success) {
    return (
      <Container>
        <GlassCard>
          <Title>Kayıt Başarılı!</Title>
          <SuccessMessage>
            <p>Email adresinize doğrulama bağlantısı gönderildi. Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın.</p>
            <p>5 saniye içinde giriş sayfasına yönlendirileceksiniz...</p>
          </SuccessMessage>
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container>
      {floatingIcons.map((icon, index) => (
        <FloatingIcon
          key={index}
          style={icon.position}
          size={icon.size}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5 + index,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <icon.Icon />
        </FloatingIcon>
      ))}

      <GlassCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 100
        }}
      >
        <Title
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          CesAI'ya Kayıt Ol
        </Title>

        <GoogleButton 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaGoogle /> {loading ? 'İşlem yapılıyor...' : 'Google ile Kayıt Ol'}
        </GoogleButton>

        <Divider>
          <span>veya</span>
        </Divider>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="text"
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Gizle" : "Göster"}
            </PasswordToggle>
          </InputGroup>

          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Şifre Tekrar"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </InputGroup>

          {error && (
            <ErrorMessage
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </ErrorMessage>
          )}

          <Button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Kayıt Yapılıyor...
              </>
            ) : (
              'Kayıt Ol'
            )}
          </Button>
        </Form>

        <LoginLink>
          Zaten bir hesabınız var mı?{' '}
          <Link to="/login">
            Giriş Yapın
          </Link>
        </LoginLink>
      </GlassCard>
    </Container>
  );
};

const SuccessContainer = styled(Container)`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
`;

const SuccessMessage = styled(GlassCard)`
  text-align: center;
  color: #ffffff;

  h2 {
    color: #4caf50;
    margin-bottom: 20px;
  }

  p {
    margin: 10px 0;
    line-height: 1.5;
  }
`;

export default RegisterPage; 