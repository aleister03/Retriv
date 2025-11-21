import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function Footer() {
  const { colors } = useContext(ThemeContext);

  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '2rem', 
      color: colors.textSecondary,
      borderTop: `1px solid ${colors.borders}`
    }}>
      <a 
        href="/terms" 
        style={{ 
          textDecoration: 'none', 
          color: colors.textSecondary 
        }}
      >
        Terms & Conditions
      </a>
    </footer>
  );
}
