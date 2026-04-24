import cron from "node-cron";

export const saleEndNotificationJob = () =>
  cron.schedule("*/30 * * * *", async () => {
    return Promise.resolve();
  });

