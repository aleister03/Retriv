import { Container, Title, useMantineColorScheme } from '@mantine/core';
import { APP_CONFIG } from '../../utils/constants';

function HeroSection() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <div
      style={{
        padding: '50px 0 30px 0',
        background: isDark ? '#0E1424' : '#F7F8FF',
        textAlign: 'center',
      }}
    >
      <Container size="md">
        <Title
          order={1}
          style={{
            fontSize: '2rem',
            fontWeight: 600,
            color: isDark ? '#F9FAFB' : '#1F2937',
            lineHeight: 1.3,
          }}
        >
          {APP_CONFIG.heroTitle}
        </Title>
      </Container>
    </div>
  );
}

export default HeroSection;
