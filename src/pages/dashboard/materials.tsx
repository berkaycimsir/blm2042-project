import {
  Box,
  Button,
  Checkbox,
  NumberInput,
  Table,
  Text,
  Title,
  em,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React, { useState } from 'react';
import { type RouterOutputs, api } from '~/utils/api';

const Materials = () => {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const { data, isFetched, refetch } = api.materials.getMaterials.useQuery();
  const { mutateAsync, isPending } =
    api.materials.requestFromSupplier.useMutation();

  const [selectedRows, setSelectedRows] = useState<
    RouterOutputs['materials']['getMaterials']
  >([]);

  const [neededMaterials, setNeededMaterials] = useState<
    RouterOutputs['materials']['getMaterials']
  >([]);

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});

  const calculateTotalAmountNeeded = (
    material: RouterOutputs['materials']['getMaterials'][0]
  ) => {
    let total = 0;
    material.Order.forEach((o) => (total += o.count * o.materialAmount));
    return total - material.amount;
  };

  React.useEffect(() => {
    setNeededMaterials([]);
    if (data && isFetched) {
      data.forEach((d) => {
        if (calculateTotalAmountNeeded(d) > 0) {
          setNeededMaterials((prev) => [...prev, d]);
        }
      });
    }
  }, [data, isFetched]);

  const requestMaterials = async () => {
    Object.entries(amounts).map(async ([k, v]) => {
      await mutateAsync(
        { materialId: Number(k), amount: v },
        {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSuccess: async () => {
            await refetch();
            setSelectedRows([]);
            setAmounts({});
          },
        }
      );
    });
  };

  const rows = data?.map((material) => (
    <Table.Tr key={material.id}>
      <Table.Td>{material.id}</Table.Td>
      <Table.Td>{material.name}</Table.Td>
      <Table.Td>{material.amount}kg</Table.Td>
      <Table.Td>{material.Order.length}</Table.Td>
    </Table.Tr>
  ));

  const rows2 = neededMaterials.map((material) => (
    <Table.Tr
      key={material.id}
      bg={
        selectedRows.find((m) => m.id === material.id)
          ? 'var(--mantine-color-blue-light)'
          : undefined
      }
    >
      <Table.Td width={1}>
        <Checkbox
          aria-label="Select row"
          checked={Boolean(selectedRows.find((m) => m.id === material.id))}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, material]
                : selectedRows.filter((m) => m.id !== material.id)
            )
          }
        />
      </Table.Td>
      <Table.Td>{material.id}</Table.Td>
      <Table.Td>{material.name}</Table.Td>
      <Table.Td>{material.amount}kg</Table.Td>
      <Table.Td>{calculateTotalAmountNeeded(material)}kg</Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Title pb="md" order={3}>
        All Materials
      </Title>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Material ID</Table.Th>
            <Table.Th>Material name</Table.Th>
            <Table.Th>Total Amount</Table.Th>
            <Table.Th>Total Orders</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      <Box pt="lg">
        <Title pb="sm" order={3}>
          Materials Needed
        </Title>
        {selectedRows.length > 0 && (
          <Box pb="md">
            <Box pb="sm" display={isMobile ? 'block' : 'flex'}>
              {selectedRows.map((r, i) => (
                <NumberInput
                  pl={i == 0 || isMobile ? '' : 'xs'}
                  w={125}
                  key={r.id}
                  label={r.name}
                  name={String(r.id)}
                  onChange={(v) =>
                    setAmounts({ ...amounts, [r.id]: Number(v) })
                  }
                  placeholder="Amount"
                  allowNegative={false}
                />
              ))}
            </Box>
            <Button
              loading={isPending}
              onClick={requestMaterials}
              color="indigo"
              variant="light"
            >
              Request from material supplier
            </Button>
          </Box>
        )}
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>Material ID</Table.Th>
              <Table.Th>Material name</Table.Th>
              <Table.Th>Total Amount</Table.Th>
              <Table.Th>Amount Needed</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows2}</Table.Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Materials;
