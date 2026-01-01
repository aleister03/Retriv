import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({
    messages: 0,
    notifications: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Disconnect socket when user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to socket server
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      const userId = user._id || user.id;
      newSocket.emit('register', userId);
    });

    newSocket.on('disconnect', (reason) => {
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for new notifications
    newSocket.on('newnotification', (notification) => {
      setUnreadCounts((prev) => ({
        ...prev,
        notifications: prev.notifications + 1,
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, unreadCounts, setUnreadCounts }}>
      {children}
    </SocketContext.Provider>
  );
};