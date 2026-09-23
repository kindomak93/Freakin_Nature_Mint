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
 "orderId": "ord_987654321ord_987654321",
  "userId": "usr_12345usr_12345usr_12345",
  "nftType": "FAT",
  "nftItems": [
    {      
      "itemTitle": "PAUF 2026 VIP",
      "quantity": 2
    },
    {
       "itemTitle": "FNB Regular",
      "quantity": 3
    }    
  ]
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
    "message": "Minted and transferred 5 ticket(s) across 2 cart item(s) successfully.",
    "orderId": "ord_987654321ord_987654321",
    "quantity": 5,
    "recipientAccount": "0.0.10274229",
    "nfts": [
        {
            "id": "3fd0b4a7-79d2-41e6-9963-f8f97a4caa57",
            "tokenId": "0.0.10164866",
            "serialNumber": "12",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "Festival Access Token",
            "symbol": "FAT",
            "itemTitle": "PAUF 2026 VIP",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"PAUF 2026 VIP Pass #1\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-23T19:51:39.097Z",
            "updatedAt": "2026-09-23T19:51:39.097Z"
        },
        {
            "id": "7077d62d-580f-47b5-b381-47eb4651b3a7",
            "tokenId": "0.0.10164866",
            "serialNumber": "13",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "Festival Access Token",
            "symbol": "FAT",
            "itemTitle": "PAUF 2026 VIP",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"PAUF 2026 VIP Pass #2\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-23T19:51:39.122Z",
            "updatedAt": "2026-09-23T19:51:39.122Z"
        },
        {
            "id": "5eb2ffc9-cb8a-4bee-b1c3-3d517b768e47",
            "tokenId": "0.0.10164866",
            "serialNumber": "14",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "Festival Access Token",
            "symbol": "FAT",
            "itemTitle": "FNB Regular",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"FNB Regular Pass #1\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-23T19:51:41.779Z",
            "updatedAt": "2026-09-23T19:51:41.779Z"
        },
        {
            "id": "5f6362d7-b2a7-45e6-bcb7-f95592172f5a",
            "tokenId": "0.0.10164866",
            "serialNumber": "15",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "Festival Access Token",
            "symbol": "FAT",
            "itemTitle": "FNB Regular",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"FNB Regular Pass #2\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-23T19:51:41.791Z",
            "updatedAt": "2026-09-23T19:51:41.791Z"
        },
        {
            "id": "840e379b-8006-49e6-9fb2-ab596475931a",
            "tokenId": "0.0.10164866",
            "serialNumber": "16",
            "ownerUserId": "usr_12345usr_12345usr_12345",
            "name": "Festival Access Token",
            "symbol": "FAT",
            "itemTitle": "FNB Regular",
            "isMutable": true,
            "image": "",
            "description": "issued to usr_12345usr_12345usr_12345",
            "rawMetadata": "{\"n\":\"FNB Regular Pass #3\",\"d\":\"issued to usr_12345usr_12345usr_12345\",\"i\":\"\"}",
            "createdAt": "2026-09-23T19:51:41.795Z",
            "updatedAt": "2026-09-23T19:51:41.795Z"
        }
    ],
    "jobId": "838f91fb-37ee-40b7-8e7f-91414a6a67f7"
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
