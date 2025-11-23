import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/home';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function Layout({ children }) {
  const location = useLocation();
  const hideNavFooterRoutes = [];
  const shouldHideNavFooter = hideNavFooterRoutes.includes(location.pathname);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {!shouldHideNavFooter && <Navbar />}
      {children}
      {!shouldHideNavFooter && <Footer />}
    </div>
  );
}
function App() {
  return (
    <ThemeProvider>
      <MantineProvider>
        <Notifications position="bottom-right" zIndex={9999} limit={3} />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </Layout>
        </Router>
      </MantineProvider>
    </ThemeProvider>
  );
}

export default App;
