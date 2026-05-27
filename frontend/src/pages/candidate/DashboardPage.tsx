import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Group, Text, Stack, SimpleGrid, ThemeIcon, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconClipboardCheck, IconClock, IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getRequests } from '../../api/candidate';
import { formatDateTime } from '../../utils/format';
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
  const completed = requests.filter((r) => r.status === 'completed');
  const others = requests.filter((r) => r.status !== 'pending');

  return (
    <>
      <PageHeader
        title="Candidate Dashboard"
        subtitle="Review and respond to verification requests"
      />

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
        <Card
          p="lg"
          radius="lg"
          className="gradient-card-green"
          style={{ background: 'linear-gradient(135deg, #0D8044 0%, #0a6636 100%)' }}
        >
          <Group>
            <ThemeIcon size={48} radius="md" variant="white" color="green">
              <IconClipboardCheck size={26} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="rgba(255,255,255,0.8)" tt="uppercase" fw={600}>
                Total Requests
              </Text>
              <Text size="xl" fw={700} c="white">
                {requests.length}
              </Text>
            </Box>
          </Group>
        </Card>
        <Card
          p="lg"
          radius="lg"
          style={{ background: 'linear-gradient(135deg, #F5A623 0%, #d48e1a 100%)' }}
        >
          <Group>
            <ThemeIcon size={48} radius="md" variant="white" color="yellow">
              <IconClock size={26} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="rgba(255,255,255,0.8)" tt="uppercase" fw={600}>
                Pending
              </Text>
              <Text size="xl" fw={700} c="white">
                {pending.length}
              </Text>
            </Box>
          </Group>
        </Card>
        <Card
          p="lg"
          radius="lg"
          style={{ background: 'linear-gradient(135deg, #1C1C2E 0%, #2a2a42 100%)' }}
        >
          <Group>
            <ThemeIcon size={48} radius="md" variant="white" color="dark">
              <IconCircleCheck size={26} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="rgba(255,255,255,0.8)" tt="uppercase" fw={600}>
                Completed
              </Text>
              <Text size="xl" fw={700} c="white">
                {completed.length}
              </Text>
            </Box>
          </Group>
        </Card>
      </SimpleGrid>

      {pending.length > 0 && (
        <>
          <Text fw={600} mb="xs" c="#1C1C2E">
            Pending Consent ({pending.length})
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="lg">
            {pending.map((req) => (
              <Card
                key={req.id}
                shadow="sm"
                radius="lg"
                p="md"
                className="hover-lift"
                style={{
                  cursor: 'pointer',
                  borderLeft: '4px solid #F5A623',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
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

      <Text fw={600} mb="xs" c="#1C1C2E">
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
              radius="md"
              className="hover-lift"
              style={{ cursor: 'pointer', background: '#FFFFFF' }}
              onClick={() => navigate(`/candidate/request/${req.id}`)}
              p="sm"
            >
              <Group justify="space-between" wrap="wrap">
                <Group gap="xs">
                  <IconClipboardCheck size={18} color="#0D8044" />
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
