CREATE TABLE `PasswordResetToken` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `PasswordResetToken_tokenHash_key` ON `PasswordResetToken`(`tokenHash`);
CREATE INDEX `PasswordResetToken_userId_idx` ON `PasswordResetToken`(`userId`);
CREATE INDEX `PasswordResetToken_expiresAt_idx` ON `PasswordResetToken`(`expiresAt`);

ALTER TABLE `PasswordResetToken`
  ADD CONSTRAINT `PasswordResetToken_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
