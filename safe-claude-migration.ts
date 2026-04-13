import mysql from "mysql2/promise";

async function executeSafeClaudeMigration() {
  const connectionString = "mysql://2KDAnvQY5XeF1D3.root:qCJLu5DsDW2iMahc@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/association_manager?ssl=true";
  
  let connection;
  try {
    // Parser l'URL pour la connexion SSL
    const url = new URL(connectionString);
    const sslConfig = url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : undefined;
    
    connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      ssl: sslConfig
    });
    console.log("Connexion à la base de données réussie");

    // ÉTAPE 1 : Correction urgente - Colonne `name` dans `projects`
    console.log("\n=== ÉTAPE 1 : Vérification de la colonne `name` dans `projects` ===");
    
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'association_manager' AND TABLE_NAME = 'projects' AND COLUMN_NAME = 'name'`
    ) as any;

    if (columns.length === 0) {
      console.log("Ajout de la colonne `name` dans `projects`...");
      await connection.execute(
        `ALTER TABLE projects ADD COLUMN \`name\` VARCHAR(255) NOT NULL DEFAULT '' AFTER \`id\``
      );
      console.log("Colonne `name` ajoutée avec succès");
    } else {
      console.log("Colonne `name` déjà présente dans `projects`");
    }

    // ÉTAPE 2 : Vérification des tables existantes
    console.log("\n=== ÉTAPE 2 : Vérification des tables existantes ===");
    
    const [existingTables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'association_manager'`
    ) as any;
    
    const tableNames = existingTables.map((row: any) => row.TABLE_NAME);
    console.log("Tables existantes :", tableNames);

    // ÉTAPE 3 : Création des nouvelles tables (sans DROP)
    console.log("\n=== ÉTAPE 3 : Création des nouvelles tables Claude.ai ===");

    // Tables de comptabilité
    const accountingTables = [
      `CREATE TABLE IF NOT EXISTS budgets (
        id int AUTO_INCREMENT PRIMARY KEY,
        name varchar(255) NOT NULL,
        description text,
        categoryId int,
        year int NOT NULL,
        totalAmount decimal(12,2) NOT NULL,
        status ENUM('draft','approved','active','closed') DEFAULT 'draft',
        approvedBy int,
        approvedAt timestamp NULL,
        createdBy int NOT NULL,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY unique_budget (categoryId, year)
      )`,
      
      `CREATE TABLE IF NOT EXISTS budget_lines (
        id int AUTO_INCREMENT PRIMARY KEY,
        budgetId int NOT NULL,
        lineNumber int NOT NULL,
        description varchar(255) NOT NULL,
        plannedAmount decimal(12,2) NOT NULL,
        actualAmount decimal(12,2) DEFAULT 0,
        variance decimal(12,2) DEFAULT 0,
        notes text,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        KEY idx_budgetId (budgetId)
      )`,

      `CREATE TABLE IF NOT EXISTS accounting_accounts (
        id int AUTO_INCREMENT PRIMARY KEY,
        accountNumber varchar(20) NOT NULL,
        accountName varchar(255) NOT NULL,
        accountType ENUM('asset','liability','equity','revenue','expense') NOT NULL,
        parentAccountId int,
        description text,
        isActive boolean DEFAULT TRUE,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY uq_accountNumber (accountNumber)
      )`,

      `CREATE TABLE IF NOT EXISTS accounting_journals (
        id int AUTO_INCREMENT PRIMARY KEY,
        journalCode varchar(10) NOT NULL,
        journalName varchar(255) NOT NULL,
        journalType ENUM('general','sales','purchases','bank','cash') NOT NULL,
        description text,
        isActive boolean DEFAULT TRUE,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY uq_journalCode (journalCode)
      )`,

      `CREATE TABLE IF NOT EXISTS accounting_entries (
        id int AUTO_INCREMENT PRIMARY KEY,
        journalId int NOT NULL,
        entryDate date NOT NULL,
        entryNumber varchar(50) NOT NULL,
        description text,
        totalDebit decimal(12,2) DEFAULT 0,
        totalCredit decimal(12,2) DEFAULT 0,
        status ENUM('draft','posted','reversed') DEFAULT 'draft',
        postedBy int,
        postedAt timestamp NULL,
        createdBy int NOT NULL,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY uq_entryNumber (entryNumber),
        KEY idx_entry_date (entryDate),
        KEY idx_ae_status (status)
      )`,

      `CREATE TABLE IF NOT EXISTS accounting_entry_lines (
        id int AUTO_INCREMENT PRIMARY KEY,
        entryId int NOT NULL,
        lineNumber int NOT NULL,
        accountId int NOT NULL,
        description varchar(255),
        debitAmount decimal(12,2) DEFAULT 0,
        creditAmount decimal(12,2) DEFAULT 0,
        createdAt timestamp DEFAULT (now()),
        KEY idx_entryId (entryId),
        KEY idx_accountId (accountId)
      )`,

      `CREATE TABLE IF NOT EXISTS suppliers (
        id int AUTO_INCREMENT PRIMARY KEY,
        name varchar(255) NOT NULL,
        email varchar(320),
        phone varchar(20),
        address text,
        city varchar(100),
        postalCode varchar(20),
        country varchar(100),
        taxId varchar(50),
        bankAccount varchar(100),
        paymentTerms varchar(100),
        isActive boolean DEFAULT TRUE,
        notes text,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now())
      )`,

      `CREATE TABLE IF NOT EXISTS invoices (
        id int AUTO_INCREMENT PRIMARY KEY,
        invoiceNumber varchar(50) NOT NULL,
        invoiceDate date NOT NULL,
        dueDate date NOT NULL,
        supplierId int,
        description text,
        totalAmount decimal(12,2) NOT NULL,
        taxAmount decimal(12,2) DEFAULT 0,
        paidAmount decimal(12,2) DEFAULT 0,
        status ENUM('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
        paymentMethod varchar(100),
        paymentDate date,
        notes text,
        fileUrl text,
        createdBy int NOT NULL,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY uq_invoiceNumber (invoiceNumber),
        KEY idx_invoiceDate (invoiceDate),
        KEY idx_inv_status (status)
      )`,

      `CREATE TABLE IF NOT EXISTS invoice_lines (
        id int AUTO_INCREMENT PRIMARY KEY,
        invoiceId int NOT NULL,
        lineNumber int NOT NULL,
        description varchar(255) NOT NULL,
        quantity decimal(10,2) NOT NULL,
        unitPrice decimal(12,2) NOT NULL,
        taxRate decimal(5,2) DEFAULT 0,
        totalAmount decimal(12,2) NOT NULL,
        createdAt timestamp DEFAULT (now()),
        KEY idx_invoiceId (invoiceId)
      )`
    ];

    // Tables d'adhésions
    const membershipTables = [
      `CREATE TABLE IF NOT EXISTS membership_types (
        id int AUTO_INCREMENT PRIMARY KEY,
        name varchar(100) NOT NULL,
        description text,
        monthlyAmount decimal(10,2) NOT NULL,
        yearlyAmount decimal(10,2) NOT NULL,
        benefits text,
        maxMembers int,
        isActive boolean DEFAULT TRUE,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY uq_mt_name (name)
      )`,

      `CREATE TABLE IF NOT EXISTS memberships (
        id int AUTO_INCREMENT PRIMARY KEY,
        memberId int NOT NULL,
        membershipTypeId int NOT NULL,
        startDate date NOT NULL,
        endDate date NOT NULL,
        amount decimal(10,2) NOT NULL,
        paymentStatus ENUM('pending','paid','overdue','cancelled') DEFAULT 'pending',
        paymentDate date,
        renewalDate date,
        notes text,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        KEY idx_ms_payment_status (paymentStatus),
        KEY idx_ms_end_date (endDate),
        KEY idx_ms_memberId (memberId)
      )`,

      `CREATE TABLE IF NOT EXISTS contributions (
        id int AUTO_INCREMENT PRIMARY KEY,
        memberId int NOT NULL,
        amount decimal(10,2) NOT NULL,
        contributionDate date NOT NULL,
        paymentMethod varchar(100),
        reference varchar(100),
        description text,
        status ENUM('pending','completed','failed') DEFAULT 'pending',
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        KEY idx_contrib_date (contributionDate),
        KEY idx_contrib_status (status),
        KEY idx_contrib_memberId (memberId)
      )`
    ];

    // Tables de bénévoles
    const volunteerTables = [
      `CREATE TABLE IF NOT EXISTS volunteers (
        id int AUTO_INCREMENT PRIMARY KEY,
        memberId int NOT NULL,
        skills text,
        certifications text,
        availability varchar(255),
        maxHoursPerWeek int,
        preferredAreas text,
        backgroundCheckDate date,
        backgroundCheckStatus ENUM('pending','approved','rejected') DEFAULT 'pending',
        emergencyContact varchar(255),
        emergencyPhone varchar(20),
        isActive boolean DEFAULT TRUE,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        KEY idx_vol_memberId (memberId)
      )`,

      `CREATE TABLE IF NOT EXISTS volunteer_missions (
        id int AUTO_INCREMENT PRIMARY KEY,
        title varchar(255) NOT NULL,
        description text,
        requiredSkills text,
        startDate date NOT NULL,
        endDate date,
        estimatedHours int,
        location varchar(255),
        status ENUM('open','in-progress','completed','cancelled') DEFAULT 'open',
        createdBy int NOT NULL,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        KEY idx_vm_status (status)
      )`,

      `CREATE TABLE IF NOT EXISTS volunteer_assignments (
        id int AUTO_INCREMENT PRIMARY KEY,
        volunteerId int NOT NULL,
        missionId int NOT NULL,
        assignedDate date NOT NULL,
        hoursWorked decimal(10,2) DEFAULT 0,
        status ENUM('assigned','in-progress','completed','cancelled') DEFAULT 'assigned',
        feedback text,
        rating int,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        KEY idx_va_status (status),
        KEY idx_va_volunteerId (volunteerId),
        KEY idx_va_missionId (missionId)
      )`,

      `CREATE TABLE IF NOT EXISTS employees (
        id int AUTO_INCREMENT PRIMARY KEY,
        memberId int NOT NULL,
        employeeNumber varchar(50) NOT NULL,
        position varchar(255),
        department varchar(255),
        salary decimal(12,2),
        contractType ENUM('cdi','cdd','stage','alternance') DEFAULT 'cdi',
        startDate date NOT NULL,
        endDate date,
        manager int,
        isActive boolean DEFAULT TRUE,
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY uq_employeeNumber (employeeNumber),
        KEY idx_emp_memberId (memberId)
      )`
    ];

    // Tables de rapports
    const reportTables = [
      `CREATE TABLE IF NOT EXISTS reports (
        id int AUTO_INCREMENT PRIMARY KEY,
        name varchar(255) NOT NULL,
        reportType ENUM('financial','membership','activity','volunteer','project') NOT NULL,
        description text,
        generatedBy int NOT NULL,
        generatedAt timestamp DEFAULT (now()),
        startDate date,
        endDate date,
        fileUrl text,
        fileKey varchar(500),
        status ENUM('generating','ready','failed') DEFAULT 'generating',
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        KEY idx_reportType (reportType),
        KEY idx_generatedAt (generatedAt)
      )`,

      `CREATE TABLE IF NOT EXISTS statistics_cache (
        id int AUTO_INCREMENT PRIMARY KEY,
        statisticType varchar(100) NOT NULL,
        period varchar(50),
        value decimal(15,2),
        metadata json,
        cachedAt timestamp DEFAULT (now()),
        expiresAt timestamp NULL,
        UNIQUE KEY uq_statistic (statisticType, period)
      )`,

      `CREATE TABLE IF NOT EXISTS audit_logs (
        id int AUTO_INCREMENT PRIMARY KEY,
        userId int,
        action varchar(100) NOT NULL,
        entityType varchar(100),
        entityId int,
        oldValue json,
        newValue json,
        ipAddress varchar(45),
        userAgent text,
        createdAt timestamp DEFAULT (now()),
        KEY idx_al_entity (entityType, entityId),
        KEY idx_al_user (userId),
        KEY idx_al_createdAt (createdAt)
      )`,

      `CREATE TABLE IF NOT EXISTS gdpr_consents (
        id int AUTO_INCREMENT PRIMARY KEY,
        userId int NOT NULL,
        consentType varchar(100) NOT NULL,
        consentGiven boolean DEFAULT FALSE,
        consentDate timestamp NULL,
        expiryDate timestamp NULL,
        ipAddress varchar(45),
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY uq_consent (userId, consentType)
      )`,

      `CREATE TABLE IF NOT EXISTS notification_preferences (
        id int AUTO_INCREMENT PRIMARY KEY,
        userId int NOT NULL,
        emailNotifications boolean DEFAULT TRUE,
        smsNotifications boolean DEFAULT FALSE,
        inAppNotifications boolean DEFAULT TRUE,
        notificationFrequency ENUM('immediate','daily','weekly','never') DEFAULT 'immediate',
        createdAt timestamp DEFAULT (now()),
        updatedAt timestamp DEFAULT (now()),
        UNIQUE KEY uq_np_userId (userId)
      )`
    ];

    // Exécuter toutes les tables
    const allTables = [...accountingTables, ...membershipTables, ...volunteerTables, ...reportTables];
    
    for (const sql of allTables) {
      try {
        await connection.execute(sql);
        console.log("Table créée avec succès");
      } catch (error: any) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log("Table existe déjà - ignorée");
        } else {
          console.error("Erreur création table:", error.message);
        }
      }
    }

    // ÉTAPE 4 : Vérification finale
    console.log("\n=== ÉTAPE 4 : Vérification finale ===");
    
    const [finalTables] = await connection.execute(
      `SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = 'association_manager' 
       ORDER BY CREATE_TIME DESC 
       LIMIT 50`
    ) as any;

    console.log("Tables dans la base de données après migration:");
    finalTables.forEach((table: any) => {
      console.log(`- ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} lignes)`);
    });

    console.log("\n=== MIGRATION TERMINÉE AVEC SUCCÈS ===");

  } catch (error) {
    console.error("Erreur lors de la migration:", error);
  } finally {
    if (connection) await connection.end();
  }
}

executeSafeClaudeMigration().catch(console.error);
