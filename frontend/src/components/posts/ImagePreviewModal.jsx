import { Modal, Image } from "@mantine/core";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function ImagePreviewModal({ opened, onClose, imageUrl }) {
  const { colors } = useContext(ThemeContext);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      withCloseButton={true}
      styles={{
        content: { background: colors.surface },
        header: { background: colors.surface },
      }}
    >
      <Image src={imageUrl} fit="contain" />
    </Modal>
  );
}
