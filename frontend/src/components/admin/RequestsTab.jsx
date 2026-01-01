import { useState, useEffect, useContext } from 'react';
import { Table, Avatar, Group, Text, ActionIcon, Menu, Select, Pagination, Box, Loader, Center, ScrollArea, Button, Modal, Stack, Badge, Image, Textarea, Tabs } from '@mantine/core';
import { IconDotsVertical, IconEye, IconCheck, IconX, IconAlertCircle, IconShieldCheck } from '@tabler/icons-react';
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

export default function RequestsTab({ onRequestUpdate }) {
  const { colors } = useContext(ThemeContext);
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
    requestsPerPage: 10,
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [reviewModalOpened, setReviewModalOpened] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter, typeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/verifications/all`, {
        params: {
          page,
          limit: 10,
          status: statusFilter,
          type: typeFilter !== 'all' ? typeFilter : undefined,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setRequests(response.data.requests);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      showError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (request) => {
    setSelectedRequest(request);
    setViewModalOpened(true);
  };

  const handleReviewClick = (request, status) => {
    setSelectedRequest(request);
    setReviewStatus(status);
    setAdminNotes('');
    setReviewModalOpened(true);
  };

  const handleReviewSubmit = async () => {
    try {
      setReviewing(true);
      const endpoint =
        reviewStatus === 'approved'
          ? `${API_BASE}/verifications/approve/${selectedRequest._id}`
          : `${API_BASE}/verifications/reject/${selectedRequest._id}`;

      const response = await axios.put(
        endpoint,
        { reason: adminNotes.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showSuccess('Request Reviewed', response.data.message);
        setReviewModalOpened(false);
        fetchRequests();
        if (onRequestUpdate) onRequestUpdate();
      }
    } catch (error) {
      showError('Failed to review request', error.response?.data?.message);
    } finally {
      setReviewing(false);
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'borrow':
        return 'blue';
      case 'rent':
        return 'green';
      case 'swap':
        return 'purple';
      case 'purchase':
        return 'orange';
      case 'claim':
        return 'cyan';
      case 'return':
        return 'pink';
      default:
        return 'gray';
    }
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'pending') return 'yellow';
    if (status === 'approved') return 'green';
    if (status === 'rejected') return 'red';
    if (status === 'completed') return 'blue';
    return 'gray';
  };

  if (loading && requests.length === 0) {
    return (
      <Center style={{ height: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Group mb="md" gap="md">
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          data={[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'completed', label: 'Completed' },
          ]}
          style={{ width: 200 }}
          styles={{
            input: {
              background: colors.elevatedSurface,
              borderColor: colors.borders,
              color: colors.textPrimary,
            },
          }}
        />
        <Select
          placeholder="Filter by type"
          value={typeFilter}
          onChange={(value) => {
            setTypeFilter(value);
            setPage(1);
          }}
          data={[
            { value: 'all', label: 'All Types' },
            { value: 'borrow', label: 'Borrow' },
            { value: 'rent', label: 'Rent' },
            { value: 'swap', label: 'Swap' },
            { value: 'purchase', label: 'Purchase' },
            { value: 'claim', label: 'Claim' },
            { value: 'return', label: 'Return' },
          ]}
          style={{ width: 200 }}
          styles={{
            input: {
              background: colors.elevatedSurface,
              borderColor: colors.borders,
              color: colors.textPrimary,
            },
          }}
        />
      </Group>

      {/* Table */}
      <ScrollArea>
        <Table striped highlightOnHover style={{ background: colors.surface, borderRadius: '8px' }}>
          <Table.Thead>
            <Table.Tr style={{ background: colors.elevatedSurface }}>
              <Table.Th style={{ color: colors.textPrimary }}>Requester</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Item</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Type</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Status</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Date</Table.Th>
              <Table.Th style={{ color: colors.textPrimary }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {requests.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c={colors.textSecondary} py="xl">
                    No requests found
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              requests.map((request) => (
                <Table.Tr key={request._id}>
                  {/* Requester */}
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar src={request.requester?.profilePicture} size="sm" radius="xl">
                        {request.requester?.name?.[0] || '?'}
                      </Avatar>
                      <Box>
                        <Text size="sm" fw={500} c={colors.textPrimary}>
                          {request.requester?.name || 'Unknown User'}
                        </Text>
                        <Text size="xs" c={colors.textSecondary}>
                          {request.requester?.email || 'No email'}
                        </Text>
                      </Box>
                    </Group>
                  </Table.Td>

                  {/* Item */}
                  <Table.Td>
                    <Group gap="xs">
                      {request.post?.images?.[0] && (
                        <Image
                          src={request.post.images[0]}
                          width={40}
                          height={40}
                          radius="sm"
                          fit="cover"
                        />
                      )}
                      <Text size="sm" c={colors.textPrimary} lineClamp={1}>
                        {request.post?.title || 'N/A'}
                      </Text>
                    </Group>
                  </Table.Td>

                  {/* Type */}
                  <Table.Td>
                    <Badge color={getTypeBadgeColor(request.type)} variant="light">
                      {request.type}
                    </Badge>
                  </Table.Td>

                  {/* Status */}
                  <Table.Td>
                    <Badge color={getStatusBadgeColor(request.status)} variant="filled">
                      {request.status}
                    </Badge>
                  </Table.Td>

                  {/* Date */}
                  <Table.Td>
                    <Text size="sm" c={colors.textSecondary}>
                      {formatDateTime(request.createdAt)}
                    </Text>
                  </Table.Td>

                  {/* Actions */}
                  <Table.Td>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown
                        style={{
                          background: colors.surface,
                          border: `1px solid ${colors.borders}`,
                        }}
                      >
                        <Menu.Item
                          leftSection={<IconEye size={16} />}
                          onClick={() => handleView(request)}
                          style={{ color: colors.textPrimary }}
                        >
                          View Details
                        </Menu.Item>
                        {request.status === 'pending' && (
                          <>
                            <Menu.Item
                              leftSection={<IconCheck size={16} />}
                              color="green"
                              onClick={() => handleReviewClick(request, 'approved')}
                            >
                              Approve
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconX size={16} />}
                              color="red"
                              onClick={() => handleReviewClick(request, 'rejected')}
                            >
                              Reject
                            </Menu.Item>
                          </>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            total={pagination.totalPages}
            value={page}
            onChange={setPage}
            color={colors.primaryAccent}
          />
        </Group>
      )}

      {/* View Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="Request Details"
        size="lg"
        centered
        styles={{
          content: { background: colors.surface },
          header: {
            background: colors.surface,
            borderBottom: `1px solid ${colors.borders}`,
          },
          title: { fontWeight: 700, color: colors.textPrimary },
        }}
      >
        {selectedRequest && (
          <Stack gap="md">
            {/* Requester Info */}
            <Box>
              <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                REQUESTER
              </Text>
              <Group>
                <Avatar
                  src={selectedRequest.requester?.profilePicture}
                  size="md"
                  radius="xl"
                >
                  {selectedRequest.requester?.name?.[0] || '?'}
                </Avatar>
                <Box>
                  <Text size="sm" fw={600} c={colors.textPrimary}>
                    {selectedRequest.requester?.name || 'Unknown User'}
                  </Text>
                  <Text size="xs" c={colors.textSecondary}>
                    {selectedRequest.requester?.email || 'No email'}
                  </Text>
                </Box>
              </Group>
            </Box>

            {/* Post Info */}
            <Box>
              <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                ITEM
              </Text>
              <Group>
                {selectedRequest.post?.images?.[0] && (
                  <Image
                    src={selectedRequest.post.images[0]}
                    width={60}
                    height={60}
                    radius="md"
                    fit="cover"
                  />
                )}
                <Text size="sm" c={colors.textPrimary}>
                  {selectedRequest.post?.title || 'N/A'}
                </Text>
              </Group>
            </Box>

            {/* Type and Status */}
            <Group>
              <Box>
                <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                  TYPE
                </Text>
                <Badge color={getTypeBadgeColor(selectedRequest.type)} variant="light">
                  {selectedRequest.type}
                </Badge>
              </Box>
              <Box>
                <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                  STATUS
                </Text>
                <Badge color={getStatusBadgeColor(selectedRequest.status)} variant="filled">
                  {selectedRequest.status}
                </Badge>
              </Box>
            </Group>

            {/* Rental Duration */}
            {selectedRequest.rentalDuration && (
              <Box>
                <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                  RENTAL DURATION
                </Text>
                <Text size="sm" c={colors.textPrimary}>
                  {new Date(selectedRequest.rentalDuration.startDate).toLocaleDateString()} -{' '}
                  {new Date(selectedRequest.rentalDuration.endDate).toLocaleDateString()} (
                  {selectedRequest.rentalDuration.durationInDays} days)
                </Text>
              </Box>
            )}

            {/* Ownership Proof */}
            {selectedRequest.ownershipProof && (
              <Box>
                <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                  OWNERSHIP PROOF
                </Text>
                <Text size="sm" c={colors.textPrimary}>
                  {selectedRequest.ownershipProof}
                </Text>
              </Box>
            )}

            {/* Details */}
            {selectedRequest.details && (
              <Box>
                <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                  DETAILS
                </Text>
                <Text size="sm" c={colors.textPrimary}>
                  {selectedRequest.details}
                </Text>
              </Box>
            )}

            {/* Proof Images */}
            {selectedRequest.proofImages && selectedRequest.proofImages.length > 0 && (
              <Box>
                <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                  PROOF IMAGES
                </Text>
                <Group gap="sm">
                  {selectedRequest.proofImages.map((img, idx) => (
                    <Image key={idx} src={img} width={100} height={100} radius="md" fit="cover" />
                  ))}
                </Group>
              </Box>
            )}

            {/* Admin Notes */}
            {selectedRequest.adminNotes && (
              <Box>
                <Text size="xs" fw={600} c={colors.textSecondary} mb="xs">
                  ADMIN NOTES
                </Text>
                <Text size="sm" c={colors.textPrimary}>
                  {selectedRequest.adminNotes}
                </Text>
              </Box>
            )}

            {/* Reviewed Info */}
            {selectedRequest.reviewedBy && (
              <Box>
                <Text size="xs" c={colors.textSecondary}>
                  Reviewed by {selectedRequest.reviewedBy.name} on{' '}
                  {formatDateTime(selectedRequest.reviewedAt)}
                </Text>
              </Box>
            )}
          </Stack>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        opened={reviewModalOpened}
        onClose={() => setReviewModalOpened(false)}
        title={reviewStatus === 'approved' ? 'Approve Request' : 'Reject Request'}
        centered
        styles={{
          content: { background: colors.surface },
          header: {
            background: colors.surface,
            borderBottom: `1px solid ${colors.borders}`,
          },
          title: {
            fontWeight: 700,
            color: reviewStatus === 'approved' ? colors.success : colors.error,
          },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c={colors.textSecondary}>
            Are you sure you want to {reviewStatus} this request?
          </Text>
          <Textarea
            label="Admin Notes (Optional)"
            placeholder="Add any notes or reasons..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            minRows={3}
            styles={{
              label: { color: colors.textPrimary, fontWeight: 600 },
              input: {
                background: colors.elevatedSurface,
                borderColor: colors.borders,
                color: colors.textPrimary,
              },
            }}
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setReviewModalOpened(false)}
              disabled={reviewing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              loading={reviewing}
              color={reviewStatus === 'approved' ? 'green' : 'red'}
            >
              {reviewStatus === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}