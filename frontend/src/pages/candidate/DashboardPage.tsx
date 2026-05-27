import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Group, Text, Stack, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconClipboardCheck } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getRequests } from '../../api/candidate';
import { formatDateTime } from '../../utils/format';
import { getQueryLabel } from '../../utils/queryTypes';
import type { VerificationRequestResponse } from '../../types';

export default function CandidateDashboard() {
  const [requests, setRequests] = useState<VerificationRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRequests()
      .then(setRequests)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load requests', color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const pending = requests.filter((r) => r.status === 'pending');
  const others = requests.filter((r) => r.status !== 'pending');

  return (
    <>
      <PageHeader
        title="Candidate Dashboard"
        subtitle="Review and respond to verification requests"
      />

      {pending.length > 0 && (
        <>
          <Text fw={600} mb="xs">
            Pending Consent ({pending.length})
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="lg">
            {pending.map((req) => (
              <Card
                key={req.id}
                shadow="sm"
                withBorder
                radius="md"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/candidate/request/${req.id}`)}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="sm">
                    Request #{req.id}
                  </Text>
                  <StatusBadge status={req.status} />
                </Group>
                <Text size="xs" c="dimmed">
                  From: {req.employer_name ?? 'Unknown'}
                </Text>
                {req.reason && (
                  <Text size="xs" c="dimmed">
                    Reason: {req.reason}
                  </Text>
                )}
                <Text size="xs" c="dimmed">
                  {req.items.length} verification{req.items.length !== 1 ? 's' : ''}
                </Text>
                <Text size="xs" c="dimmed" mt="xs">
                  {formatDateTime(req.created_at)}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}

      <Text fw={600} mb="xs">
        All Requests ({requests.length})
      </Text>

      {requests.length === 0 ? (
        <EmptyState message="No verification requests yet" />
      ) : (
        <Stack gap="xs">
          {requests.map((req) => (
            <Card
              key={req.id}
              shadow="xs"
              withBorder
              radius="sm"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/candidate/request/${req.id}`)}
              p="sm"
            >
              <Group justify="space-between" wrap="wrap">
                <Group gap="xs">
                  <IconClipboardCheck size={18} color="gray" />
                  <Text size="sm" fw={500}>
                    Request #{req.id}
                  </Text>
                  <StatusBadge status={req.status} />
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    {req.employer_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDateTime(req.created_at)}
                  </Text>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
