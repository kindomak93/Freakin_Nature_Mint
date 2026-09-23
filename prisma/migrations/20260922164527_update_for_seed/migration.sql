/*
  Warnings:

  - You are about to drop the column `festivalName` on the `Nft` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[symbol,itemTitle]` on the table `TokenCollection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Nft" DROP COLUMN "festivalName",
ADD COLUMN     "itemTitle" TEXT;

-- AlterTable
ALTER TABLE "TokenCollection" ADD COLUMN     "itemTitle" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "isMutable" SET DEFAULT false;

-- CreateTable
CREATE TABLE "TicketCheckIn" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "isSpent" BOOLEAN NOT NULL DEFAULT false,
    "scannedAt" TIMESTAMP(3),
    "scannedBy" TEXT,

    CONSTRAINT "TicketCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketCheckIn_tokenId_serialNumber_key" ON "TicketCheckIn"("tokenId", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TokenCollection_symbol_itemTitle_key" ON "TokenCollection"("symbol", "itemTitle");

-- AddForeignKey
ALTER TABLE "TicketCheckIn" ADD CONSTRAINT "TicketCheckIn_tokenId_serialNumber_fkey" FOREIGN KEY ("tokenId", "serialNumber") REFERENCES "Nft"("tokenId", "serialNumber") ON DELETE CASCADE ON UPDATE CASCADE;
