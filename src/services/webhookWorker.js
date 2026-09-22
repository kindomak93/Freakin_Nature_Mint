import prisma from "../prisma/client.js";

export const processWebhookQueue = async () => {
  // Fetch all pending jobs
  const pendingJobs = await prisma.webhookJob.findMany({
    take: 10, // Process in batches
    orderBy: { createdAt: "asc" },
  });

  if (pendingJobs.length === 0) return;

  for (const job of pendingJobs) {
    try {
      console.log(`[Worker] Executing Job ID: ${job.id} -> ${job.url}`);

      const response = await fetch(job.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: job.payload,
      });

      // Check if response status is 200 (or 2xx success)
      if (response.ok) {
        console.log(`[Worker Success] Webhook ${job.id} delivered (HTTP ${response.status}). Removing job...`);

        // SUCCESS: Remove the job from the table as requested
        await prisma.webhookJob.delete({
          where: { id: job.id },
        });
      } else {
        console.warn(`[Worker Failed] ${job.url} returned status ${response.status}. Retrying later.`);
        await prisma.webhookJob.update({
          where: { id: job.id },
          data: { attempts: job.attempts + 1 },
        });
      }
    } catch (error) {
      console.error(`[Worker Error] Could not connect to ${job.url}: ${error.message}`);
      await prisma.webhookJob.update({
        where: { id: job.id },
        data: { attempts: job.attempts + 1 },
      });
    }
  }
};

// Polling interval: Check for queued jobs every 5 seconds
export const startWebhookWorker = () => {
  console.log("🚀 Webhook background worker started...");
  setInterval(() => {
    processWebhookQueue();
  }, 5000);
};