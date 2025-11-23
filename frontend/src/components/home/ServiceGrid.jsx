import { useContext } from 'react';
import { Card, Text, SimpleGrid } from '@mantine/core';
import { IconFile, IconShoppingCart, IconArrowsExchange } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { showPageNotAvailable } from '../../utils/notifications';

export default function ServiceGrid() {
  const { colors } = useContext(ThemeContext);

  const services = [
    { icon: IconFile, title: 'Lost & Found', color: colors.secondaryAccent, link: '/lost-found' },
    { icon: IconShoppingCart, title: 'Marketplace', color: colors.primaryAccent, link: '/marketplace' },
    { icon: IconArrowsExchange, title: 'Exchange', color: colors.secondaryAccent, link: '/exchange' }
  ];

  const handleCardClick = (service) => {
    showPageNotAvailable(service.title);
  };

  return (
    <SimpleGrid
      cols={3}
      spacing="lg"
      breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem'
      }}
    >
      {services.map((service) => (
        <Card
          key={service.title}
          shadow="md"
          padding="lg"
          radius="md"
          withBorder
          style={{
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borders}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
          }}
          onClick={() => handleCardClick(service)}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = colors.hoverAccent;
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.10)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = colors.borders;
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
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
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.07)'
          }}>
            <service.icon size={40} color="#FFF" />
          </div>
          <Text fw={600} size="lg" style={{ color: colors.textPrimary }}>
            {service.title}
          </Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}
