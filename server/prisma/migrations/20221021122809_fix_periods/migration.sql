-- DropForeignKey
ALTER TABLE "klines" DROP CONSTRAINT "klines_period_id_fkey";

-- AlterTable
ALTER TABLE "klines" ALTER COLUMN "period_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "periods" ALTER COLUMN "value" DROP DEFAULT,
ALTER COLUMN "value" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "klines" ADD CONSTRAINT "klines_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("value") ON DELETE RESTRICT ON UPDATE CASCADE;
