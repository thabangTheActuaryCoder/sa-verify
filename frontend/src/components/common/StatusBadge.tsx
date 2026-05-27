import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: string;
}

const STATUS_COLOURS: Record<string, string> = {
  pending: 'yellow',
  partial: 'blue',
  completed: 'green',
  expired: 'gray',
  approved: 'green',
  declined: 'red',
  under_review: 'blue',
  resolved: 'green',
  rejected: 'red',
  open: 'yellow',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colour = STATUS_COLOURS[status] ?? 'gray';
  return (
    <Badge color={colour} variant="light" size="sm">
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
