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
            Candidate Registration
          </Text>
        </Box>

        <Card
          radius="lg"
          p="xl"
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
                variant="gradient"
                gradient={{ from: '#0D8044', to: '#F5A623', deg: 135 }}
              >
                Register
              </Button>

              <Text ta="center" size="sm">
                Already have an account?{' '}
                <Text component={Link} to="/login" c="#F5A623" fw={600} inherit>
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
