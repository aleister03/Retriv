import { useContext } from 'react';
import { Modal, Avatar, Text, Group, Stack, Badge, Divider, Box } from '@mantine/core';
import { ThemeContext } from '../../context/ThemeContext';

export default function ViewUserModal({ opened, onClose, user }) {
  const { colors } = useContext(ThemeContext);

  if (!user) return null;

  const InfoRow = ({ label, value, color }) => (
    <Group position="apart" style={{ padding: '0.5rem 0' }}>
      <Text size="sm" weight={500} style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <Text size="sm" style={{ color: color || colors.textPrimary }}>
        {value || 'N/A'}
      </Text>
    </Group>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="User Details"
      size="md"
      centered
      styles={{
        modal: {
          background: colors.surface,
        },
        title: {
          color: colors.textPrimary,
          fontWeight: 600,
          fontSize: '1.25rem',
        },
        close: {
          color: colors.textPrimary,
        },
      }}
    >
      <Stack spacing="lg">
        {/* User Header */}
        <Group position="center" direction="column" spacing="sm">
          <Avatar
            src={user.profilePicture}
            size={100}
            radius="xl"
            style={{ border: `3px solid ${colors.borders}` }}
          >
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box style={{ textAlign: 'center' }}>
            <Text weight={600} size="lg" style={{ color: colors.textPrimary }}>
              {user.name}
            </Text>
            <Text size="sm" style={{ color: colors.textSecondary }}>
              {user.email}
            </Text>
          </Box>
          <Group spacing="xs">
            {user.isAdmin && (
              <Badge color="blue" variant="light">
                Admin
              </Badge>
            )}
            {user.isBanned && (
              <Badge color="red" variant="light">
                Banned
              </Badge>
            )}
            {user.isSuspended && (
              <Badge color="orange" variant="light">
                Suspended
              </Badge>
            )}
            {!user.isBanned && !user.isSuspended && (
              <Badge color="green" variant="light">
                Active
              </Badge>
            )}
          </Group>
        </Group>

        <Divider style={{ borderColor: colors.borders }} />

        {/* User Information */}
        <Stack spacing="xs">
          <InfoRow label="Phone" value={user.phoneNumber} />
          <InfoRow label="Gender" value={user.gender} />
          <InfoRow label="Address" value={user.address} />
          <InfoRow label="Reputation Score" value={user.reputationScore} />
          <InfoRow
            label="Auth Provider"
            value={user.authProvider?.toUpperCase()}
          />
          <InfoRow
            label="Profile Locked"
            value={user.isProfileLocked ? 'Yes' : 'No'}
          />
          <InfoRow
            label="Joined Date"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
        </Stack>

        {/* Admin Info */}
        {user.isAdmin && (
          <>
            <Divider style={{ borderColor: colors.borders }} />
            <Stack spacing="xs">
              <Text size="sm" weight={600} style={{ color: colors.textPrimary }}>
                Admin Information
              </Text>
              {user.promotedBy && (
                <InfoRow
                  label="Promoted By"
                  value={user.promotedBy.name || user.promotedBy.email}
                />
              )}
              {user.promotedAt && (
                <InfoRow
                  label="Promoted At"
                  value={new Date(user.promotedAt).toLocaleDateString()}
                />
              )}
            </Stack>
          </>
        )}

        {/* Ban/Suspension Info */}
        {(user.isBanned || user.isSuspended) && (
          <>
            <Divider style={{ borderColor: colors.borders }} />
            <Stack spacing="xs">
              <Text
                size="sm"
                weight={600}
                style={{ color: user.isBanned ? '#fa5252' : '#fd7e14' }}
              >
                {user.isBanned ? 'Ban Information' : 'Suspension Information'}
              </Text>
              <InfoRow
                label="Reason"
                value={user.isBanned ? user.banReason : user.suspensionReason}
              />
              {user.isBanned ? (
                <>
                  {user.bannedBy && (
                    <InfoRow
                      label="Banned By"
                      value={user.bannedBy.name || user.bannedBy.email}
                    />
                  )}
                  {user.bannedAt && (
                    <InfoRow
                      label="Banned At"
                      value={new Date(user.bannedAt).toLocaleString()}
                    />
                  )}
                </>
              ) : (
                <>
                  {user.suspendedBy && (
                    <InfoRow
                      label="Suspended By"
                      value={user.suspendedBy.name || user.suspendedBy.email}
                    />
                  )}
                  {user.suspendedUntil && (
                    <InfoRow
                      label="Suspended Until"
                      value={new Date(user.suspendedUntil).toLocaleString()}
                      color="#fd7e14"
                    />
                  )}
                </>
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Modal>
  );
}
