import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.bgPrimary};
    color: ${({ theme }) => theme.textPrimary};
    transition: all 0.3s ease;
  }
  
  * {
    box-sizing: border-box;
  }
  
  a {
    color: ${({ theme }) => theme.accentColor};
    text-decoration: none;
  }
  
  button {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  ::selection {
    background: ${({ theme }) => theme.accentColor};
    color: #ffffff;
  }
  
  /* Tema değişikliğinde animasyon için */
  html {
    transition: background-color 0.3s ease;
  }
`;

export const darkTheme = {
  bgPrimary: '#121212',
  bgSecondary: '#1e1e1e',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  accentColor: '#646cff',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  cardBg: 'rgba(30, 30, 30, 0.8)',
  gradient: 'linear-gradient(90deg, #646cff, #8b3dff)',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
};

export const lightTheme = {
  bgPrimary: '#f5f5f5',
  bgSecondary: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  accentColor: '#646cff',
  borderColor: 'rgba(0, 0, 0, 0.1)',
  inputBg: 'rgba(0, 0, 0, 0.05)',
  cardBg: 'rgba(255, 255, 255, 0.9)',
  gradient: 'linear-gradient(90deg, #646cff, #8b3dff)',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
}; 