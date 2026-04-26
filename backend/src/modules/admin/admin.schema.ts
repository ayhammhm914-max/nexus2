import { z } from "zod";

export const adminSessionIdSchema = {
  params: z
    .object({
      id: z.string().uuid()
    })
    .strict()
};
