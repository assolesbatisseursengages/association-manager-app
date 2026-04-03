-- =====================================================
-- DONNÉES DE TEST POUR LES BÂTISSEURS ENGAGÉS
-- =====================================================

-- 1. MEMBRES ET UTILISATEURS
INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) VALUES
('user-001', 'Alice Dupont', 'alice@batisseurs.fr', 'github', 'admin', NOW(), NOW(), NOW()),
('user-002', 'Bob Martin', 'bob@batisseurs.fr', 'github', 'user', NOW(), NOW(), NOW()),
('user-003', 'Carol Lefevre', 'carol@batisseurs.fr', 'github', 'user', NOW(), NOW(), NOW()),
('user-004', 'David Moreau', 'david@batisseurs.fr', 'github', 'user', NOW(), NOW(), NOW()),
('user-005', 'Emma Bernard', 'emma@batisseurs.fr', 'github', 'user', NOW(), NOW(), NOW());

-- 2. MEMBRES (ANNUAIRE)
INSERT INTO members (firstName, lastName, email, phone, address, city, zipCode, country, joinDate, status, role) VALUES
('Alice', 'Dupont', 'alice@batisseurs.fr', '0612345678', '123 Rue de Paris', 'Paris', '75001', 'France', '2023-01-15', 'active', 'founder'),
('Bob', 'Martin', 'bob@batisseurs.fr', '0687654321', '456 Avenue Lyon', 'Lyon', '69001', 'France', '2023-03-20', 'active', 'member'),
('Carol', 'Lefevre', 'carol@batisseurs.fr', '0698765432', '789 Boulevard Marseille', 'Marseille', '13001', 'France', '2023-06-10', 'active', 'member'),
('David', 'Moreau', 'david@batisseurs.fr', '0654321098', '321 Rue Toulouse', 'Toulouse', '31000', 'France', '2023-09-05', 'active', 'volunteer'),
('Emma', 'Bernard', 'emma@batisseurs.fr', '0645678901', '654 Avenue Nice', 'Nice', '06000', 'France', '2024-01-12', 'active', 'member');

-- 3. DOCUMENTS
INSERT INTO documents (title, description, fileUrl, fileSize, uploadedBy, uploadDate, category, status) VALUES
('Statuts de l''association', 'Statuts officiels des Bâtisseurs Engagés', 'https://example.com/statuts.pdf', 245000, 1, NOW(), 'legal', 'published'),
('Rapport annuel 2023', 'Rapport d''activité et financier 2023', 'https://example.com/rapport-2023.pdf', 1200000, 1, NOW(), 'reports', 'published'),
('Procès-verbal AG 2024', 'Procès-verbal de l''assemblée générale 2024', 'https://example.com/pv-ag-2024.pdf', 350000, 1, NOW(), 'meetings', 'published'),
('Budget 2024', 'Budget prévisionnel pour 2024', 'https://example.com/budget-2024.xlsx', 125000, 1, NOW(), 'finance', 'draft'),
('Charte éthique', 'Charte éthique et valeurs de l''association', 'https://example.com/charte.pdf', 180000, 1, NOW(), 'legal', 'published');

-- 4. BUDGETS
INSERT INTO budgets (year, totalBudget, approvedBy, approvalDate, status) VALUES
(2024, 50000.00, 1, NOW(), 'approved'),
(2025, 55000.00, NULL, NULL, 'draft');

-- 5. LIGNES BUDGÉTAIRES
INSERT INTO budget_lines (budgetId, category, description, amount, spent, status) VALUES
(1, 'personnel', 'Salaires et charges', 20000.00, 15000.00, 'active'),
(1, 'operations', 'Loyer et charges', 8000.00, 8000.00, 'active'),
(1, 'projects', 'Projets sociaux', 15000.00, 5000.00, 'active'),
(1, 'communication', 'Communication et marketing', 5000.00, 2000.00, 'active'),
(1, 'other', 'Autres dépenses', 2000.00, 500.00, 'active');

-- 6. FACTURES
INSERT INTO invoices (invoiceNumber, supplierId, amount, description, issueDate, dueDate, status, paidDate) VALUES
('INV-2024-001', 1, 2500.00, 'Loyer janvier 2024', '2024-01-01', '2024-01-31', 'paid', '2024-01-28'),
('INV-2024-002', 1, 2500.00, 'Loyer février 2024', '2024-02-01', '2024-02-29', 'paid', '2024-02-27'),
('INV-2024-003', 2, 1200.00, 'Services informatiques', '2024-02-15', '2024-03-15', 'pending', NULL),
('INV-2024-004', 3, 800.00, 'Fournitures de bureau', '2024-02-20', '2024-03-20', 'pending', NULL),
('INV-2024-005', 1, 2500.00, 'Loyer mars 2024', '2024-03-01', '2024-03-31', 'overdue', NULL);

