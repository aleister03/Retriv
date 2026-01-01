import { useState, useContext, useEffect } from 'react';
import { Modal, Box, Image, Group, ActionIcon, Stack, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';

export default function ImagePreviewModal({ opened, onClose, imageUrl, allImages = [] }) {
  const { colors } = useContext(ThemeContext);
  
  // Ensure allImages is an array and contains imageUrl
  const images = Array.isArray(allImages) && allImages.length > 0 
    ? allImages 
    : [imageUrl].filter(Boolean);
  
  // Find initial index
  const initialIndex = images.indexOf(imageUrl);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  // Reset index when modal opens with new image
  useEffect(() => {
    if (opened) {
      const index = images.indexOf(imageUrl);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [opened, imageUrl, images]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!opened) return;
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, images.length]);

  if (!images.length) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      padding={0}
      withCloseButton={false}
      styles={{
        content: {
          background: colors.surface,
          borderRadius: '16px',
          overflow: 'hidden',
        },
        body: {
          padding: 0,
        },
      }}
    >
      <Box style={{ position: 'relative' }}>
        {/* Close Button */}
        <ActionIcon
          onClick={onClose}
          variant="filled"
          color="dark"
          size="lg"
          radius="xl"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
          }}
        >
          <IconX size={20} />
        </ActionIcon>

        {/* Image Counter */}
        {images.length > 1 && (
          <Box
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {currentIndex + 1} / {images.length}
          </Box>
        )}

        {/* Main Image Container */}
        <Box
          style={{
            position: 'relative',
            width: '100%',
            height: '70vh',
            maxHeight: '600px',
            background: colors.elevatedSurface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Previous Button */}
          {images.length > 1 && (
            <ActionIcon
              onClick={handlePrevious}
              variant="filled"
              color="dark"
              size="xl"
              radius="xl"
              style={{
                position: 'absolute',
                left: '1rem',
                zIndex: 5,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <IconChevronLeft size={24} />
            </ActionIcon>
          )}

          {/* Main Image */}
          <Image
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            fit="contain"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />

          {/* Next Button */}
          {images.length > 1 && (
            <ActionIcon
              onClick={handleNext}
              variant="filled"
              color="dark"
              size="xl"
              radius="xl"
              style={{
                position: 'absolute',
                right: '1rem',
                zIndex: 5,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <IconChevronRight size={24} />
            </ActionIcon>
          )}
        </Box>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <Box
            style={{
              padding: '1rem',
              background: colors.surface,
              borderTop: `1px solid ${colors.borders}`,
            }}
          >
            <Group style={{ gap: '0.75rem', justifyContent: 'center' }}>
              {images.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: currentIndex === index 
                      ? `3px solid ${colors.primaryAccent}` 
                      : `2px solid ${colors.borders}`,
                    transition: 'all 0.2s',
                    opacity: currentIndex === index ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (currentIndex !== index) {
                      e.currentTarget.style.opacity = 0.8;
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentIndex !== index) {
                      e.currentTarget.style.opacity = 0.6;
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fit="cover"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </Box>
              ))}
            </Group>
          </Box>
        )}
      </Box>
    </Modal>
  );
}