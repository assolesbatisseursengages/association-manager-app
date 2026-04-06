CREATE TABLE IF NOT EXISTS `budget_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetId` int NOT NULL,
	`lineNumber` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`category` varchar(100),
	CONSTRAINT `budget_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`year` int NOT NULL,
	`totalAmount` decimal(15,2) NOT NULL,
	`categoryId` int,
	`createdBy` int,
	`status` enum('draft','approved','active','closed') DEFAULT 'draft',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(100) NOT NULL,
	`invoiceDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) DEFAULT 0,
	`status` enum('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
	`description` text,
	`supplierId` int,
	`createdBy` int,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `project_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`category` varchar(100),
	`date` timestamp DEFAULT (now()),
	`createdBy` int,
	CONSTRAINT `project_expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `project_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`changedBy` int,
	`changedAt` timestamp DEFAULT (now()),
	`details` text,
	CONSTRAINT `project_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `project_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`role` varchar(100) DEFAULT 'member',
	`joinedAt` timestamp DEFAULT (now()),
	CONSTRAINT `project_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`budget` decimal(12,2),
	`status` enum('planning','active','on-hold','completed','cancelled') DEFAULT 'planning',
	`progress` int DEFAULT 0,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`createdBy` int,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('todo','in-progress','done','cancelled') DEFAULT 'todo',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`dueDate` timestamp,
	`assignedTo` int,
	`progress` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
