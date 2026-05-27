import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'No data found' }: EmptyStateProps) {
  return (
    <Stack align="center" py="xl" gap="sm">
      <ThemeIcon size={48} variant="light" color="gray">
        <IconInbox size={28} />
      </ThemeIcon>
      <Text c="dimmed" size="sm">
        {message}
      </Text>
    </Stack>
  );
}
