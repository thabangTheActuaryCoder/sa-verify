import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  TextInput,
  Select,
  Stack,
  Group,
  Badge,
  Switch,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getCompanies, createCompany, updateCompany } from '../../api/admin';
import type { CompanyRecord } from '../../types';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);

  // Create form
  const [newName, setNewName] = useState('');
  const [newRegNum, setNewRegNum] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newRegistered, setNewRegistered] = useState(true);

  // Edit form
  const [editCompany, setEditCompany] = useState<CompanyRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editRegistered, setEditRegistered] = useState(true);

  const fetchCompanies = () => {
    getCompanies()
      .then(setCompanies)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load companies', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = async () => {
    if (!newName || !newRegNum) {
      notifications.show({ title: 'Error', message: 'Name and registration number are required', color: 'red' });
      return;
    }
    setSubmitting(true);
    try {
      await createCompany({
        name: newName,
        registration_number: newRegNum,
        sector: newSector || undefined,
        is_registered: newRegistered,
      });
      notifications.show({ title: 'Success', message: 'Company created', color: 'green' });
      closeCreate();
      setNewName('');
      setNewRegNum('');
      setNewSector('');
      setNewRegistered(true);
      fetchCompanies();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to create company',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (company: CompanyRecord) => {
    setEditCompany(company);
    setEditName(company.name);
    setEditSector(company.sector ?? '');
    setEditRegistered(company.is_registered);
    openEdit();
  };

  const handleUpdate = async () => {
    if (!editCompany) return;
    setSubmitting(true);
    try {
      await updateCompany(editCompany.id, {
        name: editName || undefined,
        sector: editSector || undefined,
        is_registered: editRegistered,
      });
      notifications.show({ title: 'Success', message: 'Company updated', color: 'green' });
      closeEdit();
      fetchCompanies();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Failed to update company',
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
        title="Company Management"
        subtitle="Manage registered companies"
        actions={
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            Add Company
          </Button>
        }
      />

      {companies.length === 0 ? (
        <EmptyState message="No companies found" />
      ) : (
        <Table striped withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Reg. Number</Table.Th>
              <Table.Th>Sector</Table.Th>
              <Table.Th>Registered</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {companies.map((c) => (
              <Table.Tr key={c.id}>
                <Table.Td>{c.id}</Table.Td>
                <Table.Td>{c.name}</Table.Td>
                <Table.Td ff="monospace">{c.registration_number}</Table.Td>
                <Table.Td>{c.sector ?? '-'}</Table.Td>
                <Table.Td>
                  <Badge color={c.is_registered ? 'green' : 'red'} variant="light" size="sm">
                    {c.is_registered ? 'Yes' : 'No'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Button
                    size="compact-xs"
                    variant="light"
                    leftSection={<IconEdit size={14} />}
                    onClick={() => handleEditOpen(c)}
                  >
                    Edit
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* Create Modal */}
      <Modal opened={createOpened} onClose={closeCreate} title="Add Company">
        <Stack>
          <TextInput
            label="Company Name"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Registration Number"
            value={newRegNum}
            onChange={(e) => setNewRegNum(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Sector"
            value={newSector}
            onChange={(e) => setNewSector(e.currentTarget.value)}
          />
          <Switch
            label="Registered"
            checked={newRegistered}
            onChange={(e) => setNewRegistered(e.currentTarget.checked)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeCreate}>Cancel</Button>
            <Button onClick={handleCreate} loading={submitting}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editOpened} onClose={closeEdit} title={`Edit: ${editCompany?.name}`}>
        <Stack>
          <TextInput
            label="Company Name"
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
          />
          <TextInput
            label="Sector"
            value={editSector}
            onChange={(e) => setEditSector(e.currentTarget.value)}
          />
          <Switch
            label="Registered"
            checked={editRegistered}
            onChange={(e) => setEditRegistered(e.currentTarget.checked)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeEdit}>Cancel</Button>
            <Button onClick={handleUpdate} loading={submitting}>Update</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
