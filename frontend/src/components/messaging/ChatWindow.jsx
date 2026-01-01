import { useState, useEffect, useContext, useRef } from 'react';
import { Box, Paper, Text, TextInput, Avatar, ActionIcon, Group, Stack, ScrollArea, Loader, Alert } from '@mantine/core';
import { IconX, IconMinus, IconSend, IconAlertCircle } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { showError } from '../../utils/notifications';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function ChatWindow({ chat, onClose, onMinimize }) {
  const { colors } = useContext(ThemeContext);
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const isUnavailable = chat.post?.availability === 'Unavailable';

  // Fetch conversation messages
  useEffect(() => {
    if (chat.conversationId && token) {
      fetchMessages();
    }
  }, [chat.conversationId, token]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.conversationId === chat.conversationId) {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });

        const userId = user?._id || user?.id;
        socket.emit('markmessageread', {
          conversationId: chat.conversationId,
          userId: userId,
        });
      }
    };

    const handleMessageSent = (message) => {
      if (message.conversationId === chat.conversationId) {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on('newmessage', handleNewMessage);
    socket.on('messagesent', handleMessageSent);

    return () => {
      socket.off('newmessage', handleNewMessage);
      socket.off('messagesent', handleMessageSent);
    };
  }, [socket, chat.conversationId, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/messages/conversation/${chat.conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessages(response.data.messages);
        if (socket) {
          const userId = user._id || user.id;
          socket.emit('markmessageread', {
            conversationId: chat.conversationId,
            userId: userId,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      if (error.response?.status === 404) {
        showError('Chat Unavailable', 'This conversation no longer exists');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (isUnavailable) {
      showError('This item is no longer available for messaging');
      return;
    }

    if (!newMessage.trim() || !socket || sending) return;

    setSending(true);
    const userId = user._id || user.id;
    const receiverId = chat.otherUser._id || chat.otherUser.id;
    const postId = chat.post._id || chat.post.id;

    socket.emit('sendmessage', {
      conversationId: chat.conversationId,
      postId: postId,
      senderId: userId,
      receiverId: receiverId,
      content: newMessage.trim(),
    });

    setNewMessage('');
    setSending(false);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  if (chat.minimized) {
    return (
      <Paper
        p="sm"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 20,
          width: 250,
          background: colors.primaryAccent,
          cursor: 'pointer',
          zIndex: 1000,
        }}
        onClick={onMinimize}
      >
        <Group position="apart">
          <Group spacing="xs">
            <Avatar size="sm" color="blue">
              {chat.otherUser.name?.[0]}
            </Avatar>
            <Text size="sm" color="#fff" weight={600}>
              {chat.otherUser.name}
            </Text>
          </Group>
          <ActionIcon
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <IconX size={16} color="#fff" />
          </ActionIcon>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper
      shadow="lg"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 20,
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        background: colors.surface,
        border: `1px solid ${colors.borders}`,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        p="md"
        style={{
          background: colors.primaryAccent,
          borderBottom: `1px solid ${colors.borders}`,
        }}
      >
        <Group position="apart">
          <Group spacing="xs">
            <Avatar size="sm" color="blue">
              {chat.otherUser.name?.[0]}
            </Avatar>
            <div>
              <Text size="sm" color="#fff" weight={600}>
                {chat.otherUser.name}
              </Text>
              <Text size="xs" color="#fff" opacity={0.8}>
                {chat.post.title}
              </Text>
            </div>
          </Group>
          <Group spacing={4}>
            <ActionIcon onClick={onMinimize}>
              <IconMinus size={18} color="#fff" />
            </ActionIcon>
            <ActionIcon onClick={onClose}>
              <IconX size={18} color="#fff" />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Unavailable Warning */}
      {isUnavailable && (
        <Alert icon={<IconAlertCircle size={16} />} title="Item Unavailable" color="red" p="xs">
          This item is no longer available. Messaging has been disabled.
        </Alert>
      )}

      {/* Messages */}
      <ScrollArea
        style={{ flex: 1, padding: '1rem' }}
        viewportRef={scrollRef}
      >
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader size="sm" />
          </Box>
        ) : messages.length === 0 ? (
          <Text align="center" size="sm" color="dimmed" mt="xl">
            Start the conversation!
          </Text>
        ) : (
          <Stack spacing="sm">
            {messages.map((msg) => {
              const isOwn =
                msg.sender._id === user._id || msg.sender._id === user.id;
              return (
                <Box
                  key={msg._id}
                  style={{
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                  }}
                >
                  <Paper
                    p="xs"
                    style={{
                      background: isOwn ? colors.primaryAccent : colors.elevatedSurface,
                      color: isOwn ? '#fff' : colors.textPrimary,
                      borderRadius: 8,
                    }}
                  >
                    <Text size="sm">{msg.content}</Text>
                    <Text
                      size="xs"
                      style={{
                        opacity: 0.7,
                        marginTop: 4,
                      }}
                    >
                      {formatTime(msg.createdAt)}
                    </Text>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </ScrollArea>

      {/* Input - Disabled if unavailable */}
      <Box
        p="md"
        style={{
          borderTop: `1px solid ${colors.borders}`,
          background: colors.elevatedSurface,
        }}
      >
        {isUnavailable ? (
          <Alert icon={<IconAlertCircle size={14} />} color="red" p="xs">
            Messaging disabled
          </Alert>
        ) : (
          <Group spacing="xs">
            <TextInput
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              disabled={sending || isUnavailable}
              style={{ flex: 1 }}
              styles={{
                input: {
                  background: colors.elevatedSurface,
                  border: `1px solid ${colors.borders}`,
                  color: colors.textPrimary,
                },
              }}
            />
            <ActionIcon
              color="blue"
              variant="filled"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || isUnavailable}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        )}
      </Box>
    </Paper>
  );
}