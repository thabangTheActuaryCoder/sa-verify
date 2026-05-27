import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Select,
  Textarea,
  Stack,
  Group,
  Text,
  Card,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconGavel } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getDisputes, resolveDispute } from '../../api/admin';
import { formatDateTime, maskIdNumber } from '../../utils/format';
import type { AdminDisputeRecord } from '../../types';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDispute, setSelectedDispute] = useState<AdminDisputeRecord | null>(null);
  const [resolveStatus, setResolveStatus] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const fetchDisputes = () => {
    getDisputes(statusFilter ?? undefined)
      .then(setDisputes)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load disputes', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const handleResolveOpen = (dispute: AdminDisputeRecord) => {
    setSelectedDispute(dispute);
    setResolveStatus(null);
    setResolveNotes('');
    open();
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolveStatus || !resolveNotes) {
      notifications.show({ title: 'Error', message: 'Status and notes are required', color: 'red' });
      return;
    }
    setSubmitting(true);
    try {
      await resolveDispute(selectedDispute.id, {
        status: resolveStatus,
        resolution_notes: resolveNotes,
      });
      notifications.show({ title: 'Success', message: 'Dispute updated', color: 'green' });
      close();
      fetchDisputes();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to resolve dispute',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Dispute Management"
        subtitle="Review and resolve citizen disputes"
      />

      <Group mb="md">
        <Select
          placeholder="Filter by status"
          data={[
            { value: 'open', label: 'Open' },
            { value: 'under_review', label: 'Under Review' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          style={{ minWidth: 180 }}
        />
      </Group>

      {disputes.length === 0 ? (
        <EmptyState message="No disputes found" />
      ) : (
        <Card radius="lg" p={0} style={{ overflow: 'hidden' }}>
          <Table striped withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#FFF3D6' }}>
                <Table.Th>ID</Table.Th>
                <Table.Th>Citizen</Table.Th>
                <Table.Th>ID Number</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Field</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {disputes.map((d) => (
                <Table.Tr key={d.id}>
                  <Table.Td>#{d.id}</Table.Td>
                  <Table.Td>{d.citizen_name}</Table.Td>
                  <Table.Td ff="monospace">{maskIdNumber(d.citizen_id_number)}</Table.Td>
                  <Table.Td>{d.dispute_type}</Table.Td>
                  <Table.Td>{d.field_disputed}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={d.status} />
                  </Table.Td>
                  <Table.Td>{formatDateTime(d.created_at)}</Table.Td>
                  <Table.Td>
                    <Button
                      size="compact-xs"
                      variant="light"
                      color="saGold"
                      leftSection={<IconGavel size={14} />}
                      onClick={() => handleResolveOpen(d)}
                    >
                      Resolve
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      <Modal opened={opened} onClose={close} title={`Resolve Dispute #${selectedDispute?.id}`} radius="lg">
        <Stack>
          {selectedDispute && (
            <Card radius="md" p="sm" style={{ background: '#FFF9F2' }}>
              <Text size="sm">
                <strong>Citizen:</strong> {selectedDispute.citizen_name}
              </Text>
              <Text size="sm">
                <strong>Type:</strong> {selectedDispute.dispute_type}
              </Text>
              <Text size="sm">
                <strong>Field:</strong> {selectedDispute.field_disputed}
              </Text>
              <Text size="sm">
                <strong>Reason:</strong> {selectedDispute.reason}
              </Text>
            </Card>
          )}
          <Select
            label="Resolution Status"
            data={[
              { value: 'under_review', label: 'Under Review' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            value={resolveStatus}
            onChange={setResolveStatus}
            required
          />
          <Textarea
            label="Resolution Notes"
            placeholder="Describe the resolution or reason for rejection"
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>Cancel</Button>
            <Button
              onClick={handleResolve}
              loading={submitting}
              variant="gradient"
              gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
