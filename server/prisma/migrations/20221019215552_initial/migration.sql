-- CreateEnum
CREATE TYPE "RoleEnumType" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "PairEnumType" AS ENUM ('BTCUSDT', 'ALGOUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'SOLUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'TRXUSDT', 'UNIUSDT', 'AVAXUSDT', 'LEOUSDT', 'LTCUSDT', 'LINKUSDT', 'AXSUSDT', 'KDAUSDT', 'GLMUSDT');

-- CreateEnum
CREATE TYPE "StratEnumType" AS ENUM ('BB20');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" TEXT NOT NULL,
    "photo" TEXT DEFAULT 'default.png',
    "verified" BOOLEAN DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "role" "RoleEnumType" DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "provider" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periods" (
    "value" INTEGER NOT NULL DEFAULT 15
);

-- CreateTable
CREATE TABLE "klines" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "period_id" INTEGER NOT NULL,
    "pair" "PairEnumType" NOT NULL,

    CONSTRAINT "klines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strats" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "StratEnumType" NOT NULL DEFAULT 'BB20',
    "pair" "PairEnumType" NOT NULL,
    "waitingToBuy" BOOLEAN NOT NULL DEFAULT false,
    "size" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "strats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "strat_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientOrderId" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "periods_value_key" ON "periods"("value");

-- AddForeignKey
ALTER TABLE "klines" ADD CONSTRAINT "klines_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("value") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strats" ADD CONSTRAINT "strats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_strat_id_fkey" FOREIGN KEY ("strat_id") REFERENCES "strats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
