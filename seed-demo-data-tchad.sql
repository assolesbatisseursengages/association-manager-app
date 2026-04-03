-- ============================================================================
-- DONNÉES DE DÉMONSTRATION RÉALISTES - ASSOCIATION AU TCHAD
-- ============================================================================
-- Association: "Les Bâtisseurs Engagés - Tchad"
-- Contexte: Organisation humanitaire basée à N'Djaména
-- Activités: Lutte contre les inondations, formation, aide sociale
-- ============================================================================

-- ============================================================================
-- 1. CONTACTS (8 contacts variés)
-- ============================================================================

INSERT INTO crm_contacts (firstName, lastName, email, phone, company, position, source, status, lastContactDate) VALUES
-- Partenaires institutionnels
('Mahamat', 'Alamine', 'mahamat.alamine@mairie-ndjamena.td', '+235 66 12 34 56', 'Mairie de N\'Djaména', 'Adjoint au Maire', 'official', 'active', NOW()),
('Fatima', 'Hassan', 'fatima.hassan@minplan.td', '+235 62 45 67 89', 'Ministère du Plan', 'Responsable Projets', 'official', 'active', NOW()),

-- Donateurs/Sponsors
('Jean-Pierre', 'Dubois', 'jp.dubois@dubois-trading.fr', '+33 1 45 67 89 00', 'Dubois Trading SARL', 'PDG', 'referral', 'active', NOW()),
('Amina', 'Ousmane', 'amina.ousmane@banque-tchad.td', '+235 61 23 45 67', 'Banque du Tchad', 'Directrice RSE', 'event', 'active', NOW()),

-- Bénéficiaires/Partenaires locaux
('Ibrahim', 'Moussa', 'ibrahim.moussa@gmail.com', '+235 65 78 90 12', 'Communauté Goz Beida', 'Chef de village', 'referral', 'active', NOW()),
('Aïssatou', 'Sow', 'aissatou.sow@ong-action.td', '+235 63 34 56 78', 'ONG Action Solidaire', 'Coordinatrice', 'referral', 'active', NOW()),

-- Médias/Communication
('Youssouf', 'Mahamat', 'youssouf.mahamat@radio-tchad.td', '+235 64 56 78 90', 'Radio Tchad', 'Journaliste', 'event', 'interested', NOW()),

-- Consultant/Expertise
('Dr. Adèle', 'Ngarmbaye', 'adele.ngarmbaye@hopital-central.td', '+235 62 11 22 33', 'Hôpital Central N\'Djaména', 'Médecin Chef', 'referral', 'active', NOW());

-- ============================================================================
-- 2. MEMBRES / ADHÉRENTS (6 membres avec rôles variés)
-- ============================================================================

INSERT INTO members (firstName, lastName, email, phone, status, role) VALUES
('Ousmane', 'Mahamat', 'ousmane.mahamat@batisseurs.td', '+235 66 00 11 22', 'active', 'admin'),
('Aïcha', 'Abdoulaye', 'aicha.abdoulaye@batisseurs.td', '+235 62 22 33 44', 'active', 'admin'),
('Khalil', 'Hassan', 'khalil.hassan@batisseurs.td', '+235 61 33 44 55', 'active', 'member'),
('Zainab', 'Ibrahim', 'zainab.ibrahim@batisseurs.td', '+235 65 44 55 66', 'active', 'member'),
('Youssouf', 'Alamine', 'youssouf.alamine@batisseurs.td', '+235 63 55 66 77', 'active', 'member'),
('Mariam', 'Sow', 'mariam.sow@batisseurs.td', '+235 64 66 77 88', 'inactive', 'member');

-- ============================================================================
-- 3. ADHÉSIONS (6 adhésions avec types variés)
-- ============================================================================

INSERT INTO memberships (memberId, membershipTypeId, startDate, endDate, paymentStatus) VALUES
(1, 1, '2023-01-15', '2025-01-14', 'paid'),
(2, 2, '2023-06-20', '2025-06-19', 'paid'),
(3, 1, '2024-01-10', '2025-01-09', 'paid'),
(4, 3, '2024-03-05', '2025-03-04', 'paid'),
(5, 1, '2024-02-28', '2025-02-27', 'pending'),
(6, 1, '2023-11-12', '2024-11-11', 'pending');

