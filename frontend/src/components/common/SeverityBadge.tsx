import { Badge } from '@mantine/core';

interface SeverityBadgeProps {
  severity: string;
}

const SEVERITY_COLOURS: Record<string, string> = {
  critical: 'saTerracotta',
  high: 'saTerracotta',
  medium: 'saGold',
  low: 'saGreen',
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colour = SEVERITY_COLOURS[severity] ?? 'gray';
  return (
    <Badge color={colour} variant="filled" size="sm" radius="md">
      {severity}
    </Badge>
  );
}
