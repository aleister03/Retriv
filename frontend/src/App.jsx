import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/home";
import AuthSuccess from "./pages/AuthSuccess";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import LostFoundPage from "./pages/LostFoundPage";
import MarketplacePage from "./pages/MarketplacePage";
import ExchangePage from "./pages/ExchangePage";
import HelpPage from "./pages/HelpPage";
import ChatWindows from "./components/messaging/ChatWindows";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }
  
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }
  
  // Redirect admins to dashboard instead of home
  if (user?.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
}

function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  
  // Routes where navbar and footer should be hidden
  const hideNavFooterRoutes = ["/auth/success"];
  const shouldHideNavFooter = hideNavFooterRoutes.includes(location.pathname) || 
                              location.pathname.startsWith("/admin");

  return (
    <>
      {!shouldHideNavFooter && <Navbar />}
      {children}
      {!shouldHideNavFooter && <Footer />}
      {user && <ChatWindows />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <MantineProvider>
        <Notifications position="top-right" zIndex={2077} />
        <Router>
          <AuthProvider>
            <SocketProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
                  <Route path="/auth/success" element={<AuthSuccess />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/lost-found" element={<LostFoundPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/exchange" element={<ExchangePage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </SocketProvider>
          </AuthProvider>
        </Router>
      </MantineProvider>
    </ThemeProvider>
  );
}

export default App;