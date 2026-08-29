-- CreateTable
CREATE TABLE "Nft" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isMutable" BOOLEAN NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "rawMetadata" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nft_tokenId_serialNumber_key" ON "Nft"("tokenId", "serialNumber");
