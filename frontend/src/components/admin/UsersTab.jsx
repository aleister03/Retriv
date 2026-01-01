import { useState, useEffect, useContext } from 'react';
import { Table, Avatar, Badge, Group, Text, ActionIcon, Menu, TextInput, Select, Pagination, Box, Loader, Center, ScrollArea,} from '@mantine/core';
import { IconDotsVertical, IconEye, IconBan, IconClock, IconTrash, IconShieldCheck, IconSearch, IconShieldOff, IconLockOpen,} from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../utils/notifications';
import UserActionModal from './UserActionModal';
import ViewUserModal from './ViewUserModal';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function UsersTab({ onUserUpdate }) {
  const { colors } = useContext(ThemeContext);
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    usersPerPage: 10,
  });

  // Modal states
  const [actionModalOpened, setActionModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/users`, {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setActionModalOpened(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setViewModalOpened(true);
  };

  const handleActionComplete = () => {
    setActionModalOpened(false);
    fetchUsers();
    if (onUserUpdate) onUserUpdate();
  };

  const handleUnban = async (user) => {
    try {
      const response = await axios.put(
        `${API_BASE}/admin/users/${user._id}/unban`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showSuccess('User Unbanned', response.data.message);
        fetchUsers();
        if (onUserUpdate) onUserUpdate();
      }
    } catch (error) {
      showError('Failed to unban user', error.response?.data?.message);
    }
  };

  const handleUnsuspend = async (user) => {
    try {
      const response = await axios.put(
        `${API_BASE}/admin/users/${user._id}/unsuspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showSuccess('User Unsuspended', response.data.message);
        fetchUsers();
        if (onUserUpdate) onUserUpdate();
      }
    } catch (error) {
      showError('Failed to unsuspend user', error.response?.data?.message);
    }
  };

  // Check if user can be actioned
  const canActOnUser = (targetUser) => {
    if (targetUser._id === currentUser._id) return false;
    if (targetUser.isAdmin && currentUser.promotedBy && 
        currentUser.promotedBy._id === targetUser._id) return false;
    return true;
  };

  const getBadgeColor = (user) => {
    if (user.isBanned) return 'red';
    if (user.isSuspended) return 'orange';
    if (user.isAdmin) return 'blue';
    return 'green';
  };

  const getStatusText = (user) => {
    if (user.isBanned) return 'Banned';
    if (user.isSuspended) return 'Suspended';
    if (user.isAdmin) return 'Admin';
    return 'Active';
  };

  if (loading && users.length === 0) {
    return (
      <Center style={{ minHeight: '400px' }}>
        <Loader size="lg" color={colors.primaryAccent} />
      </Center>
    );
  }

  return (
    <Box>
      <Group spacing="md" style={{ marginBottom: '1.5rem' }}>
        <TextInput
          placeholder="Search by name or email..."
          icon={<IconSearch size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ flex: 1, maxWidth: '400px' }}
          styles={{
            input: {
              background: colors.elevatedSurface,
              border: `1px solid ${colors.borders}`,
              color: colors.textPrimary,
            },
          }}
        />
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          data={[
            { value: 'all', label: 'All Users' },
            { value: 'admin', label: 'Admins' },
            { value: 'banned', label: 'Banned' },
            { value: 'suspended', label: 'Suspended' },
          ]}
          style={{ width: '180px' }}
          styles={{
            input: {
              background: colors.elevatedSurface,
              border: `1px solid ${colors.borders}`,
              color: colors.textPrimary,
            },
          }}
        />
      </Group>
      <ScrollArea>
        <Table
          highlightOnHover
          styles={{
            root: {
              background: colors.surface,
            },
            thead: {
              background: colors.elevatedSurface,
            },
            th: {
              color: colors.textPrimary,
              fontWeight: 600,
              fontSize: '0.9rem',
              padding: '1rem',
            },
            td: {
              color: colors.textPrimary,
              padding: '1rem',
              borderBottom: `1px solid ${colors.borders}`,
            },
          }}
        >
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Reputation</th>
              <th>Joined</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <Group spacing="sm">
                    <Avatar src={user.profilePicture} radius="xl" size="md">
                      {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Text weight={500}>{user.name}</Text>
                  </Group>
                </td>
                <td>
                  <Text size="sm">{user.email}</Text>
                </td>
                <td>
                  <Badge color={getBadgeColor(user)} variant="light">
                    {getStatusText(user)}
                  </Badge>
                </td>
                <td>
                  <Text size="sm">{user.reputationScore}</Text>
                </td>
                <td>
                  <Text size="sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </td>
                <td>
                  <Group position="center" spacing={4}>
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => handleView(user)}
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                    <Menu position="bottom-end" withArrow>
                      <Menu.Target>
                        <ActionIcon variant="light">
                          <IconDotsVertical size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown
                        style={{
                          background: colors.surface,
                          border: `1px solid ${colors.borders}`,
                        }}
                      >
                        {user.isBanned ? (
                          <Menu.Item
                            icon={<IconLockOpen size={16} />}
                            onClick={() => handleUnban(user)}
                            disabled={!canActOnUser(user)}
                          >
                            Unban User
                          </Menu.Item>
                        ) : user.isSuspended ? (
                          <Menu.Item
                            icon={<IconLockOpen size={16} />}
                            onClick={() => handleUnsuspend(user)}
                            disabled={!canActOnUser(user)}
                          >
                            Unsuspend User
                          </Menu.Item>
                        ) : (
                          <>
                            <Menu.Item
                              icon={<IconBan size={16} />}
                              onClick={() => handleAction(user, 'ban')}
                              disabled={!canActOnUser(user)}
                            >
                              Ban User
                            </Menu.Item>
                            <Menu.Item
                              icon={<IconClock size={16} />}
                              onClick={() => handleAction(user, 'suspend')}
                              disabled={!canActOnUser(user)}
                            >
                              Suspend User
                            </Menu.Item>
                          </>
                        )}
                        
                        {user.isAdmin ? (
                          <Menu.Item
                            icon={<IconShieldOff size={16} />}
                            onClick={() => handleAction(user, 'demote')}
                            disabled={!canActOnUser(user)}
                          >
                            Demote from Admin
                          </Menu.Item>
                        ) : (
                          <Menu.Item
                            icon={<IconShieldCheck size={16} />}
                            onClick={() => handleAction(user, 'promote')}
                          >
                            Promote to Admin
                          </Menu.Item>
                        )}
                        
                        <Menu.Divider />
                        <Menu.Item
                          icon={<IconTrash size={16} />}
                          color="red"
                          onClick={() => handleAction(user, 'delete')}
                          disabled={!canActOnUser(user)}
                        >
                          Delete User
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Group position="center" style={{ marginTop: '1.5rem' }}>
          <Pagination
            page={page}
            onChange={setPage}
            total={pagination.totalPages}
            color="blue"
            size="md"
          />
          <Text size="sm" color="dimmed" style={{ color: colors.textSecondary }}>
            Showing {users.length} of {pagination.totalUsers} users
          </Text>
        </Group>
      )}

      <UserActionModal
        opened={actionModalOpened}
        onClose={() => setActionModalOpened(false)}
        user={selectedUser}
        actionType={actionType}
        onComplete={handleActionComplete}
      />

      <ViewUserModal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        user={selectedUser}
      />
    </Box>
  );
}