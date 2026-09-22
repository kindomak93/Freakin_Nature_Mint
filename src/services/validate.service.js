import prisma from "../prisma/client.js";

export const validateAndScanTicket = async ({ tokenId, serialNumber, gateOperatorId }) => {
  // 1. Fetch NFT along with its scan status
  const nft = await prisma.nft.findUnique({
    where: {
      tokenId_serialNumber: {
        tokenId: String(tokenId),
        serialNumber: String(serialNumber),
      },
    },
    include: {
      checkIn: true,
    },
  });

  if (!nft) {
    const error = new Error("Invalid ticket: NFT not found on record.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Check if already spent
  if (nft.checkIn?.isSpent) {
    const error = new Error(
      `Ticket already used on ${nft.checkIn.scannedAt?.toISOString()}`
    );
    error.statusCode = 400;
    throw error;
  }

  // 3. Mark pass as spent atomically in DB
  const updatedCheckIn = await prisma.ticketCheckIn.upsert({
    where: {
      tokenId_serialNumber: {
        tokenId: String(tokenId),
        serialNumber: String(serialNumber),
      },
    },
    update: {
      isSpent: true,
      scannedAt: new Date(),
      scannedBy: gateOperatorId || "GATE_SCANNER",
    },
    create: {
      tokenId: String(tokenId),
      serialNumber: String(serialNumber),
      isSpent: true,
      scannedAt: new Date(),
      scannedBy: gateOperatorId || "GATE_SCANNER",
    },
  });

  return {
    valid: true,
    message: "Access granted",
    nft: {
      tokenId: nft.tokenId,
      serialNumber: nft.serialNumber,
      name: nft.name,
      ownerUserId: nft.ownerUserId,
    },
    scannedAt: updatedCheckIn.scannedAt,
  };
};