import { useEffect, useState } from 'react';
import { Tabs, Table, Text, Badge, Card, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBriefcase,
  IconSchool,
  IconGavel,
  IconCreditCard,
  IconCar,
  IconCertificate,
  IconMapPin,
  IconUsers,
} from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { getProfile } from '../../api/candidate';
import { formatDate } from '../../utils/format';
import type { CandidateProfile } from '../../types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to load profile', color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!profile) return <Text>Failed to load profile</Text>;

  return (
    <>
      <PageHeader title="My Profile" subtitle={`${profile.first_name} ${profile.last_name}`} />

      <Card shadow="sm" withBorder mb="md" p="md">
        <Group wrap="wrap" gap="xl">
          <Stack gap={2}>
            <Text size="xs" c="dimmed">ID Number</Text>
            <Text size="sm" fw={500} ff="monospace">{profile.id_number}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">Date of Birth</Text>
            <Text size="sm">{formatDate(profile.date_of_birth)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">Gender</Text>
            <Text size="sm" tt="capitalize">{profile.gender}</Text>
          </Stack>
        </Group>
      </Card>

      <Tabs defaultValue="employment">
        <Tabs.List>
          <Tabs.Tab value="employment" leftSection={<IconBriefcase size={16} />}>
            Employment ({profile.employments.length})
          </Tabs.Tab>
          <Tabs.Tab value="qualifications" leftSection={<IconSchool size={16} />}>
            Qualifications ({profile.qualifications.length})
          </Tabs.Tab>
          <Tabs.Tab value="criminal" leftSection={<IconGavel size={16} />}>
            Criminal ({profile.criminal_records.length})
          </Tabs.Tab>
          <Tabs.Tab value="credit" leftSection={<IconCreditCard size={16} />}>
            Credit ({profile.credit_records.length})
          </Tabs.Tab>
          <Tabs.Tab value="licence" leftSection={<IconCar size={16} />}>
            Licence ({profile.drivers_licences.length})
          </Tabs.Tab>
          <Tabs.Tab value="professional" leftSection={<IconCertificate size={16} />}>
            Professional ({profile.professional_registrations.length})
          </Tabs.Tab>
          <Tabs.Tab value="address" leftSection={<IconMapPin size={16} />}>
            Address ({profile.addresses.length})
          </Tabs.Tab>
          <Tabs.Tab value="references" leftSection={<IconUsers size={16} />}>
            References ({profile.references.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="employment" pt="md">
          {profile.employments.length === 0 ? (
            <EmptyState message="No employment records" />
          ) : (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Job Title</Table.Th>
                  <Table.Th>Start Date</Table.Th>
                  <Table.Th>End Date</Table.Th>
                  <Table.Th>Salary Bracket</Table.Th>
                  <Table.Th>Current</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {profile.employments.map((e, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{e.company_name}</Table.Td>
                    <Table.Td>{e.job_title}</Table.Td>
                    <Table.Td>{formatDate(e.start_date)}</Table.Td>
                    <Table.Td>{e.end_date ? formatDate(e.end_date) : '-'}</Table.Td>
                    <Table.Td>{e.salary_bracket}</Table.Td>
                    <Table.Td>
                      <Badge color={e.is_current ? 'green' : 'gray'} variant="light" size="sm">
                        {e.is_current ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="qualifications" pt="md">
          {profile.qualifications.length === 0 ? (
            <EmptyState message="No qualification records" />
          ) : (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Field of Study</Table.Th>
                  <Table.Th>Institution</Table.Th>
                  <Table.Th>Year</Table.Th>
                  <Table.Th>Registered</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {profile.qualifications.map((q, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{q.qualification_type}</Table.Td>
                    <Table.Td>{q.field_of_study}</Table.Td>
                    <Table.Td>{q.institution}</Table.Td>
                    <Table.Td>{q.year_obtained}</Table.Td>
                    <Table.Td>
                      <Badge color={q.is_institution_registered ? 'green' : 'red'} variant="light" size="sm">
                        {q.is_institution_registered ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="criminal" pt="md">
          {profile.criminal_records.length === 0 ? (
            <EmptyState message="No criminal records" />
          ) : (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Case Number</Table.Th>
                  <Table.Th>Offence</Table.Th>
                  <Table.Th>Severity</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Cleared</Table.Th>
                  <Table.Th>Interpol</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {profile.criminal_records.map((r, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{r.case_number}</Table.Td>
                    <Table.Td>{r.offence}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={r.severity === 'major' ? 'red' : r.severity === 'moderate' ? 'orange' : 'yellow'}
                        variant="light"
                        size="sm"
                      >
                        {r.severity}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatDate(r.date_convicted)}</Table.Td>
                    <Table.Td>
                      <Badge color={r.is_cleared ? 'green' : 'red'} variant="light" size="sm">
                        {r.is_cleared ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {r.is_interpol_wanted ? (
                        <Badge color="red" variant="filled" size="sm">
                          {r.interpol_notice_type ?? 'Wanted'}
                        </Badge>
                      ) : (
                        <Text size="xs" c="dimmed">No</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="credit" pt="md">
          {profile.credit_records.length === 0 ? (
            <EmptyState message="No credit records" />
          ) : (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Score</Table.Th>
                  <Table.Th>Band</Table.Th>
                  <Table.Th>Defaults</Table.Th>
                  <Table.Th>Judgements</Table.Th>
                  <Table.Th>Insolvency</Table.Th>
                  <Table.Th>Accounts</Table.Th>
                  <Table.Th>Good Standing</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {profile.credit_records.map((c, i) => (
                  <Table.Tr key={i}>
                    <Table.Td fw={600}>{c.credit_score}</Table.Td>
                    <Table.Td>{c.credit_score_band}</Table.Td>
                    <Table.Td>
                      <Badge color={c.has_defaults ? 'red' : 'green'} variant="light" size="sm">
                        {c.has_defaults ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={c.has_judgements ? 'red' : 'green'} variant="light" size="sm">
                        {c.has_judgements ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={c.has_insolvency ? 'red' : 'green'} variant="light" size="sm">
                        {c.has_insolvency ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{c.total_accounts}</Table.Td>
                    <Table.Td>{c.accounts_in_good_standing}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="licence" pt="md">
          {profile.drivers_licences.length === 0 ? (
            <EmptyState message="No driver's licence records" />
          ) : (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Licence Number</Table.Th>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Issue Date</Table.Th>
                  <Table.Th>Expiry Date</Table.Th>
                  <Table.Th>Valid</Table.Th>
                  <Table.Th>Endorsements</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {profile.drivers_licences.map((l, i) => (
                  <Table.Tr key={i}>
                    <Table.Td ff="monospace">{l.licence_number}</Table.Td>
                    <Table.Td>{l.licence_code}</Table.Td>
                    <Table.Td>{formatDate(l.issue_date)}</Table.Td>
                    <Table.Td>{formatDate(l.expiry_date)}</Table.Td>
                    <Table.Td>
                      <Badge color={l.is_valid ? 'green' : 'red'} variant="light" size="sm">
                        {l.is_valid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{l.endorsements}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="professional" pt="md">
          {profile.professional_registrations.length === 0 ? (
            <EmptyState message="No professional registrations" />
          ) : (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Body</Table.Th>
                  <Table.Th>Reg. Number</Table.Th>
                  <Table.Th>Designation</Table.Th>
                  <Table.Th>Registered</Table.Th>
                  <Table.Th>Expiry</Table.Th>
                  <Table.Th>Active</Table.Th>
                  <Table.Th>Good Standing</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {profile.professional_registrations.map((p, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{p.body_name}</Table.Td>
                    <Table.Td ff="monospace">{p.registration_number}</Table.Td>
                    <Table.Td>{p.designation}</Table.Td>
                    <Table.Td>{formatDate(p.registration_date)}</Table.Td>
                    <Table.Td>{p.expiry_date ? formatDate(p.expiry_date) : '-'}</Table.Td>
                    <Table.Td>
                      <Badge color={p.is_active ? 'green' : 'red'} variant="light" size="sm">
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={p.is_in_good_standing ? 'green' : 'red'} variant="light" size="sm">
                        {p.is_in_good_standing ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="address" pt="md">
          {profile.addresses.length === 0 ? (
            <EmptyState message="No address records" />
          ) : (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Street</Table.Th>
                  <Table.Th>Suburb</Table.Th>
                  <Table.Th>City</Table.Th>
                  <Table.Th>Province</Table.Th>
                  <Table.Th>Postal Code</Table.Th>
                  <Table.Th>Current</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {profile.addresses.map((a, i) => (
                  <Table.Tr key={i}>
                    <Table.Td tt="capitalize">{a.address_type}</Table.Td>
                    <Table.Td>{a.street_address}</Table.Td>
                    <Table.Td>{a.suburb ?? '-'}</Table.Td>
                    <Table.Td>{a.city}</Table.Td>
                    <Table.Td>{a.province}</Table.Td>
                    <Table.Td>{a.postal_code}</Table.Td>
                    <Table.Td>
                      <Badge color={a.is_current ? 'green' : 'gray'} variant="light" size="sm">
                        {a.is_current ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="references" pt="md">
          {profile.references.length === 0 ? (
            <EmptyState message="No reference records" />
          ) : (
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Referee</Table.Th>
                  <Table.Th>Position</Table.Th>
                  <Table.Th>Relationship</Table.Th>
                  <Table.Th>Rating</Table.Th>
                  <Table.Th>Verified</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {profile.references.map((r, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{r.company_name}</Table.Td>
                    <Table.Td>{r.referee_name}</Table.Td>
                    <Table.Td>{r.referee_position}</Table.Td>
                    <Table.Td>{r.relationship_to_candidate}</Table.Td>
                    <Table.Td>{r.rating ?? '-'}</Table.Td>
                    <Table.Td>
                      <Badge color={r.is_verified ? 'green' : 'gray'} variant="light" size="sm">
                        {r.is_verified ? 'Yes' : 'No'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
