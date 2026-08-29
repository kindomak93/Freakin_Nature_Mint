async function syncHederaNfts() {
  if (!ACCOUNT_ID) {
    console.error("Missing HEDERA_ACCOUNT_ID in .env file.");
    return;
  }

  try {
    console.log(`Syncing NFTs for treasury account ${ACCOUNT_ID}...`);
    const mirrorUrl = `https://testnet.mirrornode.hedera.com/api/v1/tokens?account.id=${ACCOUNT_ID}`;
    const response = await axios.get(mirrorUrl);
    const tokens = response.data.tokens || [];

    for (const token of tokens) {
      if (token.type !== "NON_FUNGIBLE_UNIQUE") continue;

      // Fetch serial details from Hedera Mirror Node
      const nftsUrl = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${token.token_id}/nfts`;
      const nftsResponse = await axios.get(nftsUrl);
      const nfts = nftsResponse.data.nfts || [];

      for (const nft of nfts) {
        let metadataObj = {};
        let decodedMetadata = "";

        if (nft.metadata) {
          try {
            decodedMetadata = Buffer.from(nft.metadata, "base64").toString("utf-8");
            metadataObj = JSON.parse(decodedMetadata);
          } catch (err) {
            decodedMetadata = Buffer.from(nft.metadata, "base64").toString("utf-8");
          }
        }

        // Map compact keys (n, d, i) or standard keys (name, description, image)
        const name = metadataObj.n || metadataObj.name || token.name;
        const description = metadataObj.d || metadataObj.description || "";
        const image = metadataObj.i || metadataObj.image || "";
        const isMutable = Boolean(token.admin_key);

        await prisma.nft.upsert({
          where: {
            tokenId_serialNumber: {
              tokenId: token.token_id,
              serialNumber: String(nft.serial_number),
            },
          },
          update: {
            name,
            symbol: token.symbol,
            isMutable,
            image,
            description,
            rawMetadata: decodedMetadata,
          },
          create: {
            tokenId: token.token_id,
            serialNumber: String(nft.serial_number),
            name,
            symbol: token.symbol,
            isMutable,
            image,
            description,
            rawMetadata: decodedMetadata,
          },
        });
      }
    }
    console.log("Hedera NFT sync completed successfully.");
  } catch (error) {
    console.error("Error syncing Hedera NFTs:", error.message);
  }
}

async function getAndLogNfts() {
  console.log(`[${new Date().toLocaleTimeString()}] Executing GET /api/nfts logic...`);
  try {
    const nfts = await prisma.nft.findMany();
    console.log(`[GET /api/nfts] Successfully loaded ${nfts.length} NFTs from database:\n`);
    
    nfts.forEach((nft, index) => {
      console.log(`--- NFT #${index + 1} ---`);
      console.log(`Name:        ${nft.name}`);
      console.log(`Token ID:    ${nft.tokenId}`);
      console.log(`Serial #:    ${nft.serialNumber}`);
      console.log(`Symbol:      ${nft.symbol}`);
      console.log(`Mutable:     ${nft.isMutable}`);
      console.log(`Image:       ${nft.image || "N/A"}`);
      console.log(`Description: ${nft.description || "N/A"}\n`);
    });

    return nfts;
  } catch (error) {
    console.error("[GET /api/nfts] Database error:", error.message);
    throw error;
  }
}