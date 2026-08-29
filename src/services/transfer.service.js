import {
  PrivateKey,
  TransferTransaction,
} from "@hashgraph/sdk";

import prisma from "../prisma/client.js";
import { client } from "../config/hedera.js";
import { decryptPrivateKey } from "../utils/encryption.js";

export const transferNft = async ({
  userId,
  hashKey,
  tokenId,
  serialNumber,
  recipientAccountId,
}) => {
  // 1. Fetch user's custodial wallet
  const wallet = await prisma.custodialWallet.findUnique({
    where: {
      userId: String(userId),
    },
  });

  if (!wallet) {
    const error = new Error("Custodial wallet not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Decrypt user's private key
  const rawPrivateKey = decryptPrivateKey(
    wallet.encryptedKey,
    wallet.iv,
    hashKey,
  );

  const userPrivateKey =
    PrivateKey.fromStringECDSA(rawPrivateKey);

  // 3. Build transfer transaction
  const transferTx = new TransferTransaction()
    .addNftTransfer(
      tokenId,
      Number(serialNumber),
      wallet.accountNumber,
      recipientAccountId,
    )
    .freezeWith(client);

  // 4. Sign with user's private key
  const signedTx =
    await transferTx.sign(userPrivateKey);

  // 5. Execute on Hedera
  const txResponse =
    await signedTx.execute(client);

  const receipt =
    await txResponse.getReceipt(client);

  // 6. Update local database
  await prisma.nft.update({
    where: {
      tokenId_serialNumber: {
        tokenId,
        serialNumber: String(serialNumber),
      },
    },
    data: {
      ownerUserId: null,
    },
  });

  return {
    message: `Transferred NFT #${serialNumber} to ${recipientAccountId}`,
    status: receipt.status.toString(),
  };
};