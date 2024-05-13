import React from 'react';
import { type RouterOutputs, api } from '~/utils/api';

import {
  Group,
  Avatar,
  Text,
  Accordion,
  Box,
  Title,
  RingProgress,
  ActionIcon,
  Center,
  rem,
  Paper,
  List,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconDeviceIpadHorizontal,
  IconTractor,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

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

function AccordionLabel({
  id,
  malfunctionDates,
  maintenanceDates,
  Order,
  productionDate,
  purchaseDate,
}: RouterOutputs['workshop']['getMachines'][0]) {
  return (
    <Group wrap="nowrap">
      <Center>
        {getMachineStatus(Order) === 'working' ? (
          <ActionIcon color="teal" variant="light" radius="lg" size="lg">
            <IconTractor size={20} />
          </ActionIcon>
        ) : getMachineStatus(Order) === 'waiting' ? (
          <ActionIcon color="blue" variant="light" radius="lg" size="lg">
            <IconDeviceIpadHorizontal size={20} />
          </ActionIcon>
        ) : (
          <ActionIcon color="yellow" variant="light" radius="lg" size="lg">
            <IconAlertCircle size={20} />
          </ActionIcon>
        )}
      </Center>
      <div>
        <Box display="flex">
          <Text>Machine {id}</Text>
          &nbsp;
          <Text
            c={
              getMachineStatus(Order) === 'working'
                ? 'teal'
                : getMachineStatus(Order) === 'waiting'
                ? 'blue'
                : 'yellow'
            }
          >
            - {getMachineStatus(Order)}
          </Text>
        </Box>

        <Text size="sm" c="dimmed" fw={400}>
          Purchased at {dayjs(purchaseDate).format('LL')}
        </Text>
      </div>
    </Group>
  );
}

const Workshop = () => {
  const { data } = api.workshop.getMachines.useQuery();

  const items = data?.map((item) => (
    <Accordion.Item value={String(item.id)} key={item.id}>
      <Accordion.Control>
        <AccordionLabel {...item} />
      </Accordion.Control>
      <Accordion.Panel>
        <Title order={4}>General Information</Title>
        <List size="sm">
          <List.Item>Machine: {item.id}</List.Item>
          <List.Item>
            Production Date: {dayjs(item.productionDate).format('LL')}
          </List.Item>
          <List.Item>
            Purchase Date: {dayjs(item.purchaseDate).format('LL')}
          </List.Item>
          <List.Item>
            Malfunction Dates:{' '}
            {item.malfunctionDates.map((d) => dayjs(d).format('LL') + ' / ')}
          </List.Item>
          <List.Item>
            Maintenance Dates:{' '}
            {item.maintenanceDates.map((d) => dayjs(d).format('LL') + ' / ')}
          </List.Item>
        </List>
        <Title pt="md" order={4}>
          Status ({item.Order.length} orders)
        </Title>
        <Text
          c={
            getMachineStatus(item.Order) === 'working'
              ? 'teal'
              : getMachineStatus(item.Order) === 'waiting'
              ? 'blue'
              : 'yellow'
          }
        >
          - {getMachineStatus(item.Order)}
        </Text>
        <List size="sm">
          {item.Order.map((o) => (
            <List.Item key={o.id}>
              <Box display="flex">
                <Text>{o.Customer?.name}</Text>
                &nbsp;
                {o.shipped ? (
                  <Text c="teal">- shipped</Text>
                ) : (
                  <Text c={o.completed ? 'blue' : 'yellow'}>
                    - {o.completed ? 'on logistics' : 'on production'}
                  </Text>
                )}
              </Box>

              <Text size="sm" c="dimmed" fw={400}>
                {o.productType} - {o.size} - {o.gender}
              </Text>
            </List.Item>
          ))}
        </List>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Box>
      <Title pb="md" order={3}>
        Workshop ({data?.length} machines)
      </Title>
      <Accordion chevronPosition="right" variant="separated">
        {items}
      </Accordion>
    </Box>
  );
};

export default Workshop;
