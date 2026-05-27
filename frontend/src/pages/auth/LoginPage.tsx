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
    <Center
      mih="100vh"
      p="md"
      style={{
        background: 'linear-gradient(135deg, #0D8044 0%, #1C1C2E 100%)',
      }}
    >
      <Stack w="100%" maw={480} className="fade-in">
        <Box ta="center" mb="sm">
          <Title order={1} c="white">
            SA Verify
          </Title>
          <Text c="rgba(255,255,255,0.7)" size="sm">
            National Verification System
          </Text>
        </Box>

        <Card
          radius="lg"
          p="xl"
          className="glass-card"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack>
              <Title order={3} ta="center" c="#1C1C2E">
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
                variant="gradient"
                gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
              >
                Sign In
              </Button>

              <Text ta="center" size="sm">
                Don't have an account?{' '}
                <Text component={Link} to="/register" c="#F5A623" fw={600} inherit>
                  Register here
                </Text>
              </Text>
            </Stack>
          </form>
        </Card>

        <Card
          radius="lg"
          p="md"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Text fw={600} size="sm" mb="xs" c="#1C1C2E">
            Demo Accounts
          </Text>
          <Table striped highlightOnHover withTableBorder withColumnBorders fz="xs">
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#FFF3D6' }}>
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
                      variant="gradient"
                      gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
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
