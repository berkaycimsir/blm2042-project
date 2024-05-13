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
import { IconAlertCircle, IconCheck, IconTir } from '@tabler/icons-react';

function AccordionLabel({
  Customer,
  productType,
  size,
  gender,
  shipped,
  completed,
}: RouterOutputs['order']['getOrders'][0]) {
  return (
    <Group wrap="nowrap">
      <Center>
        {shipped ? (
          <ActionIcon color="teal" variant="light" radius="lg" size="lg">
            <IconTir size={20} />
          </ActionIcon>
        ) : completed ? (
          <ActionIcon color="blue" variant="light" radius="lg" size="lg">
            <IconCheck size={20} />
          </ActionIcon>
        ) : (
          <ActionIcon color="yellow" variant="light" radius="lg" size="lg">
            <IconAlertCircle size={20} />
          </ActionIcon>
        )}
      </Center>
      <div>
        <Box display="flex">
          <Text>{Customer?.name}</Text>
          &nbsp;
          {shipped ? (
            <Text c="teal">- shipped</Text>
          ) : (
            <Text c={completed ? 'blue' : 'yellow'}>
              - {completed ? 'on logistics' : 'on production'}
            </Text>
          )}
        </Box>

        <Text size="sm" c="dimmed" fw={400}>
          {productType} - {size} years old - {gender}
        </Text>
      </div>
    </Group>
  );
}

const Orders = () => {
  const { data } = api.order.getOrders.useQuery();

  const items = data?.map((item) => (
    <Accordion.Item value={String(item.id)} key={item.id}>
      <Accordion.Control>
        <AccordionLabel {...item} />
      </Accordion.Control>
      <Accordion.Panel>
        <Title order={4}>General Information</Title>
        <List size="sm">
          <List.Item>Product Type: {item.productType}</List.Item>
          <List.Item>Size: {item.size} years old</List.Item>
          <List.Item>Gender: {item.gender}</List.Item>
          <List.Item>Assigned Machine: Machine {item.machineId}</List.Item>
          <List.Item>Material: {item.material.name}</List.Item>
          <List.Item>
            Required material per each: {item.materialAmount}
          </List.Item>
          <List.Item>How many of them wanted: {item.count}</List.Item>
        </List>
        <Title pt="md" order={4}>
          Status
        </Title>
        {item.shipped ? (
          <Text c="teal">- shipped</Text>
        ) : (
          <Text c={item.completed ? 'blue' : 'yellow'}>
            - {item.completed ? 'on logistics' : 'on production'}
          </Text>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Box>
      <Title pb="md" order={3}>
        Orders ({data?.length})
      </Title>
      <Accordion chevronPosition="right" variant="separated">
        {items}
      </Accordion>
    </Box>
  );
};

export default Orders;
