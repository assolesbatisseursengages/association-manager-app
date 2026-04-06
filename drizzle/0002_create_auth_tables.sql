-- Create users_local table for local authentication
CREATE TABLE IF NOT EXISTS `users_local` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL UNIQUE,
  `email` varchar(320) NOT NULL UNIQUE,
  `passwordHash` varchar(255) NOT NULL,
  `isEmailVerified` boolean DEFAULT false,
  `emailVerificationToken` varchar(255),
  `emailVerificationTokenExpiry` timestamp,
  `passwordResetToken` varchar(255),
  `passwordResetTokenExpiry` timestamp,
  `lastLoginAt` timestamp,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `users_local_id` PRIMARY KEY(`id`),
  CONSTRAINT `users_local_userId_unique` UNIQUE(`userId`),
  CONSTRAINT `users_local_email_unique` UNIQUE(`email`)
);

-- Create user_sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `sessionToken` varchar(255) NOT NULL UNIQUE,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
  CONSTRAINT `user_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
