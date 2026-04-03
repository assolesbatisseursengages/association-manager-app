-- ============================================================================
-- DONNÉES DE DÉMONSTRATION - ASSOCIATION MANAGER
-- ============================================================================

-- Catégories de documents
INSERT INTO categories (name, slug, description, color, icon, sortOrder) VALUES
('Légal', 'legal', 'Documents légaux et statuts', '#e74c3c', 'file-text', 1),
('Gouvernance', 'governance', 'Procès-verbaux et assemblées', '#3498db', 'users', 2),
('Financier', 'financial', 'Rapports financiers et budgets', '#2ecc71', 'dollar-sign', 3),
('Projets', 'projects', 'Plans et rapports de projets', '#f39c12', 'briefcase', 4),
('Ressources Humaines', 'hr', 'Documents RH et membres', '#9b59b6', 'user-check', 5),
('Communication', 'communication', 'Communiqués et annonces', '#1abc9c', 'megaphone', 6);

-- Membres
INSERT INTO members (firstName, lastName, email, phone, role, function, status, joinedAt) VALUES
('Ousmane', 'Mahamat', 'ousmane.mahamat@association.fr', '+235 66 00 11 22', 'Président', 'Direction', 'active', NOW()),
('Aïcha', 'Abdoulaye', 'aicha.abdoulaye@association.fr', '+235 62 22 33 44', 'Trésorier', 'Finances', 'active', NOW()),
('Khalil', 'Hassan', 'khalil.hassan@association.fr', '+235 61 33 44 55', 'Secrétaire', 'Administration', 'active', NOW()),
('Zainab', 'Ibrahim', 'zainab.ibrahim@association.fr', '+235 65 44 55 66', 'Membre', 'Bénévole', 'active', NOW()),
('Youssouf', 'Alamine', 'youssouf.alamine@association.fr', '+235 63 55 66 77', 'Membre', 'Bénévole', 'active', NOW()),
('Mariam', 'Sow', 'mariam.sow@association.fr', '+235 64 66 77 88', 'Membre', 'Bénévole', 'inactive', NOW());

-- Cotisations
INSERT INTO cotisations (memberId, montant, dateDebut, dateFin, statut, datePayment, notes) VALUES
(1, 50000.00, '2024-01-01', '2024-12-31', 'payée', '2024-01-15', 'Cotisation annuelle 2024 - Président'),
(2, 30000.00, '2024-01-01', '2024-12-31', 'payée', '2024-01-20', 'Cotisation annuelle 2024 - Trésorier'),
(3, 15000.00, '2024-01-01', '2024-12-31', 'payée', '2024-02-01', 'Cotisation annuelle 2024 - Membre'),
(4, 15000.00, '2024-01-01', '2024-12-31', 'payée', '2024-02-05', 'Cotisation annuelle 2024 - Membre'),
(5, 15000.00, '2024-01-01', '2024-12-31', 'en attente', NULL, 'Cotisation annuelle 2024 - Membre'),
(6, 15000.00, '2024-01-01', '2024-12-31', 'en retard', NULL, 'Cotisation annuelle 2024 - Membre');

-- Dons
INSERT INTO dons (montant, donateur, dateReception, statut, notes) VALUES
(500000.00, 'Dubois Trading SARL', '2024-01-10', 'reçu', 'Don pour aide urgence inondations'),
(200000.00, 'Banque du Tchad', '2024-02-05', 'reçu', 'Don pour projet formation'),
(100000.00, 'Particulier', '2024-03-01', 'en attente', 'Don pour projet centre formation'),
(250000.00, 'ONG partenaire', '2024-03-20', 'en attente', 'Don pour aide sociale');

-- Dépenses
INSERT INTO depenses (montant, description, categorie, dateDepense, statut) VALUES
(150000.00, 'Achat équipements - Fournitures bureau', 'Équipement', '2024-01-20', 'approuvée'),
(300000.00, 'Organisation événement - Aide alimentaire', 'Événement', '2024-02-15', 'approuvée'),
(75000.00, 'Carburant et transport - Missions terrain', 'Transport', '2024-03-10', 'en attente'),
(120000.00, 'Réparation véhicule - Maintenance', 'Maintenance', '2024-03-25', 'en attente');

-- Transactions
INSERT INTO transactions (montant, type, description, dateTransaction, statut) VALUES
(500000.00, 'don', 'Don Dubois Trading', '2024-01-10', 'complétée'),
(200000.00, 'don', 'Don Banque du Tchad', '2024-02-05', 'complétée'),
(150000.00, 'dépense', 'Achat équipements', '2024-01-20', 'complétée'),
(300000.00, 'dépense', 'Organisation événement', '2024-02-15', 'complétée');