-- ============================================================================
-- 4. COTISATIONS (8 transactions de cotisations)
-- ============================================================================

INSERT INTO contributions (memberId, amount, paymentDate, paymentMethod, description, status) VALUES
(1, 50000.00, '2024-01-15', 'bank_transfer', 'Cotisation annuelle 2024 - Président', 'completed'),
(2, 30000.00, '2024-01-20', 'bank_transfer', 'Cotisation annuelle 2024 - Trésorier', 'completed'),
(3, 15000.00, '2024-02-01', 'cash', 'Cotisation annuelle 2024 - Membre', 'completed'),
(4, 15000.00, '2024-02-05', 'bank_transfer', 'Cotisation annuelle 2024 - Membre', 'completed'),
(5, 15000.00, '2024-03-10', 'cash', 'Cotisation annuelle 2024 - Membre', 'pending'),
(1, 25000.00, '2024-06-15', 'bank_transfer', 'Cotisation supplémentaire - Projet urgence', 'completed'),
(2, 20000.00, '2024-07-01', 'bank_transfer', 'Contribution projet formation', 'completed'),
(3, 10000.00, '2024-08-15', 'cash', 'Contribution projet aide sociale', 'completed');

-- ============================================================================
-- 5. DONS / FINANCES (8 transactions financières)
-- ============================================================================

INSERT INTO invoices (number, amount, issueDate, dueDate, status, description) VALUES
('DON-2024-001', 500000.00, '2024-01-10', '2024-01-15', 'paid', 'Don Dubois Trading - Aide urgence inondations'),
('DON-2024-002', 200000.00, '2024-02-05', '2024-02-10', 'paid', 'Don Banque du Tchad - Fonds projet formation'),
('FAC-2024-001', 150000.00, '2024-01-20', '2024-02-20', 'paid', 'Achat équipements - Fournitures bureau'),
('FAC-2024-002', 300000.00, '2024-02-15', '2024-03-15', 'paid', 'Organisation événement - Aide alimentaire'),
('DON-2024-003', 100000.00, '2024-03-01', '2024-03-05', 'pending', 'Don particulier - Projet centre formation'),
('FAC-2024-003', 75000.00, '2024-03-10', '2024-04-10', 'pending', 'Carburant et transport - Missions terrain'),
('DON-2024-004', 250000.00, '2024-03-20', '2024-03-25', 'overdue', 'Don ONG partenaire - Aide sociale'),
('FAC-2024-004', 120000.00, '2024-03-25', '2024-04-25', 'draft', 'Réparation véhicule - Maintenance');

-- ============================================================================
-- 6. DOCUMENTS (8 documents variés)
-- ============================================================================

INSERT INTO documents (title, description, fileType, uploadDate, status, category) VALUES
('Statuts de l\'Association', 'Statuts officiels de l\'association Les Bâtisseurs Engagés - Tchad', 'pdf', '2023-01-01', 'completed', 'legal'),
('PV Assemblée Générale 2023', 'Procès-verbal de l\'assemblée générale du 15 mars 2023', 'pdf', '2023-03-15', 'completed', 'governance'),
('Rapport d\'Activité 2023', 'Rapport annuel d\'activité pour l\'année 2023', 'pdf', '2024-01-15', 'completed', 'report'),
('Budget 2024', 'Budget prévisionnel pour l\'année 2024', 'xlsx', '2023-12-20', 'completed', 'financial'),
('Plan d\'Action Projet Inondations', 'Plan détaillé du projet de lutte contre les inondations', 'docx', '2024-02-01', 'in_progress', 'project'),
('Rapport Financier Q1 2024', 'Rapport financier du premier trimestre 2024', 'pdf', '2024-04-01', 'in_progress', 'financial'),
('Formulaire Demande Subvention', 'Demande de subvention auprès du gouvernement', 'docx', '2024-03-15', 'pending', 'funding'),
('Contrat Partenariat Banque Tchad', 'Accord de partenariat avec la Banque du Tchad', 'pdf', '2024-03-01', 'completed', 'legal');

-- ============================================================================
-- 7. ACTIVITÉS CRM (6 interactions)
-- ============================================================================

