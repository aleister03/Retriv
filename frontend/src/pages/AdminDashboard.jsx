import { useState, useEffect, useContext } from 'react';
import { Container, Tabs, Loader, Center, Text, Group, Box } from '@mantine/core';
import { IconUsers, IconFileText, IconAlertCircle } from '@tabler/icons-react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatCard from '../components/admin/StatCard';
import UsersTab from '../components/admin/UsersTab';
import PostsTab from '../components/admin/PostsTab';
import RequestsTab from '../components/admin/RequestsTab';
import { showError } from '../utils/notifications';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const { colors } = useContext(ThemeContext);
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Fetch dashboard statistics
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      showError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats when switching tabs
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'users') {
      fetchStats();
    }
  };

  if (loading) {
    return (
      <Center style={{ minHeight: '100vh', background: colors.background }}>
        <Loader size="lg" color={colors.primaryAccent} />
      </Center>
    );
  }

  return (
    <Box style={{ display: 'flex', minHeight: '100vh', background: colors.background }}>
      <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <Box style={{ flex: 1, marginLeft: '280px', padding: '2rem' }}>
        <Box style={{ marginBottom: '2rem' }}>
          <Text 
            size="xl" 
            weight={700} 
            style={{ 
              fontSize: '2rem',
              color: colors.textPrimary,
              marginBottom: '0.5rem'
            }}
          >
            Admin Dashboard
          </Text>
          <Text size="sm" color="dimmed" style={{ color: colors.textSecondary }}>
            Manage users, posts, and platform requests
          </Text>
        </Box>
        <Group spacing="lg" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={IconUsers}
            color={colors.primaryAccent}
          />
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={IconFileText}
            color={colors.secondaryAccent}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingRequests}
            icon={IconAlertCircle}
            color="#FF6B6B"
          />
        </Group>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          styles={{
            root: {
              background: colors.surface,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            },
            tab: {
              color: colors.textSecondary,
              fontWeight: 500,
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              '&[data-active]': {
                color: colors.primaryAccent,
                borderColor: colors.primaryAccent,
              },
              '&:hover': {
                background: colors.elevatedSurface,
              },
            },
            panel: {
              paddingTop: '1.5rem',
            },
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="users" icon={<IconUsers size={16} />}>
              Users
            </Tabs.Tab>
            <Tabs.Tab value="posts" icon={<IconFileText size={16} />}>
              Posts
            </Tabs.Tab>
            <Tabs.Tab value="requests" icon={<IconAlertCircle size={16} />}>
              Requests
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="users">
            <UsersTab onUserUpdate={fetchStats} />
          </Tabs.Panel>

          <Tabs.Panel value="posts">
            <PostsTab />
          </Tabs.Panel>

          <Tabs.Panel value="requests">
            <RequestsTab onRequestUpdate={fetchStats}/>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Box>
  );
}