-- Documents
INSERT INTO documents (title, description, categoryId, status, priority, fileName, fileType, createdBy, createdAt) VALUES
('Statuts de l\'Association', 'Statuts officiels de l\'association', 1, 'completed', 'high', 'statuts.pdf', 'pdf', 1, NOW()),
('PV Assemblée Générale 2024', 'Procès-verbal de l\'assemblée générale', 2, 'completed', 'high', 'pv-ag-2024.pdf', 'pdf', 1, NOW()),
('Rapport d\'Activité 2023', 'Rapport annuel d\'activité', 2, 'completed', 'medium', 'rapport-2023.pdf', 'pdf', 1, NOW()),
('Budget 2024', 'Budget prévisionnel pour 2024', 3, 'completed', 'high', 'budget-2024.xlsx', 'xlsx', 2, NOW()),
('Plan d\'Action Projets', 'Plan détaillé des projets', 4, 'in-progress', 'high', 'plan-action.docx', 'docx', 1, NOW()),
('Rapport Financier Q1 2024', 'Rapport financier du premier trimestre', 3, 'in-progress', 'medium', 'rapport-q1-2024.pdf', 'pdf', 2, NOW());

-- Contacts CRM
INSERT INTO crm_contacts (firstName, lastName, email, phone, company, position, source, status, lastContactDate) VALUES
('Mahamat', 'Alamine', 'mahamat.alamine@mairie.td', '+235 66 12 34 56', 'Mairie de N\'Djaména', 'Adjoint au Maire', 'official', 'active', NOW()),
('Fatima', 'Hassan', 'fatima.hassan@minplan.td', '+235 62 45 67 89', 'Ministère du Plan', 'Responsable Projets', 'official', 'active', NOW()),
('Jean-Pierre', 'Dubois', 'jp.dubois@dubois-trading.fr', '+33 1 45 67 89 00', 'Dubois Trading SARL', 'PDG', 'referral', 'active', NOW()),
('Amina', 'Ousmane', 'amina.ousmane@banque-tchad.td', '+235 61 23 45 67', 'Banque du Tchad', 'Directrice RSE', 'event', 'active', NOW());

-- Activités CRM
INSERT INTO crm_activities (contactId, type, subject, description, activityDate, status) VALUES
(1, 'meeting', 'Réunion coordination', 'Discussion sur les projets 2024', '2024-03-10', 'completed'),
(2, 'call', 'Suivi projet formation', 'Validation du calendrier', '2024-03-15', 'completed'),
(3, 'email', 'Proposition partenariat', 'Envoi proposition financière', '2024-03-18', 'completed'),
(4, 'meeting', 'Réunion RSE', 'Présentation des projets', '2024-03-20', 'completed');

-- Projets
INSERT INTO projects (name, description, startDate, endDate, status, budget, progress) VALUES
('Lutte contre les inondations 2024', 'Projet d\'aide d\'urgence et reconstruction', '2024-02-01', '2024-12-31', 'in_progress', 1500000.00, 45),
('Centre de Formation Professionnelle', 'Création d\'un centre de formation', '2024-03-01', '2025-06-30', 'planned', 2500000.00, 15),
('Programme Aide Sociale', 'Distribution alimentaire et aide sociale', '2024-01-01', '2024-12-31', 'in_progress', 800000.00, 60);

-- Tâches
INSERT INTO tasks (projectId, title, description, assignedTo, status, priority, dueDate) VALUES
(1, 'Évaluation des dégâts', 'Évaluation complète des dégâts', 1, 'completed', 'high', '2024-02-15'),
(1, 'Distribution d\'aide d\'urgence', 'Distribution de vivres et matériel', 2, 'in_progress', 'high', '2024-04-30'),
(2, 'Étude de faisabilité', 'Étude de faisabilité du centre', 1, 'in_progress', 'high', '2024-04-30'),
(2, 'Recherche financement', 'Recherche de financement', 2, 'in_progress', 'high', '2024-05-31'),
(3, 'Identification bénéficiaires', 'Identification des familles', 3, 'completed', 'medium', '2024-02-28'),
(3, 'Achat vivres', 'Achat des vivres', 1, 'in_progress', 'medium', '2024-04-15');

-- Événements
INSERT INTO events (title, description, startDate, endDate, location, type, status) VALUES
('Assemblée Générale Extraordinaire', 'Réunion pour présenter les projets 2024', '2024-04-15', '2024-04-15', 'N\'Djaména - Siège', 'meeting', 'planned'),
('Lancement Projet Formation', 'Événement de lancement du centre', '2024-05-01', '2024-05-01', 'N\'Djaména - Salle des fêtes', 'launch', 'planned'),
('Visite terrain', 'Visite de suivi du projet', '2024-04-20', '2024-04-22', 'Terrain', 'field_visit', 'in_progress'),
('Réunion partenaires', 'Réunion trimestrielle', '2024-03-28', '2024-03-28', 'N\'Djaména - Bureau', 'meeting', 'completed');

-- Paramètres globaux
INSERT INTO global_settings (associationName, seatCity, folio, email, website, phone, description) VALUES
('Association Manager', 'N\'Djaména', 'FOLIO-2024-001', 'contact@association.fr', 'www.association.fr', '+235 66 00 00 00', 'Plateforme de gestion administrative et financière pour associations');

-- Notifications
INSERT INTO notifications (userId, title, message, type, status, createdAt) VALUES
(1, 'Bienvenue', 'Bienvenue sur Association Manager', 'info', 'read', NOW()),
(1, 'Cotisation due', 'La cotisation de Zainab Ibrahim est en attente', 'warning', 'unread', NOW()),
(2, 'Rapport financier', 'Le rapport Q1 2024 est prêt', 'info', 'unread', NOW());

