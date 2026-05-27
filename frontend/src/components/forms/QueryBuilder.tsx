import { Stack, Select, TextInput, Group, Button, ActionIcon, Paper, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { QUERY_TYPES, type QueryTypeConfig } from '../../utils/queryTypes';
import type { QueryItem } from '../../types';

interface QueryRowProps {
  item: QueryItem;
  index: number;
  onChange: (index: number, item: QueryItem) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

function QueryRow({ item, index, onChange, onRemove, canRemove }: QueryRowProps) {
  const config = QUERY_TYPES.find((q) => q.value === item.query_type);

  const handleTypeChange = (value: string | null) => {
    if (!value) return;
    onChange(index, { query_type: value, query_params: {} });
  };

  const handleParamChange = (key: string, value: string) => {
    onChange(index, {
      ...item,
      query_params: { ...item.query_params, [key]: value },
    });
  };

  return (
    <Paper withBorder p="sm" radius="sm">
      <Group align="flex-start" wrap="wrap">
        <Select
          label="Query Type"
          data={QUERY_TYPES.map((q) => ({ value: q.value, label: q.label }))}
          value={item.query_type}
          onChange={handleTypeChange}
          style={{ minWidth: 220 }}
          searchable
        />
        {config?.params.map((param) =>
          param.type === 'select' ? (
            <Select
              key={param.key}
              label={param.label}
              data={param.options ?? []}
              value={item.query_params[param.key] ?? ''}
              onChange={(v) => handleParamChange(param.key, v ?? '')}
              style={{ minWidth: 180 }}
            />
          ) : (
            <TextInput
              key={param.key}
              label={param.label}
              placeholder={param.placeholder}
              type={param.type === 'date' ? 'date' : 'text'}
              value={item.query_params[param.key] ?? ''}
              onChange={(e) => handleParamChange(param.key, e.currentTarget.value)}
              style={{ minWidth: 180 }}
            />
          )
        )}
        {canRemove && (
          <ActionIcon
            color="red"
            variant="light"
            mt={28}
            onClick={() => onRemove(index)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
}

interface QueryBuilderProps {
  items: QueryItem[];
  onChange: (items: QueryItem[]) => void;
}

export default function QueryBuilder({ items, onChange }: QueryBuilderProps) {
  const handleAdd = () => {
    onChange([...items, { query_type: 'id_verification', query_params: {} }]);
  };

  const handleChange = (index: number, item: QueryItem) => {
    const updated = [...items];
    updated[index] = item;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <Stack gap="sm">
      <Text fw={500} size="sm">
        Verification Queries
      </Text>
      {items.map((item, i) => (
        <QueryRow
          key={i}
          item={item}
          index={i}
          onChange={handleChange}
          onRemove={handleRemove}
          canRemove={items.length > 1}
        />
      ))}
      <Button
        variant="light"
        leftSection={<IconPlus size={16} />}
        onClick={handleAdd}
        size="xs"
        w="fit-content"
      >
        Add Query
      </Button>
    </Stack>
  );
}
