CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `startDate` TIMESTAMP,
  `endDate` TIMESTAMP,
  `budget` DECIMAL(12, 2),
  `status` ENUM('planning', 'active', 'on-hold', 'completed', 'cancelled') DEFAULT 'planning',
  `progress` INT DEFAULT 0,
  `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `createdBy` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `project_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `userId` INT NOT NULL,
  `role` VARCHAR(100) DEFAULT 'member',
  `joinedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `project_user_unique` (`projectId`, `userId`)
);

CREATE TABLE IF NOT EXISTS `project_expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `category` VARCHAR(100),
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT,
  FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `project_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `changedBy` INT,
  `changedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `details` TEXT,
  FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projectId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` ENUM('todo', 'in-progress', 'done', 'cancelled') DEFAULT 'todo',
  `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `dueDate` TIMESTAMP,
  `assignedTo` INT,
  `progress` INT DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `year` INT NOT NULL,
  `totalAmount` DECIMAL(15, 2) NOT NULL,
  `categoryId` INT,
  `createdBy` INT,
  `status` ENUM('draft', 'approved', 'active', 'closed') DEFAULT 'draft',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `budget_lines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `budgetId` INT NOT NULL,
  `lineNumber` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `category` VARCHAR(100),
  FOREIGN KEY (`budgetId`) REFERENCES `budgets`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoiceNumber` VARCHAR(100) NOT NULL UNIQUE,
  `invoiceDate` TIMESTAMP NOT NULL,
  `dueDate` TIMESTAMP NOT NULL,
  `totalAmount` DECIMAL(12, 2) NOT NULL,
  `paidAmount` DECIMAL(12, 2) DEFAULT 0,
  `status` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
  `description` TEXT,
  `supplierId` INT,
  `createdBy` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
