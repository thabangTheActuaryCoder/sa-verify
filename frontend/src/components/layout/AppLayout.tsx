import { useState } from 'react';
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
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconFileText size={28} color="#1a5632" />
            <Text fw={700} size="lg" c="saGreen.6">
              SA Verify
            </Text>
          </Group>
          <Group>
            {role !== 'admin' && (
              <ActionIcon
                variant="subtle"
                size="lg"
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
                    color="red"
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
                  <Text size="sm" fw={500}>
                    {fullName}
                  </Text>
                  <IconChevronDown size={14} />
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
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            leftSection={<item.icon size={20} />}
            active={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              toggle();
            }}
            rightSection={
              item.label === 'Notifications' && unreadCount > 0 ? (
                <Badge size="xs" color="red" circle>
                  {unreadCount}
                </Badge>
              ) : undefined
            }
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer p="xs">
        <Text ta="center" size="xs" c="dimmed">
          SA Verify - National Verification System Prototype
        </Text>
      </AppShell.Footer>
    </AppShell>
  );
}
