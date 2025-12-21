import { useState, useContext, useEffect } from "react";
import { Container, Group, Button, Select, Box, Text, Stack, Loader, Center } from "@mantine/core";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/posts/PostCard";
import CreatePostModal from "../components/posts/CreatePostModal";

// localStorage key
const POSTS_STORAGE_KEY = 'retriv_posts';

// Get posts from localStorage
const getStoredPosts = () => {
  try {
    const stored = localStorage.getItem(POSTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load posts from storage:', error);
    return [];
  }
};

// Save posts to localStorage
const savePostsToStorage = (posts) => {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to save posts to storage:', error);
  }
};

// Mock data - only used if no posts in storage
const mockPosts = [
  {
    _id: '1',
    title: 'Lost Laptop Charger',
    description: 'Lost my MacBook charger near the library on 3rd floor',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'],
    author: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '01712345678',
      gender: 'Male',
      address: 'Dhaka, Bangladesh',
      profilePicture: null,
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'lost-found',
  },
  {
    _id: '2',
    title: 'Found AirPods',
    description: 'Found AirPods Pro in the cafeteria yesterday',
    images: [
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
    ],
    author: {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '01812345678',
      gender: 'Female',
      address: 'Dhaka, Bangladesh',
      profilePicture: null,
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    type: 'lost-found',
  },
];

export default function PostsPage({ type = "lost-found", title = "Lost & Found" }) {
  const { colors } = useContext(ThemeContext);
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("newest");
  const [createModalOpened, setCreateModalOpened] = useState(false);

  useEffect(() => {
    // Load posts from localStorage or use mock data
    const storedPosts = getStoredPosts();
    if (storedPosts.length > 0) {
      setPosts(storedPosts);
    } else {
      // First time - load mock data
      setPosts(mockPosts);
      savePostsToStorage(mockPosts);
    }
  }, []);

  const handlePostCreated = (newPost) => {
    setCreateModalOpened(false);
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    savePostsToStorage(updatedPosts);
  };

  const handlePostDeleted = (postId) => {
    const updatedPosts = posts.filter(p => p._id !== postId);
    setPosts(updatedPosts);
    savePostsToStorage(updatedPosts);
  };

  return (
    <Box style={{ minHeight: '70vh', paddingTop: '2rem', paddingBottom: '3rem', background: colors.background }}>
      {/* Header with subtitle */}
      <Container size="xl" mb="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fz={28} fw={700} mb={4} style={{ color: colors.textPrimary }}>
              {title}
            </Text>
            <Text size="sm" c="dimmed">
              Post and discover lost or found items around your campus or city.
            </Text>
          </div>
          <Group>
            <Select
              value={sort}
              onChange={setSort}
              data={[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ]}
              size="sm"
              styles={{
                input: {
                  background: colors.elevatedSurface,
                  borderColor: colors.borders,
                  color: colors.textPrimary,
                },
              }}
            />
            <Button 
              size="sm" 
              radius="md" 
              style={{ backgroundColor: colors.primary }}
              onClick={() => setCreateModalOpened(true)}
            >
              Create Post
            </Button>
          </Group>
        </Group>
      </Container>

      {/* Posts with 750px container */}
      <Box style={{ maxWidth: '750px', margin: '0 auto', padding: '0 1rem' }}>
        {loading ? (
          <Center style={{ minHeight: '40vh' }}>
            <Loader />
          </Center>
        ) : posts.length === 0 ? (
          <Text c="dimmed" ta="center" mt="xl">No posts yet.</Text>
        ) : (
          <Stack gap="lg">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onDelete={handlePostDeleted}
                currentUserId={user?._id}
              />
            ))}
          </Stack>
        )}
      </Box>

      <CreatePostModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={handlePostCreated}
        type={type}
      />
    </Box>
  );
}
