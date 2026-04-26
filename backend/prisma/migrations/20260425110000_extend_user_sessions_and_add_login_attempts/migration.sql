ALTER TABLE `UserSession`
  ADD COLUMN `deviceName` VARCHAR(191) NULL,
  ADD COLUMN `lastActivity` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `revokedAt` DATETIME(3) NULL;

CREATE INDEX `UserSession_userId_idx` ON `UserSession`(`userId`);
CREATE INDEX `UserSession_expiresAt_idx` ON `UserSession`(`expiresAt`);

CREATE TABLE `LoginAttempt` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `success` BOOLEAN NOT NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` VARCHAR(191) NULL,
  `userId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `LoginAttempt_email_idx` ON `LoginAttempt`(`email`);
CREATE INDEX `LoginAttempt_createdAt_idx` ON `LoginAttempt`(`createdAt`);

ALTER TABLE `LoginAttempt`
  ADD CONSTRAINT `LoginAttempt_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
