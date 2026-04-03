-- ============================================================================
-- GESTION FINANCIÈRE AVANCÉE
-- ============================================================================

-- Budgets et Prévisions
CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  categoryId INT,
  year INT NOT NULL,
  totalAmount DECIMAL(12, 2) NOT NULL,
  status ENUM('draft', 'approved', 'active', 'closed') DEFAULT 'draft',
  approvedBy INT,
  approvedAt TIMESTAMP NULL,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_budget (categoryId, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lignes budgétaires détaillées
CREATE TABLE IF NOT EXISTS budget_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budgetId INT NOT NULL,
  lineNumber INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  plannedAmount DECIMAL(12, 2) NOT NULL,
  actualAmount DECIMAL(12, 2) DEFAULT 0,
  variance DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (budgetId) REFERENCES budgets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comptes comptables
CREATE TABLE IF NOT EXISTS accounting_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accountNumber VARCHAR(20) NOT NULL UNIQUE,
  accountName VARCHAR(255) NOT NULL,
  accountType ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
  parentAccountId INT,
  description TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parentAccountId) REFERENCES accounting_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Journaux comptables
CREATE TABLE IF NOT EXISTS accounting_journals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  journalCode VARCHAR(10) NOT NULL UNIQUE,
  journalName VARCHAR(255) NOT NULL,
  journalType ENUM('general', 'sales', 'purchases', 'bank', 'cash') NOT NULL,
  description TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Écritures comptables
CREATE TABLE IF NOT EXISTS accounting_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  journalId INT NOT NULL,
  entryDate DATE NOT NULL,
  entryNumber VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  totalDebit DECIMAL(12, 2) DEFAULT 0,
  totalCredit DECIMAL(12, 2) DEFAULT 0,
  status ENUM('draft', 'posted', 'reversed') DEFAULT 'draft',
  postedBy INT,
  postedAt TIMESTAMP NULL,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (journalId) REFERENCES accounting_journals(id),
  INDEX idx_entry_date (entryDate),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lignes d'écritures comptables
CREATE TABLE IF NOT EXISTS accounting_entry_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entryId INT NOT NULL,
  lineNumber INT NOT NULL,
  accountId INT NOT NULL,
  description VARCHAR(255),
  debitAmount DECIMAL(12, 2) DEFAULT 0,
  creditAmount DECIMAL(12, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entryId) REFERENCES accounting_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (accountId) REFERENCES accounting_accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Factures
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
  invoiceDate DATE NOT NULL,
  dueDate DATE NOT NULL,
  supplierId INT,
  description TEXT,
  totalAmount DECIMAL(12, 2) NOT NULL,
  taxAmount DECIMAL(12, 2) DEFAULT 0,
  paidAmount DECIMAL(12, 2) DEFAULT 0,
  status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
  paymentMethod VARCHAR(100),
  paymentDate DATE,
  notes TEXT,
  fileUrl TEXT,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_invoice_date (invoiceDate),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lignes de factures
