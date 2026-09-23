import {
  TokenMintTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";

import prisma from "../prisma/client.js";
import { client, ACCOUNT_ID } from "../config/hedera.js";
import { COLLECTION_IMAGES } from "../config/collections.js";

export const mintNft = async ({ orderId, userId, nftType, nftItems }) => {
  
  const webhookUrl = process.env.WEBHOOK_URL;
    
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

  const allSavedNfts = [];

  // 2. Process each cart item sequential/batch loop
  for (const item of nftItems) {
    const { itemTitle, quantity } = item;
    const mintQuantity = parseInt(quantity, 10);

    // Fetch token collection using symbol and optional itemTitle filter
    const tokenCollection = await prisma.tokenCollection.findFirst({
      where: {
        symbol: String(nftType),
        //...(itemTitle ? { itemTitle: String(itemTitle) } : {}),
      },
    });

    if (!tokenCollection) {
      const error = new Error(
        `Invalid nftType '${nftType}'. Collection not found in database.`,
      );

      error.statusCode = 404;
      throw error;
    }

    const { tokenId, name: collectionName, isMutable, symbol } = tokenCollection;
    const resolvedTitle = itemTitle ? itemTitle.trim() : collectionName;

    // Build metadata buffers (kept under Hedera 100-byte limit)
    const metadataBuffers = [];
    const metadataPayloads = [];

    for (let i = 1; i <= mintQuantity; i++) {
      const fullMeta = {
        n: mintQuantity > 1 ? `${resolvedTitle} Pass #${i}` : `${resolvedTitle}`,
        d: `issued to ${userId}`,
        i: "",
      };
      
      const metadataBuffer = Buffer.from(JSON.stringify(fullMeta));
      //console.log("Metadata bytes:", metadataBuffer.length);
      metadataPayloads.push(fullMeta);
      metadataBuffers.push(metadataBuffer);
        
    }

    // Mint on Hedera in chunks of 10 to stay within transaction body limit
    const CHUNK_SIZE = 10;
    const mintedSerials = [];

    for (let i = 0; i < metadataBuffers.length; i += CHUNK_SIZE) {
      const bufferBatch = metadataBuffers.slice(i, i + CHUNK_SIZE);

      const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata(bufferBatch);

      const mintResponse = await mintTx.execute(client);
      const mintReceipt = await mintResponse.getReceipt(client);

      const chunkSerials = mintReceipt.serials.map((s) => s.toString());
      mintedSerials.push(...chunkSerials);
    }

    // Transfer minted NFTs to user's custodial wallet in chunks of 10
    for (let i = 0; i < mintedSerials.length; i += CHUNK_SIZE) {
      const serialBatch = mintedSerials.slice(i, i + CHUNK_SIZE);
      const transferTx = new TransferTransaction();

      for (const serialStr of serialBatch) {
        transferTx.addNftTransfer(
          tokenId,
          Number(serialStr),
          ACCOUNT_ID,
          wallet.accountNumber
        );
      }

      const transferResponse = await transferTx.execute(client);
      await transferResponse.getReceipt(client);
    }

    // Save/Upsert records in PostgreSQL
    for (let index = 0; index < mintedSerials.length; index++) {
      const serialNumber = mintedSerials[index];
      const meta = metadataPayloads[index];

      const nftRecord = await prisma.nft.upsert({
        where: {
          tokenId_serialNumber: { tokenId, serialNumber },
        },
        update: {
          ownerUserId: String(userId),
          name: collectionName,
          itemTitle: resolvedTitle,
          description: meta.d,
          image: meta.i,
        },
        create: {
          tokenId,
          serialNumber,
          ownerUserId: String(userId),
          name: collectionName,
          symbol,
          itemTitle: resolvedTitle,
          isMutable,
          image: meta.i,
          description: meta.d,
          rawMetadata: JSON.stringify(meta),
        },
      });

      allSavedNfts.push(nftRecord);
    }
  }
  
  
  // 8. Prepare Webhook Payload
  const webhookData = {
    event: "nft.cart.minted",
    orderId,
    userId: String(userId),
    quantity: allSavedNfts.length,
    recipientAccount: wallet.accountNumber,
    nfts: allSavedNfts,
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
    message: `Minted and transferred ${allSavedNfts.length} ticket(s) across ${nftItems.length} cart item(s) successfully.`,
    orderId,
    quantity: allSavedNfts.length,
    recipientAccount: wallet.accountNumber,
    nfts: allSavedNfts,
    jobId: createdJob.id,
  };  
};