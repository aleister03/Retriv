import { useState, useEffect, useContext } from 'react';
import { Table, Avatar, Group, Text, ActionIcon, Menu, TextInput, Select, Pagination, Box, Loader, Center, ScrollArea, Button, Modal } from '@mantine/core';
import { IconDotsVertical, IconEye, IconTrash, IconSearch } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../utils/notifications';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Format date
const formatDateTime = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
};

export default function PostsTab({ onPostUpdate }) {
  const { colors } = useContext(ThemeContext);
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    postsPerPage: 10,
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page, search, typeFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/posts`, {
        params: {
          page,
          limit: 10,
          search,
          type: typeFilter,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      showError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (post) => {
    setSelectedPost(post);
    setViewModalOpened(true);
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setDeleteConfirmOpened(true);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE}/admin/posts/${selectedPost._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showSuccess('Post Deleted', response.data.message);
        fetchPosts();
        if (onPostUpdate) onPostUpdate();
        setDeleteConfirmOpened(false);
      }
    } catch (error) {
      showError('Failed to delete post', error.response?.data?.message);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Center py={60}>
        <Loader size="lg" color={colors.primaryAccent} />
      </Center>
    );
  }

  return (
    <Box>
      {/* Search and Filters */}
      <Group mb="lg" gap="md">
        <TextInput
          placeholder="Search posts by title..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
          styles={{
            input: {
              background: colors.elevatedSurface,
              borderColor: colors.borders,
              color: colors.textPrimary,
            },
          }}
        />
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          data={[
            { value: 'all', label: 'All Types' },
            { value: 'lost-found', label: 'Lost & Found' },
            { value: 'marketplace', label: 'Marketplace' },
            { value: 'exchange', label: 'Exchange' },
          ]}
          style={{ width: '200px' }}
          styles={{
            input: {
              background: colors.elevatedSurface,
              borderColor: colors.borders,
              color: colors.textPrimary,
            },
          }}
        />
      </Group>

      {/* Posts Table */}
      <ScrollArea>
        <Table
          striped
          highlightOnHover
          styles={{
            table: { background: colors.surface },
            thead: { background: colors.elevatedSurface },
            tr: {
              '&:hover': { background: colors.elevatedSurface },
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ color: colors.textPrimary }}>User</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Post Title</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Type</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Time</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {posts.map((post) => (
              <Table.Tr key={post._id}>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar
                      src={post.author?.profilePicture}
                      radius="xl"
                      size="sm"
                    >
                      {post.author?.name?.[0]}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500} c={colors.textPrimary}>
                        {post.author?.name}
                      </Text>
                      <Text size="xs" c={colors.textSecondary}>
                        {post.author?.email}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={colors.textPrimary} lineClamp={1}>
                    {post.title}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={colors.textPrimary} tt="capitalize">
                    {post.type?.replace('-', ' & ')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c={colors.textSecondary}>
                    {formatDateTime(post.createdAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleView(post)}
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeleteClick(post)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            value={page}
            onChange={setPage}
            total={pagination.totalPages}
            color={colors.primaryAccent}
          />
        </Group>
      )}

      {/* View Post Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="Post Details"
        size="lg"
        centered
        styles={{
          content: { background: colors.surface },
          header: { background: colors.surface, borderBottom: `1px solid ${colors.borders}` },
          title: { fontSize: '1.25rem', fontWeight: 700, color: colors.textPrimary },
        }}
      >
        {selectedPost && (
          <Box>
            <Text fw={700} size="lg" c={colors.textPrimary} mb="sm">
              {selectedPost.title}
            </Text>
            <Text size="sm" c={colors.textPrimary} mb="md" style={{ whiteSpace: 'pre-wrap' }}>
              {selectedPost.description}
            </Text>
            {selectedPost.location && (
              <Text size="sm" c={colors.textSecondary} mb="md">
                📍 {selectedPost.location}
              </Text>
            )}
            <Group gap="xs" mb="md">
              {selectedPost.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Post image ${idx + 1}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: `1px solid ${colors.borders}`,
                  }}
                />
              ))}
            </Group>
            <Text size="sm" c={colors.textSecondary}>
              Posted by: {selectedPost.author?.name} ({selectedPost.author?.email})
            </Text>
            <Text size="xs" c={colors.textSecondary}>
              {formatDateTime(selectedPost.createdAt)}
            </Text>
          </Box>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmOpened}
        onClose={() => setDeleteConfirmOpened(false)}
        title="Delete Post"
        size="sm"
        centered
        styles={{
          content: { background: colors.surface },
          header: { background: colors.surface },
          title: { fontWeight: 700, color: '#ff6b6b' },
        }}
      >
        <Text c={colors.textPrimary} mb="lg">
          Are you sure you want to delete this post? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteConfirmOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
