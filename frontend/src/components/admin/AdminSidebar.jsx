import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Button, Divider, Text, ActionIcon, Group, Badge, ScrollArea } from '@mantine/core';
import { IconFileText, IconShoppingCart, IconArrowsExchange, IconUser, IconLogout, IconMoon, IconSun, IconDashboard, IconBell } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { showSuccess, showPageNotAvailable } from '../../utils/notifications';
import NotificationPanel from '../notifications/NotificationPanel';

export default function AdminSidebar({ activeTab, onTabChange }) {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const { logout, user } = useAuth();
  const { unreadCounts } = useSocket();
  const navigate = useNavigate();
  
  const [notificationPanelOpened, setNotificationPanelOpened] = useState(false);

  const handleLogout = () => {
    logout();
    showSuccess('Logged Out', 'You have been successfully logged out');
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard, action: () => onTabChange('users') },
    { id: 'lost-found', label: 'Lost & Found', icon: IconFileText, action: () => navigate('/lost-found') },
    { id: 'marketplace', label: 'Marketplace', icon: IconShoppingCart, action: () => navigate('/marketplace') },
    { id: 'exchange', label: 'Exchange', icon: IconArrowsExchange, action: () => navigate('/exchange') },
    { id: 'profile', label: 'Profile', icon: IconUser, action: () => navigate('/profile') },
  ];

  return (
    <>
      <Box
        style={{ width: '280px', height: '100vh', background: colors.surface, borderRight: `1px solid ${colors.borders}`, position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', }}
      >
        <ScrollArea
          style={{ 
            flex: 1,
            height: '100%',
          }}
          scrollbarSize={8}
          styles={{
            thumb: {
              backgroundColor: colors.borders,
            },
          }}
        >
          <Box style={{ padding: '1.5rem 1rem' }}>
            {/* Logo */}
            <Group mb="xl" style={{ gap: '0.75rem' }}>
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.primaryAccent}, ${colors.secondaryAccent})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                R
              </Box>
              <Box>
                <Text
                  size="xl"
                  style={{
                    fontWeight: 700,
                    color: colors.textPrimary,
                    lineHeight: 1.2,
                  }}
                >
                  Retriv
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: colors.textSecondary,
                    fontWeight: 500,
                  }}
                >
                  Admin Panel
                </Text>
              </Box>
            </Group>

            <Divider mb="md" color={colors.borders} />

            {/* User Info */}
            <Box
              mb="lg"
              p="sm"
              style={{
                background: colors.elevatedSurface,
                borderRadius: '8px',
                border: `1px solid ${colors.borders}`,
              }}
            >
              <Text size="xs" c={colors.textSecondary} mb={4}>
                Logged in as
              </Text>
              <Text
                size="sm"
                style={{
                  fontWeight: 600,
                  color: colors.textPrimary,
                  marginBottom: '2px',
                }}
              >
                {user?.name || 'Admin'}
              </Text>
              <Text size="xs" c={colors.textSecondary}>
                {user?.email || ''}
              </Text>
            </Box>

            {/* Menu Items */}
            <Stack style={{ gap: '0.5rem' }} mb="lg">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  leftSection={<item.icon size={20} />}
                  variant="subtle"
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

              {/* Notifications Button */}
              <Button
                leftSection={<IconBell size={20} />}
                variant="subtle"
                onClick={() => setNotificationPanelOpened(true)}
                styles={{
                  root: {
                    justifyContent: 'flex-start',
                    height: '44px',
                    padding: '0 1rem',
                    color: colors.textPrimary,
                    fontWeight: 500,
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    position: 'relative',
                    '&:hover': {
                      background: colors.elevatedSurface,
                    },
                  },
                  label: {
                    fontSize: '0.95rem',
                  },
                }}
              >
                Notifications
                {(unreadCounts.notifications > 0 || unreadCounts.messages > 0) && (
                  <Badge
                    size="sm"
                    variant="filled"
                    color="red"
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    {unreadCounts.notifications + unreadCounts.messages}
                  </Badge>
                )}
              </Button>
            </Stack>

            <Divider my="md" color={colors.borders} />

            {/* Theme Toggle */}
            <Group mb="md" style={{ justifyContent: 'space-between' }}>
              <Text size="sm" c={colors.textSecondary}>
                Theme
              </Text>
              <ActionIcon
                onClick={toggleTheme}
                variant="subtle"
                size="lg"
                style={{ color: colors.textPrimary }}
              >
                {theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
              </ActionIcon>
            </Group>

            {/* Logout */}
            <Button
              leftSection={<IconLogout size={20} />}
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
        </ScrollArea>
      </Box>

      {/* Notification Panel */}
      <NotificationPanel
        opened={notificationPanelOpened}
        onClose={() => setNotificationPanelOpened(false)}
      />
    </>
  );
}