-- 7. FOURNISSEURS
INSERT INTO suppliers (name, email, phone, address, city, zipCode, country, bankAccount, status) VALUES
('Immobilier Paris SARL', 'contact@immoparis.fr', '0123456789', '100 Rue de Rivoli', 'Paris', '75001', 'France', 'FR7612345678901234567890', 'active'),
('TechServices France', 'info@techservices.fr', '0987654321', '50 Avenue Tech', 'Lyon', '69001', 'France', 'FR7687654321098765432109', 'active'),
('Fournitures Plus', 'commandes@fournitures.fr', '0456789012', '200 Boulevard Commerce', 'Marseille', '13001', 'France', 'FR7645678901234567890123', 'active');

-- 8. TYPES D'ADHÉSIONS
INSERT INTO membership_types (name, description, annualFee, benefits, maxMembers, status) VALUES
('Adhésion Standard', 'Adhésion standard avec accès aux activités', 50.00, 'Accès aux réunions, activités, newsletter', NULL, 'active'),
('Adhésion Premium', 'Adhésion premium avec avantages supplémentaires', 100.00, 'Accès complet, vote AG, réductions', NULL, 'active'),
('Adhésion Étudiant', 'Adhésion réduite pour étudiants', 25.00, 'Accès aux activités, newsletter', NULL, 'active'),
('Adhésion Bienfaiteur', 'Adhésion pour les donateurs', 500.00, 'Reconnaissance publique, rapports spéciaux', NULL, 'active');

-- 9. ADHÉSIONS
INSERT INTO memberships (memberId, membershipTypeId, startDate, endDate, status, paymentStatus) VALUES
(1, 2, '2023-01-15', '2024-01-14', 'active', 'paid'),
(2, 1, '2023-03-20', '2024-03-19', 'active', 'paid'),
(3, 1, '2023-06-10', '2024-06-09', 'active', 'paid'),
(4, 3, '2023-09-05', '2024-09-04', 'active', 'paid'),
(5, 1, '2024-01-12', '2025-01-11', 'active', 'pending');

-- 10. COTISATIONS
INSERT INTO contributions (memberId, amount, paymentDate, paymentMethod, description, status) VALUES
(1, 100.00, '2024-01-15', 'bank_transfer', 'Adhésion Premium 2024', 'completed'),
(2, 50.00, '2024-03-20', 'bank_transfer', 'Adhésion Standard 2024', 'completed'),
(3, 50.00, '2024-06-10', 'bank_transfer', 'Adhésion Standard 2024', 'completed'),
(4, 25.00, '2024-09-05', 'bank_transfer', 'Adhésion Étudiant 2024', 'completed'),
(5, 50.00, '2024-02-01', 'bank_transfer', 'Adhésion Standard 2024', 'pending');

-- 11. BÉNÉVOLES
INSERT INTO volunteers (firstName, lastName, email, phone, skills, availability, status, joinDate) VALUES
('Pierre', 'Rousseau', 'pierre@batisseurs.fr', '0612345678', 'Gestion de projet, Communication', 'weekends', 'active', '2023-06-01'),
('Sophie', 'Dubois', 'sophie@batisseurs.fr', '0687654321', 'Comptabilité, Gestion administrative', 'evenings', 'active', '2023-08-15'),
('Marc', 'Laurent', 'marc@batisseurs.fr', '0698765432', 'Informatique, Développement web', 'flexible', 'active', '2023-10-01'),
('Nathalie', 'Petit', 'nathalie@batisseurs.fr', '0654321098', 'Communication, Marketing', 'weekends', 'active', '2024-01-10');

-- 12. MISSIONS BÉNÉVOLES
INSERT INTO volunteer_missions (volunteerId, title, description, startDate, endDate, hoursRequired, status) VALUES
(1, 'Gestion du projet été 2024', 'Coordonner le projet d''été', '2024-06-01', '2024-08-31', 40, 'active'),
(2, 'Audit comptable 2024', 'Vérifier les comptes de l''année', '2024-03-01', '2024-04-30', 20, 'active'),
(3, 'Refonte du site web', 'Moderniser le site de l''association', '2024-02-01', '2024-05-31', 80, 'in-progress'),
(4, 'Campagne de communication', 'Gérer la campagne printemps 2024', '2024-03-15', '2024-05-15', 30, 'active');

