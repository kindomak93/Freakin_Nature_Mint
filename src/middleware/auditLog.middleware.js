import prisma from "../prisma/client.js";
// Middleware: Express Audit Logger
export const auditLogMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Extract user ID from request body if available
  const userId = req.body?.userId ? String(req.body.userId) : null;
  
  // Clone incoming request payload (Sanitize sensitive fields like hashKey)
  const sanitizedBody = { ...req.body };

  const SENSITIVE_FIELDS = [
    "hashKey",
    "password",
    "privateKey",
    "encryptedKey",
    "secret",
    "token",
    "accessToken",
    "refreshToken",
    "apiKey",
    ];

    for (const field of SENSITIVE_FIELDS) {
        if (sanitizedBody[field]) {
            sanitizedBody[field] = "[REDACTED]";
        }
    }
  

  // Intercept res.send / res.json to capture response body
  const originalJson = res.json;
  let responseBody = null;

  res.json = function (body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  // Listen for request completion
  res.on("finish", async () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Extract potential error message
    let errorMessage = null;
    if (responseBody && responseBody.error) {
      errorMessage = typeof responseBody.error === "string" 
        ? responseBody.error 
        : JSON.stringify(responseBody.error);
    }

    // Save log entry to PostgreSQL in background
    try {
      await prisma.auditLog.create({
        data: {
          endpoint: req.originalUrl || req.url,
          method: req.method,
          userId: userId,
          statusCode: statusCode,
          ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
          request: JSON.stringify(sanitizedBody),
          response: responseBody ? JSON.stringify(responseBody) : null,
          error: errorMessage,
          durationMs: durationMs,
        },
      });
    } catch (dbErr) {
      console.error("[Audit Log Error] Failed to persist log entry:", dbErr.message);
    }
  });

  next();
};