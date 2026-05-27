import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  FileInput,
  Select,
  Group,
  Card,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getDocuments, uploadDocument } from '../../api/candidate';
import { formatDateTime } from '../../utils/format';
import type { DocumentRecord } from '../../types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string | null>(null);

  const fetchDocs = () => {
    getDocuments()
      .then(setDocuments)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load documents', color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async () => {
    if (!file || !docType) {
      notifications.show({ title: 'Error', message: 'Select a file and document type', color: 'red' });
      return;
    }
    setUploading(true);
    try {
      await uploadDocument(docType, file);
      notifications.show({ title: 'Success', message: 'Document uploaded', color: 'green' });
      setFile(null);
      setDocType(null);
      fetchDocs();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.response?.data?.detail ?? 'Upload failed',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Upload supporting documents for disputes or verification"
      />

      <Card shadow="sm" withBorder mb="md" p="md">
        <Text fw={500} size="sm" mb="xs">
          Upload Document
        </Text>
        <Group align="flex-end" wrap="wrap">
          <Select
            label="Document Type"
            placeholder="Select type"
            data={[
              { value: 'id_document', label: 'ID Document' },
              { value: 'payslip', label: 'Payslip' },
              { value: 'qualification_certificate', label: 'Qualification Certificate' },
              { value: 'proof_of_address', label: 'Proof of Address' },
              { value: 'police_clearance', label: 'Police Clearance' },
              { value: 'other', label: 'Other' },
            ]}
            value={docType}
            onChange={setDocType}
            style={{ minWidth: 200 }}
          />
          <FileInput
            label="File"
            placeholder="Choose file"
            value={file}
            onChange={setFile}
            style={{ minWidth: 200 }}
          />
          <Button
            leftSection={<IconUpload size={16} />}
            onClick={handleUpload}
            loading={uploading}
            disabled={!file || !docType}
          >
            Upload
          </Button>
        </Group>
      </Card>

      {documents.length === 0 ? (
        <EmptyState message="No documents uploaded" />
      ) : (
        <Table striped withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Filename</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Uploaded</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {documents.map((d) => (
              <Table.Tr key={d.id}>
                <Table.Td>#{d.id}</Table.Td>
                <Table.Td>{d.filename}</Table.Td>
                <Table.Td>{d.document_type}</Table.Td>
                <Table.Td>{formatDateTime(d.uploaded_at)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
}
