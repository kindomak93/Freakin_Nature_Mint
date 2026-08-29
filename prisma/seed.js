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

// 1. Initialize Prisma & PostgreSQL Connection
const { PrismaClient } = prismaPkg;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Initialize Hedera Client
const operatorId = process.env.HEDERA_ACCOUNT_ID;
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Mirror Node Base URL for Testnet
const MIRROR_NODE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

const collectionsToCreate = [
  { symbol: "FST", name: "Founding Supporter Token", isMutable: false },
  { symbol: "FAT", name: "Festival Access Token", isMutable: true },
  { symbol: "FCT", name: "FIDGITAL Certificate Token", isMutable: false },
  { symbol: "PCBT", name: "Partner / Creator Badge Token", isMutable: true },
];

/**
 * Queries Hedera Mirror Node to check if a token symbol exists on-chain for operatorId
 */
async function findTokenOnChainBySymbol(symbol) {
  try {
    const response = await axios.get(`${MIRROR_NODE_URL}/accounts/${operatorId}/tokens`);
    const tokens = response.data.tokens || [];

    for (const token of tokens) {
      // Query individual token details from Mirror Node to check its symbol
      const tokenInfo = await axios.get(`${MIRROR_NODE_URL}/tokens/${token.token_id}`);
      if (tokenInfo.data.symbol === symbol) {
        return tokenInfo.data; // Returns token info object containing token_id
      }
    }
  } catch (error) {
    console.warn(`[Mirror Node Warning] Failed to fetch on-chain tokens: ${error.message}`);
  }
  return null;
}

async function main() {
  console.log("Checking database and Hedera wallet for Token Collections...\n");

  for (const config of collectionsToCreate) {
    // 1. Check if collection already exists in database
    const existingInDb = await prisma.tokenCollection.findUnique({
      where: { symbol: config.symbol },
    });

    if (existingInDb) {
      console.log(`[SKIP DB] ${config.symbol} exists in database with Token ID: ${existingInDb.tokenId}`);
      continue;
    }

    // 2. Check if collection exists on-chain in your Hedera Treasury wallet
    console.log(`Checking Hedera Mirror Node for existing '${config.symbol}' on-chain...`);
    const onChainToken = await findTokenOnChainBySymbol(config.symbol);

    if (onChainToken) {
      console.log(`[FOUND ON-CHAIN] ${config.symbol} found on Hedera with Token ID: ${onChainToken.token_id}`);

      // Save the existing on-chain collection to your database
      await prisma.tokenCollection.upsert({
          where: {
            symbol: config.symbol,
          },
          update: {
            name: config.name,
            tokenId: onChainToken.token_id,
            isMutable: config.isMutable,
          },
          create: {
            symbol: config.symbol,
            name: config.name,
            tokenId: onChainToken.token_id,
            isMutable: config.isMutable,
          },
        });


      console.log(`  └ Synced existing on-chain Token ID ${onChainToken.token_id} into database.\n`);
      continue;
    }

    // 3. If missing from both DB and Wallet -> Deploy new collection to Hedera
    console.log(`[CREATE NEW] Deploying collection '${config.name}' (${config.symbol}) to Hedera...`);

    const createTx = new TokenCreateTransaction()
      .setTokenName(config.name)
      .setTokenSymbol(config.symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1000)
      .setTreasuryAccountId(operatorId)
      .setSupplyKey(operatorKey);

    if (config.isMutable) {
      createTx.setAdminKey(operatorKey);
    }

    const txResponse = await createTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const realTokenId = receipt.tokenId.toString();

    console.log(`  └ Created on Hedera with Token ID: ${realTokenId}`);

    // Save newly created token to PostgreSQL
    await prisma.tokenCollection.upsert({
        where: {
          symbol: config.symbol,
        },
        update: {
          name: config.name,
          tokenId: onChainToken.token_id,
          isMutable: config.isMutable,
        },
        create: {
          symbol: config.symbol,
          name: config.name,
          tokenId: onChainToken.token_id,
          isMutable: config.isMutable,
        },
      });


    console.log(`  └ Saved to TokenCollection database table.\n`);
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