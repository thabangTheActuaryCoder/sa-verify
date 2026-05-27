import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Group,
  Text,
  Stack,
  Button,
  Table,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDownload, IconRefresh } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import { getRequest, downloadReport } from '../../api/employer';
import { formatDateTime, maskIdNumber } from '../../utils/format';
import { getQueryLabel } from '../../utils/queryTypes';
import type { VerificationRequestResponse } from '../../types';

export default function EmployerRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<VerificationRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRequest = useCallback(() => {
    if (!id) return;
    getRequest(Number(id))
      .then(setRequest)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load request', color: 'red' }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchRequest();
    // Auto-refresh every 15 seconds for pending requests
    const interval = setInterval(fetchRequest, 15000);
    return () => clearInterval(interval);
  }, [fetchRequest]);

  const handleDownloadReport = async () => {
    if (!id) return;
    try {
      const text = await downloadReport(Number(id));
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verification_report_${id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to download report', color: 'red' });
    }
  };

  const parseParams = (paramsStr: string) => {
    try {
      return JSON.parse(paramsStr);
    } catch {
      return {};
    }
  };

  if (loading) return <LoadingState />;
  if (!request) return <Text>Request not found</Text>;

  return (
    <>
      <PageHeader
        title={`Verification Request #${request.id}`}
        actions={
          <Group>
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={fetchRequest}
            >
              Refresh
            </Button>
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Group>
        }
      />

      <Card shadow="sm" withBorder mb="md" p="md">
        <Group wrap="wrap" gap="xl">
          <Stack gap={4}>
            <Text size="xs" c="dimmed">Candidate ID</Text>
            <Text size="sm" fw={500} ff="monospace">{maskIdNumber(request.candidate_id_number)}</Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">Status</Text>
            <StatusBadge status={request.status} />
          </Stack>
          {request.reason && (
            <Stack gap={4}>
              <Text size="xs" c="dimmed">Reason</Text>
              <Text size="sm">{request.reason}</Text>
            </Stack>
          )}
          <Stack gap={4}>
            <Text size="xs" c="dimmed">Created</Text>
            <Text size="sm">{formatDateTime(request.created_at)}</Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">Updated</Text>
            <Text size="sm">{formatDateTime(request.updated_at)}</Text>
          </Stack>
        </Group>
      </Card>

      <Card shadow="sm" withBorder p="md">
        <Text fw={600} mb="sm">
          Verification Items ({request.items.length})
        </Text>
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Query Type</Table.Th>
              <Table.Th>Parameters</Table.Th>
              <Table.Th>Consent</Table.Th>
              <Table.Th>Result</Table.Th>
              <Table.Th>Responded</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {request.items.map((item) => {
              const params = parseParams(item.query_params);
              return (
                <Table.Tr key={item.id}>
                  <Table.Td>{getQueryLabel(item.query_type)}</Table.Td>
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
                    <StatusBadge status={item.consent_status} />
                  </Table.Td>
                  <Table.Td>
                    {item.result ? (
                      <Badge color={item.result === 'Yes' ? 'green' : 'red'} variant="light" size="sm">
                        {item.result}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">Awaiting</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{formatDateTime(item.responded_at)}</Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Card>
    </>
  );
}
