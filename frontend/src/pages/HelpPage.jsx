import { useState, useContext } from 'react';
import { Container, Title, Accordion, Text, Button, Stack, Box, Group, Paper, Modal, List, Alert } from '@mantine/core';
import { IconChevronDown, IconUser, IconFileText, IconShoppingCart, IconArrowsExchange, IconMessage, IconTrash, IconLock, IconAlertCircle, IconShieldCheck } from '@tabler/icons-react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError } from '../utils/notifications';
import TermsModal from '../components/layout/TermsModal';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function HelpPage() {
  const { colors } = useContext(ThemeContext);
  const { user, token, isLoggedIn, logout } = useAuth();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [termsModalOpened, setTermsModalOpened] = useState(false);

  const handleDeleteAccount = async () => {
    if (!isLoggedIn || !token) {
        showError('Login Required', 'Please login first to delete your account');
        return;
    }

    try {
        setDeleteLoading(true);
        const response = await axios.delete(
        `${API_BASE}/auth/delete-account`,
        { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
        showSuccess('Account Deleted', 'Your account has been permanently deleted');
        logout();
        setDeleteModalOpened(false);
        }
    } catch (error) {
        console.error('Delete account error:', error);
        showError('Failed to delete account', error.response?.data?.message || 'Please try again');
    } finally {
        setDeleteLoading(false);
    }
    };

  const accordionItemStyle = {
    background: colors.surface,
    border: `1px solid ${colors.borders}`,
    borderRadius: '12px',
    marginBottom: '1rem',
  };

  return (
    <Container size="lg" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <Box style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Title
          order={1}
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: '1rem',
          }}
        >
          Help & Support
        </Title>
        <Text
          size="lg"
          style={{
            color: colors.textSecondary,
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Find answers to common questions about using Retriv
        </Text>
      </Box>

      {/* Terms and Conditions Alert */}
      <Alert
        icon={<IconShieldCheck size={20} />}
        title="Important Safety Guidelines"
        color="blue"
        variant="light"
        style={{ marginBottom: '2rem' }}
      >
        <Group position="apart" style={{ alignItems: 'center' }}>
          <Text size="sm">
            Please read our terms and conditions before using Retriv services
          </Text>
          <Button
            size="sm"
            variant="light"
            onClick={() => setTermsModalOpened(true)}
          >
            View Terms
          </Button>
        </Group>
      </Alert>

      {/* Profile Section */}
      <Paper
        style={{
          background: colors.elevatedSurface,
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
        }}
      >
        <Group style={{ marginBottom: '1rem' }}>
          <IconUser size={24} color={colors.primaryAccent} />
          <Title order={2} style={{ color: colors.textPrimary, fontSize: '1.5rem' }}>
            Profile Management
          </Title>
        </Group>

        <Accordion
          variant="contained"
          chevronPosition="right"
          chevron={<IconChevronDown size={20} />}
          styles={{
            item: accordionItemStyle,
            control: {
              '&:hover': { background: colors.elevatedSurface },
            },
            label: {
              color: colors.textPrimary,
              fontWeight: 600,
            },
            content: {
              color: colors.textSecondary,
            },
          }}
        >
          <Accordion.Item value="login">
            <Accordion.Control>How do I login or create an account?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Text>
                  <strong>To create an account or login:</strong>
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Click the "Login / Sign up" button in the top right corner</List.Item>
                  <List.Item>Choose either Google Sign-in or Email login</List.Item>
                  <List.Item>
                    <strong>Google Sign-in:</strong> Click "Continue with Google" and select your account
                  </List.Item>
                  <List.Item>
                    <strong>Email Login:</strong> Enter your email address and click "Continue"
                  </List.Item>
                  <List.Item>If you're a new user, an account will be automatically created</List.Item>
                  <List.Item>Once logged in, you can access all features including posting and messaging</List.Item>
                </List>
                <Text size="sm" color="dimmed" style={{ marginTop: '0.5rem' }}>
                  💡 Your account starts with 50 reputation points
                </Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="edit-profile">
            <Accordion.Control>How do I edit my profile?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <List size="sm" spacing="xs">
                  <List.Item>Click on your profile picture in the top right corner</List.Item>
                  <List.Item>Select "Profile" from the dropdown menu</List.Item>
                  <List.Item>In the "Edit Profile" tab, you can update:</List.Item>
                  <List withPadding>
                    <List.Item>Name</List.Item>
                    <List.Item>Profile Picture (up to 5MB)</List.Item>
                    <List.Item>Address</List.Item>
                    <List.Item>Gender</List.Item>
                    <List.Item>Phone Number</List.Item>
                  </List>
                  <List.Item>Click "Save Changes" to update your information</List.Item>
                </List>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="lock-profile">
            <Accordion.Control>
              <Group spacing="xs">
                <IconLock size={18} />
                <span>How do I lock my profile?</span>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Text>
                  Profile locking helps protect your privacy by hiding personal information from other users.
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Go to your Profile page</List.Item>
                  <List.Item>Look for the "Lock/Unlock Profile" button near the top</List.Item>
                  <List.Item>Click the button to toggle your profile privacy</List.Item>
                </List>
                <Text size="sm" style={{ marginTop: '0.5rem' }}>
                  <strong>When locked:</strong> Other users cannot see your personal details like address,
                  phone number, or gender. Admins can still view your profile.
                </Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="delete-account">
            <Accordion.Control>
              <Group spacing="xs">
                <IconTrash size={18} color={colors.error} />
                <span style={{ color: colors.error }}>How do I delete my account?</span>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="md">
                <Alert icon={<IconAlertCircle size={18} />} color="red" variant="light">
                  <Text size="sm">
                    <strong>Warning:</strong> Deleting your account is permanent and cannot be undone.
                    All your posts, messages, and data will be deleted.
                  </Text>
                </Alert>
                <Text size="sm">
                  To delete your account, click the button below and confirm the deletion.
                  You must be logged in to perform this action.
                </Text>
                <Button
                  color="red"
                  variant="light"
                  leftIcon={<IconTrash size={18} />}
                  onClick={() => {
                    if (!isLoggedIn) {
                      showError('Login Required', 'Please login first to delete your account');
                    } else {
                      setDeleteModalOpened(true);
                    }
                  }}
                >
                  Delete My Account
                </Button>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="logout">
            <Accordion.Control>How do I logout?</Accordion.Control>
            <Accordion.Panel>
              <List size="sm" spacing="xs">
                <List.Item>Click on your profile picture in the top right corner</List.Item>
                <List.Item>Select "Logout" from the dropdown menu</List.Item>
                <List.Item>You will be logged out and redirected to the home page</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>

      {/* Lost & Found, Marketplace, Exchange Section */}
      <Paper
        style={{
          background: colors.elevatedSurface,
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
        }}
      >
        <Group style={{ marginBottom: '1rem' }}>
          <IconFileText size={24} color={colors.secondaryAccent} />
          <Title order={2} style={{ color: colors.textPrimary, fontSize: '1.5rem' }}>
            Posts & Services
          </Title>
        </Group>

        <Accordion
          variant="contained"
          chevronPosition="right"
          chevron={<IconChevronDown size={20} />}
          styles={{
            item: accordionItemStyle,
            control: {
              '&:hover': { background: colors.elevatedSurface },
            },
            label: {
              color: colors.textPrimary,
              fontWeight: 600,
            },
            content: {
              color: colors.textSecondary,
            },
          }}
        >
          <Accordion.Item value="report-lost">
            <Accordion.Control>How do I report a lost item?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <List size="sm" spacing="xs">
                  <List.Item>Navigate to the "Lost & Found" page from the navigation menu</List.Item>
                  <List.Item>Click the "Create Post" button</List.Item>
                  <List.Item>Fill in the details:</List.Item>
                  <List withPadding>
                    <List.Item>Title (e.g., "Lost Blue Backpack")</List.Item>
                    <List.Item>Description of the item</List.Item>
                    <List.Item>Location where it was lost</List.Item>
                    <List.Item>Upload up to 3 images</List.Item>
                  </List>
                  <List.Item>Click "Create Post" to publish</List.Item>
                </List>
                <Text size="sm" color="dimmed" style={{ marginTop: '0.5rem' }}>
                  💡 Add clear photos and detailed descriptions to help others identify your item
                </Text>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="found-item">
            <Accordion.Control>I found something. What should I do?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Text>
                  <strong>If you found an item:</strong>
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Go to the "Lost & Found" page</List.Item>
                  <List.Item>Click "Create Post" to list the found item</List.Item>
                  <List.Item>Provide details about where and when you found it</List.Item>
                  <List.Item>Upload clear photos of the item</List.Item>
                  <List.Item>Wait for the owner to contact you via the messaging feature</List.Item>
                  <List.Item>Once verified, you can arrange a safe meetup to return the item</List.Item>
                </List>
                <Alert icon={<IconShieldCheck size={18} />} color="blue" variant="light" style={{ marginTop: '0.5rem' }}>
                  <Text size="sm">
                    The owner will need to submit a claim request with proof of ownership for admin verification
                  </Text>
                </Alert>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="claim-item">
            <Accordion.Control>How do I claim an item I see on the site?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Text>
                  <strong>To claim a lost item:</strong>
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Find the item on the "Lost & Found" page</List.Item>
                  <List.Item>Click on the post to view details</List.Item>
                  <List.Item>Click the "Claim Item" button</List.Item>
                  <List.Item>Provide proof of ownership (receipts, photos, serial numbers, etc.)</List.Item>
                  <List.Item>Upload verification images</List.Item>
                  <List.Item>Submit the claim request</List.Item>
                  <List.Item>Wait for admin approval</List.Item>
                  <List.Item>Once approved, you can arrange pickup with the finder</List.Item>
                </List>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="marketplace">
            <Accordion.Control>
              <Group spacing="xs">
                <IconShoppingCart size={18} />
                <span>How do I buy or sell items?</span>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Text>
                  <strong>To sell an item:</strong>
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Go to the "Marketplace" page</List.Item>
                  <List.Item>Click "List Item"</List.Item>
                  <List.Item>Fill in product details (title, description, price, condition)</List.Item>
                  <List.Item>Upload up to 3 images</List.Item>
                  <List.Item>Click "List Item" to publish</List.Item>
                </List>
                <Text style={{ margin: '0.5rem 0' }}>
                  <strong>To buy an item:</strong>
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Browse the Marketplace page</List.Item>
                  <List.Item>Click on a product you're interested in</List.Item>
                  <List.Item>Click "Message Seller" to start a conversation</List.Item>
                  <List.Item>Discuss details, negotiate price if needed</List.Item>
                  <List.Item>Once agreed, click "Purchase Item" and upload proof of transaction</List.Item>
                  <List.Item>Wait for admin verification before completing the deal</List.Item>
                </List>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="exchange">
            <Accordion.Control>
              <Group spacing="xs">
                <IconArrowsExchange size={18} />
                <span>How do I lend, borrow, or swap items?</span>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Text>
                  The Exchange page allows you to rent, borrow, or swap items with others.
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>
                    <strong>Rent:</strong> List items for rental with daily/weekly pricing
                  </List.Item>
                  <List.Item>
                    <strong>Borrow:</strong> Lend items temporarily for free
                  </List.Item>
                  <List.Item>
                    <strong>Swap:</strong> Exchange items with others
                  </List.Item>
                </List>
                <Text style={{ marginTop: '0.5rem' }}>
                  <strong>Steps:</strong>
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Go to the "Exchange" page</List.Item>
                  <List.Item>Click "Create Exchange"</List.Item>
                  <List.Item>Select exchange type (Rent, Borrow, or Swap)</List.Item>
                  <List.Item>Fill in item details and duration</List.Item>
                  <List.Item>Set rental price (if applicable)</List.Item>
                  <List.Item>Submit the listing</List.Item>
                </List>
                <Alert icon={<IconAlertCircle size={18} />} color="orange" variant="light" style={{ marginTop: '0.5rem' }}>
                  <Text size="sm">
                    <strong>For rentals:</strong> You'll receive daily reminders, and overdue notifications
                    will be sent automatically
                  </Text>
                </Alert>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="free-service">
            <Accordion.Control>Is this service free?</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                Yes! Retriv is completely free to use. There are no listing fees, transaction fees,
                or subscription charges. You can post items, message other users, and complete
                transactions without any cost.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="report-post">
            <Accordion.Control>How do I report a post?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Text>
                  If you see inappropriate content or suspicious activity:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>Click on the post you want to report</List.Item>
                  <List.Item>Click the three-dot menu (⋮) icon</List.Item>
                  <List.Item>Select "Report Post"</List.Item>
                  <List.Item>Choose a reason from the dropdown:</List.Item>
                  <List withPadding>
                    <List.Item>Spam or misleading</List.Item>
                    <List.Item>Inappropriate content</List.Item>
                    <List.Item>Scam or fraud</List.Item>
                    <List.Item>Duplicate post</List.Item>
                    <List.Item>Other</List.Item>
                  </List>
                  <List.Item>Click "Submit Report"</List.Item>
                  <List.Item>The admin team will review the report and take appropriate action</List.Item>
                </List>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>

      {/* Messaging Section */}
      <Paper
        style={{
          background: colors.elevatedSurface,
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
        }}
      >
        <Group style={{ marginBottom: '1rem' }}>
          <IconMessage size={24} color={colors.primaryAccent} />
          <Title order={2} style={{ color: colors.textPrimary, fontSize: '1.5rem' }}>
            Messaging
          </Title>
        </Group>

        <Accordion
          variant="contained"
          chevronPosition="right"
          chevron={<IconChevronDown size={20} />}
          styles={{
            item: accordionItemStyle,
            control: {
              '&:hover': { background: colors.elevatedSurface },
            },
            label: {
              color: colors.textPrimary,
              fontWeight: 600,
            },
            content: {
              color: colors.textSecondary,
            },
          }}
        >
          <Accordion.Item value="send-message">
            <Accordion.Control>How do I message other users?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <List size="sm" spacing="xs">
                  <List.Item>You can only message users about specific posts on Retriv</List.Item>
                  <List.Item>Click on any post you're interested in</List.Item>
                  <List.Item>Click the "Message" button on the post card</List.Item>
                  <List.Item>A chat window will open at the bottom right of your screen</List.Item>
                  <List.Item>Type your message and press Enter or click the send button</List.Item>
                  <List.Item>Messages are sent instantly using real-time technology</List.Item>
                </List>
                <Alert icon={<IconAlertCircle size={18} />} color="blue" variant="light" style={{ marginTop: '0.5rem' }}>
                  <Text size="sm">
                    💬 Chat windows stay open even when you navigate to other pages
                  </Text>
                </Alert>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="message-availability">
            <Accordion.Control>How long can I message about a post?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Text size="sm">
                  The messaging feature is available as long as the post is active:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>
                    Messages work while the item availability is "Available" or "Reserved"
                  </List.Item>
                  <List.Item>
                    Once the owner marks the item as "Unavailable", messaging is disabled
                  </List.Item>
                  <List.Item>
                    If the post is deleted, all associated conversations are removed
                  </List.Item>
                  <List.Item>
                    Completed transactions automatically close the conversation
                  </List.Item>
                </List>
                <Alert icon={<IconShieldCheck size={18} />} color="green" variant="light" style={{ marginTop: '0.5rem' }}>
                  <Text size="sm">
                    <strong>Privacy Note:</strong> All chat messages are secured and will be deleted
                    after the transaction is completed
                  </Text>
                </Alert>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="safe-meetup">
            <Accordion.Control>How do I arrange a safe meetup?</Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="sm">
                <Alert icon={<IconShieldCheck size={18} />} color="blue" variant="light">
                  <Text size="sm" weight={600}>
                    Safety is our priority. Please follow these guidelines:
                  </Text>
                </Alert>
                <List size="sm" spacing="xs">
                  <List.Item>
                    <strong>Meet in public:</strong> Choose well-lit, populated areas like campus
                    cafes, coffee shops, or university lobbies
                  </List.Item>
                  <List.Item>
                    <strong>Daytime meetings:</strong> Always arrange meetups during daylight hours
                  </List.Item>
                  <List.Item>
                    <strong>Never share your home address:</strong> Keep personal location details private
                  </List.Item>
                  <List.Item>
                    <strong>Bring a friend:</strong> Consider having someone accompany you
                  </List.Item>
                  <List.Item>
                    <strong>Inform someone:</strong> Let a friend or family member know about your plans
                  </List.Item>
                  <List.Item>
                    <strong>Trust your instincts:</strong> If something feels wrong, cancel the meetup
                  </List.Item>
                </List>
                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => setTermsModalOpened(true)}
                >
                  Read Full Safety Terms & Conditions
                </Button>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>

      {/* Delete Account Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Account"
        centered
        styles={{
          title: {
            color: colors.textPrimary,
            fontWeight: 700,
            fontSize: '1.25rem',
          },
          content: {
            background: colors.surface,
          },
        }}
      >
        <Stack spacing="md">
          <Alert icon={<IconAlertCircle size={18} />} color="red" variant="light">
            <Text size="sm">
              <strong>Warning:</strong> This action cannot be undone!
            </Text>
          </Alert>
          <Text size="sm" style={{ color: colors.textSecondary }}>
            Are you sure you want to permanently delete your account? All your data including:
          </Text>
          <List size="sm" spacing="xs" style={{ color: colors.textSecondary }}>
            <List.Item>Profile information</List.Item>
            <List.Item>All posts (Lost & Found, Marketplace, Exchange)</List.Item>
            <List.Item>Messages and conversations</List.Item>
            <List.Item>Bookmarks and saved items</List.Item>
            <List.Item>Reputation score and history</List.Item>
          </List>
          <Text size="sm" weight={600} style={{ color: colors.error }}>
            will be permanently deleted and cannot be recovered.
          </Text>
          <Group position="right" spacing="sm">
            <Button
              variant="subtle"
              onClick={() => setDeleteModalOpened(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteAccount}
              loading={deleteLoading}
              leftIcon={<IconTrash size={18} />}
            >
              Delete My Account
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Terms and Conditions Modal */}
      <TermsModal opened={termsModalOpened} onClose={() => setTermsModalOpened(false)} />
    </Container>
  );
}