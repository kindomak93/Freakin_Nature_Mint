-- CreateTable
CREATE TABLE "WebhookJob" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookJob_pkey" PRIMARY KEY ("id")
);
