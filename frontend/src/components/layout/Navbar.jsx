import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  ActionIcon, Button, Group, Menu, Avatar, Text, Box, Divider, Switch
} from '@mantine/core';
import {
  IconMoon, IconSun, IconUser, IconBell,
  IconSettings, IconLogout
} from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { showPageNotAvailable } from '../../utils/notifications';

export default function Navbar() {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);

  // Dummy for prototype (set to true to show profile, false to show login button)
  const isLoggedIn = true;
  const user = { name: "Alex", avatar: "" };

  const handleNotAvailable = (page) => showPageNotAvailable(page);

  const menuItemStyle = {
    fontSize: '14px',
    color: colors.textPrimary,
    borderRadius: '8px',
    transition: 'background 0.18s',
  };

  const menuItemHoverStyle = theme === 'light' ? colors.elevatedSurface : '#222';

  return (
    <nav
      style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: colors.surface,
        borderBottom: `1px solid ${colors.borders}`,
        boxShadow: theme === 'light'
          ? '0 4px 12px rgba(80,150,220,0.03)'
          : '0 2px 8px rgba(0,0,0,0.10)',
        transition: 'background 0.3s, box-shadow 0.3s',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
      aria-label="Main navigation"
    >
      {/* Logo and Title */}
      <Group gap={0}>
        <Box
          style={{
            background: colors.primaryAccent,
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#FFF',
            fontWeight: 700,
            fontSize: '1.35rem',
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            marginRight: '0.7rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >R</Box>
        <Box>
          <Text fw={700} style={{ color: colors.textPrimary, fontSize: '1.33rem' }}>
            Retriv
          </Text>
          <Text fw={500} style={{ color: colors.textSecondary, fontSize: '0.87rem', letterSpacing: '0.2px' }}>
            Find · Trade · Connect
          </Text>
        </Box>
      </Group>

      {/* Navigation Links */}
      <Group gap="xl">
        <Link
          to="/"
          aria-label="Go to homepage"
          style={{
            textDecoration: 'none',
            color: colors.textPrimary,
            fontWeight: 500,
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '0.4rem 0.6rem',
            borderRadius: '6px',
          }}
        >
          Home
        </Link>
        {["Lost & Found", "Marketplace", "Exchange", "Help"].map((label) => (
          <Text
            key={label}
            component="span"
            role="button"
            tabIndex={0}
            aria-label={label}
            onClick={() => handleNotAvailable(label)}
            style={{
              textDecoration: 'none',
              color: colors.textPrimary,
              fontWeight: 500,
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              transition: 'background 0.18s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = colors.elevatedSurface}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {label}
          </Text>
        ))}
      </Group>

      {/* Right-side actions */}
      <Group gap="md">
        {/* Theme Toggle - Toggle Switch Style */}
        <Box
          onClick={toggleTheme}
          style={{
            width: '64px',
            height: '32px',
            borderRadius: '16px',
            background: theme === 'light' 
              ? 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)' 
              : 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
            border: `1px solid ${colors.borders}`,
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            padding: '3px',
          }}
        >
          <Box
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: theme === 'light' ? '#fff' : '#3a3a3a',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              position: 'absolute',
              left: theme === 'light' ? '3px' : '35px',
              transition: 'left 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
            }}
          >
            {theme === 'light' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </Box>
        </Box>

        {isLoggedIn ? (
          <Menu shadow="md" width={200} position="bottom-end" offset={10}>
            <Menu.Target>
              <Box
                style={{
                  cursor: 'pointer',
                  borderRadius: '50%',
                }}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.name || 'User'}
                  size="lg"
                  radius="xl"
                  style={{
                    border: `2.5px solid ${colors.primaryAccent}`,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  color={colors.primaryAccent}
                >
                  {user?.name?.[0] || 'A'}
                </Avatar>
              </Box>
            </Menu.Target>
            <Menu.Dropdown
              style={{
                background: theme === 'light' ? '#FFF' : colors.elevatedSurface,
                border: `1px solid ${colors.borders}`,
                color: colors.textPrimary,
                boxShadow: '0 6px 16px rgba(0,0,0,0.07)',
                borderRadius: '12px',
              }}
            >
              <Menu.Item
                leftSection={<IconUser size={16} style={{ color: colors.textPrimary }} />}
                onClick={() => handleNotAvailable('Profile')}
                style={menuItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = menuItemHoverStyle}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconBell size={16} style={{ color: colors.textPrimary }} />}
                onClick={() => handleNotAvailable('Notifications')}
                style={menuItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = menuItemHoverStyle}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Notifications
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={16} style={{ color: colors.textPrimary }} />}
                onClick={() => handleNotAvailable('Settings')}
                style={menuItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = menuItemHoverStyle}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Settings
              </Menu.Item>
              <Divider style={{ borderColor: colors.borders, margin: '4px 0' }} />
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                onClick={() => handleNotAvailable('Logout')}
                color="red"
                style={menuItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = menuItemHoverStyle}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button
            variant="outline"
            style={{
              borderColor: colors.primaryAccent,
              color: colors.primaryAccent,
              fontWeight: 600
            }}
            onClick={() => handleNotAvailable('Login / Sign up')}
          >
            Login / Sign up
          </Button>
        )}
      </Group>
    </nav>
  );
}
