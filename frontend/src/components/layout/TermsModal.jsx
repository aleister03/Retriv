import { useContext } from 'react';
import { Modal, Stack, Text, List, Button, Divider, Group } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';

export default function TermsModal({ opened, onClose }) {
  const { colors } = useContext(ThemeContext);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Terms & Conditions"
      size="md"
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
        body: {
          maxHeight: '65vh',
          overflowY: 'auto',
        },
      }}
    >
      <Stack spacing="md">
        {/* Safety Guidelines */}
        <div>
          <Group spacing="xs" style={{ marginBottom: '0.5rem' }}>
            <IconShieldCheck size={18} color={colors.primaryAccent} />
            <Text weight={600} size="sm" style={{ color: colors.textPrimary }}>
              Safety Guidelines
            </Text>
          </Group>
          <List size="xs" spacing="xs" style={{ color: colors.textSecondary }}>
            <List.Item>
              Always meet in public places during daylight hours (campus cafes, coffee shops, libraries)
            </List.Item>
            <List.Item>
              Never share your home address or personal contact details
            </List.Item>
            <List.Item>
              Bring a friend to meetups and inform someone about your plans
            </List.Item>
            <List.Item>
              Trust your instincts - cancel if something feels wrong
            </List.Item>
          </List>
        </div>

        <Divider />

        {/* Transaction Rules */}
        <div>
          <Text weight={600} size="sm" style={{ color: colors.textPrimary, marginBottom: '0.5rem' }}>
            Transaction Requirements
          </Text>
          <List size="xs" spacing="xs" style={{ color: colors.textSecondary }}>
            <List.Item>
              Do NOT complete any transactions without admin approval through Retriv's verification system
            </List.Item>
            <List.Item>
              Update item availability immediately after completing a transaction
            </List.Item>
            <List.Item>
              Upload proof of transaction for admin verification (photos, receipts)
            </List.Item>
            <List.Item>
              Return rental items on or before the agreed date to maintain your reputation
            </List.Item>
          </List>
        </div>

        <Divider />

        {/* Liability */}
        <div>
          <Text weight={600} size="sm" style={{ color: colors.textPrimary, marginBottom: '0.5rem' }}>
            Liability & Responsibility
          </Text>
          <List size="xs" spacing="xs" style={{ color: colors.textSecondary }}>
            <List.Item>
              Retriv is a platform facilitating connections - all transactions are between users
            </List.Item>
            <List.Item>
              Retriv takes NO responsibility for disputes, damages, losses, or injuries during transactions
            </List.Item>
            <List.Item>
              Users are responsible for verifying item condition, authenticity, and quality
            </List.Item>
          </List>
        </div>

        <Divider />

        {/* Privacy & Data */}
        <div>
          <Text weight={600} size="sm" style={{ color: colors.textPrimary, marginBottom: '0.5rem' }}>
            Privacy & Data Security
          </Text>
          <List size="xs" spacing="xs" style={{ color: colors.textSecondary }}>
            <List.Item>
              Messages are encrypted and stored securely during active conversations
            </List.Item>
            <List.Item>
              All messages and conversation data are automatically deleted after transactions are completed
            </List.Item>
            <List.Item>
              We do NOT store your messages after the transaction lifecycle ends
            </List.Item>
            <List.Item>
              Lock your profile to hide personal information from other users
            </List.Item>
          </List>
        </div>

        <Divider />

        {/* Community Guidelines */}
        <div>
          <Text weight={600} size="sm" style={{ color: colors.textPrimary, marginBottom: '0.5rem' }}>
            Community Guidelines
          </Text>
          <List size="xs" spacing="xs" style={{ color: colors.textSecondary }}>
            <List.Item>
              Treat all users with respect - harassment will result in account suspension
            </List.Item>
            <List.Item>
              Provide accurate descriptions and genuine photos in your listings
            </List.Item>
            <List.Item>
              Fraudulent activity, scams, or deception will result in immediate account termination
            </List.Item>
            <List.Item>
              Report suspicious activity using the report feature
            </List.Item>
          </List>
        </div>

        <Text size="xs" style={{ color: colors.textSecondary, fontStyle: 'italic', marginTop: '0.5rem' }}>
          By using Retriv, you agree to these terms. Violation may result in account suspension or legal action.
        </Text>

        <Button onClick={onClose} fullWidth>
          I Understand
        </Button>
      </Stack>
    </Modal>
  );
}