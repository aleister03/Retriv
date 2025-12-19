import { useContext } from 'react';
import { Center, Text, Stack, Button } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { showPageNotAvailable } from '../../utils/notifications';

export default function RequestsTab() {
  const { colors } = useContext(ThemeContext);

  return (
    <Center style={{ minHeight: '400px' }}>
      <Stack align="center" spacing="md">
        <IconAlertCircle size={64} color={colors.textSecondary} />
        <Text size="lg" weight={600} style={{ color: colors.textPrimary }}>
          Requests Management
        </Text>
        <Text size="sm" style={{ color: colors.textSecondary, textAlign: 'center' }}>
          This feature will allow you to review and approve claim requests,
          <br />
          verification requests, and other user submissions.
        </Text>
        <Button
          variant="light"
          color="blue"
          onClick={() => showPageNotAvailable('Requests Management')}
        >
          Coming Soon
        </Button>
      </Stack>
    </Center>
  );
}
