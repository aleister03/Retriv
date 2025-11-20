import { Container, Text, Anchor, useMantineColorScheme } from '@mantine/core';

function Footer() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <div
      style={{
        padding: '24px 0',
        background: isDark ? '#0E1424' : '#F7F8FF',
        borderTop: `1px solid ${isDark ? '#1E2537' : '#E5E7EB'}`,
      }}
    >
      <Container size="lg">
        <Text
          ta="center"
          size="sm"
          style={{
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          <Anchor
            href="#"
            style={{
              color: isDark ? '#9CA3AF' : '#6B7280',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = '#6366F1'}
            onMouseLeave={(e) => e.target.style.color = isDark ? '#9CA3AF' : '#6B7280'}
          >
            Terms & Conditions
          </Anchor>
        </Text>
      </Container>
    </div>
  );
}

export default Footer;
