import { useState, useContext } from 'react';
import { Modal, Button, Text, Textarea, Select, Group, Stack } from '@mantine/core';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showError, showSuccess } from '../../utils/notifications';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function UserActionModal({ opened, onClose, user, actionType, onComplete }) {
  const { colors } = useContext(ThemeContext);
  const { token } = useAuth();
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('24');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let response;

      switch (actionType) {
        case 'ban':
          response = await axios.put(
            `${API_BASE}/admin/users/${user._id}/ban`,
            { reason },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          break;

        case 'suspend':
          if (!duration) {
            showError('Please select suspension duration');
            setLoading(false);
            return;
          }
          response = await axios.put(
            `${API_BASE}/admin/users/${user._id}/suspend`,
            { reason, duration: parseInt(duration) },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          break;

        case 'delete':
          response = await axios.delete(
            `${API_BASE}/admin/users/${user._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          break;

        case 'promote':
          response = await axios.put(
            `${API_BASE}/admin/users/${user._id}/promote`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          break;

        case 'demote':
          response = await axios.put(
            `${API_BASE}/admin/users/${user._id}/demote`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          break;

        default:
          showError('Invalid action type');
          setLoading(false);
          return;
      }

      if (response.data.success) {
        showSuccess('Success', response.data.message);
        setReason('');
        setDuration('24');
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error('Action error:', error);
      showError(
        'Action Failed',
        error.response?.data?.message || 'Failed to perform action'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case 'ban':
        return 'Ban User';
      case 'suspend':
        return 'Suspend User';
      case 'delete':
        return 'Delete User';
      case 'promote':
        return 'Promote to Admin';
      case 'demote':
        return 'Demote from Admin';
      default:
        return 'User Action';
    }
  };

  const getMessage = () => {
    switch (actionType) {
      case 'ban':
        return `Are you sure you want to ban ${user?.name}? They will not be able to access the platform.`;
      case 'suspend':
        return `Temporarily suspend ${user?.name} from accessing the platform.`;
      case 'delete':
        return `Are you sure you want to permanently delete ${user?.name}? This action cannot be undone.`;
      case 'promote':
        return `Promote ${user?.name} to admin? They will have access to the admin dashboard.`;
      case 'demote':
        return `Demote ${user?.name} from admin? They will lose admin privileges.`;
      default:
        return '';
    }
  };

  const getButtonColor = () => {
    if (actionType === 'delete' || actionType === 'ban') return 'red';
    if (actionType === 'suspend') return 'orange';
    return 'blue';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={getTitle()}
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
      <Stack spacing="md">
        <Text size="sm" style={{ color: colors.textPrimary }}>
          {getMessage()}
        </Text>

        {(actionType === 'ban' || actionType === 'suspend') && (
          <Textarea
            label="Reason"
            placeholder="Enter reason for this action..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minRows={3}
            styles={{
              label: { color: colors.textPrimary, marginBottom: '0.5rem' },
              input: {
                background: colors.elevatedSurface,
                border: `1px solid ${colors.borders}`,
                color: colors.textPrimary,
              },
            }}
          />
        )}

        {actionType === 'suspend' && (
          <Select
            label="Duration"
            placeholder="Select duration"
            value={duration}
            onChange={setDuration}
            data={[
              { value: '24', label: '24 Hours' },
              { value: '48', label: '48 Hours' },
              { value: '168', label: '7 Days (168 Hours)' },
            ]}
            styles={{
              label: { color: colors.textPrimary, marginBottom: '0.5rem' },
              input: {
                background: colors.elevatedSurface,
                border: `1px solid ${colors.borders}`,
                color: colors.textPrimary,
              },
            }}
          />
        )}

        <Group position="right" spacing="sm" style={{ marginTop: '1rem' }}>
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color={getButtonColor()}
            onClick={handleSubmit}
            loading={loading}
          >
            Confirm
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
