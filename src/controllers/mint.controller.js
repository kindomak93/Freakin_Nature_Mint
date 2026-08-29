import { mintNft as mintNftService } from "../services/mint.service.js";

export const mintNft = async (req, res) => {
  const { orderId, userId, nftType } = req.body;

  if (!orderId || !userId || !nftType) {
    return res.status(400).json({
      error:
        "Missing required fields: orderId, userId, and nftType are required.",
    });
  }

  try {
    const result = await mintNftService({
      orderId,
      userId,
      nftType,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Mint Controller Error]:", error);

    return res.status(error.statusCode || 500).json({
      error: error.message || "Failed to mint and transfer NFT",
    });
  }
};