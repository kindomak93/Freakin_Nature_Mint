import {
  AccountCreateTransaction,
  Hbar,
  PrivateKey,
} from "@hashgraph/sdk";

import prisma from "../prisma/client.js";
import { client } from "../config/hedera.js";
import { encryptPrivateKey } from "../utils/encryption.js";

export const createWallet = async ({
  userId,
  email,
  hashKey,
}) => {
  // 1. Check if wallet already exists
  const existingWallet =
    await prisma.custodialWallet.findUnique({
      where: {
        email,
      },
    });

  if (existingWallet) {
    return {
      alreadyExists: true,
      accountNumber: existingWallet.accountNumber,
      email: existingWallet.email,
    };
  }

  // 2. Generate Hedera key pair
  const newUserPrivateKey =
    PrivateKey.generateECDSA();

  const newUserPublicKey =
    newUserPrivateKey.publicKey;

  // 3. Create Hedera account
  const createAccountTx =
    new AccountCreateTransaction()
      .setECDSAKeyWithAlias(newUserPublicKey)
      .setInitialBalance(new Hbar(2))
      .setMaxAutomaticTokenAssociations(-1); // <-- Enables unlimited automatic token associations;

  const txResponse =
    await createAccountTx.execute(client);

  const receipt =
    await txResponse.getReceipt(client);

  const newAccountId =
    receipt.accountId.toString();

  console.log(
    `[Wallet Created] Account ID: ${newAccountId} for ${email}`,
  );

  // 4. Encrypt private key
  const { encryptedKey, iv } =
    encryptPrivateKey(
      newUserPrivateKey.toStringRaw(),
      hashKey,
    );

  // 5. Save wallet
  const wallet =
    await prisma.custodialWallet.create({
      data: {
        userId: userId
          ? String(userId)
          : null,

        email,

        accountNumber:
          newAccountId,

        encryptedKey,

        iv,
      },
    });

  return {
    alreadyExists: false,
    accountNumber:
      wallet.accountNumber,

    email: wallet.email,
  };
};