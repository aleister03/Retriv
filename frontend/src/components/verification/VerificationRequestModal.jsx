import { useState, useContext } from 'react';
import { Modal, Button, Stack, Text, Textarea, FileInput, Image, Box, Group, ActionIcon, Alert } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconUpload, IconX, IconPhoto, IconAlertCircle } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError } from '../../utils/notifications';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default function VerificationRequestModal({
  opened,
  onClose,
  post,
  verificationType,
}) {
  const { colors } = useContext(ThemeContext);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [ownershipProof, setOwnershipProof] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Check if item is unavailable or reserved
  const isUnavailable = post?.availability === 'Unavailable';
  const isReserved = post?.availability === 'Reserved';
  const isBlocked = (isUnavailable || isReserved) && verificationType !== 'return';

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (imageFiles.length >= 3) {
      showError('Maximum 3 images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setImageFiles([...imageFiles, file]);
      setImagePreviews([...imagePreviews, base64]);
    } catch (error) {
      console.error('Failed to process image:', error);
      showError('Failed to upload image');
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Block submission if unavailable
    if (isBlocked) {
      showError('This item is no longer available for requests');
      return;
    }

    if (verificationType === 'claim' && !ownershipProof.trim()) {
      showError('Please provide ownership proof');
      return;
    }

    if (verificationType === 'rent') {
      if (!startDate || !endDate) {
        showError('Please select rental start and end dates');
        return;
      }
      if (endDate <= startDate) {
        showError('End date must be after start date');
        return;
      }
    }

    if (['purchase', 'return'].includes(verificationType) && imagePreviews.length === 0) {
      showError('Please upload proof images');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        type: verificationType,
        postId: post._id,
        proofImages: imagePreviews,
        details: details.trim(),
      };

      if (verificationType === 'rent') {
        const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
        const endDateObj = endDate instanceof Date ? endDate : new Date(endDate);
        
        const durationInDays = Math.ceil(
          (endDateObj - startDateObj) / (1000 * 60 * 60 * 24)
        );
        
        requestData.rentalDuration = {
          startDate: startDateObj.toISOString(),
          endDate: endDateObj.toISOString(),
          durationInDays,
        };
      }

      if (verificationType === 'claim') {
        requestData.ownershipProof = ownershipProof;
      }

      const response = await axios.post(
        `${API_BASE}/verifications/request`,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        showSuccess(
          'Request Submitted',
          'Your verification request has been sent to admin for review'
        );
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Verification request error:', error);
      showError('Failed to submit request', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDetails('');
    setImageFiles([]);
    setImagePreviews([]);
    setOwnershipProof('');
    setStartDate(null);
    setEndDate(null);
  };

  const getModalTitle = () => {
    switch (verificationType) {
      case 'borrow':
        return 'Request to Borrow';
      case 'rent':
        return 'Request to Rent';
      case 'swap':
        return 'Request to Swap';
      case 'purchase':
        return 'Purchase Item';
      case 'claim':
        return 'Claim Lost Item';
      case 'return':
        return 'Return Found Item';
      default:
        return 'Verification Request';
    }
  };

  const getDescription = () => {
    switch (verificationType) {
      case 'borrow':
        return 'Submit your request to borrow this item. The admin will review and approve.';
      case 'rent':
        return 'Specify rental duration and submit your request. Daily reminders will be sent.';
      case 'swap':
        return 'Submit details about the item you want to swap for this one.';
      case 'purchase':
        return 'Upload proof of handover (photo of transaction) for admin verification.';
      case 'claim':
        return 'Provide proof that this item belongs to you (receipts, photos, etc).';
      case 'return':
        return 'Upload proof that you have returned this item to its owner.';
      default:
        return '';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={getModalTitle()}
      size="lg"
      centered
      styles={{
        content: { background: colors.surface },
        header: { background: colors.surface, borderBottom: `1px solid ${colors.borders}` },
        title: { fontWeight: 700, color: colors.textPrimary },
      }}
    >
      <Stack spacing="md">
        <Text size="sm" color="dimmed">{getDescription()}</Text>

        {/* UNAVAILABLE WARNING */}
        {isBlocked && (
          <Alert icon={<IconAlertCircle size={16} />} title="Item Not Available" color="red">
            This item is {isUnavailable ? 'no longer available' : 'currently reserved'}. 
            You cannot submit a new request at this time.
          </Alert>
        )}

        {/* Post Info */}
        <Box
          p="md"
          style={{
            background: colors.elevatedSurface,
            borderRadius: 8,
            border: `1px solid ${colors.borders}`,
          }}
        >
          <Group>
            {post.images && post.images[0] && (
              <Image
                src={post.images[0]}
                alt={post.title}
                width={60}
                height={60}
                radius="md"
              />
            )}
            <div>
              <Text weight={600} color={colors.textPrimary}>{post.title}</Text>
              {post.price > 0 && (
                <Text size="sm" color="dimmed">৳{post.price.toLocaleString()}</Text>
              )}
              {/* Show availability status */}
              {post.availability && (
                <Text size="xs" color={isUnavailable ? 'red' : isReserved ? 'yellow' : 'green'}>
                  Status: {post.availability}
                </Text>
              )}
            </div>
          </Group>
        </Box>

        {/* Rental Duration */}
        {verificationType === 'rent' && (
          <>
            <DatePickerInput
              label="Start Date"
              placeholder="Select start date"
              value={startDate}
              onChange={setStartDate}
              minDate={new Date()}
              required
              disabled={isBlocked}
              styles={{
                label: { color: colors.textPrimary, fontWeight: 600 },
                input: {
                  background: colors.elevatedSurface,
                  borderColor: colors.borders,
                  color: colors.textPrimary,
                },
              }}
            />
            <DatePickerInput
              label="End Date"
              placeholder="Select end date"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || new Date()}
              required
              disabled={isBlocked}
              styles={{
                label: { color: colors.textPrimary, fontWeight: 600 },
                input: {
                  background: colors.elevatedSurface,
                  borderColor: colors.borders,
                  color: colors.textPrimary,
                },
              }}
            />
            {startDate && endDate && (
              <Text size="sm" color="dimmed">
                Duration: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days
              </Text>
            )}
          </>
        )}

        {/* Ownership Proof for Claims */}
        {verificationType === 'claim' && (
          <Textarea
            label="Ownership Proof"
            placeholder="Describe how this item belongs to you (receipts, purchase date, unique features, etc.)"
            value={ownershipProof}
            onChange={(e) => setOwnershipProof(e.target.value)}
            minRows={3}
            required
            disabled={isBlocked}
            styles={{
              label: { color: colors.textPrimary, fontWeight: 600 },
              input: {
                background: colors.elevatedSurface,
                borderColor: colors.borders,
                color: colors.textPrimary,
              },
            }}
          />
        )}

        {/* Details */}
        <Textarea
          label="Additional Details"
          placeholder="Add any relevant information..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          minRows={3}
          disabled={isBlocked}
          styles={{
            label: { color: colors.textPrimary, fontWeight: 600 },
            input: {
              background: colors.elevatedSurface,
              borderColor: colors.borders,
              color: colors.textPrimary,
            },
          }}
        />

        {/* Image Upload */}
        <div>
          <Text size="sm" weight={600} color={colors.textPrimary} mb="xs">
            Proof Images ({imageFiles.length}/3)
          </Text>
          {['purchase', 'return'].includes(verificationType) && (
            <Text size="xs" color="red" mb="xs">* Required</Text>
          )}
          {imageFiles.length < 3 && !isBlocked && (
            <FileInput
              icon={<IconUpload size={14} />}
              placeholder="Upload proof image"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              value={null}
              key={imageFiles.length}
              disabled={isBlocked}
              styles={{
                input: {
                  background: colors.elevatedSurface,
                  borderColor: colors.borders,
                  color: colors.textPrimary,
                },
              }}
            />
          )}
          {imagePreviews.length > 0 && (
            <Group mt="md" spacing="sm">
              {imagePreviews.map((preview, idx) => (
                <Box key={idx} style={{ position: 'relative' }}>
                  <Image src={preview} alt={`Preview ${idx + 1}`} width={100} height={100} radius="md" />
                  <ActionIcon
                    color="red"
                    variant="filled"
                    size="sm"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
          )}
        </div>

        {/* Action Buttons */}
        <Group position="right" mt="md">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={isBlocked} //Disable if unavailable
            style={{
              background: isBlocked ? '#ccc' : colors.primaryAccent,
              color: '#fff',
            }}
          >
            Submit Request
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}