CREATE TABLE `AdminAuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `resource` VARCHAR(191) NOT NULL,
  `resourceId` VARCHAR(191) NOT NULL,
  `changes` JSON NULL,
  `ipAddress` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `AdminAuditLog_userId_idx` ON `AdminAuditLog`(`userId`);
CREATE INDEX `AdminAuditLog_action_idx` ON `AdminAuditLog`(`action`);
CREATE INDEX `AdminAuditLog_createdAt_idx` ON `AdminAuditLog`(`createdAt`);

ALTER TABLE `AdminAuditLog`
  ADD CONSTRAINT `AdminAuditLog_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
