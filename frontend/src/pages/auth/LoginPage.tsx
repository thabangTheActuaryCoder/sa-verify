import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Center,
  Table,
  Divider,
  Box,
} from '@mantine/core';
import { IconLogin, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

const DEMO_ACCOUNTS = [
  { username: 'thabo.candidate', password: 'Demo@1234', role: 'Candidate' },
  { username: 'naledi.candidate', password: 'Demo@1234', role: 'Candidate' },
  { username: 'sipho.candidate', password: 'Demo@1234', role: 'Candidate' },
  { username: 'hr.discovery', password: 'Demo@1234', role: 'Employer' },
  { username: 'hr.standardbank', password: 'Demo@1234', role: 'Employer' },
  { username: 'admin', password: 'Admin@1234', role: 'Admin' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      const role = localStorage.getItem('sa_verify_role');
      navigate(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login({ username: demoUsername, password: demoPassword });
      const role = localStorage.getItem('sa_verify_role');
      navigate(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center mih="100vh" bg="gray.0" p="md">
      <Stack w="100%" maw={480}>
        <Box ta="center" mb="sm">
          <Title order={1} c="saGreen.6">
            SA Verify
          </Title>
          <Text c="dimmed" size="sm">
            National Verification System
          </Text>
        </Box>

        <Card shadow="sm" radius="md" withBorder p="xl">
          <form onSubmit={handleSubmit}>
            <Stack>
              <Title order={3} ta="center">
                Sign In
              </Title>

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                leftSection={<IconLogin size={18} />}
              >
                Sign In
              </Button>

              <Text ta="center" size="sm">
                Don't have an account?{' '}
                <Text component={Link} to="/register" c="saGreen.6" fw={500} inherit>
                  Register here
                </Text>
              </Text>
            </Stack>
          </form>
        </Card>

        <Card shadow="sm" radius="md" withBorder p="md">
          <Text fw={600} size="sm" mb="xs">
            Demo Accounts
          </Text>
          <Table striped highlightOnHover withTableBorder withColumnBorders fz="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Username</Table.Th>
                <Table.Th>Password</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {DEMO_ACCOUNTS.map((acc) => (
                <Table.Tr key={acc.username}>
                  <Table.Td>
                    <Text size="xs" ff="monospace">
                      {acc.username}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" ff="monospace">
                      {acc.password}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{acc.role}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="compact-xs"
                      variant="light"
                      onClick={() => handleDemoLogin(acc.username, acc.password)}
                      loading={loading}
                    >
                      Login
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Stack>
    </Center>
  );
}