-- 13. PROJETS
INSERT INTO projects (name, description, startDate, endDate, budget, progress, status, priority) VALUES
('Projet été 2024', 'Grand projet d''été avec activités pour les jeunes', '2024-06-01', '2024-08-31', 15000.00, 25, 'planning', 'high'),
('Refonte site web', 'Modernisation complète du site web', '2024-02-01', '2024-05-31', 8000.00, 60, 'active', 'high'),
('Formation bénévoles', 'Programme de formation pour les bénévoles', '2024-03-01', '2024-06-30', 3000.00, 40, 'active', 'medium'),
('Événement gala 2024', 'Gala de fin d''année', '2024-11-01', '2024-11-30', 5000.00, 10, 'planning', 'medium'),
('Étude impact social', 'Étude d''impact des actions de l''association', '2024-04-01', '2024-06-30', 2000.00, 30, 'active', 'low');

-- 14. TÂCHES
INSERT INTO tasks (projectId, title, description, assignedTo, dueDate, priority, status, progress) VALUES
(1, 'Planifier les activités', 'Définir le programme d''activités', 1, '2024-04-30', 'high', 'in-progress', 50),
(1, 'Réserver les locaux', 'Réserver les salles pour les activités', 2, '2024-05-15', 'high', 'pending', 0),
(2, 'Design UI/UX', 'Créer les maquettes du nouveau site', 3, '2024-03-31', 'high', 'completed', 100),
(2, 'Développement frontend', 'Coder l''interface utilisateur', 3, '2024-05-15', 'high', 'in-progress', 60),
(3, 'Créer le programme', 'Élaborer le programme de formation', 2, '2024-03-15', 'medium', 'pending', 0),
(3, 'Organiser les sessions', 'Planifier les dates et lieux', 1, '2024-04-01', 'medium', 'pending', 0),
(4, 'Choisir le lieu', 'Sélectionner le lieu du gala', 2, '2024-08-31', 'medium', 'pending', 0),
(5, 'Collecter les données', 'Rassembler les données d''impact', 1, '2024-05-31', 'low', 'in-progress', 40);

-- 15. ÉVÉNEMENTS
INSERT INTO events (title, description, startDate, endDate, location, capacity, registeredCount, status) VALUES
('Réunion mensuelle mars', 'Réunion mensuelle du bureau', '2024-03-15 19:00:00', '2024-03-15 21:00:00', 'Siège social', 50, 12, 'scheduled'),
('Atelier communication', 'Atelier sur les stratégies de communication', '2024-03-22 18:00:00', '2024-03-22 20:00:00', 'Salle de formation', 30, 18, 'scheduled'),
('Sortie équipe', 'Sortie d''équipe de printemps', '2024-04-20 10:00:00', '2024-04-20 17:00:00', 'Parc régional', 100, 45, 'scheduled'),
('Conférence invité', 'Conférence d''un expert en développement durable', '2024-04-10 20:00:00', '2024-04-10 21:30:00', 'Auditorium', 150, 87, 'scheduled');

-- 16. NOTIFICATIONS
INSERT INTO notifications (userId, title, message, type, relatedEntity, relatedEntityId, isRead, createdAt) VALUES
(1, 'Nouvelle adhésion', 'Emma Bernard a rejoint l''association', 'info', 'membership', 5, 0, NOW()),
(1, 'Facture en retard', 'La facture INV-2024-005 est en retard', 'warning', 'invoice', 5, 0, NOW()),
(2, 'Tâche assignée', 'Vous avez été assigné à la tâche "Réserver les locaux"', 'info', 'task', 2, 0, NOW()),
(3, 'Projet mis à jour', 'Le projet "Refonte site web" a été mis à jour', 'info', 'project', 2, 0, NOW()),
(1, 'Rapport généré', 'Le rapport mensuel de mars est disponible', 'success', 'report', 1, 1, NOW());

-- 17. ANNONCES
INSERT INTO announcements (title, content, author, publishDate, expiryDate, status, priority) VALUES
('Bienvenue Emma!', 'Nous accueillons chaleureusement Emma Bernard qui rejoint notre association!', 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'published', 'high'),
('Appel aux bénévoles', 'Nous recherchons des bénévoles pour le projet d''été. Contactez-nous!', 1, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 'published', 'high'),
('Mise à jour site web', 'Notre nouveau site web sera bientôt en ligne. Merci pour votre patience!', 1, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 'published', 'medium'),
('Réunion extraordinaire', 'Une réunion extraordinaire est prévue le 25 mars à 19h', 1, NOW(), '2024-03-25', 'published', 'high');

-- 18. CATÉGORIES
INSERT INTO categories (name, slug, description, color, icon, sortOrder) VALUES
('Légal', 'legal', 'Documents légaux et statuts', '#FF6B6B', 'file-text', 1),
('Rapports', 'reports', 'Rapports d''activité et financiers', '#4ECDC4', 'bar-chart', 2),
('Réunions', 'meetings', 'Procès-verbaux et minutes', '#45B7D1', 'users', 3),
('Finance', 'finance', 'Documents financiers', '#FFA07A', 'dollar-sign', 4),
('RH', 'hr', 'Ressources humaines', '#98D8C8', 'users', 5),
('Projets', 'projects', 'Documents de projets', '#F7DC6F', 'briefcase', 6);

