import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Select,
  Group,
  Card,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconShieldPlus, IconTrash } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import {
  getBlockedCompanies,
  blockCompany,
  unblockCompany,
  getCompanies,
} from '../../api/candidate';
import { formatDateTime } from '../../utils/format';
import type { BlockedCompanyResponse, CompanyOption } from '../../types';

export default function BlockedPage() {
  const [blocked, setBlocked] = useState<BlockedCompanyResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    Promise.all([getBlockedCompanies(), getCompanies()])
      .then(([b, c]) => {
        setBlocked(b);
        setCompanies(c);
      })
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load data', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBlock = async () => {
    if (!selectedCompany) return;
    setSubmitting(true);
    try {
      await blockCompany(Number(selectedCompany));
      notifications.show({ title: 'Success', message: 'Company blocked', color: 'green' });
      setSelectedCompany(null);
      fetchData();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to block company',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblock = async (blockId: number) => {
    try {
      await unblockCompany(blockId);
      notifications.show({ title: 'Success', message: 'Company unblocked', color: 'green' });
      fetchData();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to unblock',
        color: 'red',
      });
    }
  };

  if (loading) return <LoadingState />;

  const blockedIds = new Set(blocked.map((b) => b.company_id));
  const availableCompanies = companies
    .filter((c) => !blockedIds.has(c.id))
    .map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <>
      <PageHeader
        title="Blocked Companies"
        subtitle="Prevent companies from requesting verification of your records"
      />

      <Card shadow="sm" withBorder mb="md" p="md">
        <Text fw={500} size="sm" mb="xs">
          Block a Company
        </Text>
        <Group>
          <Select
            placeholder="Select company"
            data={availableCompanies}
            value={selectedCompany}
            onChange={setSelectedCompany}
            searchable
            style={{ minWidth: 250 }}
          />
          <Button
            leftSection={<IconShieldPlus size={16} />}
            onClick={handleBlock}
            loading={submitting}
            disabled={!selectedCompany}
          >
            Block
          </Button>
        </Group>
      </Card>

      {blocked.length === 0 ? (
        <EmptyState message="No companies blocked" />
      ) : (
        <Table striped withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Company</Table.Th>
              <Table.Th>Blocked At</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {blocked.map((b) => (
              <Table.Tr key={b.id}>
                <Table.Td>{b.company_name}</Table.Td>
                <Table.Td>{formatDateTime(b.blocked_at)}</Table.Td>
                <Table.Td>
                  <Button
                    size="compact-xs"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => handleUnblock(b.id)}
                  >
                    Unblock
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
}
