import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  Group,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getDisputes, createDispute } from '../../api/candidate';
import { formatDateTime } from '../../utils/format';
import type { DisputeResponse } from '../../types';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [disputeType, setDisputeType] = useState('');
  const [fieldDisputed, setFieldDisputed] = useState('');
  const [reason, setReason] = useState('');

  const fetchDisputes = () => {
    getDisputes()
      .then(setDisputes)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load disputes', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleSubmit = async () => {
    if (!disputeType || !fieldDisputed || !reason) {
      notifications.show({ title: 'Error', message: 'All fields are required', color: 'red' });
      return;
    }
    setSubmitting(true);
    try {
      await createDispute({
        dispute_type: disputeType,
        field_disputed: fieldDisputed,
        reason,
      });
      notifications.show({ title: 'Success', message: 'Dispute submitted', color: 'green' });
      close();
      setDisputeType('');
      setFieldDisputed('');
      setReason('');
      fetchDisputes();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to create dispute',
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
        title="My Disputes"
        subtitle="Dispute inaccurate information on your record"
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={open}
            variant="gradient"
            gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
          >
            New Dispute
          </Button>
        }
      />

      {disputes.length === 0 ? (
        <EmptyState message="No disputes filed" />
      ) : (
        <Card radius="lg" p={0} style={{ overflow: 'hidden' }}>
          <Table striped withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#FFF3D6' }}>
                <Table.Th>ID</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Field</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Resolution</Table.Th>
                <Table.Th>Created</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {disputes.map((d) => (
                <Table.Tr key={d.id}>
                  <Table.Td>#{d.id}</Table.Td>
                  <Table.Td>{d.dispute_type}</Table.Td>
                  <Table.Td>{d.field_disputed}</Table.Td>
                  <Table.Td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.reason}
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={d.status} />
                  </Table.Td>
                  <Table.Td>{d.resolution_notes ?? '-'}</Table.Td>
                  <Table.Td>{formatDateTime(d.created_at)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      <Modal opened={opened} onClose={close} title="File a Dispute" radius="lg">
        <Stack>
          <Select
            label="Dispute Type"
            placeholder="Select type"
            data={[
              { value: 'incorrect_data', label: 'Incorrect Data' },
              { value: 'identity_theft', label: 'Identity Theft' },
              { value: 'outdated_info', label: 'Outdated Information' },
              { value: 'other', label: 'Other' },
            ]}
            value={disputeType}
            onChange={(v) => setDisputeType(v ?? '')}
            required
          />
          <TextInput
            label="Field Disputed"
            placeholder="e.g. employment, criminal_record"
            value={fieldDisputed}
            onChange={(e) => setFieldDisputed(e.currentTarget.value)}
            required
          />
          <Textarea
            label="Reason"
            placeholder="Describe why this information is incorrect"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              variant="gradient"
              gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
            >
              Submit Dispute
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
