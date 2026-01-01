import { useState, useEffect, useContext } from 'react';
import { Drawer, Tabs, Text, Stack, Box, Group, Avatar, ActionIcon, ScrollArea, Loader, Center, Badge, Button } from '@mantine/core';
import { IconX, IconCheck, IconBell, IconMessage } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { showError } from '../../utils/notifications';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function NotificationPanel({ opened, onClose }) {
  const { colors } = useContext(ThemeContext);
  const { user, token } = useAuth();
  const { socket, unreadCounts } = useSocket();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && token) {
      fetchNotifications();
    }
  }, [opened, activeTab, token]);

  useEffect(() => {
    if (socket) {
      socket.on('newnotification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        socket.off('newnotification');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/notifications`, {
        params: { filter: activeTab },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${API_BASE}/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      if (socket) {
        socket.emit('marknotificationread', {
          notificationId,
          userId: user._id || user.id,
        });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch(
        `${API_BASE}/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));

      if (socket) {
        socket.emit('markallnotificationsread', user._id || user.id);
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Handle message notifications
    if (notification.type === 'message' && notification.relatedPost && notification.relatedUser) {
      try {
        const userId = user._id || user.id;
        const otherUserId = notification.relatedUser._id || notification.relatedUser.id;
        const postId = notification.relatedPost._id || notification.relatedPost.id;
        
        // Create conversationId 
        const conversationId = [userId, otherUserId].sort().join('_') + '_' + postId;

        // Open chat window with complete data
        if (window.openChat) {
          window.openChat({
            conversationId: conversationId,
            post: notification.relatedPost,
            otherUser: notification.relatedUser,
            minimized: false,
          });
        }

        // Close notification panel after opening chat
        onClose();
      } catch (error) {
        console.error('Failed to open chat:', error);
        showError('Error', 'Failed to open chat window');
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <IconMessage size={20} />;
      case 'rental_reminder':
      case 'rental_overdue':
        return <IconBell size={20} />;
      default:
        return <IconBell size={20} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'rental_overdue':
        return colors.error;
      case 'verification_approved':
        return colors.success;
      case 'verification_rejected':
        return colors.error;
      case 'message':
        return colors.primaryAccent;
      default:
        return colors.secondaryAccent;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="400px"
      padding={0}
      styles={{
        content: { background: colors.background },
        header: { display: 'none' },
      }}
    >
      {/* Header */}
      <Box p="md" style={{ background: colors.surface, borderBottom: `1px solid ${colors.borders}` }}>
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <IconBell size={24} color={colors.textPrimary} />
            <Text size="xl" fw={700} c={colors.textPrimary}>
              Inbox
            </Text>
          </Group>
          <ActionIcon variant="subtle" onClick={onClose}>
            <IconX size={20} />
          </ActionIcon>
        </Group>

        {unreadCounts.notifications > 0 && (
          <Button variant="subtle" size="xs" onClick={handleMarkAllAsRead} style={{ color: colors.primaryAccent }}>
            Mark all as read
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List style={{ background: colors.surface, borderBottom: `1px solid ${colors.borders}`, padding: '0 16px' }}>
          <Tabs.Tab value="all" style={{ color: activeTab === 'all' ? colors.primaryAccent : colors.textSecondary }}>
            All
          </Tabs.Tab>
          <Tabs.Tab value="unreads" style={{ color: activeTab === 'unreads' ? colors.primaryAccent : colors.textSecondary }}>
            Unreads
            {unreadCounts.notifications > 0 && (
              <Badge size="xs" circle ml={5} style={{ background: colors.error }}>
                {unreadCounts.notifications}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="messages" style={{ color: activeTab === 'messages' ? colors.primaryAccent : colors.textSecondary }}>
            Messages
          </Tabs.Tab>
        </Tabs.List>

        {/* Content */}
        <ScrollArea style={{ height: 'calc(100vh - 140px)' }}>
          {loading ? (
            <Center mt="xl">
              <Loader size="md" />
            </Center>
          ) : notifications.length === 0 ? (
            <Center style={{ height: '400px' }}>
              <Stack align="center" gap="md">
                <Text size="xl" fw={600} c={colors.textPrimary}>
                  Nothing here yet
                </Text>
                <Text size="sm" c={colors.textSecondary} ta="center">
                  Come back for notifications on events, transactions, and more.
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap={0}>
              {notifications.map((notification) => (
                <Box
                  key={notification._id}
                  p="md"
                  style={{
                    background: notification.isRead ? colors.surface : colors.elevatedSurface,
                    borderBottom: `1px solid ${colors.borders}`,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = colors.elevatedSurface)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notification.isRead ? colors.surface : colors.elevatedSurface)
                  }
                >
                  <Group align="flex-start" gap="sm">
                    <Box
                      style={{
                        background: getNotificationColor(notification.type),
                        borderRadius: '50%',
                        padding: '8px',
                        color: '#fff',
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>

                    <Box style={{ flex: 1 }}>
                      <Group justify="space-between">
                        <Text size="sm" fw={600} c={colors.textPrimary}>
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                          >
                            <IconCheck size={14} />
                          </ActionIcon>
                        )}
                      </Group>

                      <Text size="sm" c={colors.textSecondary} mt={4}>
                        {notification.message}
                      </Text>

                      {notification.relatedUser && (
                        <Group gap="xs" mt={8}>
                          <Avatar
                            src={notification.relatedUser.profilePicture}
                            size="xs"
                            radius="xl"
                          >
                            {notification.relatedUser.name?.[0]}
                          </Avatar>
                          <Text size="xs" c={colors.textSecondary}>
                            {notification.relatedUser.name}
                          </Text>
                        </Group>
                      )}

                      <Text size="xs" c={colors.textSecondary} mt={8}>
                        {formatTime(notification.createdAt)}
                      </Text>
                    </Box>
                  </Group>
                </Box>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Tabs>
    </Drawer>
  );
}