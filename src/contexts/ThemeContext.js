import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebase } from './FirebaseContext';

// Theme Context
const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme Provider Component
export const ThemeProvider = ({ children, initialTheme = 'dark' }) => {
  const [theme, setTheme] = useState(initialTheme);
  const { user, updateTheme } = useFirebase();

  // Initialize theme from localStorage or user preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (user && user.theme) {
      setTheme(user.theme);
      document.documentElement.setAttribute('data-theme', user.theme);
    }
  }, [user]);

  // Toggle theme function
  const toggleTheme = async (newTheme) => {
    // If no theme provided, toggle between dark and light
    const updatedTheme = newTheme || (theme === 'dark' ? 'light' : 'dark');
    
    // Update state
    setTheme(updatedTheme);
    
    // Update DOM
    document.documentElement.setAttribute('data-theme', updatedTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', updatedTheme);
    
    // If user is logged in, update their preferences in Firebase
    if (user) {
      try {
        await updateTheme(user.uid, updatedTheme);
      } catch (error) {
        console.error('Tema güncellenirken hata oluştu:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 