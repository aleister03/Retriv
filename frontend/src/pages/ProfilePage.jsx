import { useState, useContext } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Group,
  Avatar,
  Stack,
  Container,
  FileInput,
  Text,
  Divider,
  Box,
  ActionIcon,
  Select,
  Badge,
  Loader,
} from "@mantine/core";
import { IconUpload, IconCamera, IconLock, IconLockOpen } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { showSuccess, showError } from "../utils/notifications";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/auth";

function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const { theme, colors } = useContext(ThemeContext);
  
  const [form, setForm] = useState({
    name: user?.name || "",
    address: user?.address || "",
    gender: user?.gender || "",
    phoneNumber: user?.phoneNumber || "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || null);
  const [loading, setLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.currentTarget.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderChange = (value) => {
    setForm((prev) => ({ ...prev, gender: value }));
  };

  const handleImageChange = (file) => {
    if (file) {
      
      if (file.size > 5 * 1024 * 1024) {
        showError("Image size should be less than 5MB");
        return;
      }
      
      
      if (!file.type.startsWith('image/')) {
        showError("Please select an image file");
        return;
      }
      
      console.log("File selected:", file.name, file.type, file.size);
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) {
      showError("You must be logged in to update profile");
      return;
    }

    if (!form.name.trim()) {
      showError("Name is required");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          gender: form.gender,
          phoneNumber: form.phoneNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.user);
      showSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePicture = async () => {
    if (!token) {
      showError("You must be logged in to update picture");
      return;
    }

    if (!imageFile) {
      showError("Please select an image");
      return;
    }

    try {
      setPictureLoading(true);
      console.log("Starting image upload...");

      
      const reader = new FileReader();
      
      const imageUrl = await new Promise((resolve, reject) => {
        reader.onload = (e) => {
          console.log("FileReader loaded successfully");
          const result = e.target.result;
          if (result && typeof result === 'string') {
            console.log("Base64 length:", result.length);
            resolve(result);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          reject(new Error("Failed to read file"));
        };
        
        reader.onabort = () => {
          console.error("FileReader aborted");
          reject(new Error("File reading was aborted"));
        };
        
        console.log("Starting to read file...");
        reader.readAsDataURL(imageFile);
      });

      console.log("Sending image to server...");
      const res = await fetch(`${API_BASE}/profile/picture`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePicture: imageUrl }),
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update picture");
      }

      setUser(data.user);
      setImageFile(null);
      setImagePreview(data.user.profilePicture);
      showSuccess("Profile picture updated successfully!");
    } catch (err) {
      console.error("Profile picture update error:", err);
      showError(err.message || "Failed to upload picture");
    } finally {
      setPictureLoading(false);
    }
  };

  const handleToggleLock = async () => {
    if (!token) {
      showError("You must be logged in");
      return;
    }

    try {
      setLockLoading(true);
      const res = await fetch(`${API_BASE}/profile/lock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to toggle lock");
      }

      setUser(data.user);
      showSuccess(
        data.isProfileLocked 
          ? "Profile locked successfully!" 
          : "Profile unlocked successfully!"
      );
    } catch (err) {
      showError(err.message);
    } finally {
      setLockLoading(false);
    }
  };

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Paper 
          shadow="md" 
          p="xl" 
          radius="md" 
          withBorder
          style={{ 
            background: colors.surface,
            borderColor: colors.borders,
          }}
        >
          <Text size="lg" ta="center" style={{ color: colors.textPrimary }}>
            Please log in to view your profile
          </Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Box style={{ background: colors.background, minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Container size="sm">
        <Paper 
          shadow="md" 
          p="xl" 
          radius="md" 
          withBorder
          style={{ 
            background: colors.surface,
            borderColor: colors.borders,
          }}
        >
          <Group justify="space-between" mb="lg">
            <Title order={2} style={{ color: colors.textPrimary }}>
              Edit Profile
            </Title>
            <Group>
              <Badge color={user?.isProfileLocked ? "red" : "green"}>
                {user?.isProfileLocked ? "Locked" : "Unlocked"}
              </Badge>
              <Button
                variant="outline"
                leftSection={user?.isProfileLocked ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                onClick={handleToggleLock}
                loading={lockLoading}
                color={user?.isProfileLocked ? "red" : "green"}
              >
                {user?.isProfileLocked ? "Unlock" : "Lock"} Profile
              </Button>
            </Group>
          </Group>

          {/* Profile Picture Section */}
          <Stack align="center" mb="xl">
            <Box pos="relative">
              <Avatar
                src={imagePreview}
                size={120}
                radius={120}
                alt={form.name}
                style={{ border: `3px solid ${colors.primaryAccent}` }}
              >
                {form.name?.[0]?.toUpperCase()}
              </Avatar>
              <ActionIcon
                variant="filled"
                radius="xl"
                size="lg"
                pos="absolute"
                bottom={0}
                right={0}
                style={{ 
                  cursor: "pointer",
                  background: colors.primaryAccent,
                }}
              >
                <IconCamera size={18} />
              </ActionIcon>
            </Box>

            <FileInput
              placeholder="Choose profile picture"
              leftSection={<IconUpload size={18} />}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              clearable
              style={{ width: "100%" }}
              styles={{
                input: {
                  background: colors.elevatedSurface,
                  color: colors.textPrimary,
                  borderColor: colors.borders,
                }
              }}
            />

            {imageFile && (
              <Button
                onClick={handleSavePicture}
                loading={pictureLoading}
                variant="light"
                fullWidth
              >
                {pictureLoading ? "Uploading..." : "Upload Profile Picture"}
              </Button>
            )}
          </Stack>

          <Divider 
            my="lg" 
            label="Personal Information" 
            labelPosition="center"
            style={{ borderColor: colors.borders }}
            styles={{
              label: { color: colors.textSecondary }
            }}
          />

          {/* Profile Form */}
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange("name")}
              required
              withAsterisk
              styles={{
                input: {
                  background: colors.elevatedSurface,
                  color: colors.textPrimary,
                  borderColor: colors.borders,
                },
                label: { color: colors.textPrimary }
              }}
            />

            <TextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              value={form.phoneNumber}
              onChange={handleChange("phoneNumber")}
              type="tel"
              styles={{
                input: {
                  background: colors.elevatedSurface,
                  color: colors.textPrimary,
                  borderColor: colors.borders,
                },
                label: { color: colors.textPrimary }
              }}
            />

            <Select
              label="Gender"
              placeholder="Select your gender"
              value={form.gender}
              onChange={handleGenderChange}
              data={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
              ]}
              clearable
              styles={{
                input: {
                  background: colors.elevatedSurface,
                  color: colors.textPrimary,
                  borderColor: colors.borders,
                },
                label: { color: colors.textPrimary },
                dropdown: {
                  background: colors.elevatedSurface,
                  borderColor: colors.borders,
                },
                option: {
                  color: colors.textPrimary,
                  '&[data-selected]': {
                    background: colors.primaryAccent,
                  },
                  '&:hover': {
                    background: colors.hoverAccent,
                  }
                }
              }}
            />

            <TextInput
              label="Address"
              placeholder="Enter your address"
              value={form.address}
              onChange={handleChange("address")}
              styles={{
                input: {
                  background: colors.elevatedSurface,
                  color: colors.textPrimary,
                  borderColor: colors.borders,
                },
                label: { color: colors.textPrimary }
              }}
            />

            <Text size="sm" c="dimmed" style={{ color: colors.textSecondary }}>
              Email: {user?.email}
            </Text>

            <Group justify="flex-end" mt="md">
              <Button
                onClick={handleSaveProfile}
                loading={loading}
                size="md"
                style={{ background: colors.primaryAccent }}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default ProfilePage;
