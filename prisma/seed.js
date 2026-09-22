import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} from "@hashgraph/sdk";

dotenv.config();

const { PrismaClient } = prismaPkg;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const operatorId = process.env.HEDERA_ACCOUNT_ID;
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

const collectionsToCreate = [
  { symbol: "FST", name: "Founding Supporter Token", isMutable: false, itemTitle: "TITLE FOUNDING PARTNER" },
  { symbol: "FST", name: "Founding Supporter Token", isMutable: false, itemTitle: "FOUNDING ECOSYSTEM PARTNER" },
  { symbol: "FST", name: "Founding Supporter Token", isMutable: false, itemTitle: "FOUNDING CIRCLE PARTNER" },
  { symbol: "FST", name: "Founding Supporter Token", isMutable: false, itemTitle: "FOUNDING SUPPORTER PARTNER" },
  { symbol: "FAT", name: "Festival Access Token", isMutable: true, itemTitle: "Pan African Unity Festival" },
  { symbol: "FCT", name: "FIDGITAL Certificate Token", isMutable: false, itemTitle: "" },
  { symbol: "PCBT", name: "Partner / Creator Badge Token", isMutable: true, itemTitle: "" },
];

async function findTokenOnChainBySymbol(symbol) {
  try {
    const response = await axios.get(`${MIRROR_NODE_URL}/accounts/${operatorId}/tokens`);
    const tokens = response.data.tokens || [];

    for (const token of tokens) {
      const tokenInfo = await axios.get(`${MIRROR_NODE_URL}/tokens/${token.token_id}`);
      if (tokenInfo.data.symbol === symbol) {
        return tokenInfo.data.token_id;
      }
    }
  } catch (error) {
    console.warn(`[Mirror Node Warning] ${error.message}`);
  }
  return null;
}

async function main() {
  console.log("Seeding Token Collections...\n");

  // In-memory cache for Token IDs across iterations
  const tokenCache = {};

  for (const config of collectionsToCreate) {
    const itemTitle = config.itemTitle || "";

    // 1. Check if DB record already exists
    const existingInDb = await prisma.tokenCollection.findFirst({
      where: { symbol: config.symbol, itemTitle: itemTitle },
    });

    if (existingInDb) {
      console.log(`[SKIP] DB already has '${config.symbol}' - '${itemTitle}'`);
      tokenCache[config.symbol] = existingInDb.tokenId;
      continue;
    }

    // 2. Resolve Hedera Token ID (Check Cache -> Mirror Node -> Create New)
    let targetTokenId = tokenCache[config.symbol];

    if (!targetTokenId) {
      targetTokenId = await findTokenOnChainBySymbol(config.symbol);
      if (targetTokenId) {
        console.log(`[FOUND ON-CHAIN] Reusing Token ID ${targetTokenId} for '${config.symbol}'`);
      }
    }

    if (!targetTokenId) {
      console.log(`[DEPLOYING] Deploying new '${config.symbol}' token to Hedera...`);
      const createTx = new TokenCreateTransaction()
        .setTokenName(config.name)
        .setTokenSymbol(config.symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000)
        .setTreasuryAccountId(operatorId)
        .setSupplyKey(operatorKey);

      if (config.isMutable) createTx.setAdminKey(operatorKey);

      const txResponse = await createTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      targetTokenId = receipt.tokenId.toString();
      console.log(`  └ Deployed on Hedera as: ${targetTokenId}`);
    }

    // Cache the resolved Token ID for future loops
    tokenCache[config.symbol] = targetTokenId;

    // 3. Save unique record into PostgreSQL
    await prisma.tokenCollection.create({
      data: {
        symbol: config.symbol,
        name: config.name,
        tokenId: targetTokenId,
        isMutable: config.isMutable,
        itemTitle: itemTitle,
      },
    });

    //console.log(`  └ Inserted DB Row: ${config.symbol} | ${itemTitle || "Default"} | ${targetTokenId}`);
    console.log(`  └ Saved '${config.symbol}' - '${itemTitle || "Default"}' (Token ID: ${targetTokenId}) to DB.\n`);
  }

  console.log("Seeding and sync process completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    client.close();
  })
  .catch(async (e) => {
    console.error("Error during execution:", e);
    await prisma.$disconnect();
    client.close();
    process.exit(1);
  });