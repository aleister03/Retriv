import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';
import { createElement } from 'react';
import { COLORS } from './constants';

const getNotificationColor = (type, theme = 'light') => {
  switch (type) {
    case 'success': return COLORS[theme].success;
    case 'error': return COLORS[theme].error;
    case 'warning': return COLORS[theme].warning;
    case 'info': return COLORS[theme].info;
    default: return COLORS[theme].primaryAccent;
  }
};

const notificationConfig = {
  autoClose: 3500,
  withCloseButton: true,
  position: 'bottom-right'
};

export const showSuccess = (title, message, theme = 'light', autoClose = 3500) =>
  notifications.show({
    ...notificationConfig,
    autoClose,
    title,
    message,
    color: getNotificationColor('success', theme),
    icon: createElement(IconCheck, { size: 18 }),
  });

export const showError = (title, message, theme = 'light', autoClose = 3500) =>
  notifications.show({
    ...notificationConfig,
    autoClose,
    title,
    message,
    color: getNotificationColor('error', theme),
    icon: createElement(IconX, { size: 18 }),
  });

export const showWarning = (title, message, theme = 'light', autoClose = 3500) =>
  notifications.show({
    ...notificationConfig,
    autoClose,
    title,
    message,
    color: getNotificationColor('warning', theme),
    icon: createElement(IconAlertTriangle, { size: 18 }),
  });

export const showInfo = (title, message, theme = 'light', autoClose = 3500) =>
  notifications.show({
    ...notificationConfig,
    autoClose,
    title,
    message,
    color: getNotificationColor('info', theme),
    icon: createElement(IconInfoCircle, { size: 18 }),
  });

export const showPageNotAvailable = (pageName, theme = 'light') =>
  showWarning('Not Available Yet', `${pageName} page is currently under development`, theme);

export const showMaintenanceMode = (pageName, theme = 'light') =>
  showWarning('Under Maintenance', `${pageName} is temporarily unavailable for maintenance`, theme);
