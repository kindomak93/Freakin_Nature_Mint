-- CreateTable
CREATE TABLE "CustodialWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustodialWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "userId" TEXT,
    "statusCode" INTEGER,
    "ipAddress" TEXT,
    "request" TEXT NOT NULL,
    "response" TEXT,
    "error" TEXT,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustodialWallet_userId_key" ON "CustodialWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustodialWallet_email_key" ON "CustodialWallet"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CustodialWallet_accountNumber_key" ON "CustodialWallet"("accountNumber");