INSERT INTO crm_activities (contactId, type, subject, description, activityDate, status) VALUES
(1, 'meeting', 'Réunion coordination aide urgence', 'Discussion sur la réponse aux inondations de 2024', '2024-03-10', 'completed'),
(2, 'call', 'Appel suivi projet formation', 'Validation du calendrier de formation', '2024-03-15', 'completed'),
(3, 'email', 'Proposition partenariat', 'Envoi proposition de partenariat financier', '2024-03-18', 'completed'),
(4, 'meeting', 'Réunion RSE Banque Tchad', 'Présentation des projets 2024', '2024-03-20', 'completed'),
(5, 'call', 'Suivi situation Goz Beida', 'Évaluation des besoins après inondations', '2024-03-22', 'pending'),
(6, 'email', 'Demande collaboration ONG', 'Proposition de projet conjoint aide sociale', '2024-03-25', 'pending');

-- ============================================================================
-- 8. PROJETS (3 projets réalistes)
-- ============================================================================

INSERT INTO projects (name, description, startDate, endDate, status, budget, progress) VALUES
('Lutte contre les inondations 2024', 'Projet d\'aide d\'urgence et reconstruction post-inondations à Goz Beida', '2024-02-01', '2024-12-31', 'in_progress', 1500000.00, 45),
('Centre de Formation Professionnelle', 'Création d\'un centre de formation pour les jeunes au Tchad', '2024-03-01', '2025-06-30', 'planned', 2500000.00, 15),
('Programme Aide Sociale Alimentaire', 'Distribution alimentaire et aide sociale aux familles vulnérables', '2024-01-01', '2024-12-31', 'in_progress', 800000.00, 60);

-- ============================================================================
-- 9. TÂCHES (8 tâches liées aux projets)
-- ============================================================================

INSERT INTO tasks (projectId, title, description, assignedTo, status, priority, dueDate) VALUES
(1, 'Évaluation des dégâts', 'Évaluation complète des dégâts causés par les inondations', 1, 'completed', 'high', '2024-02-15'),
(1, 'Distribution d\'aide d\'urgence', 'Distribution de vivres et matériel d\'urgence', 2, 'in_progress', 'high', '2024-04-30'),
(1, 'Reconstruction habitations', 'Reconstruction des habitations endommagées', 3, 'planned', 'medium', '2024-08-31'),
(2, 'Étude de faisabilité', 'Étude de faisabilité du centre de formation', 1, 'in_progress', 'high', '2024-04-30'),
(2, 'Recherche financement', 'Recherche de financement pour le projet', 2, 'in_progress', 'high', '2024-05-31'),
(3, 'Identification bénéficiaires', 'Identification des familles bénéficiaires', 3, 'completed', 'medium', '2024-02-28'),
(3, 'Achat vivres', 'Achat des vivres pour distribution', 1, 'in_progress', 'medium', '2024-04-15'),
(3, 'Suivi bénéficiaires', 'Suivi et évaluation impact auprès des bénéficiaires', 2, 'planned', 'low', '2024-06-30');

-- ============================================================================
-- 10. ÉVÉNEMENTS (5 événements)
-- ============================================================================

INSERT INTO events (title, description, startDate, endDate, location, type, status) VALUES
('Assemblée Générale Extraordinaire', 'Réunion pour présenter les projets 2024', '2024-04-15', '2024-04-15', 'N\'Djaména - Siège', 'meeting', 'planned'),
('Lancement Projet Formation', 'Événement de lancement du centre de formation', '2024-05-01', '2024-05-01', 'N\'Djaména - Salle des fêtes', 'launch', 'planned'),
('Visite terrain Goz Beida', 'Visite de suivi du projet inondations', '2024-04-20', '2024-04-22', 'Goz Beida', 'field_visit', 'in_progress'),
('Réunion partenaires', 'Réunion trimestrielle avec les partenaires', '2024-03-28', '2024-03-28', 'N\'Djaména - Bureau', 'meeting', 'completed'),
('Distribution aide alimentaire', 'Distribution mensuelle aux bénéficiaires', '2024-04-10', '2024-04-12', 'Différents sites', 'activity', 'in_progress');

