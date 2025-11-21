import { useContext } from 'react';
import { Title } from '@mantine/core';
import { ThemeContext } from '../../context/ThemeContext';

export default function HeroSection() {
  const { colors } = useContext(ThemeContext);

  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <Title 
        order={1} 
        style={{ 
          fontSize: '3rem', 
          color: colors.textPrimary, 
          marginBottom: '2rem',
          fontWeight: 700
        }}
      >
        Hey there, what do you <br />want to do today?
      </Title>
    </div>
  );
}