-- 19. ACTIVITÉS
INSERT INTO activities (memberId, activityType, description, activityDate, status) VALUES
(1, 'login', 'Connexion à l''application', NOW(), 'completed'),
(2, 'document_upload', 'Téléchargement du rapport annuel', NOW(), 'completed'),
(3, 'event_registration', 'Inscription à l''atelier communication', NOW(), 'completed'),
(4, 'volunteer_signup', 'Inscription comme bénévole', NOW(), 'completed'),
(1, 'project_update', 'Mise à jour du projet été 2024', NOW(), 'completed');

-- 20. CONTACTS CRM
INSERT INTO crm_contacts (firstName, lastName, email, phone, company, position, source, status, lastContactDate) VALUES
('Jean', 'Partenaire', 'jean@partenaire.fr', '0123456789', 'Entreprise Partenaire', 'Directeur', 'referral', 'active', NOW()),
('Marie', 'Donateur', 'marie@donateur.fr', '0987654321', 'Fondation Généreuse', 'Responsable', 'website', 'active', NOW()),
('Luc', 'Sponsor', 'luc@sponsor.fr', '0456789012', 'Société Sponsor', 'Commercial', 'event', 'interested', NOW());

-- 21. ACTIVITÉS CRM
INSERT INTO crm_activities (contactId, activityType, description, activityDate, nextFollowUp) VALUES
(1, 'call', 'Appel pour discuter du partenariat', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
(2, 'email', 'Envoi de la proposition de donation', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY)),
(3, 'meeting', 'Réunion pour discuter du sponsoring', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- 22. JOURNAUX COMPTABLES
INSERT INTO accounting_journals (name, code, type, status) VALUES
('Journal Général', 'JG', 'general', 'active'),
('Journal des Ventes', 'JV', 'sales', 'active'),
('Journal des Achats', 'JA', 'purchases', 'active'),
('Journal de Banque', 'JB', 'bank', 'active'),
('Journal de Caisse', 'JC', 'cash', 'active');

-- 23. COMPTES COMPTABLES
INSERT INTO accounting_accounts (code, name, type, status) VALUES
('1000', 'Caisse', 'asset', 'active'),
('1100', 'Banque', 'asset', 'active'),
('2000', 'Immobilisations', 'asset', 'active'),
('4000', 'Fournisseurs', 'liability', 'active'),
('5000', 'Cotisations', 'revenue', 'active'),
('6000', 'Charges de personnel', 'expense', 'active'),
('6100', 'Charges d''exploitation', 'expense', 'active');

-- 24. ÉCRITURES COMPTABLES
INSERT INTO accounting_entries (journalId, entryDate, description, amount, reference) VALUES
(1, NOW(), 'Cotisation Alice Dupont', 100.00, 'COTI-001'),
(1, NOW(), 'Cotisation Bob Martin', 50.00, 'COTI-002'),
(4, NOW(), 'Loyer janvier 2024', 2500.00, 'LOY-001'),
(3, NOW(), 'Facture fournitures', 800.00, 'FOUR-001');

-- 25. PRÉFÉRENCES DE NOTIFICATIONS
INSERT INTO notification_preferences (userId, emailNotifications, smsNotifications, inAppNotifications) VALUES
(1, 1, 1, 1),
(2, 1, 0, 1),
(3, 1, 1, 1),
(4, 0, 0, 1),
(5, 1, 1, 1);

-- 26. LOGS D'AUDIT
INSERT INTO audit_logs (userId, action, entityType, entityId, changes, ipAddress, userAgent, status) VALUES
(1, 'CREATE', 'member', 5, '{"firstName":"Emma","lastName":"Bernard"}', '192.168.1.1', 'Mozilla/5.0', 'success'),
(1, 'UPDATE', 'project', 1, '{"progress":25}', '192.168.1.1', 'Mozilla/5.0', 'success'),
(2, 'VIEW', 'document', 1, '{}', '192.168.1.2', 'Mozilla/5.0', 'success'),
(3, 'DELETE', 'task', 1, '{}', '192.168.1.3', 'Mozilla/5.0', 'success');

-- 27. CONSENTEMENTS RGPD
INSERT INTO gdpr_consents (userId, consentType, given, consentDate, expiryDate) VALUES
(1, 'marketing', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
(2, 'marketing', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
(3, 'marketing', 0, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
(4, 'marketing', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
(5, 'marketing', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR));
