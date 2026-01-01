import { useState, useContext } from "react";
import { Modal, TextInput, Textarea, Button, Group, FileInput, Image, Text, Stack, ActionIcon, Box, NumberInput, Select } from "@mantine/core";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError } from "../../utils/notifications";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Convert File to base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default function CreatePostModal({ opened, onClose, onSuccess, type }) {
  const { colors } = useContext(ThemeContext);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Marketplace specific fields
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");

  // Exchange specific fields
  const [exchangeType, setExchangeType] = useState("");
  const [duration, setDuration] = useState("");
  const [rentalPrice, setRentalPrice] = useState("");

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

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
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
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    // Marketplace specific validations
    if (type === 'marketplace') {
      if (!price || price <= 0) {
        showError('Please enter a valid price');
        return;
      }
      if (!condition) {
        showError('Please select product condition');
        return;
      }
    }

    // Exchange specific validations
    if (type === 'exchange') {
      if (!exchangeType) {
        showError('Please select exchange type');
        return;
      }
      if (!duration) {
        showError('Please enter duration/period');
        return;
      }
      if (exchangeType === 'Rent' && (!rentalPrice || rentalPrice <= 0)) {
        showError('Please enter rental price');
        return;
      }
    }

    if (!token) {
      showError('You must be logged in to create a post');
      return;
    }

    try {
      setLoading(true);

      const postData = {
        title,
        description,
        images: imagePreviews,
        type,
      };

      // Add type-specific fields
      if (type === 'lost-found') {
        postData.location = location;
      } else if (type === 'marketplace') {
        postData.price = parseFloat(price);
        postData.condition = condition;
      } else if (type === 'exchange') {
        postData.exchangeType = exchangeType;
        postData.duration = duration;
        postData.rentalPrice = exchangeType === 'Rent' ? parseFloat(rentalPrice) : 0;
      }

      const response = await axios.post(`${API_BASE}/posts`, postData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        showSuccess('Post created successfully!', response.data.message);
        resetForm();
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      showError('Failed to create post', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setImageFiles([]);
    setImagePreviews([]);
    setPrice("");
    setCondition("");
    setExchangeType("");
    setDuration("");
    setRentalPrice("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Determine modal title based on type
  const getModalTitle = () => {
    if (type === 'marketplace') return 'List Item for Sale';
    if (type === 'lost-found') return 'Create Post';
    if (type === 'exchange') return 'List Item for Exchange';
    return 'Create Post';
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={getModalTitle()}
      size="lg"
      centered
      styles={{
        content: { background: colors.surface },
        header: { background: colors.surface, borderBottom: `1px solid ${colors.borders}` },
        title: { fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder={
            type === 'marketplace' ? 'e.g., iPhone 13 Pro' :
            type === 'exchange' ? 'e.g., Canon Camera for Rent' :
            'e.g., Lost Laptop Charger'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          styles={{
            input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
            label: { color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' },
          }}
        />

        <Textarea
          label="Description"
          placeholder="Provide detailed information..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minRows={4}
          styles={{
            input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
            label: { color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' },
          }}
        />

        {/* Lost & Found specific field */}
        {type === 'lost-found' && (
          <TextInput
            label="Location"
            placeholder="e.g., Library 3rd Floor"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            styles={{
              input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
              label: { color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' },
            }}
          />
        )}

        {/* Marketplace specific fields */}
        {type === 'marketplace' && (
          <>
            <NumberInput
              label="Price"
              placeholder="Enter price in BDT"
              value={price}
              onChange={setPrice}
              required
              min={0}
              prefix="৳ "
              thousandSeparator=","
              styles={{
                input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
                label: { color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' },
              }}
            />

            <Select
              label="Condition"
              placeholder="Select product condition"
              value={condition}
              onChange={setCondition}
              required
              data={[
                { value: 'New', label: 'New' },
                { value: 'Like New', label: 'Like New' },
                { value: 'Used - Good', label: 'Used - Good' },
                { value: 'Used - Fair', label: 'Used - Fair' },
              ]}
              styles={{
                input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
                label: { color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' },
              }}
            />
          </>
        )}

        {/* Exchange specific fields */}
        {type === 'exchange' && (
          <>
            <Select
              label="Exchange Type"
              placeholder="Select exchange type"
              value={exchangeType}
              onChange={setExchangeType}
              required
              data={[
                { value: 'Rent', label: 'For Rent' },
                { value: 'Borrow', label: 'For Borrow (Free)' },
                { value: 'Swap', label: 'For Swap/Trade' },
              ]}
              styles={{
                input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
                label: { color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' },
              }}
            />

            <TextInput
              label="Duration/Period"
              placeholder="e.g., Daily, Weekly, 3 days, 1 month"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              styles={{
                input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
                label: { color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' },
              }}
            />

            {exchangeType === 'Rent' && (
              <NumberInput
                label="Rental Price"
                placeholder="Enter rental price in BDT"
                value={rentalPrice}
                onChange={setRentalPrice}
                required
                min={0}
                prefix="৳ "
                thousandSeparator=","
                styles={{
                  input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
                  label: { color: colors.textPrimary, fontWeight: 600, marginBottom: '0.5rem' },
                }}
              />
            )}
          </>
        )}

        <Box>
          <Text size="sm" fw={600} c={colors.textPrimary} mb="0.5rem">
            Images ({imageFiles.length}/3)
          </Text>

          {imageFiles.length < 3 && (
            <FileInput
              leftSection={<IconPhoto size={18} />}
              placeholder="Upload an image"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              value={null}
              key={imageFiles.length}
              styles={{
                input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
              }}
            />
          )}

          {imagePreviews.length > 0 && (
            <Group mt="md" gap="md">
              {imagePreviews.map((preview, idx) => (
                <Box
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: `1px solid ${colors.borders}`,
                  }}
                >
                  <Image
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    fit="cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <ActionIcon
                    color="red"
                    size="sm"
                    radius="xl"
                    variant="filled"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
          )}
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} color="gray">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            style={{
              background: colors.primaryAccent,
              color: '#fff',
            }}
          >
            {type === 'marketplace' ? 'List Item' : type === 'exchange' ? 'Create Exchange' : 'Create Post'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}