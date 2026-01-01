import { useContext } from 'react';
import { Modal, Avatar, Text, Group, Stack, Badge, Divider, Box, Center } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function ViewUserModal({ opened, onClose, user }) {
  const { colors } = useContext(ThemeContext);
  const { user: currentUser } = useAuth();

  if (!user) return null;

  // Check if current user is admin
  const isAdmin = currentUser?.isAdmin || false;
  
  // Check if viewing own profile
  const isOwnProfile = currentUser?._id === user._id;

  // Check if profile is locked and viewer is not admin AND not the owner
  const isProfileLocked = user.isProfileLocked && !isAdmin && !isOwnProfile;

  const InfoRow = ({ label, value, color }) => (
    <Group justify="space-between" wrap="nowrap">
      <Text size="sm" c={colors.textSecondary} fw={500}>
        {label}
      </Text>
      <Text 
        size="sm" 
        c={color || colors.textPrimary} 
        fw={600} 
        style={{ 
          textAlign: 'right',
          wordBreak: 'break-word',
          maxWidth: '60%',
        }}
      >
        {value || 'N/A'}
      </Text>
    </Group>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="User Profile"
      size="md"
      centered
      styles={{
        content: { 
          background: colors.surface,
          color: colors.textPrimary,
        },
        header: { 
          background: colors.surface, 
          borderBottom: `1px solid ${colors.borders}`,
          color: colors.textPrimary 
        },
        title: { 
          fontWeight: 700, 
          fontSize: '1.25rem',
          color: colors.textPrimary,
        },
      }}
    >
      <Stack gap="lg">
        {/* User Header */}
        <Group gap="md" align="flex-start">
          <Avatar
            src={user.profilePicture}
            size={80}
            radius={80}
            style={{ border: `3px solid ${colors.primaryAccent}` }}
          >
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap="sm" wrap="wrap">
              <Text size="xl" fw={700} c={colors.textPrimary}>
                {user.name}
              </Text>
              {user.isProfileLocked && (
                <Badge
                  size="sm"
                  variant="light"
                  color="red"
                  leftSection={<IconLock size={12} />}
                >
                  Locked
                </Badge>
              )}
              {isOwnProfile && (
                <Badge
                  size="sm"
                  variant="light"
                  color="blue"
                >
                  You
                </Badge>
              )}
            </Group>
            <Text size="sm" c={colors.textSecondary} style={{ wordBreak: 'break-word' }}>
              {user.email}
            </Text>
            <Group gap="xs" mt={4}>
              {user.isAdmin && (
                <Badge size="md" variant="filled" color="blue">
                  Admin
                </Badge>
              )}
              {user.isBanned && (
                <Badge size="md" variant="filled" color="red">
                  Banned
                </Badge>
              )}
              {user.isSuspended && (
                <Badge size="md" variant="filled" color="orange">
                  Suspended
                </Badge>
              )}
              {!user.isBanned && !user.isSuspended && (
                <Badge size="md" variant="filled" color="green">
                  Active
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>

        <Divider color={colors.borders} />

        {/* Show locked message ONLY for non-admin, non-owner users */}
        {isProfileLocked ? (
          <Center py={40}>
            <Stack align="center" gap="md">
              <IconLock size={64} color={colors.textSecondary} stroke={1.5} />
              <Text size="lg" fw={600} c={colors.textPrimary} ta="center">
                This Profile is Locked
              </Text>
              <Text size="sm" c={colors.textSecondary} ta="center">
                The user has chosen to keep their profile private.
              </Text>
            </Stack>
          </Center>
        ) : (
          <>
            {/* User Information - Show if: not locked OR user is admin OR user is owner */}
            <Stack gap="sm">
              <InfoRow label="Phone Number" value={user.phoneNumber} />
              <InfoRow label="Gender" value={user.gender} />
              <InfoRow label="Address" value={user.address} />
              <InfoRow 
                label="Reputation Score" 
                value={user.reputationScore?.toString()} 
                color={colors.primaryAccent}
              />
              <InfoRow 
                label="Member Since" 
                value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
              />
            </Stack>

            {/* Admin Info */}
            {user.isAdmin && (
              <>
                <Divider color={colors.borders} />
                <Box>
                  <Text size="sm" fw={700} c={colors.textPrimary} mb="sm">
                    Admin Information
                  </Text>
                  <Stack gap="sm">
                    {user.promotedBy && (
                      <InfoRow 
                        label="Promoted By" 
                        value={user.promotedBy.name || user.promotedBy} 
                      />
                    )}
                    {user.promotedAt && (
                      <InfoRow 
                        label="Promoted On" 
                        value={new Date(user.promotedAt).toLocaleDateString()} 
                      />
                    )}
                  </Stack>
                </Box>
              </>
            )}

            {/* Ban/Suspension Info */}
            {(user.isBanned || user.isSuspended) && (
              <>
                <Divider color={colors.borders} />
                <Box>
                  <Text size="sm" fw={700} c={colors.textPrimary} mb="sm">
                    {user.isBanned ? 'Ban Information' : 'Suspension Information'}
                  </Text>
                  <Stack gap="sm">
                    {user.isBanned ? (
                      <>
                        <InfoRow 
                          label="Ban Reason" 
                          value={user.banReason} 
                          color="#ff6b6b"
                        />
                        {user.bannedBy && (
                          <InfoRow 
                            label="Banned By" 
                            value={user.bannedBy.name || user.bannedBy} 
                          />
                        )}
                        {user.bannedAt && (
                          <InfoRow 
                            label="Banned On" 
                            value={new Date(user.bannedAt).toLocaleDateString()} 
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <InfoRow 
                          label="Suspension Reason" 
                          value={user.suspensionReason} 
                          color="#ff922b"
                        />
                        {user.suspendedBy && (
                          <InfoRow 
                            label="Suspended By" 
                            value={user.suspendedBy.name || user.suspendedBy} 
                          />
                        )}
                        {user.suspendedUntil && (
                          <InfoRow 
                            label="Suspended Until" 
                            value={new Date(user.suspendedUntil).toLocaleString()} 
                            color="#ff922b"
                          />
                        )}
                      </>
                    )}
                  </Stack>
                </Box>
              </>
            )}
          </>
        )}
      </Stack>
    </Modal>
  );
}