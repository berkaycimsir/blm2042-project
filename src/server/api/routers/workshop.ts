import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const workshopRouter = createTRPCRouter({
  getMachines: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.machine.findMany({ include: { Order: { include: { Customer: true, material: true } } } });
  })
});
