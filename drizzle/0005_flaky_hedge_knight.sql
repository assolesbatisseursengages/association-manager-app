CREATE TABLE `member_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`location` varchar(255),
	`coordinatorId` int,
	`email` varchar(320),
	`phone` varchar(20),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `member_groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_groups_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `activity_logs` ADD `groupId` int;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD `groupId` int;--> statement-breakpoint
ALTER TABLE `crm_contacts` ADD `groupId` int;--> statement-breakpoint
ALTER TABLE `members` ADD `groupId` int;