/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Table,
  Title,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import React, { useState } from 'react';
import { type RouterOutputs, api } from '~/utils/api';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

const Logistic = () => {
  const { data, isFetched, refetch } = api.order.getShippingOrders.useQuery();
  const { mutateAsync, isPending } = api.order.shipOrders.useMutation();

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const shipSelected = async () => {
    if (localStorage.getItem('user') !== 'admin') {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'You are not allowed for this action. Talk to your manager.',
      });
    } else {
      await mutateAsync(
        { orderIds: selectedRows },
        {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSuccess: async () => {
            await refetch();
            setSelectedRows([]);
          },
        }
      );
    }
  };

  const rows = data?.map((order) => (
    <Table.Tr
      key={order.id}
      bg={
        selectedRows.find((o) => o === order.id)
          ? 'var(--mantine-color-blue-light)'
          : undefined
      }
    >
      <Table.Td width={1}>
        {!order.shipped && (
          <Checkbox
            aria-label="Select row"
            checked={Boolean(selectedRows.find((o) => o === order.id))}
            onChange={(event) =>
              setSelectedRows(
                event.currentTarget.checked
                  ? [...selectedRows, order.id]
                  : selectedRows.filter((o) => o !== order.id)
              )
            }
          />
        )}
      </Table.Td>
      <Table.Td>{order.id}</Table.Td>
      <Table.Td>{order.Customer?.name}</Table.Td>
      <Table.Td>{`${order.productType}-${order.size}-${order.gender}-${order.material.name}`}</Table.Td>
      <Table.Td>
        <Center style={{ justifyContent: 'flex-start' }}>
          <IconCheck color="green" size={16} />
        </Center>
      </Table.Td>
      <Table.Td>
        {order.shipped ? (
          <Badge color="teal">Shipped</Badge>
        ) : (
          <Badge color="blue">Ready to ship</Badge>
        )}
      </Table.Td>
      <Table.Td>
        {order.shipped && dayjs(order.shippedAt).format('LL')}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Title pb="md" order={3}>
        Logistics
      </Title>

      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Order ID</Table.Th>
            <Table.Th>Customer</Table.Th>
            <Table.Th>Product</Table.Th>
            <Table.Th>Stock</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Shipped At</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      {selectedRows.length > 0 && (
        <Box pt="md">
          <Button
            onClick={shipSelected}
            loading={isPending}
            color="indigo"
            variant="light"
          >
            Ship Selected
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Logistic;
