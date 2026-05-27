import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Group,
  Text,
  Stack,
  Button,
  Table,
  Badge,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck, IconX } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import { getRequest, submitConsent } from '../../api/candidate';
import { formatDateTime } from '../../utils/format';
import { getQueryLabel } from '../../utils/queryTypes';
import type { VerificationRequestResponse, ConsentDecision } from '../../types';

export default function CandidateRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<VerificationRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'declined'>>({});

  const fetchRequest = () => {
    if (!id) return;
    getRequest(Number(id))
      .then(setRequest)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load request', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleDecision = (itemId: number, decision: 'approved' | 'declined') => {
    setDecisions((prev) => ({ ...prev, [itemId]: decision }));
  };

  const handleSubmit = async () => {
    const consentDecisions: ConsentDecision[] = Object.entries(decisions).map(
      ([itemId, decision]) => ({ item_id: Number(itemId), decision })
    );

    if (consentDecisions.length === 0) {
      notifications.show({ title: 'Warning', message: 'No decisions made', color: 'yellow' });
      return;
    }

    setSubmitting(true);
    try {
      await submitConsent({ decisions: consentDecisions });
      notifications.show({ title: 'Success', message: 'Consent submitted successfully', color: 'green' });
      setDecisions({});
      fetchRequest();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to submit consent',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!request) return <Text>Request not found</Text>;

  const pendingItems = request.items.filter((i) => i.consent_status === 'pending');
  const processedItems = request.items.filter((i) => i.consent_status !== 'pending');

  const parseParams = (paramsStr: string) => {
    try {
      return JSON.parse(paramsStr);
    } catch {
      return {};
    }
  };

  return (
    <>
      <PageHeader
        title={`Request #${request.id}`}
        subtitle={`From ${request.employer_name ?? 'Unknown employer'}`}
        actions={
          <Button variant="light" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <Card shadow="sm" withBorder mb="md" p="md">
        <Group justify="space-between" wrap="wrap">
          <Stack gap={4}>
            <Group gap="xs">
              <Text size="sm" fw={500}>Status:</Text>
              <StatusBadge status={request.status} />
            </Group>
            {request.reason && <Text size="sm" c="dimmed">Reason: {request.reason}</Text>}
            <Text size="xs" c="dimmed">Created: {formatDateTime(request.created_at)}</Text>
          </Stack>
        </Group>
      </Card>

      {pendingItems.length > 0 && (
        <Card shadow="sm" withBorder mb="md" p="md">
          <Text fw={600} mb="sm">
            Pending Consent ({pendingItems.length})
          </Text>
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Query Type</Table.Th>
                <Table.Th>Parameters</Table.Th>
                <Table.Th>Decision</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pendingItems.map((item) => {
                const params = parseParams(item.query_params);
                return (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Text size="sm">{getQueryLabel(item.query_type)}</Text>
                    </Table.Td>
                    <Table.Td>
                      {Object.keys(params).length > 0 ? (
                        <Stack gap={2}>
                          {Object.entries(params).map(([k, v]) => (
                            <Text size="xs" key={k}>
                              {k}: <strong>{String(v)}</strong>
                            </Text>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="xs" c="dimmed">None</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          size="compact-xs"
                          color="green"
                          variant={decisions[item.id] === 'approved' ? 'filled' : 'light'}
                          leftSection={<IconCheck size={14} />}
                          onClick={() => handleDecision(item.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="compact-xs"
                          color="red"
                          variant={decisions[item.id] === 'declined' ? 'filled' : 'light'}
                          leftSection={<IconX size={14} />}
                          onClick={() => handleDecision(item.id, 'declined')}
                        >
                          Decline
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
          <Group justify="flex-end" mt="md">
            <Button onClick={handleSubmit} loading={submitting} disabled={Object.keys(decisions).length === 0}>
              Submit Consent
            </Button>
          </Group>
        </Card>
      )}

      {processedItems.length > 0 && (
        <Card shadow="sm" withBorder p="md">
          <Text fw={600} mb="sm">
            Processed Items ({processedItems.length})
          </Text>
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Query Type</Table.Th>
                <Table.Th>Consent</Table.Th>
                <Table.Th>Result</Table.Th>
                <Table.Th>Responded</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {processedItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{getQueryLabel(item.query_type)}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={item.consent_status} />
                  </Table.Td>
                  <Table.Td>
                    {item.result ? (
                      <Badge color={item.result === 'Yes' ? 'green' : 'red'} variant="light" size="sm">
                        {item.result}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">-</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{formatDateTime(item.responded_at)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </>
  );
}
