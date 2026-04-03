-- Les Bâtisseurs Engagés - Database Schema Migration
-- This migration creates all necessary tables for the application

-- Drop existing tables if they exist (optional, comment out if you want to keep data)
-- SET FOREIGN_KEY_CHECKS=0;
-- DROP TABLE IF EXISTS activity_logs;
-- DROP TABLE IF EXISTS adhesion_pipeline;
-- DROP TABLE IF EXISTS adhesions;
-- DROP TABLE IF EXISTS announcements;
-- DROP TABLE IF EXISTS app_settings;
-- DROP TABLE IF EXISTS app_users;
-- DROP TABLE IF EXISTS association_info;
-- DROP TABLE IF EXISTS auditLogs;
-- DROP TABLE IF EXISTS campaigns;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS cotisations;
-- DROP TABLE IF EXISTS crm_activities;
-- DROP TABLE IF EXISTS crm_contacts;
-- DROP TABLE IF EXISTS crm_email_integration;
-- DROP TABLE IF EXISTS crm_reports;
-- DROP TABLE IF EXISTS depenses;
-- DROP TABLE IF EXISTS document_notes;
-- DROP TABLE IF EXISTS document_permissions;
-- DROP TABLE IF EXISTS documents;
-- DROP TABLE IF EXISTS dons;
-- DROP TABLE IF EXISTS email_history;
-- DROP TABLE IF EXISTS email_templates;
-- DROP TABLE IF EXISTS events;
-- DROP TABLE IF EXISTS global_settings;
-- DROP TABLE IF EXISTS members;
-- DROP TABLE IF EXISTS notification_preferences;
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS offline_sync_queue;
-- DROP TABLE IF EXISTS projects;
-- DROP TABLE IF EXISTS tasks;
-- DROP TABLE IF EXISTS user_roles;
-- DROP TABLE IF EXISTS users;
-- SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE IF NOT EXISTS `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `adhesion_pipeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`stage` enum('inquiry','application','review','approved','rejected','member') NOT NULL DEFAULT 'inquiry',
	`applicationDate` date,
	`approvalDate` date,
	`rejectionReason` text,
	`notes` text,
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adhesion_pipeline_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `adhesions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`annee` int NOT NULL,
	`montant` decimal(10,2) NOT NULL,
	`dateAdhesion` timestamp NOT NULL,
	`dateExpiration` timestamp NOT NULL,
	`status` enum('active','expired','pending') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adhesions_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`authorId` int NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `app_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`type` enum('string','number','boolean','json') NOT NULL DEFAULT 'string',
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_settings_key_unique` UNIQUE(`key`)
);

CREATE TABLE IF NOT EXISTS `app_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`password` text NOT NULL,
	`fullName` varchar(255),
	`role` enum('admin','membre') NOT NULL DEFAULT 'membre',
	`isActive` boolean NOT NULL DEFAULT true,
	`lastLogin` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_users_email_unique` UNIQUE(`email`)
);

CREATE TABLE IF NOT EXISTS `association_info` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`logo` text,
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`siret` varchar(20),
	`rib` varchar(50),
	`website` varchar(255),
	`foundedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `association_info_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userEmail` varchar(255),
	`action` varchar(50) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`entityName` varchar(255),
	`changes` text,
	`oldValue` text,
	`newValue` text,
	`description` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`objectif` decimal(10,2) NOT NULL,
	`montantCollecte` decimal(10,2) NOT NULL DEFAULT '0',
	`dateDebut` timestamp NOT NULL,
	`dateFin` timestamp NOT NULL,
	`status` enum('draft','active','completed','cancelled') NOT NULL DEFAULT 'draft',
	`image` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `categories` (
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

CREATE TABLE IF NOT EXISTS `cotisations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`montant` decimal(10,2) NOT NULL,
	`dateDebut` timestamp NOT NULL,
	`dateFin` timestamp NOT NULL,
	`statut` enum('payée','en attente','en retard') NOT NULL DEFAULT 'en attente',
	`datePayment` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cotisations_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `crm_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`type` enum('call','email','meeting','task','note','event') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`dueDate` timestamp,
	`completedDate` timestamp,
	`assignedTo` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_activities_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `crm_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`company` varchar(255),
	`position` varchar(100),
	`address` text,
	`city` varchar(100),
	`postalCode` varchar(20),
	`country` varchar(100),
	`birthDate` date,
	`joinDate` date,
	`segment` varchar(50) DEFAULT 'general',
	`status` enum('prospect','active','inactive','archived') NOT NULL DEFAULT 'prospect',
	`notes` text,
	`tags` varchar(500),
	`lastInteraction` timestamp,
	`engagementScore` int DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_contacts_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `crm_email_integration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`emailHistoryId` int,
	`subject` varchar(255) NOT NULL,
	`content` text,
	`direction` enum('sent','received') NOT NULL,
	`status` enum('sent','failed','bounced','opened','clicked') NOT NULL DEFAULT 'sent',
	`sentBy` int,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_email_integration_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `crm_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('engagement','pipeline','activity','segment','custom') NOT NULL,
	`description` text,
	`data` json,
	`filters` json,
	`generatedBy` int NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_reports_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `depenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(255) NOT NULL,
	`montant` decimal(10,2) NOT NULL,
	`categorie` varchar(100) NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`approuvePar` int,
	`notes` text,
	`pieceJointe` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `depenses_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `document_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `document_notes_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `document_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`memberId` int NOT NULL,
	`canView` boolean DEFAULT true,
	`canEdit` boolean DEFAULT false,
	`canDelete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_permissions_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`categoryId` int NOT NULL,
	`status` enum('pending','in-progress','completed') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
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

CREATE TABLE IF NOT EXISTS `dons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`donateur` varchar(255) NOT NULL,
	`montant` decimal(10,2) NOT NULL,
	`description` text,
	`email` varchar(320),
	`telephone` varchar(20),
	`date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dons_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `email_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`recipientCount` int NOT NULL,
	`sentBy` int NOT NULL,
	`status` enum('pending','sending','sent','failed') NOT NULL DEFAULT 'pending',
	`successCount` int DEFAULT 0,
	`failureCount` int DEFAULT 0,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_history_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`variables` varchar(500),
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dateDebut` timestamp NOT NULL,
	`dateFin` timestamp NOT NULL,
	`location` varchar(255),
	`capacity` int,
	`registeredCount` int DEFAULT 0,
	`status` enum('draft','published','cancelled','completed') NOT NULL DEFAULT 'draft',
	`image` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `global_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`associationName` varchar(255) NOT NULL,
	`seatCity` varchar(100),
	`folio` varchar(50),
	`email` varchar(320),
	`website` varchar(255),
	`phone` varchar(20),
	`logo` text,
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `global_settings_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`role` varchar(100),
	`function` varchar(100),
	`status` enum('active','inactive','suspended','pending') NOT NULL DEFAULT 'active',
	`joinedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` boolean DEFAULT true,
	`pushNotifications` boolean DEFAULT true,
	`smsNotifications` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','warning','error','success') NOT NULL DEFAULT 'info',
	`isRead` boolean DEFAULT false,
	`actionUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `offline_sync_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`data` json,
	`status` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`syncedAt` timestamp,
	CONSTRAINT `offline_sync_queue_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('planning','in-progress','on-hold','completed','cancelled') NOT NULL DEFAULT 'planning',
	`startDate` timestamp,
	`endDate` timestamp,
	`budget` decimal(10,2),
	`spent` decimal(10,2) DEFAULT '0',
	`progress` int DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('todo','in-progress','review','done','cancelled') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `user_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` varchar(50) NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
