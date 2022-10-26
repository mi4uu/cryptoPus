/*
  Warnings:

  - The values [LEOUSDT] on the enum `PairEnumType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[timestamp,period_id,pair]` on the table `klines` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `close` on the `klines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `high` on the `klines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `low` on the `klines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `open` on the `klines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `volume` on the `klines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PairEnumType_new" AS ENUM ('BTCUSDT', 'ALGOUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'SOLUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'TRXUSDT', 'UNIUSDT', 'AVAXUSDT', 'LTCUSDT', 'LINKUSDT', 'AXSUSDT', 'KDAUSDT', 'GLMUSDT');
ALTER TABLE "klines" ALTER COLUMN "pair" TYPE "PairEnumType_new" USING ("pair"::text::"PairEnumType_new");
ALTER TABLE "strats" ALTER COLUMN "pair" TYPE "PairEnumType_new" USING ("pair"::text::"PairEnumType_new");
ALTER TYPE "PairEnumType" RENAME TO "PairEnumType_old";
ALTER TYPE "PairEnumType_new" RENAME TO "PairEnumType";
DROP TYPE "PairEnumType_old";
COMMIT;

-- AlterTable
ALTER TABLE "klines" DROP COLUMN "close",
ADD COLUMN     "close" DECIMAL(65,30) NOT NULL,
DROP COLUMN "high",
ADD COLUMN     "high" DECIMAL(65,30) NOT NULL,
DROP COLUMN "low",
ADD COLUMN     "low" DECIMAL(65,30) NOT NULL,
DROP COLUMN "open",
ADD COLUMN     "open" DECIMAL(65,30) NOT NULL,
DROP COLUMN "volume",
ADD COLUMN     "volume" DECIMAL(65,30) NOT NULL;

-- CreateIndex
CREATE INDEX "klines_timestamp_idx" ON "klines"("timestamp" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "klines_timestamp_period_id_pair_key" ON "klines"("timestamp" ASC, "period_id", "pair");
