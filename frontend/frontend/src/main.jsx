import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App.jsx';
import './index.css';
import { theme } from './theme/mantineTheme.js';

const mantineTheme = createTheme(theme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={mantineTheme} defaultColorScheme="light">
      <Notifications />
      <App />
    </MantineProvider>
  </StrictMode>
);

