import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";

//dotenv.config();

import mintRoutes from "./routes/mint.routes.js";
import walletRoutes from "./routes/wallet.routes.js"
import transferRoutes from "./routes/transfer.routes.js";
import nftRoutes from "./routes/nft.routes.js";
import { requireApiKey } from "./middleware/apiKey.middleware.js";
import { auditLogMiddleware } from "./middleware/auditLog.middleware.js";


const app = express();
app.use(cors());
app.use(express.json());

// Audit every API request
app.use("/api", auditLogMiddleware);


//API Authentication
app.use("/api", requireApiKey);

//Routes
app.use("/api", mintRoutes);
app.use("/api", walletRoutes);
app.use("/api", transferRoutes);
app.use("/api", nftRoutes);


// REST Endpoint to fetch indexed NFTs
app.get("/api/nfts", async (req, res) => {
  try {
    const nfts = await prisma.nft.findMany();    
    console.log("Fetched NFTs:", nfts); 
    res.json(nfts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch NFTs from database." });
  }
});


// Manual trigger sync endpoint
/* app.post("/api/sync", async (req, res) => {
  await syncHederaNfts();
  res.json({ message: "Sync triggered successfully." });
}); */

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);  
  //await getAndLogNfts();
});