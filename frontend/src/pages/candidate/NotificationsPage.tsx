import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Group, Text, Stack, Button, Badge } from '@mantine/core';
import { notifications as mantineNotifications } from '@mantine/notifications';
import { IconBell, IconCheck } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getNotifications, markNotificationRead } from '../../api/candidate';
import { formatDateTime } from '../../utils/format';
import type { NotificationResponse } from '../../types';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    getNotifications()
      .then(setItems)
      .catch(() =>
        mantineNotifications.show({ title: 'Error', message: 'Failed to load notifications', color: 'red' })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      mantineNotifications.show({ title: 'Error', message: 'Failed to mark as read', color: 'red' });
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader title="Notifications" subtitle="Stay up to date with verification activity" />

      {items.length === 0 ? (
        <EmptyState message="No notifications" />
      ) : (
        <Stack gap="xs">
          {items.map((n) => (
            <Card
              key={n.id}
              shadow="xs"
              withBorder
              p="sm"
              style={{
                opacity: n.is_read ? 0.7 : 1,
                borderLeft: n.is_read ? undefined : '3px solid var(--mantine-color-saGreen-6)',
              }}
            >
              <Group justify="space-between" wrap="wrap">
                <Stack gap={2} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <IconBell size={16} />
                    <Text size="sm" fw={n.is_read ? 400 : 600}>
                      {n.title}
                    </Text>
                    {!n.is_read && (
                      <Badge size="xs" color="blue">
                        New
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {n.message}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDateTime(n.created_at)}
                  </Text>
                </Stack>
                <Group gap="xs">
                  {n.link && (
                    <Button size="compact-xs" variant="light" onClick={() => navigate(n.link!)}>
                      View
                    </Button>
                  )}
                  {!n.is_read && (
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      leftSection={<IconCheck size={14} />}
                      onClick={() => handleMarkRead(n.id)}
                    >
                      Read
                    </Button>
                  )}
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
