import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GoogleCallback from './pages/GoogleCallback';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MantineProvider>
          <Notifications position="top-center" zIndex={9999} limit={3} />
          <Router>
            <div style={{ 
              minHeight: '100vh', 
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-primary)',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
              </Routes>
              <Footer />
            </div>
          </Router>
        </MantineProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
