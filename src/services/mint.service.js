import {
  TokenMintTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";

import prisma from "../prisma/client.js";
import { client, ACCOUNT_ID } from "../config/hedera.js";
import { COLLECTION_IMAGES } from "../config/collections.js";

export const mintNft = async ({ orderId, userId, nftType, itemTitle, quantity = 1, }) => {
  
  const webhookUrl = process.env.WEBHOOK_URL;
  const mintQuantity = parseInt(quantity, 10);
  if (isNaN(mintQuantity) || mintQuantity < 1) {
    const error = new Error("quantity must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }
  
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
    name: collectionName,
    isMutable,
    symbol,
  } = tokenCollection;

  // Resolve dynamic itemTitle or fallback to collection default
  const eventName = itemTitle ? itemTitle.trim() : collectionName;

  console.log(
    `[Mint Service] Order: ${orderId} | User: ${userId} | Event: '${eventName}' | Quantity: ${mintQuantity}`,
  );

  // 3. Construct metadata Arrays for Batch
  const metadataBuffers = [];
  const metadataPayloads = [];

  for (let i = 1; i <= mintQuantity; i++) {
    const payload = {
      n: mintQuantity > 1 ? `${eventName} Pass #${i}` : `${eventName}`,
      d: `issued to ${userId}`,
      i: "",
    };
    const metadataBuffer = Buffer.from(JSON.stringify(payload));
    //console.log("Metadata bytes:", metadataBuffer.length);
    metadataPayloads.push(payload);
    metadataBuffers.push(metadataBuffer);
  }
  /* const metadataPayload = {
    n: `${symbol}`,
    d: `${symbol} for ${userId}`,
    i:  COLLECTION_IMAGES[symbol] ,
  };

  const metadataBuffer = Buffer.from(
    JSON.stringify(metadataPayload),
  ); */

  //console.log("Metadata:", metadataJson);
  //console.log("Metadata bytes:", metadataBuffer.length);
  // 4. Batch Mint NFTs on Hedera
  const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata(metadataBuffers);

  const mintResponse = await mintTx.execute(client);
  const mintReceipt = await mintResponse.getReceipt(client);

  // Extract array of minted serial numbers as strings
  const mintedSerials = mintReceipt.serials.map((s) => s.toString());

  console.log(
    `Minted ${mintedSerials.length} serials on Hedera: ${mintedSerials.join(", ")}`,
  );
  // 4. Mint NFT
  /* const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([metadataBuffer]);

  const mintResponse = await mintTx.execute(client);
  const mintReceipt = await mintResponse.getReceipt(client);

  const serialNumber = mintReceipt.serials[0].toString();

  console.log(
    `Minted Serial #${serialNumber} for Token ID ${tokenId} to Treasury`,
  ); */

  // 5. Transfer NFT to user's custodial account
  /* const transferTx = new TransferTransaction()
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
  ); */

  // 5. Transfer ALL Minted Serials from Treasury -> User's Custodial Wallet
  const transferTx = new TransferTransaction();
  for (const serialStr of mintedSerials) {
    transferTx.addNftTransfer(
      tokenId,
      Number(serialStr),
      ACCOUNT_ID,
      wallet.accountNumber,
    );
  }

  const transferResponse = await transferTx.execute(client);
  await transferResponse.getReceipt(client);

  console.log(
    `Transferred ${mintedSerials.length} serials to User Wallet (${wallet.accountNumber})`,
  );

  // 6. Save NFT
  /* const savedNft = await prisma.nft.upsert({
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
  }); */

  const savedNfts = [];
  for (let index = 0; index < mintedSerials.length; index++) {
    const serialNumber = mintedSerials[index];
    const meta = metadataPayloads[index];

    const nftRecord = await prisma.nft.upsert({
      where: {
        tokenId_serialNumber: {
          tokenId,
          serialNumber,
        },
      },
      update: {
        ownerUserId: String(userId),
        name: meta.n,
        itemTitle: eventName,
        description: meta.d,
        image: meta.i,
      },
      create: {
        tokenId,
        serialNumber,
        ownerUserId: String(userId),
        name: meta.n,
        symbol,
        itemTitle: eventName,
        isMutable,
        image: meta.i,
        description: meta.d,
        rawMetadata: JSON.stringify(meta),
      },
    });

    savedNfts.push(nftRecord);
  }
  
  // 8. Prepare Webhook Payload
  const webhookData = {
    event: "nft.minted",
    orderId,
    userId: String(userId),
    quantity: mintedSerials.length,
    recipientAccount: wallet.accountNumber,
    nfts: savedNfts,
    timestamp: new Date().toISOString(),
  };

  // 9. ENQUEUE JOB: Save job to DB table (the background worker sends it)
  const createdJob = await prisma.webhookJob.create({
    data: {
      url: webhookUrl,
      payload: JSON.stringify(webhookData),
    },
  });

  console.log(`[Job Enqueued] Created WebhookJob #${createdJob.id} for Order #${orderId}`);

  // Return immediately to caller
  return {
    message: `Minted and transferred ${mintedSerials.length} ticket(s) for '${eventName}' successfully.`,
    orderId,
    quantity: mintedSerials.length,
    recipientAccount: wallet.accountNumber,
    nfts: savedNfts,
    jobId: createdJob.id,
  };  
};