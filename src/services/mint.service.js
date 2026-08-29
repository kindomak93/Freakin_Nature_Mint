import {
  TokenMintTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";

import prisma from "../prisma/client.js";
import { client, ACCOUNT_ID } from "../config/hedera.js";
import { COLLECTION_IMAGES } from "../config/collections.js";

export const mintNft = async ({ orderId, userId, nftType }) => {
  // 1. Find user's custodial wallet
  const wallet = await prisma.custodialWallet.findUnique({
    where: {
      userId: String(userId),
    },
  });

  if (!wallet) {
    const error = new Error(
      `No custodial wallet found for userId '${userId}'. Call /api/create_wallet first.`,
    );

    error.statusCode = 404;
    throw error;
  }

  // 2. Find token collection
  const tokenCollection = await prisma.tokenCollection.findUnique({
    where: {
      symbol: String(nftType),
    },
  });

  if (!tokenCollection) {
    const error = new Error(
      `Invalid nftType '${nftType}'. Collection not found in database.`,
    );

    error.statusCode = 404;
    throw error;
  }

  const {
    tokenId,
    name,
    isMutable,
    symbol,
  } = tokenCollection;

  // 3. Construct metadata
  const metadataPayload = {
    n: `${symbol}`,
    d: `${symbol} for ${userId}`,
    i:  COLLECTION_IMAGES[symbol] ,
  };

  const metadataBuffer = Buffer.from(
    JSON.stringify(metadataPayload),
  );

  //console.log("Metadata:", metadataJson);
  console.log("Metadata bytes:", metadataBuffer.length);
  // 4. Mint NFT
  const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([metadataBuffer]);

  const mintResponse = await mintTx.execute(client);
  const mintReceipt = await mintResponse.getReceipt(client);

  const serialNumber = mintReceipt.serials[0].toString();

  console.log(
    `Minted Serial #${serialNumber} for Token ID ${tokenId} to Treasury`,
  );

  // 5. Transfer NFT to user's custodial account
  const transferTx = new TransferTransaction()
    .addNftTransfer(
      tokenId,
      Number(serialNumber),
      ACCOUNT_ID,
      wallet.accountNumber,
    );

  const transferResponse = await transferTx.execute(client);

  await transferResponse.getReceipt(client);

  console.log(
    `Transferred Serial #${serialNumber} to User Wallet (${wallet.accountNumber})`,
  );

  // 6. Save NFT
  const savedNft = await prisma.nft.upsert({
    where: {
      tokenId_serialNumber: {
        tokenId,
        serialNumber,
      },
    },

    update: {
      ownerUserId: String(userId),
      name: metadataPayload.n,
      description: metadataPayload.d,
      image: metadataPayload.i,
    },

    create: {
      tokenId,
      serialNumber,
      ownerUserId: String(userId),
      name: metadataPayload.n,
      symbol,
      isMutable,
      image: metadataPayload.i,
      description: metadataPayload.d,
      rawMetadata: JSON.stringify(metadataPayload),
    },
  });

  return {
    message: `Minted and transferred ${name} successfully`,
    orderId,
    recipientAccount: wallet.accountNumber,
    nft: savedNft,
  };
};