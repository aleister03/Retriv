import { useState, useContext, useEffect } from "react";
import { TextInput, Button, Paper, Title, Group, Avatar, Stack, Container, FileInput, Text, Divider, Box, ActionIcon, Select, Badge, Loader, Tabs, Center } from "@mantine/core";
import { IconUpload, IconCamera, IconLock, IconLockOpen, IconEdit, IconBookmark, IconFileText } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { showSuccess, showError } from "../utils/notifications";
import PostCard from "../components/posts/PostCard";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const { theme, colors } = useContext(ThemeContext);
  
  // Tab state
  const [activeTab, setActiveTab] = useState("edit");
  
  // Form states
  const [form, setForm] = useState({
    name: user?.name || "",
    address: user?.address || "",
    gender: user?.gender || "",
    phoneNumber: user?.phoneNumber || "",
  });
  
  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  
  // Posts states
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);

  // Fetch posts when tab changes
  useEffect(() => {
    if (activeTab === 'posts' && token) {
      fetchMyPosts();
    } else if (activeTab === 'saved' && token) {
      fetchSavedPosts();
    }
  }, [activeTab, token]);

  const fetchMyPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await axios.get(`${API_BASE}/posts/my-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setMyPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch my posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      setSavedLoading(true);
      const response = await axios.get(`${API_BASE}/posts/bookmarked`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSavedPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
    } finally {
      setSavedLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setMyPosts(myPosts.filter(p => p._id !== postId));
    setSavedPosts(savedPosts.filter(p => p._id !== postId));
  };

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
      const res = await fetch(`${API_BASE}/auth/profile`, {
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

      const reader = new FileReader();
      const imageUrl = await new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target.result;
          if (result && typeof result === 'string') {
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
        reader.readAsDataURL(imageFile);
      });

      const res = await fetch(`${API_BASE}/auth/profile/picture`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePicture: imageUrl }),
      });

      const data = await res.json();

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
      const res = await fetch(`${API_BASE}/auth/profile/lock`, {
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
      <Container size="md" py={50}>
        <Center>
          <Text color={colors.textSecondary}>Please log in to view your profile</Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py={40} style={{ minHeight: 'calc(100vh - 200px)' }}>
      <Paper
        p="xl"
        radius="md"
        style={{
          background: colors.surface,
          border: `1px solid ${colors.borders}`,
        }}
      >
        <Group justify="space-between" mb="xl">
          <Title order={2} style={{ color: colors.textPrimary }}>
            My Profile
          </Title>
          <Group>
            <Badge 
              size="lg" 
              color={user?.isProfileLocked ? "red" : "green"}
              variant="light"
            >
              {user?.isProfileLocked ? "Locked" : "Unlocked"}
            </Badge>
            <Button
              leftSection={user?.isProfileLocked ? <IconLockOpen size={18} /> : <IconLock size={18} />}
              onClick={handleToggleLock}
              loading={lockLoading}
              color={user?.isProfileLocked ? "red" : "green"}
              variant="light"
            >
              {user?.isProfileLocked ? "Unlock" : "Lock"} Profile
            </Button>
          </Group>
        </Group>

        <Tabs 
          value={activeTab} 
          onChange={setActiveTab}
          styles={{
            root: {
              marginTop: '1rem',
            },
            list: {
              borderBottom: `1px solid ${colors.borders}`,
            },
            tab: {
              color: colors.textSecondary,
              fontSize: '0.95rem',
              fontWeight: 500,
              padding: '0.75rem 1.25rem',
              transition: 'all 0.2s',
              '&:hover': {
                background: colors.elevatedSurface,
                borderColor: colors.borders,
              },
              '&[data-active]': {
                color: colors.primaryAccent,
                borderColor: colors.primaryAccent,
              },
            },
            panel: {
              paddingTop: '1.5rem',
            },
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="edit" leftSection={<IconEdit size={18} />}>
              Edit Profile
            </Tabs.Tab>
            <Tabs.Tab value="posts" leftSection={<IconFileText size={18} />}>
              My Posts
            </Tabs.Tab>
            <Tabs.Tab value="saved" leftSection={<IconBookmark size={18} />}>
              Saved
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="edit">
            <Stack gap="md">
              <Group justify="center" mb="md">
                <Avatar
                  src={imagePreview}
                  size={120}
                  radius={120}
                  style={{
                    border: `3px solid ${colors.primaryAccent}`,
                  }}
                >
                  {form.name?.[0]?.toUpperCase()}
                </Avatar>
              </Group>

              <FileInput
                leftSection={<IconCamera size={18} />}
                label="Profile Picture"
                placeholder="Choose an image"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                clearable
                style={{ width: "100%" }}
                styles={{
                  label: { color: colors.textPrimary, marginBottom: '0.5rem' },
                  input: {
                    background: colors.elevatedSurface,
                    color: colors.textPrimary,
                    borderColor: colors.borders,
                  },
                }}
              />

              {imageFile && (
                <Button
                  fullWidth
                  onClick={handleSavePicture}
                  loading={pictureLoading}
                  color={colors.primaryAccent}
                  leftSection={<IconUpload size={18} />}
                >
                  {pictureLoading ? "Uploading..." : "Upload Profile Picture"}
                </Button>
              )}

              <Divider my="sm" color={colors.borders} />

              <TextInput
                label="Name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange("name")}
                required
                styles={{
                  label: { color: colors.textPrimary, marginBottom: '0.5rem' },
                  input: {
                    background: colors.elevatedSurface,
                    color: colors.textPrimary,
                    borderColor: colors.borders,
                  },
                }}
              />

              <TextInput
                label="Email"
                value={user?.email}
                disabled
                styles={{
                  label: { color: colors.textPrimary, marginBottom: '0.5rem' },
                  input: {
                    background: colors.elevatedSurface,
                    color: colors.textSecondary,
                    borderColor: colors.borders,
                  },
                }}
              />

              <TextInput
                label="Phone Number"
                placeholder="Your phone number"
                value={form.phoneNumber}
                onChange={handleChange("phoneNumber")}
                styles={{
                  label: { color: colors.textPrimary, marginBottom: '0.5rem' },
                  input: {
                    background: colors.elevatedSurface,
                    color: colors.textPrimary,
                    borderColor: colors.borders,
                  },
                }}
              />

              <Select
                label="Gender"
                placeholder="Select gender"
                value={form.gender}
                onChange={handleGenderChange}
                data={["Male", "Female"]}
                clearable
                styles={{
                  label: { color: colors.textPrimary, marginBottom: '0.5rem' },
                  input: {
                    background: colors.elevatedSurface,
                    color: colors.textPrimary,
                    borderColor: colors.borders,
                  },
                }}
              />

              <TextInput
                label="Address"
                placeholder="Your address"
                value={form.address}
                onChange={handleChange("address")}
                styles={{
                  label: { color: colors.textPrimary, marginBottom: '0.5rem' },
                  input: {
                    background: colors.elevatedSurface,
                    color: colors.textPrimary,
                    borderColor: colors.borders,
                  },
                }}
              />

              <Button
                fullWidth
                onClick={handleSaveProfile}
                loading={loading}
                mt="md"
                size="md"
                style={{
                  background: colors.primaryAccent,
                  color: '#fff',
                }}
              >
                Save Changes
              </Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="posts">
            {postsLoading ? (
              <Center py={60}>
                <Loader size="lg" color={colors.primaryAccent} />
              </Center>
            ) : myPosts.length === 0 ? (
              <Center py={60}>
                <Stack align="center" gap="md">
                  <IconFileText size={64} color={colors.textSecondary} stroke={1.5} />
                  <Text size="lg" fw={600} c={colors.textPrimary}>
                    No Posts Yet
                  </Text>
                  <Text size="sm" c={colors.textSecondary}>
                    You haven't created any posts. Start sharing now!
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="lg">
                {myPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={handlePostDeleted}
                    currentUserId={user?._id}
                    onUpdate={fetchMyPosts}
                  />
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="saved">
            {savedLoading ? (
              <Center py={60}>
                <Loader size="lg" color={colors.primaryAccent} />
              </Center>
            ) : savedPosts.length === 0 ? (
              <Center py={60}>
                <Stack align="center" gap="md">
                  <IconBookmark size={64} color={colors.textSecondary} stroke={1.5} />
                  <Text size="lg" fw={600} c={colors.textPrimary}>
                    No Saved Posts
                  </Text>
                  <Text size="sm" c={colors.textSecondary}>
                    Bookmark posts to see them here.
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="lg">
                {savedPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onDelete={handlePostDeleted}
                    currentUserId={user?._id}
                    onUpdate={fetchSavedPosts}
                  />
                ))}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
}

export default ProfilePage;