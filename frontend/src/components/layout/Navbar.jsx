import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActionIcon, Button, Group, Menu, Avatar } from '@mantine/core';
import { IconMoon, IconSun, IconUser, IconBell, IconSettings, IconLogout } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { showPageNotAvailable, showSuccess } from '../../utils/notifications';

export default function Navbar() {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleNavigation = (path, pageName) => {
    if (path === '/') {
      navigate(path);
    } else {
      showPageNotAvailable(pageName);
    }
  };

  const handleLogout = () => {
    logout();
    showSuccess('Logged Out', 'You have been successfully logged out');
  };

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderBottom: `1px solid ${colors.borders}`,
      transition: 'all 0.3s ease'
    }}>
      <Group>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            background: colors.primaryAccent, 
            borderRadius: '12px', 
            padding: '8px 12px', 
            color: 'white', 
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>R</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: colors.textPrimary }}>Retriv</div>
            <div style={{ fontSize: '0.75rem', color: colors.textSecondary }}>Find: Trade, Connect.</div>
          </div>
        </div>
      </Group>
      
      <Group gap="xl">
        <Link 
          to="/" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/', 'Home'); }}
          style={{ textDecoration: 'none', color: colors.textPrimary, fontWeight: 500, cursor: 'pointer' }}
        >
          Home
        </Link>
        <span 
          onClick={() => handleNavigation('/lost-found', 'Lost & Found')}
          style={{ textDecoration: 'none', color: colors.textPrimary, fontWeight: 500, cursor: 'pointer' }}
        >
          L&F
        </span>
        <span 
          onClick={() => handleNavigation('/marketplace', 'Marketplace')}
          style={{ textDecoration: 'none', color: colors.textPrimary, fontWeight: 500, cursor: 'pointer' }}
        >
          Marketplace
        </span>
        <span 
          onClick={() => handleNavigation('/exchange', 'Exchange')}
          style={{ textDecoration: 'none', color: colors.textPrimary, fontWeight: 500, cursor: 'pointer' }}
        >
          Exchange
        </span>
        <span 
          onClick={() => handleNavigation('/help', 'Help')}
          style={{ textDecoration: 'none', color: colors.textPrimary, fontWeight: 500, cursor: 'pointer' }}
        >
          Help
        </span>
      </Group>

      <Group>
        <ActionIcon 
          onClick={handleThemeToggle} 
          variant="subtle"
          size="lg"
          style={{ 
            color: colors.textSecondary,
            cursor: 'pointer'
          }}
        >
          {theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
        </ActionIcon>

        {isLoggedIn ? (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <ActionIcon 
                variant="subtle"
                size="lg"
                style={{ cursor: 'pointer' }}
              >
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.name || 'User'} 
                  size="sm"
                  color={colors.primaryAccent}
                >
                  {user?.name?.[0] || 'U'}
                </Avatar>
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown 
              style={{ 
                backgroundColor: colors.surface,
                border: `1px solid ${colors.borders}`,
                color: colors.textPrimary
              }}
            >
              <Menu.Item 
                leftSection={<IconUser size={16} style={{ color: colors.textPrimary }} />}
                onClick={() => handleNavigation('/profile', 'Profile')}
                style={{ 
                  fontSize: '14px',
                  color: colors.textPrimary
                }}
              >
                Profile
              </Menu.Item>
              <Menu.Item 
                leftSection={<IconBell size={16} style={{ color: colors.textPrimary }} />}
                onClick={() => handleNavigation('/notifications', 'Notifications')}
                style={{ 
                  fontSize: '14px',
                  color: colors.textPrimary
                }}
              >
                Notifications
              </Menu.Item>
              <Menu.Item 
                leftSection={<IconSettings size={16} style={{ color: colors.textPrimary }} />}
                onClick={() => handleNavigation('/settings', 'Settings')}
                style={{ 
                  fontSize: '14px',
                  color: colors.textPrimary
                }}
              >
                Settings
              </Menu.Item>
              <Menu.Divider style={{ borderColor: colors.borders }} />
              <Menu.Item 
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
                color="red"
                style={{ 
                  fontSize: '14px'
                }}
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
              color: colors.primaryAccent
            }}
            onClick={() => navigate('/login')}
          >
            Login / Sign up
          </Button>
        )}
      </Group>
    </nav>
  );
}
