CREATE TABLE `association_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`associationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`logoUrl` text,
	`logoFileName` varchar(255),
	`primaryColor` varchar(7) DEFAULT '#1a4d2e',
	`secondaryColor` varchar(7) DEFAULT '#f0f0f0',
	`accentColor` varchar(7) DEFAULT '#d97706',
	`contactEmail` varchar(320),
	`contactPhone` varchar(20),
	`website` varchar(500),
	`address` text,
	`city` varchar(100),
	`country` varchar(100),
	`description` text,
	`theme` enum('light','dark') NOT NULL DEFAULT 'light',
	`language` varchar(10) NOT NULL DEFAULT 'fr',
	`timezone` varchar(50) NOT NULL DEFAULT 'Africa/Ndjamena',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `association_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `association_settings_associationId_unique` UNIQUE(`associationId`)
);
--> statement-breakpoint
CREATE TABLE `offline_sync_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tableName` varchar(100) NOT NULL,
	`action` enum('create','update','delete') NOT NULL,
	`recordId` int,
	`data` json,
	`status` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`syncedAt` timestamp,
	`retryCount` int DEFAULT 0,
	CONSTRAINT `offline_sync_queue_id` PRIMARY KEY(`id`)
);
