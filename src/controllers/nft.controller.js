import {
  getUserNfts as getUserNftsService,
} from "../services/nft.service.js";

export const getUserNfts = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      error:
        "Missing required field: userId is required.",
    });
  }

  try {
    const result =
      await getUserNftsService(userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "[Get User NFTs Controller Error]:",
      error,
    );

    return res.status(500).json({
      error:
        "Failed to fetch user NFTs from database.",
      details: error.message,
    });
  }
};