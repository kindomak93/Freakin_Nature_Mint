-- AlterTable
ALTER TABLE "Nft" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ownerUserId" TEXT;

-- CreateTable
CREATE TABLE "TokenCollection" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "isMutable" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenCollection_symbol_key" ON "TokenCollection"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "TokenCollection_tokenId_key" ON "TokenCollection"("tokenId");
