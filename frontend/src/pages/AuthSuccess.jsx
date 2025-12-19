import { useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader, Center, Text, Box } from "@mantine/core";
import { AuthContext } from "../context/AuthContext";
import { showSuccess, showInfo, showError } from "../utils/notifications";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/auth";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const token = searchParams.get("token");
    const isNewUser = searchParams.get("isNewUser") === "true";

    console.log("AuthSuccess - Received params:", {
      token: token ? token.substring(0, 20) + "..." : null,
      isNewUser,
    });

    if (!token) {
      console.error("Missing token in auth success URL");
      showError("Login failed. Missing token.");
      navigate("/", { replace: true });
      return;
    }

    hasProcessed.current = true;

    // Save token immediately so other parts of the app can use it
    localStorage.setItem("authToken", token);

    // Fetch full user profile from backend
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("AuthSuccess - profile response:", data);

        if (!res.ok || !data.success || !data.user) {
          throw new Error(data.message || "Failed to load profile");
        }

        const userData = {
          name: data.user.name,
          email: data.user.email,
          profilePicture: data.user.profilePicture || "",
          phoneNumber: data.user.phoneNumber || "",
          gender: data.user.gender || "",
          address: data.user.address || "",
          isProfileLocked: data.user.isProfileLocked,
          reputationScore: data.user.reputationScore,
          isVerified: data.user.isVerified,
        };

        console.log("AuthSuccess - logging in with userData:", userData);

        // Use your existing login helper to update context
        login(token, userData);

        if (isNewUser) {
          showInfo(
            "Welcome to Retriv!",
            `Hi ${userData.name}! Your account has been created successfully 🎉`
          );
        } else {
          showSuccess("Welcome Back!", `Good to see you again, ${userData.name}!`);
        }

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      } catch (err) {
        console.error("AuthSuccess - profile fetch error:", err);
        showError("Login failed while loading your profile.");
        navigate("/", { replace: true });
      }
    };

    fetchProfile();
  }, [searchParams, navigate, login]);

  return (
    <Center
      style={{
        height: "100vh",
        backgroundColor: "var(--bg-color)",
        transition: "background-color 0.3s ease",
      }}
    >
      <Box style={{ textAlign: "center" }}>
        <Loader size="lg" color="var(--primary-accent)" />
        <Text mt="lg" size="lg" style={{ color: "var(--text-primary)" }}>
          Completing login...
        </Text>
      </Box>
    </Center>
  );
}
