import { Group, Button, Text, Switch, Avatar, Menu, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoonStars, IconUser, IconSettings, IconLogout } from '@tabler/icons-react';
import { useState } from 'react';
import { NAV_ITEMS, APP_CONFIG } from '../../utils/constants';

function Navbar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div
      style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        background: isDark ? '#0E1424' : '#ffffff',
        borderBottom: `1px solid ${isDark ? '#1E2537' : '#E5E7EB'}`,
      }}
    >
      {/* Logo */}
      <Group gap="xs">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          R
        </div>
        <div>
          <Text size="xl" fw={700} c={isDark ? 'white' : '#1F2937'}>
            {APP_CONFIG.appName}
          </Text>
          <Text size="xs" c={isDark ? '#9CA3AF' : '#6B7280'}>
            Find: Trade, Connect.
          </Text>
        </div>
      </Group>

      {/* Navigation Links */}
      <Group gap="xs">
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.path}
            variant="subtle"
            size="md"
            c={isDark ? '#E5E7EB' : '#374151'}
            style={{
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
            styles={{
              root: {
                '&:hover': {
                  backgroundColor: isDark ? '#2A3450' : '#EEF1FF',
                  transform: 'translateY(-1px)',
                },
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Group>

      {/* Right side: Dark Mode Toggle and Login/Profile */}
      <Group gap="md">
        <Switch
          size="md"
          color="indigo"
          checked={isDark}
          onChange={() => toggleColorScheme()}
          onLabel={<IconSun size={16} stroke={2.5} />}
          offLabel={<IconMoonStars size={16} stroke={2.5} />}
          styles={{
            track: {
              cursor: 'pointer',
            },
          }}
        />

        {isLoggedIn ? (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Avatar
                radius="xl"
                size="md"
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                color="indigo"
              >
                <IconUser size={20} />
              </Avatar>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item leftSection={<IconUser size={16} />}>
                Profile
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={16} />}>
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                color="red" 
                leftSection={<IconLogout size={16} />}
                onClick={() => setIsLoggedIn(false)}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button
            variant="subtle"
            size="md"
            c={isDark ? '#E5E7EB' : '#374151'}
            onClick={() => setIsLoggedIn(true)}
            style={{
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
            styles={{
              root: {
                '&:hover': {
                  backgroundColor: isDark ? '#2A3450' : '#EEF1FF',
                  transform: 'translateY(-1px)',
                },
              },
            }}
          >
            Login / Sign up
          </Button>
        )}
      </Group>
    </div>
  );
}

export default Navbar;
