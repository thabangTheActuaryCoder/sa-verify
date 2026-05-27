import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconUser,
  IconHistory,
  IconAlertTriangle,
  IconShieldLock,
  IconBell,
  IconFileText,
  IconLogout,
  IconUsers,
  IconBuilding,
  IconGavel,
  IconUpload,
  IconSearch,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import SAMap from '../common/SAMap';

interface NavItem {
  label: string;
  icon: typeof IconDashboard;
  path: string;
}

const candidateNav: NavItem[] = [
  { label: 'Dashboard', icon: IconDashboard, path: '/candidate/dashboard' },
  { label: 'Profile', icon: IconUser, path: '/candidate/profile' },
  { label: 'History', icon: IconHistory, path: '/candidate/history' },
  { label: 'Disputes', icon: IconAlertTriangle, path: '/candidate/disputes' },
  { label: 'Blocked Companies', icon: IconShieldLock, path: '/candidate/blocked' },
  { label: 'Documents', icon: IconUpload, path: '/candidate/documents' },
  { label: 'Notifications', icon: IconBell, path: '/candidate/notifications' },
];

const employerNav: NavItem[] = [
  { label: 'Dashboard', icon: IconDashboard, path: '/employer/dashboard' },
  { label: 'Bulk Verify', icon: IconSearch, path: '/employer/bulk-verify' },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', icon: IconDashboard, path: '/admin/dashboard' },
  { label: 'Users', icon: IconUsers, path: '/admin/users' },
  { label: 'Companies', icon: IconBuilding, path: '/admin/companies' },
  { label: 'Disputes', icon: IconGavel, path: '/admin/disputes' },
];

function getNavItems(role: string | null): NavItem[] {
  switch (role) {
    case 'candidate':
      return candidateNav;
    case 'employer':
      return employerNav;
    case 'admin':
      return adminNav;
    default:
      return [];
  }
}

export default function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { role, fullName, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = getNavItems(role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      footer={{ height: 40 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: 'linear-gradient(135deg, #0D8044 0%, #1C1C2E 100%)',
          borderBottom: 'none',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
            <IconFileText size={28} color="#F5A623" />
            <Text fw={700} size="lg" c="white">
              SA Verify
            </Text>
          </Group>
          <Group>
            {role !== 'admin' && (
              <ActionIcon
                variant="subtle"
                size="lg"
                color="white"
                onClick={() =>
                  navigate(
                    role === 'candidate'
                      ? '/candidate/notifications'
                      : '/employer/dashboard'
                  )
                }
                pos="relative"
              >
                <IconBell size={22} />
                {unreadCount > 0 && (
                  <Badge
                    size="xs"
                    circle
                    color="saGold.4"
                    pos="absolute"
                    top={0}
                    right={0}
                    style={{ pointerEvents: 'none' }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </ActionIcon>
            )}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Group gap={4} style={{ cursor: 'pointer' }}>
                  <Text size="sm" fw={500} c="white">
                    {fullName}
                  </Text>
                  <IconChevronDown size={14} color="white" />
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  Role: {role}
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  color="red"
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Box visibleFrom="sm">
              <SAMap width={40} height={40} />
            </Box>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="xs"
        style={{
          background: '#1C1C2E',
          borderRight: 'none',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={20} color={isActive ? '#F5A623' : '#a0a0b8'} />}
              active={isActive}
              onClick={() => {
                navigate(item.path);
                toggle();
              }}
              rightSection={
                item.label === 'Notifications' && unreadCount > 0 ? (
                  <Badge size="xs" color="saGold.4" circle>
                    {unreadCount}
                  </Badge>
                ) : undefined
              }
              styles={{
                root: {
                  borderRadius: 8,
                  marginBottom: 4,
                  borderLeft: isActive ? '3px solid #F5A623' : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(245, 166, 35, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(245, 166, 35, 0.08)',
                  },
                },
                label: {
                  color: isActive ? '#F5A623' : '#c8c8d8',
                  fontWeight: isActive ? 600 : 400,
                },
              }}
            />
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'linear-gradient(180deg, #FFF9F2 0%, #FFFFFF 100%)' }}>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer
        p="xs"
        style={{
          background: '#1C1C2E',
          borderTop: 'none',
        }}
      >
        <Text ta="center" size="xs" c="dimmed" style={{ color: '#8888a0' }}>
          SA Verify - National Verification System Prototype
        </Text>
      </AppShell.Footer>
    </AppShell>
  );
}
