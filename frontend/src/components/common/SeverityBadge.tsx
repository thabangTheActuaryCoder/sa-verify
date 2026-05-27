import { Badge } from '@mantine/core';

interface SeverityBadgeProps {
  severity: string;
}

const SEVERITY_COLOURS: Record<string, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'blue',
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colour = SEVERITY_COLOURS[severity] ?? 'gray';
  return (
    <Badge color={colour} variant="filled" size="sm">
      {severity}
    </Badge>
  );
}
