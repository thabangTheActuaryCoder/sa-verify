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
  Box,
} from '@mantine/core';
import { IconUserPlus, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { register } from '../../api/auth';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await register({
        full_name: fullName,
        username,
        id_number: idNumber,
        password,
      });
      setSuccess(res.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Registration failed.');
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
            Candidate Registration
          </Text>
        </Box>

        <Card shadow="sm" radius="md" withBorder p="xl">
          <form onSubmit={handleSubmit}>
            <Stack>
              <Title order={3} ta="center">
                Create Account
              </Title>

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert icon={<IconCheck size={16} />} color="green" variant="light">
                  {success}
                </Alert>
              )}

              <TextInput
                label="Full Name"
                placeholder="e.g. Thabo Mokoena"
                value={fullName}
                onChange={(e) => setFullName(e.currentTarget.value)}
                required
              />

              <TextInput
                label="SA ID Number"
                placeholder="13-digit SA ID number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.currentTarget.value)}
                maxLength={13}
                required
              />

              <TextInput
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                leftSection={<IconUserPlus size={18} />}
              >
                Register
              </Button>

              <Text ta="center" size="sm">
                Already have an account?{' '}
                <Text component={Link} to="/login" c="saGreen.6" fw={500} inherit>
                  Sign in
                </Text>
              </Text>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Center>
  );
}
