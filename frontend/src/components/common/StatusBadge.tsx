import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: string;
}

const STATUS_COLOURS: Record<string, string> = {
  pending: 'saGold',
  partial: 'blue',
  completed: 'saGreen',
  expired: 'gray',
  approved: 'saGreen',
  declined: 'saTerracotta',
  under_review: 'blue',
  resolved: 'saGreen',
  rejected: 'saTerracotta',
  open: 'saGold',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colour = STATUS_COLOURS[status] ?? 'gray';
  return (
    <Badge color={colour} variant="light" size="sm" radius="md">
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
