import { useContext } from 'react';
import { Paper, Text, Group, Box } from '@mantine/core';
import { ThemeContext } from '../../context/ThemeContext';

export default function StatCard({ title, value, icon: Icon, color }) {
  const { colors } = useContext(ThemeContext);

  return (
    <Paper
      shadow="sm"
      radius="md"
      style={{
        flex: 1,
        minWidth: '250px',
        padding: '1.5rem',
        background: colors.surface,
        border: `1px solid ${colors.borders}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      <Group position="apart" noWrap>
        <Box style={{ flex: 1 }}>
          <Text size="sm" weight={500} style={{ color: colors.textSecondary, marginBottom: '0.5rem' }}>
            {title}
          </Text>
          <Text
            size="xl"
            weight={700}
            style={{
              fontSize: '2rem',
              color: colors.textPrimary,
            }}
          >
            {value.toLocaleString()}
          </Text>
        </Box>
        <Box
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={32} color={color} />
        </Box>
      </Group>
    </Paper>
  );
}
