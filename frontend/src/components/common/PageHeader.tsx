import { Group, Title, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" mb="lg" wrap="wrap">
      <div>
        <Title order={2}>{title}</Title>
        {subtitle && (
          <Text c="dimmed" size="sm" mt={4}>
            {subtitle}
          </Text>
        )}
      </div>
      {actions && <Group>{actions}</Group>}
    </Group>
  );
}
