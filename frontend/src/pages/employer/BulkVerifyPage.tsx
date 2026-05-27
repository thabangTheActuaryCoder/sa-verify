import { useState } from 'react';
import {
  Card,
  Text,
  Stack,
  Textarea,
  TextInput,
  Button,
  Alert,
  Table,
  Badge,
  Group,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSend, IconAlertCircle } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import QueryBuilder from '../../components/forms/QueryBuilder';
import { submitBulkVerification } from '../../api/employer';
import type { QueryItem } from '../../types';

interface BulkResult {
  submitted: { id_number: string; request_id: number }[];
  errors: { id_number: string; error: string }[];
  message: string;
}

export default function BulkVerifyPage() {
  const [idNumbers, setIdNumbers] = useState('');
  const [reason, setReason] = useState('');
  const [queryItems, setQueryItems] = useState<QueryItem[]>([
    { query_type: 'id_verification', query_params: {} },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState<BulkResult | null>(null);

  const handleSubmit = async () => {
    setFormError('');
    setResult(null);

    const ids = idNumbers
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      setFormError('Enter at least one candidate ID number');
      return;
    }
    if (queryItems.length === 0) {
      setFormError('At least one query is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitBulkVerification({
        candidate_id_numbers: ids,
        reason: reason.trim() || undefined,
        items: queryItems,
      });
      setResult(res);
      notifications.show({ title: 'Done', message: res.message, color: 'green' });
    } catch (err: any) {
      setFormError(err.response?.data?.detail ?? 'Bulk submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Bulk Verification"
        subtitle="Submit verification requests for multiple candidates at once"
      />

      <Card
        shadow="sm"
        radius="lg"
        mb="lg"
        p="md"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Stack gap="sm">
          {formError && (
            <Alert icon={<IconAlertCircle size={16} />} color="saTerracotta" variant="light">
              {formError}
            </Alert>
          )}

          <Textarea
            label="Candidate ID Numbers"
            description="Enter one ID number per line, or separated by commas"
            placeholder={"9001015009087\n8501025008083\n7712015006082"}
            value={idNumbers}
            onChange={(e) => setIdNumbers(e.currentTarget.value)}
            minRows={4}
            required
          />

          <TextInput
            label="Reason (optional)"
            placeholder="e.g. Annual background screening"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
          />

          <QueryBuilder items={queryItems} onChange={setQueryItems} />

          <Group justify="flex-end">
            <Button
              leftSection={<IconSend size={16} />}
              onClick={handleSubmit}
              loading={submitting}
              variant="gradient"
              gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
            >
              Submit Bulk Request
            </Button>
          </Group>
        </Stack>
      </Card>

      {result && (
        <Card shadow="sm" radius="lg" p="md">
          <Text fw={600} mb="sm">
            Results
          </Text>
          <Text size="sm" mb="md" c="dimmed">
            {result.message}
          </Text>

          {result.submitted.length > 0 && (
            <>
              <Text size="sm" fw={500} mb="xs" c="saGreen.6">
                Submitted ({result.submitted.length})
              </Text>
              <Card radius="lg" p={0} mb="md" style={{ overflow: 'hidden' }}>
                <Table striped withTableBorder>
                  <Table.Thead>
                    <Table.Tr style={{ backgroundColor: '#E8F5E9' }}>
                      <Table.Th>ID Number</Table.Th>
                      <Table.Th>Request ID</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {result.submitted.map((s) => (
                      <Table.Tr key={s.request_id}>
                        <Table.Td ff="monospace">{s.id_number}</Table.Td>
                        <Table.Td>#{s.request_id}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </>
          )}

          {result.errors.length > 0 && (
            <>
              <Text size="sm" fw={500} mb="xs" c="saTerracotta.4">
                Errors ({result.errors.length})
              </Text>
              <Card radius="lg" p={0} style={{ overflow: 'hidden' }}>
                <Table striped withTableBorder>
                  <Table.Thead>
                    <Table.Tr style={{ backgroundColor: '#FDEAE5' }}>
                      <Table.Th>ID Number</Table.Th>
                      <Table.Th>Error</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {result.errors.map((err, i) => (
                      <Table.Tr key={i}>
                        <Table.Td ff="monospace">{err.id_number}</Table.Td>
                        <Table.Td>
                          <Badge color="saTerracotta" variant="light" size="sm">
                            {err.error}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </>
          )}
        </Card>
      )}
    </>
  );
}
