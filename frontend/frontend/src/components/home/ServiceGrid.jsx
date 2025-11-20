import { Container, SimpleGrid, Card, Title, Text, useMantineColorScheme } from '@mantine/core';
import { IconSearch, IconShoppingCart, IconArrowsExchange } from '@tabler/icons-react';
import { SERVICES } from '../../utils/constants';

function ServiceGrid() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const iconMap = {
    IconSearch: IconSearch,
    IconShoppingCart: IconShoppingCart,
    IconArrowsExchange: IconArrowsExchange,
  };

  const colorMap = {
    blue: { bg: '#6366F1', light: '#EEF2FF' },
    teal: { bg: '#14B8A6', light: '#CCFBF1' },
    purple: { bg: '#A855F7', light: '#F3E8FF' },
  };

  return (
    <Container 
      size="lg" 
      style={{
        paddingTop: '30px',
        paddingBottom: '50px',
      }}
    >
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
        {SERVICES.map((service) => {
          const Icon = iconMap[service.icon];
          const colors = colorMap[service.color];
          
          return (
            <Card
              key={service.id}
              shadow="none"
              padding="32px"
              radius="lg"
              withBorder={false}
              style={{
                textAlign: 'center',
                background: isDark ? '#1E2537' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? '#2A3450' : '#EEF1FF';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? '#1E2537' : '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 16,
                  background: colors.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Icon size={36} stroke={1.8} color={colors.bg} />
              </div>

              <Title 
                order={3} 
                size="20px" 
                mb="xs"
                style={{
                  color: isDark ? '#F9FAFB' : '#1F2937',
                  fontWeight: 600,
                }}
              >
                {service.title}
              </Title>

              <Text 
                size="sm" 
                style={{
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  lineHeight: 1.6,
                }}
              >
                {service.description}
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>
    </Container>
  );
}

export default ServiceGrid;
