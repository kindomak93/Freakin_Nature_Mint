import { validateAndScanTicket as validateTicketService } from "../services/validate.service.js";

export const validateTicket = async (req, res) => {
  const { tokenId, serialNumber, gateOperatorId } = req.body;

  if (!tokenId || !serialNumber) {
    return res.status(400).json({
      error: "Missing required fields: tokenId and serialNumber are required.",
    });
  }

  try {
    const result = await validateTicketService({
      tokenId,
      serialNumber,
      gateOperatorId,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Validate Controller Error]:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Failed to validate ticket.",
    });
  }
};