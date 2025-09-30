# Guide de Déploiement Chef@Home

## 🚀 Déploiement en Production

### Prérequis
- Serveur avec Node.js 18+
- Base de données MongoDB (Atlas recommandé)
- Compte Stripe (mode live)
- Nom de domaine configuré
- Certificat SSL

### 1. Configuration de l'Environnement

#### Variables d'Environnement Production
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/chef-home

# JWT
JWT_SECRET=your-super-secure-production-jwt-secret-key
JWT_EXPIRE=7d

# Stripe (Mode Live)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Email (Production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@chefathome.fr
EMAIL_PASS=your-production-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret

# Frontend URL
CLIENT_URL=https://chefathome.fr
```

### 2. Déploiement Backend (API)

#### Option A: Render
```bash
# 1. Connecter le repository GitHub à Render
# 2. Configurer le service :
#    - Build Command: cd server && npm install
#    - Start Command: cd server && npm start
#    - Environment: Node.js
#    - Region: Frankfurt (EU)

# 3. Ajouter les variables d'environnement dans Render Dashboard
```

#### Option B: Railway
```bash
# 1. Installer Railway CLI
npm install -g @railway/cli

# 2. Login et déployer
railway login
railway init
railway add --database mongodb
railway deploy
```

#### Option C: VPS (Ubuntu)
```bash
# 1. Installer Node.js et MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb

# 2. Cloner et configurer
git clone <repository-url>
cd chef-home/server
npm install --production

# 3. Configurer PM2
npm install -g pm2
pm2 start server.js --name "chef-home-api"
pm2 startup
pm2 save

# 4. Configurer Nginx
sudo apt install nginx
# Configurer le reverse proxy
```

### 3. Déploiement Frontend

#### Option A: Vercel
```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Déployer
cd chef-home
vercel --prod

# 3. Configurer les variables d'environnement
# VITE_API_URL=https://your-api-domain.com/api
```

#### Option B: Netlify
```bash
# 1. Build du projet
npm run build

# 2. Déployer via Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# 3. Configurer les redirects (_redirects file)
/*    /index.html   200
```

### 4. Configuration Base de Données

#### MongoDB Atlas
```bash
# 1. Créer un cluster sur MongoDB Atlas
# 2. Configurer les règles de sécurité réseau
# 3. Créer un utilisateur de base de données
# 4. Obtenir la chaîne de connexion
# 5. Ajouter à MONGODB_URI_PROD
```

#### Initialisation des Données
```bash
# Créer les index de performance
cd server
node scripts/createIndexes.js

# Créer les données de test (optionnel)
npm run seed create
```

### 5. Configuration Stripe

#### Webhooks Production
```bash
# 1. Configurer les webhooks dans Stripe Dashboard
# Endpoint: https://your-api-domain.com/api/payments/webhook
# Events: payment_intent.succeeded, payment_intent.payment_failed

# 2. Récupérer le secret webhook
# 3. Ajouter à STRIPE_WEBHOOK_SECRET
```

#### Comptes Connectés
```bash
# Configuration automatique via l'API
# Les chefs créent leurs comptes Stripe via l'interface
```

### 6. Configuration Email

#### Gmail (Recommandé)
```bash
# 1. Activer l'authentification à 2 facteurs
# 2. Générer un mot de passe d'application
# 3. Configurer EMAIL_USER et EMAIL_PASS
```

#### SendGrid (Alternative)
```bash
# 1. Créer un compte SendGrid
# 2. Configurer l'API key
# 3. Modifier la configuration email dans server/utils/email.js
```

### 7. Monitoring et Logs

#### Configuration des Logs
```bash
# 1. Installer Winston pour les logs avancés
npm install winston

# 2. Configurer Sentry pour le monitoring d'erreurs
npm install @sentry/node

# 3. Ajouter les variables d'environnement
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

#### Health Checks
```bash
# Endpoint de santé disponible
GET /health

# Réponse :
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production"
}
```

### 8. Sécurité Production

#### SSL/TLS
```bash
# 1. Obtenir un certificat SSL (Let's Encrypt recommandé)
# 2. Configurer HTTPS sur le serveur web
# 3. Rediriger HTTP vers HTTPS
```

#### Sécurité Headers
```bash
# Déjà configuré avec Helmet.js
# - Content Security Policy
# - X-Frame-Options
# - X-Content-Type-Options
# - Referrer-Policy
```

#### Rate Limiting
```bash
# Configuration actuelle :
# - 100 requêtes par 15 minutes par IP
# - Peut être ajusté selon les besoins
```

### 9. Backup et Récupération

#### Backup MongoDB
```bash
# Script de backup automatique
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI_PROD" --out="/backups/chef-home-$DATE"
```

#### Backup des Fichiers
```bash
# Backup Cloudinary automatique via leur API
# Backup du code via Git
```

### 10. Mise à Jour et Maintenance

#### Déploiement Continu
```bash
# 1. Configurer GitHub Actions
# 2. Tests automatiques avant déploiement
# 3. Déploiement automatique sur push main
```

#### Maintenance
```bash
# 1. Monitoring des performances
# 2. Mise à jour des dépendances
# 3. Backup réguliers
# 4. Surveillance des logs
```

## 🔧 Scripts de Déploiement

### Script de Déploiement Complet
```bash
#!/bin/bash
echo "🚀 Déploiement Chef@Home en cours..."

# 1. Build Frontend
echo "📦 Build du frontend..."
npm run build

# 2. Deploy Backend
echo "🔧 Déploiement du backend..."
cd server
npm install --production
pm2 restart chef-home-api

# 3. Update Database
echo "💾 Mise à jour de la base de données..."
node scripts/migrate.js

# 4. Clear Cache
echo "🧹 Nettoyage du cache..."
pm2 flush chef-home-api

echo "✅ Déploiement terminé avec succès !"
```

### Script de Rollback
```bash
#!/bin/bash
echo "🔄 Rollback en cours..."

# 1. Restore previous version
git checkout HEAD~1

# 2. Rebuild and restart
npm run build
cd server
pm2 restart chef-home-api

echo "✅ Rollback terminé !"
```

## 📊 Monitoring Production

### Métriques à Surveiller
- **Temps de réponse API** : < 500ms
- **Taux d'erreur** : < 1%
- **Utilisation CPU** : < 80%
- **Utilisation mémoire** : < 85%
- **Connexions DB** : Monitoring des connexions actives

### Alertes Recommandées
- Erreurs 5xx > 10/minute
- Temps de réponse > 2 secondes
- Échec de paiement
- Erreurs de base de données
- Espace disque < 10%

## 🆘 Dépannage

### Problèmes Courants

#### Erreur de Connexion MongoDB
```bash
# Vérifier la chaîne de connexion
# Vérifier les règles de sécurité réseau Atlas
# Vérifier les credentials
```

#### Erreurs Stripe
```bash
# Vérifier les clés API (test vs live)
# Vérifier la configuration des webhooks
# Vérifier les logs Stripe Dashboard
```

#### Problèmes d'Upload
```bash
# Vérifier la configuration Cloudinary
# Vérifier les limites de taille de fichier
# Vérifier les permissions
```

---

Pour plus d'informations, consultez la documentation complète ou contactez l'équipe technique.