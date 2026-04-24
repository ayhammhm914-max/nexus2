import cron from "node-cron";

export const stockAlertJob = () =>
  cron.schedule("*/30 * * * *", async () => {
    return Promise.resolve();
  });

