import { useState, useEffect, useContext } from 'react';
import { Box } from '@mantine/core';
import { ThemeContext } from '../../context/ThemeContext';
import ChatWindow from './ChatWindow';

export default function ChatWindows() {
  const { colors } = useContext(ThemeContext);
  const [openChats, setOpenChats] = useState([]);

  // Load open chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('openChats');
    if (savedChats) {
      setOpenChats(JSON.parse(savedChats));
    }
  }, []);

  // Save open chats to localStorage
  useEffect(() => {
    localStorage.setItem('openChats', JSON.stringify(openChats));
  }, [openChats]);

  const openChat = (chatData) => {
    // Check if chat is already open
    const exists = openChats.find(
      (chat) => chat.conversationId === chatData.conversationId
    );

    if (!exists) {
      setOpenChats([...openChats, chatData]);
    }
  };

  const closeChat = (conversationId) => {
    setOpenChats(openChats.filter((chat) => chat.conversationId !== conversationId));
  };

  const minimizeChat = (conversationId) => {
    setOpenChats(
      openChats.map((chat) =>
        chat.conversationId === conversationId
          ? { ...chat, minimized: !chat.minimized }
          : chat
      )
    );
  };

  // Expose openChat function globally
  useEffect(() => {
    window.openChat = openChat;
    return () => {
      delete window.openChat;
    };
  }, [openChats]);

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        right: 20,
        display: 'flex',
        gap: '10px',
        zIndex: 1000,
        flexDirection: 'row-reverse',
      }}
    >
      {openChats.map((chat, index) => (
        <ChatWindow
          key={chat.conversationId}
          chat={chat}
          onClose={() => closeChat(chat.conversationId)}
          onMinimize={() => minimizeChat(chat.conversationId)}
          style={{
            marginRight: index * 10,
          }}
        />
      ))}
    </Box>
  );
}