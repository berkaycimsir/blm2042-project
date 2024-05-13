import {
  Box,
  Button,
  Checkbox,
  NumberInput,
  Table,
  Title,
  em,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React, { useState } from 'react';
import { type RouterOutputs, api } from '~/utils/api';

const Stock = () => {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  const { data, isFetched, refetch } = api.order.getStock.useQuery();
  const { mutateAsync, isPending } =
    api.materials.requestFromSupplier.useMutation();

  const rows = data?.map((order) => (
    <Table.Tr key={order.id}>
      <Table.Td>{order.productType}</Table.Td>
      <Table.Td>{order.size}</Table.Td>
      <Table.Td>{order.gender}</Table.Td>
      <Table.Td>{order.material.name}</Table.Td>
      <Table.Td>{order.totalStock}</Table.Td>
      <Table.Td>{order.totalOrders}</Table.Td>
    </Table.Tr>
  ));
  return (
    <Box>
      <Title pb="md" order={3}>
        Stock
      </Title>
      <Table striped withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Product</Table.Th>
            <Table.Th>Size</Table.Th>
            <Table.Th>Gender</Table.Th>
            <Table.Th>Material</Table.Th>
            <Table.Th>Total Stock</Table.Th>
            <Table.Th>Total Orders</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  );
};

export default Stock;
