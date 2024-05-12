import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
  getOrders: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.order.findMany({});
  })
});
