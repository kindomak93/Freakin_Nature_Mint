import prisma from "../prisma/client.js";

export const getUserNfts = async (userId) => {
  // 1. Fetch user's custodial wallet
  const wallet =
    await prisma.custodialWallet.findUnique({
      where: {
        userId: String(userId),
      },
    });

  // 2. Fetch user's NFTs
  const userNfts =
    await prisma.nft.findMany({
      where: {
        ownerUserId: String(userId),
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return {
    userId: String(userId),

    accountNumber:
      wallet?.accountNumber || null,

    count: userNfts.length,

    nfts: userNfts.map((nft) => ({
      tokenId: nft.tokenId,
      serialNumber: nft.serialNumber,
      symbol: nft.symbol,
      name: nft.name,
      description: nft.description,
      image: nft.image,
      isMutable: nft.isMutable,
      createdAt: nft.createdAt,
    })),
  };
};