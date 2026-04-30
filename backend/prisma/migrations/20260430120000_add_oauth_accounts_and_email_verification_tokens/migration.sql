CREATE TABLE `OAuthAccount` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `providerUserId` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `displayName` VARCHAR(191) NULL,
  `avatarUrl` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `OAuthAccount_provider_providerUserId_key`(`provider`, `providerUserId`),
  INDEX `OAuthAccount_userId_idx`(`userId`),
  INDEX `OAuthAccount_provider_email_idx`(`provider`, `email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EmailVerificationToken` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `EmailVerificationToken_tokenHash_key`(`tokenHash`),
  INDEX `EmailVerificationToken_userId_idx`(`userId`),
  INDEX `EmailVerificationToken_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `OAuthAccount`
  ADD CONSTRAINT `OAuthAccount_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `EmailVerificationToken`
  ADD CONSTRAINT `EmailVerificationToken_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
