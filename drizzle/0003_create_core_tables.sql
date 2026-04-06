-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `openId` varchar(255),
  `email` varchar(255),
  `loginMethod` varchar(50) DEFAULT 'oauth',
  `name` varchar(255),
  `role` varchar(50) DEFAULT 'member',
  `avatar` varchar(255),
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `users_id` PRIMARY KEY(`id`)
);

-- Create roles table
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(100) NOT NULL UNIQUE,
  `description` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(100) NOT NULL UNIQUE,
  `description` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS `email_templates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(100) NOT NULL UNIQUE,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `variables` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);

-- Create email_history table
CREATE TABLE IF NOT EXISTS `email_history` (
  `id` int AUTO_INCREMENT NOT NULL,
  `templateId` int,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255),
  `body` text,
  `status` varchar(50) DEFAULT 'pending',
  `sentAt` timestamp,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `email_history_id` PRIMARY KEY(`id`)
);

-- Create email_recipients table
CREATE TABLE IF NOT EXISTS `email_recipients` (
  `id` int AUTO_INCREMENT NOT NULL,
  `historyId` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `email_recipients_id` PRIMARY KEY(`id`)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `color` varchar(7),
  `icon` varchar(50),
  `sortOrder` int DEFAULT 0,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS `documents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `content` longtext,
  `categoryId` int,
  `authorId` int,
  `status` varchar(50) DEFAULT 'draft',
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);

-- Create document_notes table
CREATE TABLE IF NOT EXISTS `document_notes` (
  `id` int AUTO_INCREMENT NOT NULL,
  `documentId` int NOT NULL,
  `content` text NOT NULL,
  `authorId` int,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `document_notes_id` PRIMARY KEY(`id`)
);

-- Create document_permissions table
CREATE TABLE IF NOT EXISTS `document_permissions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `documentId` int NOT NULL,
  `userId` int NOT NULL,
  `permission` varchar(50) NOT NULL,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `document_permissions_id` PRIMARY KEY(`id`)
);

-- Create members table
CREATE TABLE IF NOT EXISTS `members` (
  `id` int AUTO_INCREMENT NOT NULL,
  `firstName` varchar(255),
  `lastName` varchar(255),
  `email` varchar(255),
  `phone` varchar(20),
  `joinDate` date,
  `status` varchar(50) DEFAULT 'active',
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `members_id` PRIMARY KEY(`id`)
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` int AUTO_INCREMENT NOT NULL,
  `key` varchar(255) NOT NULL UNIQUE,
  `value` longtext,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `app_settings_id` PRIMARY KEY(`id`)
);

-- Create crm_contacts table
CREATE TABLE IF NOT EXISTS `crm_contacts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255),
  `phone` varchar(20),
  `company` varchar(255),
  `status` varchar(50) DEFAULT 'lead',
  `createdBy` int,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `crm_contacts_id` PRIMARY KEY(`id`)
);

-- Create crm_activities table
CREATE TABLE IF NOT EXISTS `crm_activities` (
  `id` int AUTO_INCREMENT NOT NULL,
  `contactId` int NOT NULL,
  `type` varchar(50),
  `description` text,
  `date` timestamp,
  `createdBy` int,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `crm_activities_id` PRIMARY KEY(`id`)
);

-- Create adhesion_pipeline table
CREATE TABLE IF NOT EXISTS `adhesion_pipeline` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `adhesion_pipeline_id` PRIMARY KEY(`id`)
);

-- Create crm_reports table
CREATE TABLE IF NOT EXISTS `crm_reports` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `crm_reports_id` PRIMARY KEY(`id`)
);

-- Create crm_email_integration table
CREATE TABLE IF NOT EXISTS `crm_email_integration` (
  `id` int AUTO_INCREMENT NOT NULL,
  `email` varchar(255) NOT NULL,
  `provider` varchar(50),
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `crm_email_integration_id` PRIMARY KEY(`id`)
);

-- Create cotisations table
CREATE TABLE IF NOT EXISTS `cotisations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `memberId` int,
  `amount` decimal(10,2),
  `date` date,
  `status` varchar(50),
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `cotisations_id` PRIMARY KEY(`id`)
);

-- Create dons table
CREATE TABLE IF NOT EXISTS `dons` (
  `id` int AUTO_INCREMENT NOT NULL,
  `donorName` varchar(255),
  `amount` decimal(10,2),
  `date` date,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `dons_id` PRIMARY KEY(`id`)
);

-- Create depenses table
CREATE TABLE IF NOT EXISTS `depenses` (
  `id` int AUTO_INCREMENT NOT NULL,
  `description` varchar(255),
  `amount` decimal(10,2),
  `date` date,
  `category` varchar(100),
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `depenses_id` PRIMARY KEY(`id`)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `type` varchar(50),
  `amount` decimal(10,2),
  `date` date,
  `description` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);

-- Create global_settings table
CREATE TABLE IF NOT EXISTS `global_settings` (
  `id` int AUTO_INCREMENT NOT NULL,
  `associationName` varchar(255),
  `city` varchar(255),
  `folio` varchar(100),
  `website` varchar(255),
  `phone` varchar(20),
  `logo` varchar(255),
  `description` text,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `global_settings_id` PRIMARY KEY(`id`)
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `type` varchar(50),
  `enabled` boolean DEFAULT true,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);

-- Create adhesions table
CREATE TABLE IF NOT EXISTS `adhesions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `memberId` int,
  `year` int,
  `status` varchar(50),
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `adhesions_id` PRIMARY KEY(`id`)
);
