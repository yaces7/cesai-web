import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --bg-primary: ${({ theme }) => theme.bgPrimary};
    --bg-secondary: ${({ theme }) => theme.bgSecondary};
    --text-primary: ${({ theme }) => theme.textPrimary};
    --text-secondary: ${({ theme }) => theme.textSecondary};
    --accent-color: ${({ theme }) => theme.accentColor};
    --border-color: ${({ theme }) => theme.borderColor};
    --input-bg: ${({ theme }) => theme.inputBg};
    --button-bg: ${({ theme }) => theme.buttonBg};
    --button-hover: ${({ theme }) => theme.buttonHover};
    --shadow-color: ${({ theme }) => theme.shadowColor};
    --card-bg: ${({ theme }) => theme.cardBg};
    --error-color: ${({ theme }) => theme.errorColor};
    --success-color: ${({ theme }) => theme.successColor};
    --warning-color: ${({ theme }) => theme.warningColor};
    --info-color: ${({ theme }) => theme.infoColor};
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.3s ease;
  }

  a {
    color: var(--accent-color);
    text-decoration: none;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, button {
    font-family: inherit;
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
  buttonBg: 'linear-gradient(135deg, #646cff 0%, #8b3dff 100%)',
  buttonHover: 'linear-gradient(135deg, #535ad6 0%, #7a35e8 100%)',
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  cardBg: 'rgba(30, 30, 30, 0.8)',
  errorColor: '#ff4d4d',
  successColor: '#28a745',
  warningColor: '#ffc107',
  infoColor: '#17a2b8'
};

export const lightTheme = {
  bgPrimary: '#f5f5f5',
  bgSecondary: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  accentColor: '#646cff',
  borderColor: 'rgba(0, 0, 0, 0.1)',
  inputBg: 'rgba(0, 0, 0, 0.05)',
  buttonBg: 'linear-gradient(135deg, #646cff 0%, #8b3dff 100%)',
  buttonHover: 'linear-gradient(135deg, #535ad6 0%, #7a35e8 100%)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  cardBg: 'rgba(255, 255, 255, 0.9)',
  errorColor: '#dc3545',
  successColor: '#28a745',
  warningColor: '#ffc107',
  infoColor: '#17a2b8'
}; 