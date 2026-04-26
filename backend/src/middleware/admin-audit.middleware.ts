import { prisma } from "../config/database";
import { logger } from "../config/logger";

type AdminAuditChanges = Record<string, unknown> | null;

export const logAdminAction = async (
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId: string,
  changes: AdminAuditChanges,
  ipAddress?: string
) => {
  try {
    await prisma.adminAuditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        changes: changes as never,
        ipAddress
      }
    });

    logger.info(
      JSON.stringify({
        event: "ADMIN_AUDIT_LOGGED",
        userId,
        action,
        resource,
        resourceId,
        createdAt: new Date().toISOString()
      })
    );
  } catch (error) {
    logger.warn(
      JSON.stringify({
        event: "ADMIN_AUDIT_LOG_FAILED",
        userId,
        action,
        resource,
        resourceId,
        message: error instanceof Error ? error.message : "Unknown audit error"
      })
    );
  }
};
