import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Stack,
  Group,
  Badge,
  Switch,
  Card,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getUsers, createUser, updateUser } from '../../api/admin';
import type { UserRecord } from '../../types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<string | null>(null);
  const [editActive, setEditActive] = useState(true);

  const fetchUsers = () => {
    getUsers()
      .then(setUsers)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load users', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    if (!newUsername || !newPassword || !newFullName || !newRole) {
      notifications.show({ title: 'Error', message: 'All fields are required', color: 'red' });
      return;
    }
    setSubmitting(true);
    try {
      await createUser({
        username: newUsername,
        password: newPassword,
        full_name: newFullName,
        role: newRole,
      });
      notifications.show({ title: 'Success', message: 'User created', color: 'green' });
      closeCreate();
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      setNewRole(null);
      fetchUsers();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to create user',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (user: UserRecord) => {
    setEditUser(user);
    setEditFullName(user.full_name);
    setEditRole(user.role);
    setEditActive(user.is_active);
    openEdit();
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      await updateUser(editUser.id, {
        full_name: editFullName || undefined,
        role: editRole || undefined,
        is_active: editActive,
      });
      notifications.show({ title: 'Success', message: 'User updated', color: 'green' });
      closeEdit();
      fetchUsers();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to update user',
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
        title="User Management"
        subtitle="Manage system user accounts"
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreate}
            variant="gradient"
            gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
          >
            Create User
          </Button>
        }
      />

      {users.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <Card radius="lg" p={0} style={{ overflow: 'hidden' }}>
          <Table striped withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#FFF3D6' }}>
                <Table.Th>ID</Table.Th>
                <Table.Th>Username</Table.Th>
                <Table.Th>Full Name</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Active</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>{u.id}</Table.Td>
                  <Table.Td ff="monospace">{u.username}</Table.Td>
                  <Table.Td>{u.full_name}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={u.role === 'admin' ? 'saTerracotta' : u.role === 'employer' ? 'saGold' : 'saGreen'}
                      variant="light"
                      size="sm"
                    >
                      {u.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={u.is_active ? 'saGreen' : 'saTerracotta'} variant="light" size="sm">
                      {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="compact-xs"
                      variant="light"
                      leftSection={<IconEdit size={14} />}
                      onClick={() => handleEditOpen(u)}
                    >
                      Edit
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      <Modal opened={createOpened} onClose={closeCreate} title="Create User" radius="lg">
        <Stack>
          <TextInput
            label="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Full Name"
            value={newFullName}
            onChange={(e) => setNewFullName(e.currentTarget.value)}
            required
          />
          <Select
            label="Role"
            data={[
              { value: 'candidate', label: 'Candidate' },
              { value: 'employer', label: 'Employer' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={newRole}
            onChange={setNewRole}
            required
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeCreate}>Cancel</Button>
            <Button
              onClick={handleCreate}
              loading={submitting}
              variant="gradient"
              gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={editOpened} onClose={closeEdit} title={`Edit User: ${editUser?.username}`} radius="lg">
        <Stack>
          <TextInput
            label="Full Name"
            value={editFullName}
            onChange={(e) => setEditFullName(e.currentTarget.value)}
          />
          <Select
            label="Role"
            data={[
              { value: 'candidate', label: 'Candidate' },
              { value: 'employer', label: 'Employer' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={editRole}
            onChange={setEditRole}
          />
          <Switch
            label="Active"
            checked={editActive}
            onChange={(e) => setEditActive(e.currentTarget.checked)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeEdit}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              loading={submitting}
              variant="gradient"
              gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
            >
              Update
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
