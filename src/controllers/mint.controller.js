import { mintNft as mintNftService } from "../services/mint.service.js";

export const mintNft = async (req, res) => {
  const { orderId, userId, nftType, nftItems } = req.body;

  if (!orderId || !userId || !nftType) {
    return res.status(400).json({
      error:
        "Missing required fields: orderId, userId, and nftType are required.",
    });
  }
  if (!Array.isArray(nftItems) || nftItems.length === 0) {
    return res.status(400).json({
      error: "A non-empty NFT items array is required.",
    });
  }
  for (const item of nftItems) {
    if (!item.quantity || parseInt(item.quantity, 10) < 1) {
      return res.status(400).json({
        error: "Each item in NFT items must include quantity >= 1.",
      });
    }
  }

  try {
    const result = await mintNftService({
      orderId,
      userId,
      nftType,
      nftItems
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