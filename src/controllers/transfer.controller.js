import {
  transferNft as transferNftService,
} from "../services/transfer.service.js";

export const transferNft = async (req, res) => {
  const {
    userId,
    hashKey,
    tokenId,
    serialNumber,
    recipientAccountId,
  } = req.body;

  if (
    !userId ||
    !hashKey ||
    !tokenId ||
    !serialNumber ||
    !recipientAccountId
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: userId, hashKey, tokenId, serialNumber, and recipientAccountId are required.",
    });
  }

  try {
    const result =
      await transferNftService({
        userId,
        hashKey,
        tokenId,
        serialNumber,
        recipientAccountId,
      });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "[Transfer Controller Error]:",
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
      error:
        error.message || "Transfer failed.",
    });
  }
};