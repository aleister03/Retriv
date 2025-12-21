import { useState, useContext } from "react";
import { Card, Image, Text, Group, ActionIcon, Avatar, Button, Menu, Modal, Stack } from "@mantine/core";
import { IconBookmark, IconBookmarkFilled, IconFlag, IconMail, IconDots, IconTrash } from "@tabler/icons-react";
import { ThemeContext } from "../../context/ThemeContext";
import { showSuccess, showPageNotAvailable } from "../../utils/notifications";
import ViewUserModal from "../admin/ViewUserModal";
import ImagePreviewModal from "./ImagePreviewModal";

// Format date as MM/DD/YYYY H:MM AM/PM
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

export default function PostCard({ post, onDelete, currentUserId }) {
  const { colors } = useContext(ThemeContext);
  const [bookmarked, setBookmarked] = useState(false);
  const [userModalOpened, setUserModalOpened] = useState(false);
  const [imagePreviewOpened, setImagePreviewOpened] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);

  const isOwner = currentUserId === post.author?._id;

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    showSuccess(bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleReport = () => {
    showSuccess('Post reported to admin', 'The admin team will review this post');
  };

  const handleContact = () => {
    showPageNotAvailable('Messaging');
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImagePreviewOpened(true);
  };

  const handleDelete = () => {
    onDelete(post._id);
    setDeleteConfirmOpened(false);
    showSuccess('Post deleted successfully');
  };

  return (
    <>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          background: colors.surface,
          borderColor: colors.borders,
        }}
      >
        {/* User Info Header */}
        <Group justify="space-between" mb="md">
          <Group 
            gap="xs" 
            style={{ cursor: 'pointer' }} 
            onClick={() => setUserModalOpened(true)}
          >
            <Avatar src={post.author?.profilePicture} radius="xl" size="md" color="teal">
              {post.author?.name?.[0] || 'U'}
            </Avatar>
            <div>
              <Text fw={600} size="sm" style={{ color: colors.textPrimary }}>
                {post.author?.name}
              </Text>
              <Text size="xs" c="dimmed">
                {formatDateTime(post.createdAt)}
              </Text>
            </div>
          </Group>
          <Group gap="xs">
            <ActionIcon 
              variant="subtle" 
              onClick={handleBookmark}
              style={{ color: bookmarked ? colors.primary : colors.textSecondary }}
            >
              {bookmarked ? <IconBookmarkFilled size={20} /> : <IconBookmark size={20} />}
            </ActionIcon>
            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" style={{ color: colors.textSecondary }}>
                  <IconDots size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown style={{ background: colors.surface, borderColor: colors.borders }}>
                <Menu.Item 
                  leftSection={<IconFlag size={16} />} 
                  color="orange"
                  onClick={handleReport}
                  styles={{
                    item: { color: colors.textPrimary }
                  }}
                >
                  Report Post
                </Menu.Item>
                {isOwner && (
                  <Menu.Item 
                    leftSection={<IconTrash size={16} />} 
                    color="red"
                    onClick={() => setDeleteConfirmOpened(true)}
                  >
                    Delete Post
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Post Content */}
        <Text fw={600} size="lg" mb="xs" style={{ color: colors.textPrimary }}>
          {post.title}
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          {post.description}
        </Text>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            {post.images.length === 1 ? (
              <Image
                src={post.images[0]}
                height={350}
                radius="md"
                fit="cover"
                style={{ cursor: 'pointer' }}
                onClick={() => handleImageClick(post.images[0])}
              />
            ) : post.images.length === 2 ? (
              <Group gap="xs">
                {post.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    height={300}
                    style={{ flex: 1, cursor: 'pointer' }}
                    radius="md"
                    fit="cover"
                    onClick={() => handleImageClick(img)}
                  />
                ))}
              </Group>
            ) : (
              <Group gap="xs">
                <Image
                  src={post.images[0]}
                  height={300}
                  style={{ flex: 2, cursor: 'pointer' }}
                  radius="md"
                  fit="cover"
                  onClick={() => handleImageClick(post.images[0])}
                />
                <Stack gap="xs" style={{ flex: 1 }}>
                  {post.images.slice(1, 3).map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      height={145}
                      radius="md"
                      fit="cover"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleImageClick(img)}
                    />
                  ))}
                </Stack>
              </Group>
            )}
          </div>
        )}

        {/* Contact User */}
        <Group 
          style={{
            padding: '12px 16px',
            background: colors.elevatedSurface,
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          gap="xs"
          onClick={handleContact}
        >
          <Avatar src={post.author?.profilePicture} radius="xl" size="sm" color="teal">
            {post.author?.name?.[0] || 'U'}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500} style={{ color: colors.textPrimary }}>
              {post.author?.name}
            </Text>
          </div>
          <Button
            variant="filled"
            size="xs"
            leftSection={<IconMail size={14} />}
            style={{ 
              backgroundColor: colors.primary,
              pointerEvents: 'none',
            }}
          >
            Contact User
          </Button>
        </Group>
      </Card>

      <ViewUserModal
        opened={userModalOpened}
        onClose={() => setUserModalOpened(false)}
        user={post.author}
      />

      <ImagePreviewModal
        opened={imagePreviewOpened}
        onClose={() => setImagePreviewOpened(false)}
        imageUrl={selectedImage}
      />

      <Modal
        opened={deleteConfirmOpened}
        onClose={() => setDeleteConfirmOpened(false)}
        title="Delete Post"
        size="sm"
        centered
        styles={{
          content: { background: colors.surface },
          header: { background: colors.surface, color: colors.textPrimary },
          title: { fontWeight: 700, color: '#ff6b6b' },
        }}
      >
        <Text mb="md" style={{ color: colors.textPrimary }}>
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
    </>
  );
}
