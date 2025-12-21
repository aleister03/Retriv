import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/home";
import AuthSuccess from "./pages/AuthSuccess";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import PostsPage from "./pages/PostsPage";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route
          path="/lost-found"
          element={<PostsPage type="lost-found" title="Lost & Found" />}
        />
        <Route
          path="/marketplace"
          element={<PostsPage type="marketplace" title="Marketplace" />}
        />
        <Route
          path="/exchange"
          element={<PostsPage type="exchange" title="Exchange" />}
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MantineProvider>
        <Notifications />
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </MantineProvider>
    </ThemeProvider>
  );
}

