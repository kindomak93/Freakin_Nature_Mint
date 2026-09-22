# FreakinFutureMint API

FreakinFutureMint is a Node.js API for managing custodial wallets and NFT operations on the Hedera network. The API supports custodial wallet creation, NFT minting, NFT ownership transfers, and retrieving NFTs owned by users.

## Getting Started

### 1. Clone the Repository

Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/kindomak93/Freakin_Nature_Mint.git
cd Freakin_Nature_Mint
```

### 2. Configure Environment Variables

Copy the provided .env file into the project root.


### 3. Start the Application

Build and start the application using Docker Compose:

```bash
docker-compose up --build
```


## Once the containers are running, the API will be available at the configured server URL.

# API Documentation
## Authentication

All API requests must include the following header:

| Header | Value |
|---|---|
| `x-api-key` | Your configured `API_KEY` value |

### Example

```http
x-api-key: your_api_key
```

## 1. Create Wallet

Creates a custodial wallet for a user.

### Endpoint

```http
POST /api/create_wallet
```

### Headers

```http
Content-Type: application/json
x-api-key: your_api_key
```
### Request Body

```json
{
  "userId": "usr_12345",
  "email": "user@example.com",
  "hashKey": "your_laravel_app_secret_hash_key"
}
```
### Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Custodial wallet created successfully.",
  "accountNumber": "0.0.7891011",
  "email": "user@example.com"
}
```
### Error Responses

**400 Bad Request / 404 Not Found**

```json
{
  "error": "Missing required fields: email and hashKey are required."
}
```
**500 Internal Server Error**

```json
{
  "error": "Failed to create custodial wallet on Hedera."
}
```
## 2. Mint NFT

Mints an NFT for a user based on the specified NFT type.

### Endpoint

```http
POST /api/mint
```
### Headers

```http
Content-Type: application/json
x-api-key: your_api_key
```
### Request Body

```json
{
  "orderId": "ord_987654321",
  "userId": "usr_12345",
  "nftType": "FAT",
  "itemTitle": "PAUF 2026",
  "quantity": "4"
}
```
> **Note:** `orderId` may correspond to the `payment_intent_id` returned by Stripe.
### Supported NFT Types

| Symbol | Name |
|---|---|
| `FST` | Founding Supporter Token |
| `FAT` | Festival Access Token |
| `FCT` | FIDGITAL Certificate Token |
| `PCBT` | Partner / Creator Badge Token |

### Success Response

**200 OK**

```json
{
    "success": true,
    "message": "Minted and transferred 4 ticket(s) for 'PAUF' successfully.",
    "orderId": "ord_987654321ord_987654321",
    "quantity": 4,
    "recipientAccount": "0.0.10274229",
    "nfts": [
        {
            "id": "26afcd9d-2a1d-48ec-b867-970de2fe78fb",
            "tokenId": "0.0.10164866",
            "serialNumber": "8",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "PAUF Pass #1",
            "symbol": "FAT",
            "itemTitle": "PAUF 2026",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"PAUF Pass #1\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-22T14:42:53.360Z",
            "updatedAt": "2026-09-22T14:42:53.360Z"
        },
        {
            "id": "251af6f4-0136-4a61-94b0-8f9e16e3a1a8",
            "tokenId": "0.0.10164866",
            "serialNumber": "9",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "PAUF Pass #2",
            "symbol": "FAT",
            "itemTitle": "PAUF 2026",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"PAUF Pass #2\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-22T14:42:53.363Z",
            "updatedAt": "2026-09-22T14:42:53.363Z"
        },
        {
            "id": "1ed7efe0-7cd0-4994-a327-273b346c2f31",
            "tokenId": "0.0.10164866",
            "serialNumber": "10",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "PAUF Pass #3",
            "symbol": "FAT",
            "itemTitle": "PAUF 2026",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"PAUF Pass #3\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-22T14:42:53.365Z",
            "updatedAt": "2026-09-22T14:42:53.365Z"
        },
        {
            "id": "6a99612c-74a8-4bd9-be6d-74381f886e13",
            "tokenId": "0.0.10164866",
            "serialNumber": "11",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "PAUF Pass #4",
            "symbol": "FAT",
            "itemTitle": "PAUF 2026",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"PAUF Pass #4\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-22T14:42:53.367Z",
            "updatedAt": "2026-09-22T14:42:53.367Z"
        }
    ],
    "jobId": "5daa4f8b-e791-4c82-93a7-d336ad984e23"
}
```
### Error Response

**400 Bad Request / 404 Not Found**

```json
{
  "error": "Missing required fields: orderId, userId, and nftType are required."
}
```
### 3. Transfer NFT Ownership

Transfers ownership of an NFT from a user's custodial wallet to another Hedera account.

### Endpoint

```http
POST /api/transfer_nft
```
### Headers

```http
Content-Type: application/json
x-api-key: your_api_key
```
### Request Body

```json
{
  "userId": "usr_12345",
  "hashKey": "your_laravel_app_secret_hash_key",
  "tokenId": "0.0.10164866",
  "serialNumber": "2",
  "recipientAccountId": "0.0.10274229"
}
```
### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Transferred NFT #2 to 0.0.10274733",
  "status": "SUCCESS"
}
```
### Error Response

**500 Internal Server Error**

```json
{
  "error": "Receipt for transaction 0.0.6866899@1787992832.388514772 contained error status SENDER_DOES_NOT_OWN_NFT_SERIAL_NO"
}
```

## 4. Get NFTs Owned by a User

Retrieves all NFTs associated with a user's custodial wallet.

### Endpoint

```http
POST /api/get_nfts
```
### Headers

```http
Content-Type: application/json
x-api-key: your_api_key
```
### Request Body

```json
{
  "userId": "usr_12345"
}
```
### Success Response

**200 OK**

```json
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
```
**400 Bad Request / 404 Not Found**

```json
{
  "error": "Missing required field: userId is required."
}
```
**500 Internal Server Error**

```json
{
  "error": "Failed to fetch user NFTs from database.",
  "details": "The actual error message here"
}
```
## API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/create_wallet` | Create a custodial wallet |
| `POST` | `/api/mint` | Mint an NFT |
| `POST` | `/api/transfer_nft` | Transfer NFT ownership |
| `POST` | `/api/get_nfts` | Retrieve NFTs owned by a user |
## Development Notes

- All API endpoints require the `x-api-key` authentication header.
- Keep sensitive configuration values in the `.env` file.
- Never commit secrets, API keys, private keys, or database credentials to Git.
- The application is designed to run using Docker Compose.
- NFT operations interact with the Hedera network.
- The `orderId` used by the mint endpoint may correspond to the Stripe `payment_intent_id`.
