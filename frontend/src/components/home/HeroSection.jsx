import { useContext } from 'react';
import { Title, Text } from '@mantine/core';
import { ThemeContext } from '../../context/ThemeContext';

export default function HeroSection() {
  const { colors } = useContext(ThemeContext);

  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem 2.5rem 2rem',
      background: colors.background
    }}>
      <Title
        order={1}
        style={{
          fontSize: '3rem',
          color: colors.primaryAccent,
          marginBottom: '1.2rem',
          fontWeight: 700,
          lineHeight: '1.15',
        }}
      >
        Welcome to Retriv! <br />
        What will you discover today?
      </Title>
      <Text
        size="lg"
        style={{
          color: colors.textSecondary,
          fontWeight: 400,
        }}
      >
        Find lost items, shop the marketplace, or make an exchange.
      </Text>
    </div>
  );
}