import { useEffect, useState } from 'react';
import { Table, Badge, Card } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getHistory } from '../../api/candidate';
import { formatDateTime } from '../../utils/format';
import { getQueryLabel } from '../../utils/queryTypes';
import type { VerificationHistoryEntry } from '../../types';

export default function HistoryPage() {
  const [entries, setEntries] = useState<VerificationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(setEntries)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load history', color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Verification History" subtitle="Complete history of all verification queries against your records" />

      {entries.length === 0 ? (
        <EmptyState message="No verification history" />
      ) : (
        <Card radius="lg" p={0} style={{ overflow: 'hidden' }}>
          <Table striped withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#FFF3D6' }}>
                <Table.Th>Request</Table.Th>
                <Table.Th>Employer</Table.Th>
                <Table.Th>Query Type</Table.Th>
                <Table.Th>Consent</Table.Th>
                <Table.Th>Result</Table.Th>
                <Table.Th>Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entries.map((entry, i) => (
                <Table.Tr key={i}>
                  <Table.Td>#{entry.request_id}</Table.Td>
                  <Table.Td>{entry.employer_name ?? '-'}</Table.Td>
                  <Table.Td>{getQueryLabel(entry.query_type)}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={entry.consent_status} />
                  </Table.Td>
                  <Table.Td>
                    {entry.result ? (
                      <Badge color={entry.result === 'Yes' ? 'saGreen' : 'saTerracotta'} variant="light" size="sm">
                        {entry.result}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </Table.Td>
                  <Table.Td>{formatDateTime(entry.created_at)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </>
  );
}
