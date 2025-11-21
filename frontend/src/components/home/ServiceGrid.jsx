import { useContext } from 'react';
import { Card, Text, SimpleGrid } from '@mantine/core';
import { IconFile, IconShoppingCart, IconArrowsExchange } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { showPageNotAvailable } from '../../utils/notifications';

export default function ServiceGrid() {
  const { colors } = useContext(ThemeContext);

  const services = [
    { icon: IconFile, title: 'Lost & Found', color: '#5B7FFF', link: '/lost-found' },
    { icon: IconShoppingCart, title: 'Marketplace', color: '#4FD1C5', link: '/marketplace' },
    { icon: IconArrowsExchange, title: 'Exchange', color: '#9F7AEA', link: '/exchange' }
  ];

  const handleCardClick = (service) => {
    showPageNotAvailable(service.title);
  };

  return (
    <SimpleGrid 
      cols={3} 
      spacing="lg" 
      style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}
    >
      {services.map((service) => (
        <Card 
          key={service.title} 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          onClick={() => handleCardClick(service)}
          style={{ 
            textAlign: 'center', 
            cursor: 'pointer',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borders}`,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.hoverAccent;
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.borders;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ 
            background: service.color, 
            borderRadius: '16px', 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <service.icon size={40} color="white" />
          </div>
          <Text fw={600} size="lg" style={{ color: colors.textPrimary }}>
            {service.title}
          </Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}
