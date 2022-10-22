/*
  Warnings:

  - Added the required column `close` to the `klines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `high` to the `klines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `low` to the `klines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `open` to the `klines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `klines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "klines" ADD COLUMN     "close" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "high" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "low" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "open" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "volume" DOUBLE PRECISION NOT NULL;
