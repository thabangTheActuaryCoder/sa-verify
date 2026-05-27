import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Group,
  Text,
  Stack,
  TextInput,
  Textarea,
  Button,
  Select,
  Table,
  Divider,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconSend, IconAlertCircle } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import QueryBuilder from '../../components/forms/QueryBuilder';
import { submitVerification, getRequests } from '../../api/employer';
import { formatDateTime } from '../../utils/format';
import { maskIdNumber } from '../../utils/format';
import type { VerificationRequestResponse, QueryItem } from '../../types';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VerificationRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [candidateId, setCandidateId] = useState('');
  const [reason, setReason] = useState('');
  const [queryItems, setQueryItems] = useState<QueryItem[]>([
    { query_type: 'id_verification', query_params: {} },
  ]);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const [formError, setFormError] = useState('');

  const fetchRequests = () => {
    getRequests(statusFilter ?? undefined, searchFilter || undefined)
      .then(setRequests)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load requests', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, searchFilter]);

  const handleSubmit = async () => {
    setFormError('');
    if (!candidateId.trim()) {
      setFormError('Candidate ID number is required');
      return;
    }
    if (candidateId.trim().length !== 13) {
      setFormError('SA ID number must be 13 digits');
      return;
    }
    if (queryItems.length === 0) {
      setFormError('At least one query is required');
      return;
    }

    setSubmitting(true);
    try {
      await submitVerification({
        candidate_id_number: candidateId.trim(),
        reason: reason.trim() || undefined,
        items: queryItems,
      });
      notifications.show({ title: 'Success', message: 'Verification request submitted', color: 'green' });
      setCandidateId('');
      setReason('');
      setQueryItems([{ query_type: 'id_verification', query_params: {} }]);
      fetchRequests();
    } catch (err: any) {
      setFormError(err.response?.data?.detail ?? 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Employer Dashboard"
        subtitle="Submit and manage verification requests"
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
        <Text fw={600} mb="sm" c="#1C1C2E">
          New Verification Request
        </Text>
        <Stack gap="sm">
          {formError && (
            <Alert icon={<IconAlertCircle size={16} />} color="saTerracotta" variant="light">
              {formError}
            </Alert>
          )}
          <Group align="flex-start" wrap="wrap">
            <TextInput
              label="Candidate SA ID Number"
              placeholder="13-digit ID number"
              value={candidateId}
              onChange={(e) => setCandidateId(e.currentTarget.value)}
              maxLength={13}
              style={{ minWidth: 220 }}
              required
            />
            <Textarea
              label="Reason (optional)"
              placeholder="e.g. Pre-employment screening"
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
              style={{ minWidth: 300, flex: 1 }}
              rows={1}
              autosize
            />
          </Group>

          <QueryBuilder items={queryItems} onChange={setQueryItems} />

          <Group justify="flex-end">
            <Button
              leftSection={<IconSend size={16} />}
              onClick={handleSubmit}
              loading={submitting}
              variant="gradient"
              gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
            >
              Submit Request
            </Button>
          </Group>
        </Stack>
      </Card>

      <Divider mb="md" />

      <Group mb="md" wrap="wrap">
        <Select
          placeholder="Filter by status"
          data={[
            { value: 'pending', label: 'Pending' },
            { value: 'partial', label: 'Partial' },
            { value: 'completed', label: 'Completed' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          style={{ minWidth: 160 }}
        />
        <TextInput
          placeholder="Search by ID number..."
          leftSection={<IconSearch size={16} />}
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.currentTarget.value)}
          style={{ minWidth: 220 }}
        />
      </Group>

      {loading ? (
        <LoadingState />
      ) : requests.length === 0 ? (
        <EmptyState message="No verification requests found" />
      ) : (
        <Card radius="lg" p={0} style={{ overflow: 'hidden' }}>
          <Table striped withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#FFF3D6' }}>
                <Table.Th>ID</Table.Th>
                <Table.Th>Candidate ID</Table.Th>
                <Table.Th>Items</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {requests.map((req) => (
                <Table.Tr
                  key={req.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/employer/request/${req.id}`)}
                >
                  <Table.Td>#{req.id}</Table.Td>
                  <Table.Td ff="monospace">{maskIdNumber(req.candidate_id_number)}</Table.Td>
                  <Table.Td>{req.items.length}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={req.status} />
                  </Table.Td>
                  <Table.Td>{req.reason ?? '-'}</Table.Td>
                  <Table.Td>{formatDateTime(req.created_at)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </>
  );
}
