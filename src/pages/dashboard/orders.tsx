import React from 'react';
import { api } from '~/utils/api';

const Orders = () => {
  const { data } = api.order.getOrders.useQuery();

  return <div>{console.log(data)}</div>;
};

export default Orders;
