import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';
import { createElement } from 'react';

// Standard notification styles
const notificationConfig = {
  autoClose: 3000,
  withCloseButton: true,
};

// Success notification
export const showSuccess = (title, message) => {
  notifications.show({
    ...notificationConfig,
    title: title,
    message: message,
    color: 'green',
    icon: createElement(IconCheck, { size: 18 }),
  });
};

// Error notification
export const showError = (title, message) => {
  notifications.show({
    ...notificationConfig,
    title: title,
    message: message,
    color: 'red',
    icon: createElement(IconX, { size: 18 }),
  });
};

// Warning notification (for "Not Available Yet")
export const showWarning = (title, message) => {
  notifications.show({
    ...notificationConfig,
    title: title,
    message: message,
    color: 'yellow',
    icon: createElement(IconAlertTriangle, { size: 18 }),
  });
};

// Info notification
export const showInfo = (title, message) => {
  notifications.show({
    ...notificationConfig,
    title: title,
    message: message,
    color: 'blue',
    icon: createElement(IconInfoCircle, { size: 18 }),
  });
};

// Page not available notification (reusable for all pages)
export const showPageNotAvailable = (pageName) => {
  showWarning(
    'Not Available Yet',
    `${pageName} page is currently under development`
  );
};

// Maintenance notification
export const showMaintenanceMode = (pageName) => {
  showWarning(
    'Under Maintenance',
    `${pageName} is temporarily unavailable for maintenance`
  );
};