CREATE TABLE IF NOT EXISTS invoice_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT NOT NULL,
  lineNumber INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unitPrice DECIMAL(12, 2) NOT NULL,
  taxRate DECIMAL(5, 2) DEFAULT 0,
  totalAmount DECIMAL(12, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  postalCode VARCHAR(20),
  country VARCHAR(100),
  taxId VARCHAR(50),
  bankAccount VARCHAR(100),
  paymentTerms VARCHAR(100),
  isActive BOOLEAN DEFAULT TRUE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- GESTION DES ADHÉSIONS ET COTISATIONS
-- ============================================================================

-- Types d'adhésions
CREATE TABLE IF NOT EXISTS membership_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  monthlyAmount DECIMAL(10, 2) NOT NULL,
  yearlyAmount DECIMAL(10, 2) NOT NULL,
  benefits TEXT,
  maxMembers INT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adhésions
CREATE TABLE IF NOT EXISTS memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  memberId INT NOT NULL,
  membershipTypeId INT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentStatus ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  paymentDate DATE,
  renewalDate DATE,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (membershipTypeId) REFERENCES membership_types(id),
  INDEX idx_payment_status (paymentStatus),
  INDEX idx_end_date (endDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cotisations
CREATE TABLE IF NOT EXISTS contributions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  memberId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  contributionDate DATE NOT NULL,
  paymentMethod VARCHAR(100),
  reference VARCHAR(100),
  description TEXT,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_contribution_date (contributionDate),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- GESTION DES RESSOURCES HUMAINES ET BÉNÉVOLES
-- ============================================================================

-- Bénévoles
CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  memberId INT NOT NULL,
  skills TEXT,
  certifications TEXT,
  availability VARCHAR(255),
  maxHoursPerWeek INT,
  preferredAreas TEXT,
  backgroundCheckDate DATE,
  backgroundCheckStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  emergencyContact VARCHAR(255),
  emergencyPhone VARCHAR(20),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Missions bénévoles
CREATE TABLE IF NOT EXISTS volunteer_missions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requiredSkills TEXT,
  startDate DATE NOT NULL,
  endDate DATE,
  estimatedHours INT,
  location VARCHAR(255),
  status ENUM('open', 'in-progress', 'completed', 'cancelled') DEFAULT 'open',
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignations bénévoles
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteerId INT NOT NULL,
  missionId INT NOT NULL,
  assignedDate DATE NOT NULL,
  hoursWorked DECIMAL(10, 2) DEFAULT 0,
  status ENUM('assigned', 'in-progress', 'completed', 'cancelled') DEFAULT 'assigned',
  feedback TEXT,
  rating INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (volunteerId) REFERENCES volunteers(id) ON DELETE CASCADE,
  FOREIGN KEY (missionId) REFERENCES volunteer_missions(id) ON DELETE CASCADE,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employés
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  memberId INT NOT NULL,
  employeeNumber VARCHAR(50) NOT NULL UNIQUE,
  position VARCHAR(255),
  department VARCHAR(255),
  salary DECIMAL(12, 2),
  contractType ENUM('cdi', 'cdd', 'stage', 'alternance') DEFAULT 'cdi',
  startDate DATE NOT NULL,
  endDate DATE,
  manager INT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- GESTION DES PROJETS ET TÂCHES
-- ============================================================================

-- Projets
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  startDate DATE NOT NULL,
  endDate DATE,
  budget DECIMAL(12, 2),
  status ENUM('planning', 'active', 'on-hold', 'completed', 'cancelled') DEFAULT 'planning',
  leaderId INT,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  progress INT DEFAULT 0,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tâches
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignedTo INT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('todo', 'in-progress', 'review', 'done', 'blocked') DEFAULT 'todo',
  startDate DATE,
  dueDate DATE,
  completedDate DATE,
  estimatedHours INT,
  actualHours INT,
  progress INT DEFAULT 0,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_assigned_to (assignedTo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dépendances entre tâches
CREATE TABLE IF NOT EXISTS task_dependencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  taskId INT NOT NULL,
  dependsOnTaskId INT NOT NULL,
  dependencyType ENUM('blocks', 'blocked_by', 'relates_to') DEFAULT 'blocks',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (dependsOnTaskId) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_dependency (taskId, dependsOnTaskId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SYSTÈME DE NOTIFICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  relatedEntityType VARCHAR(100),
  relatedEntityId INT,
  isRead BOOLEAN DEFAULT FALSE,
  readAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (userId, isRead),
  INDEX idx_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Préférences de notifications
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  emailNotifications BOOLEAN DEFAULT TRUE,
  smsNotifications BOOLEAN DEFAULT FALSE,
  inAppNotifications BOOLEAN DEFAULT TRUE,
  notificationFrequency ENUM('immediate', 'daily', 'weekly', 'never') DEFAULT 'immediate',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RAPPORTS ET STATISTIQUES
-- ============================================================================

-- Rapports générés
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  reportType ENUM('financial', 'membership', 'activity', 'volunteer', 'project') NOT NULL,
  description TEXT,
  generatedBy INT NOT NULL,
  generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  startDate DATE,
  endDate DATE,
  fileUrl TEXT,
  fileKey VARCHAR(500),
  status ENUM('generating', 'ready', 'failed') DEFAULT 'generating',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_report_type (reportType),
  INDEX idx_generated_at (generatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Statistiques en cache
CREATE TABLE IF NOT EXISTS statistics_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  statisticType VARCHAR(100) NOT NULL,
  period VARCHAR(50),
  value DECIMAL(15, 2),
  metadata JSON,
  cachedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP,
  UNIQUE KEY unique_statistic (statisticType, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUDIT ET CONFORMITÉ
-- ============================================================================

-- Logs d'audit détaillés
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  action VARCHAR(100) NOT NULL,
  entityType VARCHAR(100),
  entityId INT,
  oldValue JSON,
  newValue JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entityType, entityId),
  INDEX idx_user (userId),
  INDEX idx_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Consentements RGPD
CREATE TABLE IF NOT EXISTS gdpr_consents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  consentType VARCHAR(100) NOT NULL,
  consentGiven BOOLEAN DEFAULT FALSE,
  consentDate TIMESTAMP NULL,
  expiryDate TIMESTAMP NULL,
  ipAddress VARCHAR(45),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_consent (userId, consentType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
