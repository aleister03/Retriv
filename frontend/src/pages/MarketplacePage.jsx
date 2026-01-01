import { useState, useContext, useEffect } from "react";
import { Container, Group, Button, Select, Box, Text, Stack, Loader, Center } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/posts/PostCard";
import CreatePostModal from "../components/posts/CreatePostModal";
import { showError } from "../utils/notifications";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function MarketplacePage() {
  const { colors } = useContext(ThemeContext);
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [sort, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE}/posts`, {
        params: {
          type: 'marketplace',
          page,
          limit: 10,
          sort,
        },
        headers,
      });

      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      console.error('Error response:', error.response?.data);
      showError('Failed to load posts', error.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setCreateModalOpened(false);
    fetchPosts();
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  return (
    <Box style={{ minHeight: 'calc(100vh - 200px)', background: colors.background, paddingTop: '2rem', paddingBottom: '3rem' }}>
      <Container size="md">
        {/* Header */}
        <Stack gap="xs" mb="xl">
          <Text
            size="2.5rem"
            fw={700}
            style={{
              color: colors.textPrimary,
              lineHeight: 1.2,
            }}
          >
            Marketplace
          </Text>
          <Text
            size="1.1rem"
            style={{
              color: colors.textSecondary,
              marginBottom: '1rem',
            }}
          >
            Buy and sell products in your local community.
          </Text>
        </Stack>

        {/* Action Bar */}
        <Group justify="space-between" mb="xl">
          <Select
            value={sort}
            onChange={setSort}
            data={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
            ]}
            style={{ width: '200px' }}
            styles={{
              input: {
                background: colors.surface,
                borderColor: colors.borders,
                color: colors.textPrimary,
              },
            }}
          />
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => setCreateModalOpened(true)}
            style={{
              background: colors.primaryAccent,
              color: '#fff',
            }}
            size="md"
          >
            List Item
          </Button>
        </Group>

        {/* Posts Feed */}
        <Box style={{ maxWidth: '750px', margin: '0 auto' }}>
          {loading ? (
            <Center py={60}>
              <Loader size="lg" color={colors.primaryAccent} />
            </Center>
          ) : posts.length === 0 ? (
            <Center py={60}>
              <Text size="lg" c={colors.textSecondary}>
                No items listed yet. Be the first to sell something!
              </Text>
            </Center>
          ) : (
            <Stack gap="lg">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handlePostDeleted}
                  currentUserId={user?._id}
                  onUpdate={fetchPosts}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Container>

      <CreatePostModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handlePostCreated}
        type="marketplace"
      />
    </Box>
  );
}