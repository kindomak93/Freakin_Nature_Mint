import {
  createWallet as createWalletService,
} from "../services/wallet.service.js";

export const createWallet = async (req, res) => {
  const {
    userId,
    email,
    hashKey,
  } = req.body;

  if (!email || !hashKey) {
    return res.status(400).json({
      error:
        "Missing required fields: email and hashKey are required.",
    });
  }

  try {
    const result =
      await createWalletService({
        userId,
        email,
        hashKey,
      });

    if (result.alreadyExists) {
      return res.status(200).json({
        message:
          "Custodial wallet already exists for this user.",
        accountNumber:
          result.accountNumber,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Custodial wallet created successfully.",
      accountNumber:
        result.accountNumber,
      email: result.email,
    });
  } catch (error) {
    console.error(
      "[Create Wallet Error]:",
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
      error:
        error.message ||
        "Failed to create custodial wallet on Hedera.",
    });
  }
};