import { useState, useContext, useEffect } from "react";
import { Card, Image, Text, Group, ActionIcon, Avatar, Button, Menu, Modal, Stack, Box, Badge, Select } from "@mantine/core";
import { IconBookmark, IconBookmarkFilled, IconFlag, IconMail, IconDots, IconTrash, IconEdit } from "@tabler/icons-react";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showPageNotAvailable, showError } from "../../utils/notifications";
import ViewUserModal from "../admin/ViewUserModal";
import ImagePreviewModal from "./ImagePreviewModal";
import VerificationRequestModal from "../verification/VerificationRequestModal";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

export default function PostCard({ post, onDelete, currentUserId, onUpdate }) {
  const { colors } = useContext(ThemeContext);
  const { token, user } = useAuth();

  // Initialize states
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const [availability, setAvailability] = useState(post.availability || 'Available');
  const [userModalOpened, setUserModalOpened] = useState(false);
  const [imagePreviewOpened, setImagePreviewOpened] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [availabilityModalOpened, setAvailabilityModalOpened] = useState(false);
  const [reportModalOpened, setReportModalOpened] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  // New states for verification
  const [verificationModalOpened, setVerificationModalOpened] = useState(false);
  const [verificationType, setVerificationType] = useState('');

  // Update states when post prop changes
  useEffect(() => {
    setBookmarked(post.isBookmarked || false);
    setAvailability(post.availability || 'Available');
  }, [post.isBookmarked, post.availability]);

  const isOwner = currentUserId === post.author?._id;

  const handleBookmark = async () => {
    if (!token) {
      showError('Please login to bookmark posts');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/posts/${post._id}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setBookmarked(response.data.isBookmarked);
        showSuccess(response.data.message);
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      showError('Failed to bookmark post', error.response?.data?.message);
    }
  };

  const handleUpdateAvailability = async (newAvailability) => {
    try {
      setUpdatingAvailability(true);
      const response = await axios.patch(
        `${API_BASE}/posts/${post._id}/availability`,
        { availability: newAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAvailability(newAvailability);
        showSuccess('Availability updated', response.data.message);
        setAvailabilityModalOpened(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Update availability error:', error);
      showError('Failed to update availability', error.response?.data?.message);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!token) {
      showError('Please login to report posts');
      return;
    }

    if (!reportReason) {
      showError('Please select a reason');
      return;
    }

    try {
      setSubmittingReport(true);
      await axios.post(
        `${API_BASE}/posts/${post._id}/report`,
        { reason: reportReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess('Post reported to admin', 'The admin team will review this post');
      setReportModalOpened(false);
      setReportReason('');
    } catch (error) {
      console.error('Report error:', error);
      showError(
        'Failed to report post',
        error.response?.data?.message || 'Please try again'
      );
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleVerificationAction = (type) => {
    if (!token) {
      showError('Please login to continue');
      return;
    }

    setVerificationType(type);
    setVerificationModalOpened(true);
  };

  const openChatWithOwner = () => {
    if (!token) {
      showError("Please login to chat");
      return;
    }

  
    const conversationId = [currentUserId, post.author._id || post.author.id]
      .sort()
      .join("_") + "_" + post._id;

    if (window.openChat) {
      window.openChat({
        conversationId,
        post: {
          id: post._id || post.id,
          title: post.title,
          images: post.images,
          type: post.type,
          availability: post.availability,
        },
        otherUser: post.author,
        minimized: false,
      });
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImagePreviewOpened(true);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${API_BASE}/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess('Post deleted successfully', 'Your reputation points have been adjusted');
      setDeleteConfirmOpened(false);
      onDelete(post._id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete post', error.response?.data?.message);
    } finally {
      setDeleting(false);
    }
  };

  // Get availability badge color
  const getAvailabilityColor = () => {
    if (availability === 'Available') return 'green';
    if (availability === 'Reserved') return 'yellow';
    return 'red';
  };

  // Render action buttons based on post type
  const renderActionButtons = () => {
    if (isOwner) {
      return null;
    }

    // Block actions for unavailable items
    if (availability === 'Unavailable') {
      return (
        <Badge color="red" size="lg" variant="filled">
          No Longer Available
        </Badge>
      );
    }

    // Block actions for reserved items (except for owner/renter)
    if (availability === 'Reserved') {
      return (
        <Group>
          <Badge color="yellow" size="lg">
            Currently Reserved
          </Badge>
          <Button
            variant="light"
            size="sm"
            onClick={openChatWithOwner}
            leftIcon={<IconMail size={16} />}
          >
            Chat
          </Button>
        </Group>
      );
    }

    if (post.type === 'exchange') {
      return (
        <Group gap="xs" grow>
          {post.exchangeType === 'Borrow' && (
            <Button
              onClick={() => handleVerificationAction('borrow')}
              style={{
                background: colors.primaryAccent,
                color: '#fff',
              }}
              size="sm"
            >
              Borrow Item
            </Button>
          )}
          {post.exchangeType === 'Rent' && (
            <Button
              onClick={() => handleVerificationAction('rent')}
              style={{
                background: colors.primaryAccent,
                color: '#fff',
              }}
              size="sm"
            >
              Rent Item
            </Button>
          )}
          {post.exchangeType === 'Swap' && (
            <Button
              onClick={() => handleVerificationAction('swap')}
              style={{
                background: colors.primaryAccent,
                color: '#fff',
              }}
              size="sm"
            >
              Swap Item
            </Button>
          )}
          <Button
            onClick={openChatWithOwner}
            variant="light"
            style={{
              color: colors.primaryAccent,
            }}
            size="sm"
          >
            Chat
          </Button>
        </Group>
      );
    }

    if (post.type === 'marketplace') {
      return (
        <Group gap="xs" grow>
          <Button
            onClick={() => handleVerificationAction('purchase')}
            style={{
              background: colors.primaryAccent,
              color: '#fff',
            }}
            size="sm"
          >
            Buy Item
          </Button>
          <Button
            onClick={openChatWithOwner}
            variant="light"
            style={{
              color: colors.primaryAccent,
            }}
            size="sm"
          >
            Chat
          </Button>
        </Group>
      );
    }

    if (post.type === 'lost-found') {
      return (
        <Group gap="xs" grow>
          <Button
            onClick={() => handleVerificationAction('claim')}
            style={{
              background: colors.primaryAccent,
              color: '#fff',
            }}
            size="sm"
          >
            Claim Item
          </Button>
          <Button
            onClick={() => handleVerificationAction('return')}
            variant="light"
            style={{
              color: colors.secondaryAccent,
            }}
            size="sm"
          >
            Return Item
          </Button>
          <Button
            onClick={openChatWithOwner}
            variant="light"
            style={{
              color: colors.primaryAccent,
            }}
            size="sm"
          >
            Chat
          </Button>
        </Group>
      );
    }

    return null;
  };

  return (
    <>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        style={{
          background: colors.surface,
          border: `1px solid ${colors.borders}`,
          marginBottom: '1rem',
        }}
      >
        {/* User Info Header */}
        <Group justify="space-between" mb="md">
          <Group
            gap="sm"
            style={{ cursor: 'pointer' }}
            onClick={() => setUserModalOpened(true)}
          >
            <Avatar src={post.author?.profilePicture} radius="xl" size="md">
              {post.author?.name?.[0] || 'U'}
            </Avatar>
            <Box>
              <Text size="sm" fw={600} c={colors.textPrimary}>
                {post.author?.name}
              </Text>
              <Text size="xs" c={colors.textSecondary}>
                {formatDateTime(post.createdAt)}
              </Text>
            </Box>
          </Group>

          <Group gap="xs">
            <ActionIcon
              onClick={handleBookmark}
              variant="subtle"
              color={bookmarked ? 'yellow' : 'gray'}
            >
              {bookmarked ? <IconBookmarkFilled size={20} /> : <IconBookmark size={20} />}
            </ActionIcon>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconDots size={20} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.borders}`,
                }}
              >
                {!isOwner && (
                  <Menu.Item
                    leftSection={<IconFlag size={16} />}
                    color="orange"
                    onClick={() => setReportModalOpened(true)}
                    styles={{
                      item: { color: colors.textPrimary }
                    }}
                  >
                    Report Post
                  </Menu.Item>
                )}

                {isOwner && post.type === 'exchange' && (
                  <Menu.Item
                    leftSection={<IconEdit size={16} />}
                    color="blue"
                    onClick={() => setAvailabilityModalOpened(true)}
                    styles={{
                      item: { color: colors.textPrimary }
                    }}
                  >
                    Change Availability
                  </Menu.Item>
                )}

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
        <Text size="lg" fw={600} mb="xs" c={colors.textPrimary}>
          {post.title}
        </Text>

        {/* Marketplace specific: Price and Condition badges */}
        {post.type === 'marketplace' && (
          <Group gap="xs" mb="sm">
            {post.price !== undefined && post.price > 0 && (
              <Badge color="green" variant="light" size="lg">
                ৳ {post.price.toLocaleString()}
              </Badge>
            )}
            {post.condition && (
              <Badge color="blue" variant="light">
                {post.condition}
              </Badge>
            )}
          </Group>
        )}

        {/* Exchange specific: Type, Duration, Price, and Availability badges */}
        {post.type === 'exchange' && (
          <Group gap="xs" mb="sm">
            {post.exchangeType && (
              <Badge color="purple" variant="light">
                {post.exchangeType === 'Rent' ? '🏠 For Rent' :
                  post.exchangeType === 'Borrow' ? '🤝 For Borrow' : '🔄 For Swap'}
              </Badge>
            )}

            {/* Availability Badge */}
            <Badge color={getAvailabilityColor()} variant="filled">
              {availability}
            </Badge>

            {post.duration && (
              <Badge color="cyan" variant="light">
                ⏱️ {post.duration}
              </Badge>
            )}

            {post.exchangeType === 'Rent' && post.rentalPrice > 0 && (
              <Badge color="green" variant="light" size="lg">
                ৳ {post.rentalPrice.toLocaleString()}/{post.duration || 'period'}
              </Badge>
            )}

            {(post.exchangeType === 'Borrow' || post.exchangeType === 'Swap') && (
              <Badge color="teal" variant="light">
                ✨ Free
              </Badge>
            )}
          </Group>
        )}

        <Text size="sm" c={colors.textSecondary} mb="md">
          {post.description}
        </Text>

        {post.location && post.type === 'lost-found' && (
          <Text size="sm" c={colors.textSecondary} mb="md">
            📍 {post.location}
          </Text>
        )}

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <Box mb="md">
            {post.images.length === 1 ? (
              <Image
                src={post.images[0]}
                height={300}
                fit="cover"
                radius="md"
                style={{ cursor: 'pointer' }}
                onClick={() => handleImageClick(post.images[0])}
              />
            ) : post.images.length === 2 ? (
              <Group gap="xs">
                {post.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    height={250}
                    style={{ flex: 1, cursor: 'pointer' }}
                    fit="cover"
                    radius="md"
                    onClick={() => handleImageClick(img)}
                  />
                ))}
              </Group>
            ) : (
              <Group gap="xs" align="stretch">
                <Image
                  src={post.images[0]}
                  height={300}
                  style={{ flex: 1.5, cursor: 'pointer' }}
                  fit="cover"
                  radius="md"
                  onClick={() => handleImageClick(post.images[0])}
                />
                <Stack gap="xs" style={{ flex: 1 }}>
                  {post.images.slice(1, 3).map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      height={145}
                      fit="cover"
                      radius="md"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleImageClick(img)}
                    />
                  ))}
                </Stack>
              </Group>
            )}
          </Box>
        )}

        {/* Contact User / Action Buttons */}
        {!isOwner && (
          <>
            <Group
              p="sm"
              style={{
                borderTop: `1px solid ${colors.borders}`,
              }}
            >
              <Avatar
                src={post.author?.profilePicture}
                size="md"
                radius="xl"
                style={{ cursor: 'pointer' }}
                onClick={() => setUserModalOpened(true)}
              >
                {post.author?.name?.[0] || 'U'}
              </Avatar>
              <Box style={{ flex: 1 }}>
                <Text
                  size="sm"
                  fw={600}
                  c={colors.textPrimary}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setUserModalOpened(true)}
                >
                  {post.author?.name}
                </Text>
              </Box>
            </Group>

            {/* Action Buttons */}
            <Box px="sm" pb="sm">
              {renderActionButtons()}
            </Box>
          </>
        )}
      </Card>

      {/* Modals */}
      <ViewUserModal
        opened={userModalOpened}
        onClose={() => setUserModalOpened(false)}
        user={post.author}
      />

      <ImagePreviewModal
        opened={imagePreviewOpened}
        onClose={() => setImagePreviewOpened(false)}
        imageUrl={selectedImage}
        allImages={post.images}
      />

      {/* Verification Request Modal */}
      <VerificationRequestModal
        opened={verificationModalOpened}
        onClose={() => {
          setVerificationModalOpened(false);
          setVerificationType('');
        }}
        post={post}
        verificationType={verificationType}
      />

      {/* Delete Confirmation Modal */}
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
        <Stack gap="md">
          <Text size="sm" c={colors.textSecondary}>
            Are you sure you want to delete this post? This action cannot be undone and will deduct 10 reputation points.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteConfirmOpened(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Change Availability Modal */}
      <Modal
        opened={availabilityModalOpened}
        onClose={() => setAvailabilityModalOpened(false)}
        title="Change Availability"
        size="sm"
        centered
        styles={{
          content: { background: colors.surface },
          header: { background: colors.surface, borderBottom: `1px solid ${colors.borders}` },
          title: { fontWeight: 700, color: colors.textPrimary },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c={colors.textSecondary}>
            Update the availability status of your exchange item
          </Text>

          <Select
            label="Availability Status"
            value={availability}
            onChange={setAvailability}
            data={[
              { value: 'Available', label: 'Available' },
              { value: 'Reserved', label: 'Reserved' },
              { value: 'Unavailable', label: 'Unavailable' },
            ]}
            styles={{
              input: {
                background: colors.elevatedSurface,
                borderColor: colors.borders,
                color: colors.textPrimary,
              },
            }}
          />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setAvailabilityModalOpened(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleUpdateAvailability(availability)}
              loading={updatingAvailability}
              style={{
                background: colors.primaryAccent,
                color: '#fff',
              }}
            >
              Update
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Report Post Modal */}
      <Modal
        opened={reportModalOpened}
        onClose={() => {
          setReportModalOpened(false);
          setReportReason('');
        }}
        title="Report Post"
        size="sm"
        centered
        styles={{
          content: { background: colors.surface },
          header: {
            background: colors.surface,
            borderBottom: `1px solid ${colors.borders}`
          },
          title: { fontWeight: 700, color: colors.textPrimary },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c={colors.textSecondary}>
            Help us understand what's wrong with this post. Your report will be reviewed by our admin team.
          </Text>

          <Select
            label="Reason for reporting"
            placeholder="Select a reason"
            value={reportReason}
            onChange={setReportReason}
            data={[
              'Spam',
              'Inappropriate Content',
              'Misleading Information',
              'Duplicate Post',
              'Fraud/Scam',
              'Other',
            ]}
            required
            styles={{
              label: { color: colors.textPrimary },
              input: {
                background: colors.elevatedSurface,
                borderColor: colors.borders,
                color: colors.textPrimary
              },
            }}
          />

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => {
                setReportModalOpened(false);
                setReportReason('');
              }}
              style={{
                borderColor: colors.borders,
                color: colors.textPrimary
              }}
            >
              Cancel
            </Button>
            <Button
              color="orange"
              onClick={handleReportSubmit}
              loading={submittingReport}
              disabled={!reportReason}
            >
              Submit Report
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}