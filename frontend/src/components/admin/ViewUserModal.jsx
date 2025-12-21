import { useContext } from "react";
import { Modal, Avatar, Text, Badge, Group, Stack, Divider } from "@mantine/core";
import { ThemeContext } from "../../context/ThemeContext";

export default function ViewUserModal({ opened, onClose, user }) {
  const { colors } = useContext(ThemeContext);

  if (!user) return null;

  const formatDate = (date) => {
    if (!date) return 'Invalid Date';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="User Details"
      size="md"
      centered
      styles={{
        content: { background: colors.surface },
        header: { 
          background: colors.surface, 
          borderBottom: `1px solid ${colors.borders}`,
          color: colors.textPrimary 
        },
        title: { fontWeight: 700, fontSize: '1.25rem', color: colors.textPrimary },
        body: { padding: '1.5rem' },
      }}
    >
      <Stack gap="lg">
        {/* User Avatar and Name */}
        <Group justify="center">
          <Avatar
            src={user.profilePicture}
            size={100}
            radius="xl"
            color="teal"
            style={{ border: `3px solid ${colors.borders}` }}
          >
            {user.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        </Group>

        <div style={{ textAlign: 'center' }}>
          <Text size="xl" fw={700} mb={4} style={{ color: colors.textPrimary }}>
            {user.name || 'Unknown User'}
          </Text>
          <Text size="sm" c="dimmed">
            {user.email || 'N/A'}
          </Text>
          <Badge 
            color={user.status === 'active' ? 'green' : 'gray'} 
            mt="xs"
            variant="light"
          >
            {user.status?.toUpperCase() || 'ACTIVE'}
          </Badge>
        </div>

        <Divider color={colors.borders} />

        {/* User Details */}
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ color: colors.textSecondary }}>
              Phone
            </Text>
            <Text size="sm" style={{ color: colors.textPrimary }}>
              {user.phone || 'N/A'}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ color: colors.textSecondary }}>
              Gender
            </Text>
            <Text size="sm" style={{ color: colors.textPrimary }}>
              {user.gender || 'N/A'}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ color: colors.textSecondary }}>
              Address
            </Text>
            <Text size="sm" ta="right" style={{ color: colors.textPrimary, maxWidth: '60%' }}>
              {user.address || 'N/A'}
            </Text>
          </Group>

          <Divider color={colors.borders} />

          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ color: colors.textSecondary }}>
              Reputation Score
            </Text>
            <Text size="sm" style={{ color: colors.textPrimary }}>
              {user.reputationScore || 'N/A'}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ color: colors.textSecondary }}>
              Auth Provider
            </Text>
            <Text size="sm" style={{ color: colors.textPrimary }}>
              {user.authProvider || 'N/A'}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ color: colors.textSecondary }}>
              Profile Locked
            </Text>
            <Text size="sm" style={{ color: colors.textPrimary }}>
              {user.isProfileLocked ? 'Yes' : 'No'}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text fw={600} size="sm" style={{ color: colors.textSecondary }}>
              Joined Date
            </Text>
            <Text size="sm" style={{ color: colors.textPrimary }}>
              {formatDate(user.createdAt)}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
}
