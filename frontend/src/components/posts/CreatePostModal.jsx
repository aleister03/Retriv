import { useState, useContext } from "react";
import { Modal, TextInput, Textarea, Button, Group, FileInput, Image, Text, Stack, ActionIcon } from "@mantine/core";
import { IconUpload, IconX } from "@tabler/icons-react";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError } from "../../utils/notifications";

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (imageFiles.length >= 3) {
      showError('Maximum 3 images allowed');
      return;
    }

    try {
      // Convert to base64 for permanent storage
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
      showError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create post with base64 images (survives logout/login)
      const newPost = {
        _id: Date.now().toString(),
        title,
        description,
        images: [...imagePreviews], // base64 strings
        author: {
          _id: user?._id || 'current-user',
          name: user?.name || 'SHRUTI MANDAL PROMA',
          email: user?.email || 'shrutimandalproma@g.bracu.ac.bd',
          phone: user?.phone || '01989664455',
          gender: user?.gender || 'Female',
          address: user?.address || 'Mohammadia Housing Society, Mohammadpur.',
          profilePicture: user?.profilePicture || null,
        },
        createdAt: new Date().toISOString(),
        type,
      };

      showSuccess('Post created successfully');
      
      setTitle("");
      setDescription("");
      setImageFiles([]);
      setImagePreviews([]);
      
      onSuccess(newPost);
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      showError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setImageFiles([]);
    setImagePreviews([]);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create Post"
      size="lg"
      styles={{
        content: { background: colors.surface },
        header: { background: colors.surface, color: colors.textPrimary },
        title: { fontWeight: 700, fontSize: '1.25rem' },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Enter post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          styles={{
            input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
            label: { color: colors.textPrimary, fontWeight: 600 },
          }}
        />

        <Textarea
          label="Description"
          placeholder="Enter post description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minRows={4}
          styles={{
            input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
            label: { color: colors.textPrimary, fontWeight: 600 },
          }}
        />

        <div>
          <Text size="sm" fw={600} mb="xs" style={{ color: colors.textPrimary }}>
            Images ({imageFiles.length}/3)
          </Text>
          
          {imageFiles.length < 3 && (
            <FileInput
              placeholder="Choose image"
              accept="image/*"
              onChange={handleImageUpload}
              leftSection={<IconUpload size={16} />}
              value={null}
              key={imageFiles.length}
              styles={{
                input: { background: colors.elevatedSurface, borderColor: colors.borders, color: colors.textPrimary },
              }}
            />
          )}
          
          {imagePreviews.length > 0 && (
            <Group gap="xs" mt="md">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <Image
                    src={preview}
                    height={100}
                    width={100}
                    fit="cover"
                    radius="md"
                  />
                  <ActionIcon
                    size="sm"
                    color="red"
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
                </div>
              ))}
            </Group>
          )}
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            style={{ backgroundColor: colors.primary }}
          >
            Create Post
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
