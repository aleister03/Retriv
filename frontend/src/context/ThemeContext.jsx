import { createContext, useState, useEffect } from 'react';
import { COLORS } from '../utils/constants';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const colors = COLORS[theme];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', colors.background);
    root.style.setProperty('--surface-color', colors.surface);
    root.style.setProperty('--elevated-surface', colors.elevatedSurface);
    root.style.setProperty('--primary-accent', colors.primaryAccent);
    root.style.setProperty('--secondary-accent', colors.secondaryAccent);
    root.style.setProperty('--hover-accent', colors.hoverAccent);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--borders', colors.borders);
  }, [theme, colors]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}