import { useContext } from 'react';
import { Center, Text, Stack, Button } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { showPageNotAvailable } from '../../utils/notifications';

export default function PostsTab() {
  const { colors } = useContext(ThemeContext);

  return (
    <Center style={{ minHeight: '400px' }}>
      <Stack align="center" spacing="md">
        <IconFileText size={64} color={colors.textSecondary} />
        <Text size="lg" weight={600} style={{ color: colors.textPrimary }}>
          Posts Management
        </Text>
        <Text size="sm" style={{ color: colors.textSecondary, textAlign: 'center' }}>
          This feature will allow you to manage all lost & found posts,
          <br />
          approve or reject submissions, and moderate content.
        </Text>
        <Button
          variant="light"
          color="blue"
          onClick={() => showPageNotAvailable('Posts Management')}
        >
          Coming Soon
        </Button>
      </Stack>
    </Center>
  );
}
