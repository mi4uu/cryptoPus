import { PairEnumType } from "@prisma/client";
import { z } from "zod";

export const klineSelector = z.object({
  pair: z.nativeEnum(PairEnumType),
  period: z.string(),
  dateFrom: z.string().or(z.date()),
  dateTo: z.string().or(z.date()).optional(),
  limit: z.number().optional(),
});
export type KlineSelectorType = z.infer<typeof klineSelector>;
