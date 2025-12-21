import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Button, Divider, Text, ActionIcon, Group } from '@mantine/core';
import { IconFileText, IconShoppingCart, IconArrowsExchange, IconUser, IconLogout, IconMoon, IconSun, IconDashboard,} from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showPageNotAvailable } from '../../utils/notifications';

export default function AdminSidebar({ activeTab, onTabChange }) {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showSuccess('Logged Out', 'You have been successfully logged out');
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLostFound = () => {
    navigate('/lost-found');
  };

  const handleMarketplace = () => {
    showPageNotAvailable('Marketplace');
  };

  const handleExchange = () => {
    showPageNotAvailable('Exchange');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard, action: () => onTabChange('users') },
    { id: 'lost-found', label: 'Lost & Found', icon: IconFileText, action: handleLostFound },
    { id: 'marketplace', label: 'Marketplace', icon: IconShoppingCart, action: handleMarketplace },
    { id: 'exchange', label: 'Exchange', icon: IconArrowsExchange, action: handleExchange },
    { id: 'profile', label: 'Profile', icon: IconUser, action: handleProfile },
  ];

  return (
    <Box
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '280px',
        background: colors.surface,
        borderRight: `1px solid ${colors.borders}`,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      <Box style={{ marginBottom: '2rem' }}>
        <Group spacing="xs" style={{ marginBottom: '0.5rem' }}>
          <Box
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            R
          </Box>
          <Box>
            <Text
              weight={700}
              style={{
                fontSize: '1.5rem',
                color: colors.textPrimary,
                lineHeight: 1.2,
              }}
            >
              Retriv
            </Text>
            <Text size="xs" style={{ color: colors.textSecondary }}>
              Admin Panel
            </Text>
          </Box>
        </Group>
      </Box>

      <Box
        style={{
          background: colors.elevatedSurface,
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <Text size="xs" weight={500} style={{ color: colors.textSecondary, marginBottom: '0.25rem' }}>
          Logged in as
        </Text>
        <Text weight={600} style={{ color: colors.textPrimary, fontSize: '0.95rem' }}>
          {user?.name || 'Admin'}
        </Text>
        <Text size="xs" style={{ color: colors.textSecondary }}>
          {user?.email || ''}
        </Text>
      </Box>

      <Stack spacing="xs" style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="subtle"
            leftIcon={<item.icon size={20} />}
            onClick={item.action}
            styles={{
              root: {
                justifyContent: 'flex-start',
                height: '44px',
                padding: '0 1rem',
                color: colors.textPrimary,
                fontWeight: 500,
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  background: colors.elevatedSurface,
                },
              },
              label: {
                fontSize: '0.95rem',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>

      <Divider style={{ marginTop: 'auto', marginBottom: '1rem', borderColor: colors.borders }} />

      <Group position="apart" style={{ marginBottom: '1rem' }}>
        <Text size="sm" weight={500} style={{ color: colors.textPrimary }}>
          Theme
        </Text>
        <ActionIcon
          onClick={toggleTheme}
          size="lg"
          variant="light"
          style={{
            background: colors.elevatedSurface,
            color: colors.textPrimary,
          }}
        >
          {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </ActionIcon>
      </Group>
      <Button
        leftIcon={<IconLogout size={20} />}
        onClick={handleLogout}
        color="red"
        variant="light"
        fullWidth
        styles={{
          root: {
            height: '44px',
            fontWeight: 500,
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
}
