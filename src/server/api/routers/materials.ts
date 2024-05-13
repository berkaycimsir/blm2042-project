import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const materialsRouter = createTRPCRouter({
  getMaterials: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.material.findMany({ include: { Order: true } });
  }),
  requestFromSupplier: publicProcedure.input(z.object({
    amount: z.number().min(1),
    materialId: z.number()
  })).mutation(async ({ ctx, input: { amount, materialId } }) => {
    const material = await ctx.db.material.findUnique({ where: { id: materialId } })
    if (material) {
      await ctx.db.material.update({
        where: { id: materialId }, data: {
          amount: material.amount + amount
        }
      })
      return true;
    }
    return false;
  })
});
