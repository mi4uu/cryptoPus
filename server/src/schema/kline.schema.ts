import { z } from "zod";
import { PairEnumType } from "@server/enums";

export const klineSelector = z.object({
    pair: z.nativeEnum(PairEnumType),
    period:z.string(),
    dateFrom:z.string(),
    dateTo:z.string().optional(),
    limit:z.number().optional(),
  })
  export type KlineSelectorType = z.infer<typeof klineSelector>