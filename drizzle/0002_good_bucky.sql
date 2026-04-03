CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`userAgent` text,
	`ipAddress` varchar(45),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users_local` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`isEmailVerified` boolean DEFAULT false,
	`emailVerificationToken` varchar(255),
	`emailVerificationTokenExpiry` timestamp,
	`passwordResetToken` varchar(255),
	`passwordResetTokenExpiry` timestamp,
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_local_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_local_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `users_local_email_unique` UNIQUE(`email`)
);