-- ============================================================================
-- 11. BUDGETS (2 budgets)
-- ============================================================================

INSERT INTO budgets (year, totalAmount, status) VALUES
(2024, 5600000.00, 'approved'),
(2025, 6200000.00, 'draft');

-- ============================================================================
-- 12. LIGNES BUDGÉTAIRES (6 lignes)
-- ============================================================================

INSERT INTO budget_lines (budgetId, category, description, amount, spent) VALUES
(1, 'Emergency Response', 'Aide d\'urgence inondations', 1500000.00, 1200000.00),
(1, 'Training Programs', 'Centre de formation professionnelle', 2500000.00, 375000.00),
(1, 'Social Assistance', 'Programme aide alimentaire', 800000.00, 480000.00),
(1, 'Operations', 'Fonctionnement et administration', 600000.00, 300000.00),
(2, 'Emergency Response', 'Aide d\'urgence et prévention', 1200000.00, 0.00),
(2, 'Training Programs', 'Centre de formation - Phase 2', 3000000.00, 0.00);

-- ============================================================================
-- 13. FOURNISSEURS (4 fournisseurs)
-- ============================================================================

INSERT INTO suppliers (name, email, phone, address, category, status) VALUES
('Fournitures Tchad SARL', 'contact@fournitures-tchad.td', '+235 66 11 22 33', 'N\'Djaména', 'Office Supplies', 'active'),
('Transport Sahel Express', 'logistique@sahel-express.td', '+235 62 44 55 66', 'N\'Djaména', 'Logistics', 'active'),
('Alimentation Générale Goz', 'ventes@ali-goz.td', '+235 65 77 88 99', 'Goz Beida', 'Food Supplies', 'active'),
('Carburant Tchad Pétrole', 'ventes@carburant-tchad.td', '+235 61 99 88 77', 'N\'Djaména', 'Fuel', 'active');

-- ============================================================================
-- 14. ANNONCES (5 annonces)
-- ============================================================================

INSERT INTO announcements (title, content, type, status, publishDate) VALUES
('Appel aux bénévoles', 'Nous recherchons des bénévoles pour le projet de formation. Contactez-nous!', 'call_for_action', 'published', NOW()),
('Mise à jour projet inondations', 'Phase 2 du projet de reconstruction commence le 1er mai 2024', 'update', 'published', NOW()),
('Nouvelle partenaire ONG', 'Bienvenue à l\'ONG Action Solidaire qui nous rejoint dans nos projets', 'news', 'published', NOW()),
('Réunion urgente', 'Assemblée générale extraordinaire le 15 avril à 14h', 'urgent', 'published', NOW()),
('Merci à nos donateurs', 'Nous remercions tous nos donateurs pour leur soutien en 2024', 'gratitude', 'draft', NOW());

-- ============================================================================
-- 15. NOTIFICATIONS (6 notifications)
-- ============================================================================

INSERT INTO notifications (userId, title, message, type, status, createdAt) VALUES
(1, 'Nouvelle demande de subvention', 'Formulaire de demande de subvention reçu', 'info', 'unread', NOW()),
(2, 'Rapport financier à valider', 'Le rapport Q1 2024 est prêt pour validation', 'alert', 'unread', NOW()),
(1, 'Réunion partenaires confirmée', 'La réunion du 28 mars est confirmée', 'info', 'read', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'Tâche assignée', 'Vous avez une nouvelle tâche: Évaluation des dégâts', 'task', 'read', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'Cotisation en attente', 'Cotisation de Youssouf Alamine en attente de paiement', 'warning', 'unread', NOW()),
(1, 'Événement à venir', 'Visite terrain Goz Beida prévue le 20 avril', 'info', 'unread', NOW());

-- ============================================================================
-- FIN DES DONNÉES DE DÉMONSTRATION
-- ============================================================================
-- Total: 
-- - 8 contacts
-- - 6 membres
-- - 6 adhésions
-- - 8 cotisations
-- - 8 transactions financières (dons + factures)
-- - 8 documents
-- - 6 activités CRM
-- - 3 projets
-- - 8 tâches
-- - 5 événements
-- - 2 budgets avec 6 lignes
-- - 4 fournisseurs
-- - 5 annonces
-- - 6 notifications
-- ============================================================================
