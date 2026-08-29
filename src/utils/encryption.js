import crypto from "crypto";

export function encryptPrivateKey(privateKeyStr, secretHashKey) {
        const iv = crypto.randomBytes(16);

        // Ensure the hash key is exactly 32 bytes
        const key = crypto
            .createHash("sha256")
            .update(secretHashKey)
            .digest();

        const cipher = crypto.createCipheriv(
            "aes-256-gcm",
            key,
            iv,
        );

        let encrypted = cipher.update(
            privateKeyStr,
            "utf8",
            "hex",
        );

        encrypted += cipher.final("hex");

        const authTag = cipher
            .getAuthTag()
            .toString("hex");

        return {
            encryptedKey: `${encrypted}:${authTag}`,
            iv: iv.toString("hex"),
        };
}

export function decryptPrivateKey(encryptedKeyWithTag, ivHex, secretHashKey,) 
{
        const [encryptedHex, authTagHex] =
            encryptedKeyWithTag.split(":");

        const key = crypto
            .createHash("sha256")
            .update(secretHashKey)
            .digest();

        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(
            authTagHex,
            "hex",
        );

        const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            key,
            iv,
        );

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(
            encryptedHex,
            "hex",
            "utf8",
        );

        decrypted += decipher.final("utf8");

        return decrypted; // Returns raw private key string
}