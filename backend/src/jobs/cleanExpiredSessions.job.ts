import cron from "node-cron";
import { prisma } from "../config/database";

export const cleanExpiredSessionsJob = () =>
  cron.schedule("0 * * * *", async () => {
    await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  });

