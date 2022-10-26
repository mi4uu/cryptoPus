/*
  Warnings:

  - The values [GLMUSDT] on the enum `PairEnumType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PairEnumType_new" AS ENUM ('BTCUSDT', 'ALGOUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'SOLUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'TRXUSDT', 'UNIUSDT', 'AVAXUSDT', 'LTCUSDT', 'LINKUSDT', 'AXSUSDT', 'KDAUSDT');
ALTER TABLE "klines" ALTER COLUMN "pair" TYPE "PairEnumType_new" USING ("pair"::text::"PairEnumType_new");
ALTER TABLE "strats" ALTER COLUMN "pair" TYPE "PairEnumType_new" USING ("pair"::text::"PairEnumType_new");
ALTER TYPE "PairEnumType" RENAME TO "PairEnumType_old";
ALTER TYPE "PairEnumType_new" RENAME TO "PairEnumType";
DROP TYPE "PairEnumType_old";
COMMIT;
