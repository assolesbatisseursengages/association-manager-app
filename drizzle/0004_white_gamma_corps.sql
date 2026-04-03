CREATE TABLE `dashboard_widgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`widgetType` varchar(50) NOT NULL,
	`title` varchar(100) NOT NULL,
	`description` text,
	`position` int NOT NULL,
	`size` enum('small','medium','large') NOT NULL DEFAULT 'medium',
	`config` json,
	`isVisible` boolean DEFAULT true,
	`refreshInterval` int DEFAULT 300,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_widgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `widget_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`defaultConfig` json,
	`defaultSize` enum('small','medium','large') DEFAULT 'medium',
	`category` varchar(50),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `widget_templates_id` PRIMARY KEY(`id`)
);
