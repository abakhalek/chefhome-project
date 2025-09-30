# Chef@Home - Plateforme de Réservation de Chefs Professionnels

Chef@Home est une plateforme complète qui connecte les gourmets avec des chefs professionnels pour des expériences culinaires exceptionnelles à domicile. La plateforme offre des solutions adaptées aux particuliers, aux chefs indépendants, aux professionnels B2B et dispose d'outils d'administration avancés.
## 🎯 Vue d'ensemble
## 🚀 Fonctionnalités Principales
### 🧑‍🍳 Espace Personnel du Chef
- **Création du Profil** : Coordonnées, justificatifs, spécialités culinaires
- **Gestion des Offres** : Menus types et prestations personnalisées
- **Planning et Missions** : Agenda, disponibilités, demandes de mission
- **Suivi Administratif** : Paiements, revenus, évaluations clients
### 👨‍💼 Interface Administrateur
- **Reporting Avancé** : Statistiques globales et outils marketing
- **Gestion des Litiges** : Résolution des conflits et remboursements
- **Suivi des Réservations** : Visualisation et modification des prestations
- **Gestion des Utilisateurs** : Validation des profils et accès aux comptes
### 🏢 Espace Professionnel B2B
- **Compte Professionnel Dédié** : Interface adaptée aux besoins professionnels
- **Dépôt de Missions Spécialisées** : Aide en cuisine, remplacements, événements
- **Recherche Ciblée de Chefs** : Filtres avancés et attribution directe
- **Facturation Professionnelle** : Historique complet et facturation groupée
### 💳 Système de Paiement et Facturation
- **Génération de Devis** : Création automatique consultable en ligne
- **Paiement Sécurisé** : Acompte ou paiement total via Stripe
- **Répartition des Fonds** : Commission plateforme + solde chef
- **Documents Comptables** : Facture client et bordereau chef automatisés
### 📱 Communication et Notifications
- **Confirmation** : Envoi automatique après réservation
- **Rappel** : Notification 24h avant la prestation
- **Modifications** : Alertes en cas de changements
- **Évaluation** : Demande post-prestation
### 🔒 Sécurité et Conformité RGPD
- **Authentification Sécurisée** : Protection renforcée des comptes
- **Données Cryptées** : Stockage conforme RGPD européen
- **Paiements PCI-DSS** : Transactions sécurisées via Stripe
- **Accès Restreint** : Contrôle par rôles spécifiques
## 🛠 Technologies Utilisées
### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **Lucide React** pour les icônes
- **Axios** pour les appels API
- **React Hook Form** pour les formulaires
### Backend
- **Node.js** avec Express.js
- **MongoDB** avec Mongoose ODM
- **Socket.io** pour le temps réel
- **Stripe** pour les paiements
- **JWT** pour l'authentification
- **Cloudinary** pour les uploads
- **Nodemailer** pour les emails
## 📦 Installation et Configuration
### Prérequis
- Node.js 18+
- MongoDB
- Compte Stripe
- Compte Cloudinary (optionnel)
### Installation Frontend
```bash
npm install
npm run dev
```
### Installation Backend
```bash
cd server
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```
### Variables d'Environnement
```env
# Server
PORT=5000
NODE_ENV=development
# Database
MONGODB_URI=mongodb://localhost:27017/chef-home
# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# Frontend URL
CLIENT_URL=http://localhost:5173
```
## 🎯 Avantages par Segment
### Clients Particuliers
- ✅ **Recherche Personnalisée** : Trouvez le chef idéal selon vos critères
- ✅ **Expérience Sur Mesure** : Adaptez chaque détail à vos préférences
- ✅ **Sécurité Garantie** : Chefs vérifiés et paiements protégés
### Chefs Partenaires
- ✅ **100% Flexibilité** : Liberté totale dans la gestion de votre emploi du temps
- ✅ **0€ Frais d'Inscription** : Aucun coût initial pour rejoindre la plateforme
- ✅ **+40% Revenus** : Augmentation moyenne des revenus pour les chefs actifs
- ✅ **24/7 Visibilité** : Présence permanente sur la plateforme
### Professionnels B2B
- ✅ **Solution RH Flexible** : Gérez les pics d'activité sans contraintes
- ✅ **Profils Qualifiés** : Accès à des chefs vérifiés avec expérience
- ✅ **Facturation Simplifiée** : Gestion administrative automatisée
- ✅ **Support Dédié** : Assistance pour la création de contrats
## 📚 Documentation API
### Endpoints Principaux
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/chefs` - Liste des chefs disponibles
- `POST /api/bookings` - Créer une réservation
- `POST /api/payments/create-intent` - Créer un paiement
- `GET /api/dashboard/chef` - Données dashboard chef
- `GET /api/admin/stats` - Statistiques administrateur
### Authentification
Toutes les routes protégées nécessitent un token JWT dans l'en-tête :
```
Authorization: Bearer <token>
```
## 🧪 Tests et Développement
### Comptes de Test
- **Admin** : admin@chefathome.fr / admin123
- **Client** : client@chefathome.fr / client123
- **Chef** : chef@chefathome.fr / chef123
- **B2B** : b2b@chefathome.fr / b2b123
### Commandes Utiles
```bash
# Créer des données de test
cd server && npm run seed create
# Supprimer les données de test
cd server && npm run seed remove
# Réinitialiser les données
cd server && npm run seed reset
# Lancer les tests
cd server && npm test
```
## 🚀 Déploiement
### Production
1. Configurer les variables d'environnement de production
2. Utiliser MongoDB Atlas pour la base de données
3. Configurer Stripe en mode live
4. Déployer sur Render, Heroku ou serveur VPS
### Monitoring
- Logs centralisés avec Morgan
- Health check endpoint : `/health`
- Métriques de performance intégrées
- Alertes automatiques en cas d'erreur
## 📄 Licence
Ce projet est sous licence MIT.
## 🤝 Contribution
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request
## 📞 Support
Pour toute question ou support :
- Email : support@chefathome.fr
- Documentation : [docs.chefathome.fr](https://docs.chefathome.fr)
- Issues GitHub : [github.com/chefathome/issues](https://github.com/chefathome/issues)
---
**Chef@Home** - Révolutionnons l'expérience culinaire ensemble ! 🍽️✨