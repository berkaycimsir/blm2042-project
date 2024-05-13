import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { uniqBy } from 'lodash';
import { z } from 'zod';

export const orderRouter = createTRPCRouter({
  getOrders: publicProcedure.query(async ({ ctx }) => {
    return (await ctx.db.order.findMany({ include: { Customer: true, machine: true, material: true }, orderBy: { id: 'desc' } }));
  }),
  getStock: publicProcedure.query(async ({ ctx }) => {
    const orders = (await ctx.db.order.findMany({ where: { completed: true }, include: { Customer: true, machine: true, material: true }, orderBy: { id: 'desc' } }));
    const newOrders = orders.map(o => ({ product: `${o.productType}-${o.size}-${o.gender}-${o.material.name}`, totalStock: 0, totalOrders: 0, ...o }))
    let stock: typeof newOrders = [];

    stock = newOrders.map(o => {
      const product = o.product;
      let total = 0;

      const filtered = newOrders.filter(or => or.product === product);

      filtered.forEach(f => total += f.count);

      return { ...o, totalStock: total, totalOrders: filtered.length }
    })
    return uniqBy(stock, "product");
  }),
  getShippingOrders: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.order.findMany({ include: { Customer: true, machine: true, material: true }, where: { completed: true } });
  }),
  shipOrders: publicProcedure.input(z.object({ orderIds: z.array(z.number()) })).mutation(async ({ ctx, input }) => {
    for (const id of input.orderIds) {
      const order = await ctx.db.order.update({
        where: { id }, data: {
          shipped: true,
          shippedAt: new Date()
        },
      });

      const material = await ctx.db.material.findFirst({ where: { id: order.materialId } })
      if (material) {
        await ctx.db.material.update({ where: { id: order.materialId }, data: { amount: material.amount - (order.materialAmount * order.count) } })
      }
    }

    return true;
  })
});
