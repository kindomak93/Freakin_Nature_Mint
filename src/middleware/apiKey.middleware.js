export const requireApiKey = (req, res, next) => {
  const apiKey = req.get("x-api-key");

  if (!apiKey) {
    return res.status(401).json({
      error: "API key is required",
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      error: "Invalid API key",
    });
  }

  next();
};