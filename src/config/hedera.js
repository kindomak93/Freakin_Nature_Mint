import {
  Client,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";

const ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;

//console.log("environment variables,", ACCOUNT_ID, PRIVATE_KEY);
if (!ACCOUNT_ID || !PRIVATE_KEY) {
  console.error("Missing Hedera credentials in .env file!");
  process.exit(1);
}

const client = Client.forTestnet();

client.setOperator(
  AccountId.fromString(ACCOUNT_ID),
  PrivateKey.fromStringECDSA(PRIVATE_KEY),
);

export {
  client,
  ACCOUNT_ID,
};