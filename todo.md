# Project TODO - Association Manager App (Manus)

## Phase 1 - Configuration Initiale
- [x] Initialiser le projet Manus avec scaffold web-db-user
- [x] Copier le code source de "Les Bâtisseurs Engagés"
- [x] Modifier les identifiants de connexion (admin@association.fr / Admin123!)
- [x] Adapter les configurations pour le nouveau domaine
- [x] Configurer les secrets et variables d'environnement

## Phase 2 - Authentification Locale
- [x] Tables users_local et user_sessions existantes
- [x] Routers localAuth avec register/login/logout
- [x] Tester l'authentification avec les nouveaux identifiants
- [x] Vérifier la persistance des sessions

## Phase 3 - Gestion des Membres
- [x] Table members avec rôles et statuts
- [x] Routers pour CRUD membres
- [x] Tester la création/édition/suppression de membres
- [x] Vérifier les permissions par rôle

## Phase 4 - Gestion Documentaire
- [x] Table documents avec catégories
- [x] Routers pour documents et catégories
- [x] Tester l'upload de fichiers
- [x] Vérifier les permissions d'accès

## Phase 5 - Gestion Financière
- [x] Tables cotisations, dons, dépenses, transactions
- [x] Routers pour gestion financière
- [x] Tester les opérations financières
- [x] Vérifier les calculs et rapports

## Phase 6 - Module CRM
- [x] Tables crmContacts, crmActivities, adhesionPipeline
- [x] Routers CRM complets
- [x] Tester la gestion des contacts
- [x] Vérifier le pipeline d'adhésion

## Phase 7 - Projets et Tâches
- [x] Tables projects, tasks, project_members
- [x] Routers pour gestion de projets
- [x] Tester la création de projets
- [x] Vérifier la gestion des tâches

## Phase 8 - Tableau de Bord Personnalisable
- [x] Table dashboardWidgets
- [x] Routers pour widgets
- [x] Tester la personnalisation du dashboard
- [x] Vérifier la sauvegarde des préférences

## Phase 9 - Notifications et Préférences
- [x] Table notifications et notification_preferences
- [x] Routers pour notifications
- [x] Tester le système de notifications
- [x] Vérifier les préférences utilisateur

## Phase 10 - Paramètres Globaux
- [x] Tables globalSettings et associationSettings
- [x] Routers pour paramètres
- [x] Tester la modification des paramètres
- [x] Vérifier la persistance des données

## Phase 11 - Audit et Logs
- [x] Table auditLogs
- [x] Routers pour audit
- [x] Tester l'enregistrement des activités
- [x] Vérifier les logs d'audit

## Phase 12 - Déploiement sur Manus
- [x] Configurer le domaine personnalisé
- [x] Tester l'application en production
- [x] Vérifier toutes les fonctionnalités
- [x] Créer un checkpoint final

## Phase 13 - Gestion des Groupes/Antennes Locales
- [x] Créer la table member_groups
- [x] Ajouter la colonne groupId à la table members
- [x] Créer le router tRPC pour les groupes
- [x] Créer l'interface utilisateur
- [x] Ajouter le lien de navigation
- [x] Charger les données de démonstration

## Phase 14 - Améliorations Futures
- [ ] Ajouter les exports PDF/Excel
- [ ] Implémenter les rappels de paiement
- [ ] Ajouter les graphiques avancés
- [ ] Système de notifications par email

## Phase 15 - Champ Responsable pour les Groupes
- [x] Ajouter la colonne responsableMemberId à la table member_groups
- [x] Générer et appliquer la migration
- [x] Mettre à jour le router tRPC
- [x] Mettre à jour l'interface utilisateur
- [x] Charger les responsables pour les groupes de démonstration

## Phase 16 - Configuration GitHub et Vercel
- [x] Synchroniser le code avec GitHub
- [x] Créer le fichier .env.example
- [x] Créer le fichier vercel.json
- [x] Créer la documentation pour les autres IA
- [x] Tester le déploiement sur Vercel
