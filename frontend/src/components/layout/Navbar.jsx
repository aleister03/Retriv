import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Group, Menu, Avatar, Text, Box, Divider, Badge, ActionIcon } from '@mantine/core';
import { IconMoon, IconSun, IconUser, IconBell, IconSettings, IconLogout } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { showPageNotAvailable, showSuccess } from '../../utils/notifications';
import LoginModal from '../auth/LoginModal';
import NotificationPanel from '../notifications/NotificationPanel';

export default function Navbar() {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const { user, isLoggedIn, loading, logout } = useContext(AuthContext);
  const { unreadCounts } = useSocket();
  const [loginModalOpened, setLoginModalOpened] = useState(false);
  const [notificationPanelOpened, setNotificationPanelOpened] = useState(false);
  const navigate = useNavigate();

  const handleNotAvailable = (page) => showPageNotAvailable(page);

  const handleLogout = () => {
    logout();
    showSuccess('Logged Out', 'You have been successfully logged out');
  };

  const menuItemStyle = {
    fontSize: '14px',
    color: colors.textPrimary,
    borderRadius: '8px',
    transition: 'background 0.18s',
  };

  const menuItemHoverStyle = theme === 'light' ? colors.elevatedSurface : '#222';

  return (
    <>
      <Box
        style={{
          background: colors.surface,
          borderBottom: `1px solid ${colors.borders}`,
          padding: '0.8rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Group justify="space-between">
          {/* Logo */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Box
              style={{
                background: colors.primaryAccent,
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}
            >
              R
            </Box>
            <Box>
              <Text
                size="lg"
                fw={700}
                style={{ color: colors.textPrimary, lineHeight: 1.2 }}
              >
                Retriv
              </Text>
              <Text
                size="xs"
                style={{ color: colors.textSecondary, lineHeight: 1 }}
              >
                Find · Trade · Connect
              </Text>
            </Box>
          </Link>

          {/* Nav Links */}
          <Group gap="md">
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: colors.textPrimary,
                fontWeight: 500,
                fontSize: '1rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = colors.elevatedSurface)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              Home
            </Link>
            <Link
              to="/lost-found"
              style={{
                textDecoration: 'none',
                color: colors.textPrimary,
                fontWeight: 500,
                fontSize: '1rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = colors.elevatedSurface)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              Lost & Found
            </Link>
            <Link
              to="/marketplace"
              style={{
                textDecoration: 'none',
                color: colors.textPrimary,
                fontWeight: 500,
                fontSize: '1rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = colors.elevatedSurface)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              Marketplace
            </Link>
            <Link
              to="/exchange"
              style={{
                textDecoration: 'none',
                color: colors.textPrimary,
                fontWeight: 500,
                fontSize: '1rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = colors.elevatedSurface)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              Exchange
            </Link>
            <Link
              to="/help"
              style={{
                textDecoration: 'none',
                color: colors.textPrimary,
                fontWeight: 500,
                fontSize: '1rem',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = colors.elevatedSurface)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              Help
            </Link>
          </Group>

          {/* Right Side */}
          <Group gap="sm">
            {/* Theme Toggle */}
            <ActionIcon
              onClick={toggleTheme}
              variant="subtle"
              size="lg"
              style={{ color: colors.textPrimary }}
            >
              {theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
            </ActionIcon>

            {loading ? (
              <Text>Loading...</Text>
            ) : isLoggedIn ? (
              <>
                {/* Notification Bell */}
                <ActionIcon
                  onClick={() => setNotificationPanelOpened(true)}
                  variant="subtle"
                  size="lg"
                  style={{ position: 'relative', color: colors.textPrimary }}
                >
                  <IconBell size={22} />
                  {(unreadCounts.notifications > 0 || unreadCounts.messages > 0) && (
                    <Badge
                      size="xs"
                      circle
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        background: colors.error,
                        color: '#fff',
                        border: `2px solid ${colors.surface}`,
                      }}
                    >
                      {unreadCounts.notifications + unreadCounts.messages}
                    </Badge>
                  )}
                </ActionIcon>

                {/* User Menu */}
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      style={{
                        borderRadius: '50%',
                      }}
                    >
                      <Avatar
                        src={user?.profilePicture}
                        size="sm"
                        radius="xl"
                        style={{ cursor: 'pointer' }}
                      >
                        {user?.name?.[0] || 'U'}
                      </Avatar>
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown
                    style={{
                      background: colors.surface,
                      border: `1px solid ${colors.borders}`,
                    }}
                  >
                    <Menu.Item
                      leftSection={<IconUser size={16} />}
                      onClick={() => navigate('/profile')}
                      style={menuItemStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = menuItemHoverStyle)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      Profile
                    </Menu.Item>

                    <Divider my="xs" />

                    <Menu.Item
                      leftSection={<IconLogout size={16} />}
                      onClick={handleLogout}
                      color="red"
                      style={menuItemStyle}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = menuItemHoverStyle)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <Button
                onClick={() => setLoginModalOpened(true)}
                style={{
                  background: colors.primaryAccent,
                  color: '#fff',
                }}
              >
                Login / Sign up
              </Button>
            )}
          </Group>
        </Group>
      </Box>

      <LoginModal opened={loginModalOpened} onClose={() => setLoginModalOpened(false)} />
      <NotificationPanel
        opened={notificationPanelOpened}
        onClose={() => setNotificationPanelOpened(false)}
      />
    </>
  );
}