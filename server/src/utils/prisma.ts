import { PairEnumType, Period, PrismaClient } from "@prisma/client";

export const getPrismaClient = () => new PrismaClient();

export { PairEnumType, Period };
