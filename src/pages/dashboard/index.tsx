/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Card,
  Center,
  Grid,
  Group,
  LoadingOverlay,
  NavLink,
  Paper,
  RingProgress,
  Table,
  Text,
  Title,
  rem,
  useComputedColorScheme,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { RouterOutputs, api } from '~/utils/api';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

export default function Home() {
  const { data } = api.order.getOrders.useQuery();
  const { data: machinesData } = api.workshop.getMachines.useQuery();
  const { data: materialsData, isFetched } =
    api.materials.getMaterials.useQuery();

  const getProgressValuesForOrders = () => {
    if (data) {
      const shippedOrders = data?.filter((o) => o.completed && o.shipped);
      const readyToShipOrders = data?.filter((o) => o.completed && !o.shipped);
      const onProductionOrders = data?.filter((o) => !o.completed);

      return [
        {
          value: (100 / data.length) * onProductionOrders.length,
          color: 'yellow',
          tooltip: `On Production (${onProductionOrders.length})`,
        },
        {
          value: (100 / data.length) * readyToShipOrders.length,
          color: 'blue',
          tooltip: `Ready to Ship (${readyToShipOrders.length})`,
        },
        {
          value: (100 / data.length) * shippedOrders.length,
          color: 'teal',
          tooltip: `Shipped Orders (${shippedOrders.length})`,
        },
      ];
    } else return [];
  };

  const getMachineStatus = (
    orders: RouterOutputs['workshop']['getMachines'][0]['Order']
  ): string => {
    let status = 'waiting';
    if (orders.length === 0) return (status = 'waiting');

    orders.forEach((o) => {
      if (!o.completed && o.materialAmount * o.count > o.material.amount)
        status = 'on hold (not enough materials)';
    });

    orders.forEach((o) => {
      if (!o.completed && o.materialAmount * o.count <= o.material.amount)
        status = 'working';
    });

    return status;
  };

  const getProgressValuesForMachines = () => {
    if (machinesData) {
      const workingMachines = machinesData?.filter(
        (m) => getMachineStatus(m.Order) === 'working'
      );
      const holdingMachines = machinesData?.filter(
        (m) => getMachineStatus(m.Order) === 'on hold (not enough materials)'
      );
      const waitingMachines = machinesData?.filter(
        (m) => getMachineStatus(m.Order) === 'waiting'
      );

      return [
        {
          value: (100 / machinesData.length) * holdingMachines.length,
          color: 'yellow',
          tooltip: `On Hold (${holdingMachines.length})`,
        },
        {
          value: (100 / machinesData.length) * waitingMachines.length,
          color: 'blue',
          tooltip: `Waiting (${waitingMachines.length})`,
        },
        {
          value: (100 / machinesData.length) * workingMachines.length,
          color: 'teal',
          tooltip: `Working (${workingMachines.length})`,
        },
      ];
    } else return [];
  };

  const [neededMaterials, setNeededMaterials] = useState<
    RouterOutputs['materials']['getMaterials']
  >([]);

  const calculateTotalAmountNeeded = (
    material: RouterOutputs['materials']['getMaterials'][0]
  ) => {
    let total = 0;
    material.Order.forEach((o) => (total += o.count * o.materialAmount));
    return total - material.amount;
  };

  React.useEffect(() => {
    setNeededMaterials([]);
    if (materialsData && isFetched) {
      materialsData.forEach((d) => {
        if (calculateTotalAmountNeeded(d) > 0) {
          setNeededMaterials((prev) => [...prev, d]);
        }
      });
    }
  }, [materialsData, isFetched]);

  const rows = data?.map((order) => (
    <Table.Tr key={order.id}>
      <Table.Td>{order.id}</Table.Td>
      <Table.Td>{order.Customer?.name}</Table.Td>
      <Table.Td>{`${order.productType}-${order.gender}-${order.material.name}`}</Table.Td>
      <Table.Td>{order.size} years old</Table.Td>
      <Table.Td>
        <Center style={{ justifyContent: 'flex-start' }}>
          {order.completed ? (
            <IconCheck color="green" size={16} />
          ) : (
            <IconX color="red" size={16} />
          )}
        </Center>
      </Table.Td>
      <Table.Td>
        {!order.completed ? (
          <Badge color="yellow">On Production</Badge>
        ) : order.shipped ? (
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
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Title pb="md" order={3}>
          Home
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder radius="md">
              <Card.Section withBorder inheritPadding py="xs">
                <Title order={4}>Orders Status</Title>
              </Card.Section>

              <Card.Section inheritPadding py="xs">
                <Box display="flex" style={{ alignItems: 'center' }}>
                  <RingProgress
                    size={120}
                    label={
                      <Text
                        size="xs"
                        ta="center"
                        px="xs"
                        style={{ pointerEvents: 'none' }}
                      >
                        Orders ({data?.length})
                      </Text>
                    }
                    thickness={12}
                    sections={getProgressValuesForOrders()}
                  />
                  <Text c="dimmed" size="sm">
                    <Anchor component={Link} href="/dashboard/orders">
                      {data?.length} orders
                    </Anchor>{' '}
                    since last visit: review them from orders page.
                  </Text>
                </Box>
              </Card.Section>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder radius="md">
              <Card.Section withBorder inheritPadding py="xs">
                <Title order={4}>Machines Status</Title>
              </Card.Section>

              <Card.Section inheritPadding py="xs">
                <Box display="flex" style={{ alignItems: 'center' }}>
                  <RingProgress
                    size={120}
                    label={
                      <Text
                        size="xs"
                        ta="center"
                        px="xs"
                        style={{ pointerEvents: 'none' }}
                      >
                        Machines ({machinesData?.length})
                      </Text>
                    }
                    thickness={12}
                    sections={getProgressValuesForMachines()}
                  />
                  <Text c="dimmed" size="sm">
                    Workshop has {machinesData?.length} machines. Currently,
                    there is no machine in maintenance. Check them from{' '}
                    <Anchor component={Link} href="/dashboard/workshop">
                      workshop{' '}
                    </Anchor>
                    page.
                  </Text>
                </Box>
              </Card.Section>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card withBorder radius="md">
              <Card.Section withBorder inheritPadding py="xs">
                <Title order={4}>Materials</Title>
              </Card.Section>

              <Card.Section inheritPadding py="xs">
                <Box display="flex" style={{ alignItems: 'center' }}>
                  <RingProgress
                    sections={[
                      {
                        value: 100,
                        color: neededMaterials.length === 0 ? 'teal' : 'red',
                      },
                    ]}
                    label={
                      <Center>
                        {neededMaterials.length === 0 ? (
                          <ActionIcon
                            color="teal"
                            variant="light"
                            radius="xl"
                            size="xl"
                          >
                            <IconCheck
                              style={{ width: rem(22), height: rem(22) }}
                            />
                          </ActionIcon>
                        ) : (
                          <ActionIcon
                            color="red"
                            variant="light"
                            radius="xl"
                            size="xl"
                          >
                            <IconAlertCircle
                              style={{ width: rem(22), height: rem(22) }}
                            />
                          </ActionIcon>
                        )}
                      </Center>
                    }
                  />
                  <Text c="dimmed" size="sm">
                    Workshop has {neededMaterials.length} materials needed.
                    Check{' '}
                    <Anchor component={Link} href="/dashboard/materials">
                      materials{' '}
                    </Anchor>
                    page to request needed materials from materials supplier
                  </Text>
                </Box>
              </Card.Section>
            </Card>
          </Grid.Col>
        </Grid>

        <Title pt="xl" pb="md" order={4}>
          Orders
        </Title>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Order ID</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Product</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Stock</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Shipped At</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </main>
    </>
  );
}
