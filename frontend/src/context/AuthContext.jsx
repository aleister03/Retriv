import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (jwt) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/profile",
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      setUser(response.data.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      
      if (error.response?.data?.isBanned || error.response?.data?.isSuspended) {
        localStorage.removeItem("authToken");
        setUser(null);
        setIsLoggedIn(false);
        setToken(null);
      } else {
        localStorage.removeItem("authToken");
        setUser(null);
        setIsLoggedIn(false);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback((jwt, userData) => {
    localStorage.setItem("authToken", jwt);
    setToken(jwt);
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsLoggedIn(false);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        loading,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);