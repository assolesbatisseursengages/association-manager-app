CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`type` enum('call','email','meeting','note','task') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','completed','cancelled') DEFAULT 'pending',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `association_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`associationId` int NOT NULL DEFAULT 1,
	`name` varchar(255) NOT NULL,
	`description` text,
	`logoUrl` text,
	`logoKey` varchar(500),
	`primaryColor` varchar(7) DEFAULT '#0066cc',
	`secondaryColor` varchar(7) DEFAULT '#00aa00',
	`accentColor` varchar(7) DEFAULT '#ff9900',
	`email` varchar(320),
	`phone` varchar(20),
	`website` varchar(255),
	`address` text,
	`city` varchar(100),
	`postalCode` varchar(10),
	`country` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `association_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `association_settings_associationId_unique` UNIQUE(`associationId`)
);
--> statement-breakpoint
CREATE TABLE `budget_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` varchar(255),
	`amount` decimal(12,2) NOT NULL,
	`spent` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`year` int NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`status` enum('draft','approved','active','closed') DEFAULT 'draft',
	`description` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`color` varchar(7) DEFAULT '#1a4d2e',
	`icon` varchar(50) DEFAULT 'folder',
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`company` varchar(255),
	`position` varchar(100),
	`type` enum('prospect','client','partner','supplier') DEFAULT 'prospect',
	`status` enum('active','inactive','archived') DEFAULT 'active',
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `document_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`memberId` int NOT NULL,
	`canView` boolean DEFAULT true,
	`canEdit` boolean DEFAULT false,
	`canDelete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`categoryId` int NOT NULL,
	`status` enum('pending','in-progress','completed') DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`fileUrl` text,
	`fileKey` varchar(500),
	`fileName` varchar(255),
	`fileType` varchar(100),
	`fileSize` int,
	`createdBy` int,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`dueDate` timestamp,
	`isArchived` boolean DEFAULT false,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`category` varchar(100) NOT NULL,
	`status` enum('pending','approved','paid','rejected') DEFAULT 'pending',
	`expenseDate` timestamp DEFAULT (now()),
	`createdBy` int,
	`approvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`contactId` int,
	`amount` decimal(12,2) NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
	`invoiceDate` timestamp DEFAULT (now()),
	`dueDate` timestamp,
	`paidDate` timestamp,
	`description` text,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`role` varchar(100) DEFAULT 'Membre',
	`function` varchar(100),
	`status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`startDate` timestamp DEFAULT (now()),
	`endDate` timestamp,
	`status` enum('active','expired','cancelled') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` boolean DEFAULT true,
	`inAppNotifications` boolean DEFAULT true,
	`notificationFrequency` enum('immediate','daily','weekly','never') DEFAULT 'immediate',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`type` enum('info','success','warning','error') DEFAULT 'info',
	`isRead` boolean DEFAULT false,
	`actionUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offline_sync_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`payload` text,
	`status` enum('pending','synced','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`syncedAt` timestamp,
	CONSTRAINT `offline_sync_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('planning','active','on-hold','completed','cancelled') DEFAULT 'planning',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`budget` decimal(12,2),
	`startDate` timestamp,
	`endDate` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('todo','in-progress','review','completed') DEFAULT 'todo',
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`assignedTo` int,
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `users_local` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`firstName` varchar(100),
	`lastName` varchar(100),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `users_local_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_local_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `activities_contactId_idx` ON `activities` (`contactId`);--> statement-breakpoint
CREATE INDEX `activities_type_idx` ON `activities` (`type`);--> statement-breakpoint
CREATE INDEX `activityLogs_userId_idx` ON `activity_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `activityLogs_entityType_idx` ON `activity_logs` (`entityType`);--> statement-breakpoint
CREATE INDEX `budgetLines_budgetId_idx` ON `budget_lines` (`budgetId`);--> statement-breakpoint
CREATE INDEX `budgets_year_idx` ON `budgets` (`year`);--> statement-breakpoint
CREATE INDEX `contacts_email_idx` ON `contacts` (`email`);--> statement-breakpoint
CREATE INDEX `contacts_type_idx` ON `contacts` (`type`);--> statement-breakpoint
CREATE INDEX `documentNotes_documentId_idx` ON `document_notes` (`documentId`);--> statement-breakpoint
CREATE INDEX `documentPermissions_documentId_idx` ON `document_permissions` (`documentId`);--> statement-breakpoint
CREATE INDEX `documents_categoryId_idx` ON `documents` (`categoryId`);--> statement-breakpoint
CREATE INDEX `documents_status_idx` ON `documents` (`status`);--> statement-breakpoint
CREATE INDEX `documents_isArchived_idx` ON `documents` (`isArchived`);--> statement-breakpoint
CREATE INDEX `expenses_category_idx` ON `expenses` (`category`);--> statement-breakpoint
CREATE INDEX `expenses_status_idx` ON `expenses` (`status`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `invoices_invoiceDate_idx` ON `invoices` (`invoiceDate`);--> statement-breakpoint
CREATE INDEX `members_email_idx` ON `members` (`email`);--> statement-breakpoint
CREATE INDEX `members_status_idx` ON `members` (`status`);--> statement-breakpoint
CREATE INDEX `memberships_memberId_idx` ON `memberships` (`memberId`);--> statement-breakpoint
CREATE INDEX `memberships_status_idx` ON `memberships` (`status`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `offlineSyncQueue_userId_idx` ON `offline_sync_queue` (`userId`);--> statement-breakpoint
CREATE INDEX `offlineSyncQueue_status_idx` ON `offline_sync_queue` (`status`);--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `tasks_projectId_idx` ON `tasks` (`projectId`);--> statement-breakpoint
CREATE INDEX `tasks_status_idx` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `user_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `sessionToken_idx` ON `user_sessions` (`sessionToken`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users_local` (`email`);