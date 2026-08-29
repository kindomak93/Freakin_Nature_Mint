FreakinFutureMint API

FreakinFutureMint is a Node.js API for managing custodial wallets and NFT operations on the Hedera network. The API supports custodial wallet creation, NFT minting, NFT ownership transfers, and retrieving NFTs owned by users.

Getting Started
1. Clone the Repository

Clone the repository and navigate to the project directory:

git clone https://github.com/kindomak93/Freakin_Nature_Mint.git
cd Freakin_Nature_Mint

2. Configure Environment Variables

Copy the provided .env file into the project root.

Important: Do not commit the .env file to the repository. It may contain sensitive credentials, API keys, private keys, database credentials, and other secrets.

3. Start the Application

Build and start the application using Docker Compose:

docker-compose up --build


Once the containers are running, the API will be available at the configured server URL.

API Documentation
Authentication

All API requests must include the following header:

Header	Value
x-api-key	Your configured API_KEY value

Example:

x-api-key: your_api_key

1. Create Wallet

Creates a custodial wallet for a user.

Endpoint
POST /api/create_wallet

Headers
Content-Type: application/json
x-api-key: your_api_key

Request Body
{
  "userId": "usr_12345",
  "email": "user@example.com",
  "hashKey": "your_laravel_app_secret_hash_key"
}

Success Response

201 Created

{
  "success": true,
  "message": "Custodial wallet created successfully.",
  "accountNumber": "0.0.7891011",
  "email": "user@example.com"
}

Error Responses

400 Bad Request / 404 Not Found

{
  "error": "Missing required fields: email and hashKey are required."
}


500 Internal Server Error

{
  "error": "Failed to create custodial wallet on Hedera."
}

2. Mint NFT

Mints an NFT for a user based on the specified NFT type.

Endpoint
POST /api/mint

Headers
Content-Type: application/json
x-api-key: your_api_key

Request Body
{
  "orderId": "ord_987654321",
  "userId": "usr_12345",
  "nftType": "FAT"
}


Note: orderId may correspond to the payment_intent_id returned by Stripe.

Supported NFT Types
Symbol	Name
FST	Founding Supporter Token
FAT	Festival Access Token
FCT	FIDGITAL Certificate Token
PCBT	Partner / Creator Badge Token
Success Response

200 OK

{
  "success": true,
  "message": "Minted Festival Access Token successfully",
  "orderId": "ord_987654321",
  "nft": {
    "id": "e4b3c2d1-0000-0000-0000-123456789abc",
    "tokenId": "0.0.10164774",
    "serialNumber": "1",
    "ownerUserId": "usr_12345",
    "name": "Festival Access Token #ord_987654321",
    "symbol": "FAT",
    "isMutable": true,
    "image": "https://picsum.photos/id/11/400",
    "description": "Official Festival Access Token issued to User usr_12345 (Order #ord_987654321)",
    "rawMetadata": "{\"n\":\"Festival Access Token #ord_987654321\",\"d\":\"Official Festival Access Token issued to User usr_12345 (Order #ord_987654321)\",\"i\":\"https://picsum.photos/id/11/400\"}",
    "createdAt": "2026-08-28T19:00:00.000Z",
    "updatedAt": "2026-08-28T19:00:00.000Z"
  }
}

Error Response

400 Bad Request / 404 Not Found

{
  "error": "Missing required fields: orderId, userId, and nftType are required."
}

3. Transfer NFT Ownership

Transfers ownership of an NFT from a user's custodial wallet to another Hedera account.

Endpoint
POST /api/transfer_nft

Headers
Content-Type: application/json
x-api-key: your_api_key

Request Body
{
  "userId": "usr_12345",
  "hashKey": "your_laravel_app_secret_hash_key",
  "tokenId": "0.0.10164866",
  "serialNumber": "2",
  "recipientAccountId": "0.0.10274229"
}

Success Response

200 OK

{
  "success": true,
  "message": "Transferred NFT #2 to 0.0.10274733",
  "status": "SUCCESS"
}

Error Response

500 Internal Server Error

{
  "error": "Receipt for transaction 0.0.6866899@1787992832.388514772 contained error status SENDER_DOES_NOT_OWN_NFT_SERIAL_NO"
}

4. Get NFTs Owned by a User

Retrieves all NFTs associated with a user's custodial wallet.

Endpoint
GET /api/get_nfts

Headers
x-api-key: your_api_key

Request

The userId should be provided as a query parameter.

GET /api/get_nfts?userId=usr_12345

Success Response

200 OK

{
  "success": true,
  "nfts": [
    {
      "tokenId": "0.0.123456",
      "serialNumber": "1",
      "name": "Artwork #1",
      "symbol": "ART",
      "metadata": "ipfs://QmExample..."
    },
    {
      "tokenId": "0.0.123456",
      "serialNumber": "2",
      "name": "Artwork #2",
      "symbol": "ART",
      "metadata": "ipfs://QmExample..."
    }
  ]
}

Error Responses

400 Bad Request / 404 Not Found

{
  "error": "Missing required field: userId is required."
}


500 Internal Server Error

{
  "error": "Failed to fetch user NFTs from database.",
  "details": "The actual error message here"
}

API Endpoint Summary
Method	Endpoint	Description
POST	/api/create_wallet	Create a custodial wallet
POST	/api/mint	Mint an NFT
POST	/api/transfer_nft	Transfer NFT ownership
GET	/api/get_nfts	Retrieve NFTs owned by a user
Development Notes
All API endpoints require the x-api-key authentication header.
Keep sensitive configuration values in the .env file.
Never commit secrets, API keys, private keys, or database credentials to Git.
The application is designed to run using Docker Compose.
NFT operations interact with the Hedera network.
The orderId used by the mint endpoint may correspond to the Stripe payment_intent_id.
The /api/get_nfts endpoint uses a GET request with userId provided as a query parameter.