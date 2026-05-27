import { useEffect, useState } from 'react';
import {
  SimpleGrid,
  Card,
  Text,
  Stack,
  Table,
  Button,
  Tabs,
  Group,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconUsers,
  IconBuilding,
  IconClipboardCheck,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconBell,
} from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import SeverityBadge from '../../components/common/SeverityBadge';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import {
  getStats,
  getFraudAlerts,
  sendFraudNotifications,
  getRequests,
  getAuditLog,
} from '../../api/admin';
import { formatDateTime, maskIdNumber } from '../../utils/format';
import type {
  SystemStats,
  FraudAlert,
  AdminRequestRecord,
  AuditLogEntry,
} from '../../types';

interface StatCardProps {
  title: string;
  value: number;
  icon: typeof IconUsers;
  colour: string;
}

function StatCard({ title, value, icon: Icon, colour }: StatCardProps) {
  return (
    <Card shadow="sm" withBorder p="md">
      <Group>
        <ThemeIcon size={42} variant="light" color={colour} radius="md">
          <Icon size={24} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {title}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [requests, setRequests] = useState<AdminRequestRecord[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    Promise.all([getStats(), getFraudAlerts(), getRequests(), getAuditLog(50)])
      .then(([s, f, r, a]) => {
        setStats(s);
        setFraudAlerts(f);
        setRequests(r);
        setAuditLog(a);
      })
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load dashboard data', color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  const handleNotifyFraud = async () => {
    setNotifying(true);
    try {
      const res = await sendFraudNotifications();
      notifications.show({ title: 'Success', message: res.message, color: 'green' });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to send notifications', color: 'red' });
    } finally {
      setNotifying(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="System overview and management" />

      {stats && (
        <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} mb="lg">
          <StatCard title="Citizens" value={stats.total_citizens} icon={IconUsers} colour="blue" />
          <StatCard title="Companies" value={stats.total_companies} icon={IconBuilding} colour="violet" />
          <StatCard title="Total Requests" value={stats.total_verification_requests} icon={IconClipboardCheck} colour="cyan" />
          <StatCard title="Pending" value={stats.pending_requests} icon={IconClock} colour="yellow" />
          <StatCard title="Completed" value={stats.completed_requests} icon={IconCircleCheck} colour="green" />
          <StatCard title="Fraud Alerts" value={stats.total_fraud_alerts} icon={IconAlertTriangle} colour="red" />
        </SimpleGrid>
      )}

      <Tabs defaultValue="fraud">
        <Tabs.List>
          <Tabs.Tab value="fraud" leftSection={<IconAlertTriangle size={16} />}>
            Fraud Alerts ({fraudAlerts.length})
          </Tabs.Tab>
          <Tabs.Tab value="requests" leftSection={<IconClipboardCheck size={16} />}>
            Recent Requests
          </Tabs.Tab>
          <Tabs.Tab value="audit" leftSection={<IconClock size={16} />}>
            Audit Log
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="fraud" pt="md">
          <Group mb="sm">
            <Button
              leftSection={<IconBell size={16} />}
              variant="light"
              color="orange"
              onClick={handleNotifyFraud}
              loading={notifying}
            >
              Send Fraud Notifications
            </Button>
          </Group>
          {fraudAlerts.length === 0 ? (
            <EmptyState message="No fraud alerts detected" />
          ) : (
            <Table striped withTableBorder highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Severity</Table.Th>
                  <Table.Th>Citizen</Table.Th>
                  <Table.Th>ID Number</Table.Th>
                  <Table.Th>Description</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {fraudAlerts.map((alert, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{alert.alert_type.replace(/_/g, ' ')}</Table.Td>
                    <Table.Td>
                      <SeverityBadge severity={alert.severity} />
                    </Table.Td>
                    <Table.Td>{alert.citizen_name}</Table.Td>
                    <Table.Td ff="monospace">{maskIdNumber(alert.citizen_id_number)}</Table.Td>
                    <Table.Td style={{ maxWidth: 300 }}>{alert.description}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="requests" pt="md">
          {requests.length === 0 ? (
            <EmptyState message="No verification requests" />
          ) : (
            <Table striped withTableBorder highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Employer</Table.Th>
                  <Table.Th>Candidate ID</Table.Th>
                  <Table.Th>Items</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {requests.slice(0, 50).map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td>#{r.id}</Table.Td>
                    <Table.Td>{r.employer_name ?? '-'}</Table.Td>
                    <Table.Td ff="monospace">{maskIdNumber(r.candidate_id_number)}</Table.Td>
                    <Table.Td>{r.item_count}</Table.Td>
                    <Table.Td>
                      <StatusBadge status={r.status} />
                    </Table.Td>
                    <Table.Td>{formatDateTime(r.created_at)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="audit" pt="md">
          {auditLog.length === 0 ? (
            <EmptyState message="No audit entries" />
          ) : (
            <Table striped withTableBorder highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Timestamp</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Resource</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {auditLog.map((entry) => (
                  <Table.Tr key={entry.id}>
                    <Table.Td>{formatDateTime(entry.timestamp)}</Table.Td>
                    <Table.Td>{entry.username ?? '-'}</Table.Td>
                    <Table.Td>{entry.action}</Table.Td>
                    <Table.Td>
                      {entry.resource_type}
                      {entry.resource_id ? ` #${entry.resource_id}` : ''}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
