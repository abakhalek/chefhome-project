# Documentation API Chef@Home

## 🌐 Vue d'ensemble de l'API

L'API Chef@Home est une API RESTful complète qui gère toutes les fonctionnalités de la plateforme de réservation de chefs professionnels.

**Base URL**: `https://api.chefathome.fr/api` (Production)  
**Base URL**: `http://localhost:5000/api` (Développement)

## 🔐 Authentification

### JWT Token
Toutes les routes protégées nécessitent un token JWT dans l'en-tête :
```http
Authorization: Bearer <token>
```

### Endpoints d'Authentification

#### POST /auth/register
Inscription d'un nouvel utilisateur
```json
{
  "name": "Sophie Martin",
  "email": "sophie@example.com",
  "password": "password123",
  "phone": "+33123456789",
  "role": "client"
}
```

#### POST /auth/login
Connexion utilisateur
```json
{
  "email": "sophie@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Récupérer les informations de l'utilisateur connecté

#### POST /auth/logout
Déconnexion utilisateur

## 👥 Gestion des Utilisateurs

### GET /users/profile
Récupérer le profil utilisateur

### PUT /users/profile
Mettre à jour le profil utilisateur
```json
{
  "name": "Sophie Martin",
  "phone": "+33123456789",
  "preferences": {
    "dietary": ["vegetarian"],
    "allergies": ["nuts"],
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

### PUT /users/change-password
Changer le mot de passe
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## 🧑‍🍳 Gestion des Chefs

### GET /chefs
Récupérer la liste des chefs avec filtres
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 12)
- city: string
- cuisineType: string
- serviceType: string
- minPrice: number
- maxPrice: number
- rating: number
- sortBy: string (default: 'rating.average')
- sortOrder: 'asc' | 'desc' (default: 'desc')
```

### GET /chefs/:id
Récupérer le profil d'un chef spécifique

### GET /chefs/me/profile
Récupérer son propre profil chef (Chef uniquement)

### PUT /chefs/me/profile
Mettre à jour son profil chef
```json
{
  "specialty": "Cuisine Française Moderne",
  "experience": 15,
  "hourlyRate": 80,
  "description": "Chef expérimentée...",
  "cuisineTypes": ["french", "modern"],
  "serviceTypes": ["home-dining", "private-events"],
  "serviceAreas": [{
    "city": "Paris",
    "zipCodes": ["75001", "75002"],
    "maxDistance": 25
  }]
}
```

### POST /chefs/me/documents
Upload de documents (Chef uniquement)
```
Content-Type: multipart/form-data
Fields:
- document: File
- type: 'cv' | 'insurance' | 'healthCertificate' | 'businessLicense'
```

### GET /chefs/me/menus
Récupérer ses menus (Chef uniquement)

### POST /chefs/me/menus
Créer un nouveau menu
```json
{
  "name": "Menu Gastronomique Français",
  "description": "Un voyage culinaire...",
  "price": 85,
  "type": "forfait",
  "courses": ["Amuse-bouche", "Entrée", "Plat", "Dessert"],
  "dietaryOptions": ["vegetarian-option"],
  "duration": "3-4h",
  "minGuests": 2,
  "maxGuests": 12
}
```

### PUT /chefs/me/availability
Mettre à jour ses disponibilités
```json
{
  "schedule": {
    "monday": {
      "available": true,
      "hours": [{"start": "18:00", "end": "23:00"}]
    }
  },
  "blackoutDates": ["2024-12-25"],
  "minimumBookingHours": 3,
  "maximumGuests": 12
}
```

## 📅 Gestion des Réservations

### POST /bookings
Créer une nouvelle réservation
```json
{
  "chefId": "chef_id",
  "serviceType": "home-dining",
  "eventDetails": {
    "date": "2024-01-15",
    "startTime": "19:00",
    "duration": 3,
    "guests": 4,
    "eventType": "dinner"
  },
  "location": {
    "address": "123 Rue de la Paix",
    "city": "Paris",
    "zipCode": "75001"
  },
  "menu": {
    "customRequests": "Menu végétarien",
    "dietaryRestrictions": ["vegetarian"],
    "allergies": ["nuts"]
  }
}
```

### GET /bookings
Récupérer ses réservations
```
Query Parameters:
- status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
- page: number
- limit: number
```

### GET /bookings/:id
Récupérer une réservation spécifique

### PUT /bookings/:id/status
Mettre à jour le statut d'une réservation
```json
{
  "status": "confirmed",
  "note": "Réservation confirmée par le chef"
}
```

### POST /bookings/:id/review
Ajouter une évaluation
```json
{
  "rating": 5,
  "comment": "Excellente expérience culinaire !"
}
```

## 💳 Gestion des Paiements

### POST /payments/create-intent
Créer un intent de paiement
```json
{
  "bookingId": "booking_id",
  "amount": 240
}
```

### POST /payments/confirm
Confirmer un paiement
```json
{
  "paymentIntentId": "pi_xxx",
  "bookingId": "booking_id"
}
```

### POST /payments/refund
Traiter un remboursement
```json
{
  "bookingId": "booking_id",
  "amount": 100,
  "reason": "Annulation client"
}
```

### GET /payments/history
Récupérer l'historique des paiements

## 👨‍💼 Routes Administrateur

### GET /admin/stats
Statistiques globales de la plateforme

### GET /admin/users
Liste des utilisateurs avec filtres
```
Query Parameters:
- role: 'client' | 'chef' | 'b2b'
- status: 'active' | 'suspended'
- search: string
- page: number
- limit: number
```

### GET /admin/chefs/pending
Chefs en attente de validation

### PUT /admin/chefs/:id/verify
Approuver/rejeter un chef
```json
{
  "status": "approved",
  "rejectionReason": "Documents incomplets"
}
```

### GET /admin/bookings
Toutes les réservations avec filtres

### PUT /admin/bookings/:id/dispute
Gérer un litige
```json
{
  "resolution": "resolved",
  "refundAmount": 100,
  "note": "Remboursement partiel accordé"
}
```

### GET /admin/analytics
Analytics avancées de la plateforme

## 🏢 Routes B2B

### POST /b2b/missions
Créer une mission B2B
```json
{
  "title": "Chef pour événement corporate",
  "description": "Recherche chef expérimenté...",
  "serviceType": "private-events",
  "eventDetails": {
    "date": "2024-01-20",
    "duration": 6,
    "guests": 50
  },
  "location": {
    "address": "La Défense, Paris",
    "city": "Paris",
    "zipCode": "92400"
  },
  "budget": 1200,
  "requirements": ["Cuisine française", "Expérience événementiel"]
}
```

### GET /b2b/missions
Récupérer ses missions B2B

### GET /b2b/chefs/search
Rechercher des chefs pour B2B
```
Query Parameters:
- specialty: string
- experience: number
- location: string
- availability: string
- serviceType: string
```

### PUT /b2b/missions/:id/assign
Assigner un chef à une mission
```json
{
  "chefId": "chef_id"
}
```

### GET /b2b/analytics
Analytics B2B spécialisées

## 💬 Messagerie

### GET /messages/conversations
Récupérer ses conversations

### GET /messages/conversations/:id
Récupérer les messages d'une conversation

### POST /messages
Envoyer un message
```json
{
  "recipientId": "user_id",
  "content": "Bonjour, j'ai une question...",
  "bookingId": "booking_id",
  "type": "text"
}
```

## 🔔 Notifications

### GET /notifications
Récupérer ses notifications
```
Query Parameters:
- page: number
- limit: number
- unreadOnly: boolean
```

### PUT /notifications/:id/read
Marquer une notification comme lue

### PUT /notifications/read-all
Marquer toutes les notifications comme lues

## 📊 Dashboard et Analytics

### GET /dashboard/chef
Données dashboard chef

### GET /dashboard/client
Données dashboard client

### GET /dashboard/admin
Données dashboard admin

### GET /dashboard/b2b
Données dashboard B2B

### GET /analytics/platform
Analytics globales de la plateforme
```
Query Parameters:
- period: '7d' | '30d' | '90d' | '1y'
```

### GET /analytics/chef
Analytics spécifiques au chef

## 📝 Codes de Réponse

### Succès
- `200 OK` - Requête réussie
- `201 Created` - Ressource créée
- `204 No Content` - Suppression réussie

### Erreurs Client
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Non authentifié
- `403 Forbidden` - Non autorisé
- `404 Not Found` - Ressource non trouvée
- `409 Conflict` - Conflit de données

### Erreurs Serveur
- `500 Internal Server Error` - Erreur serveur
- `503 Service Unavailable` - Service indisponible

## 📋 Format des Réponses

### Réponse Standard
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Réponse d'Erreur
```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

## 🔄 Webhooks

### Stripe Webhooks
Endpoint: `POST /payments/webhook`

Events gérés :
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `account.updated`
- `transfer.created`

## 📡 WebSocket Events

### Connexion
```javascript
const socket = io('ws://localhost:5000', {
  auth: {
    token: 'jwt_token'
  }
});
```

### Events Émis
- `booking-notification` - Nouvelle réservation
- `message-received` - Nouveau message
- `status-update` - Changement de statut
- `system-notification` - Notification système

### Events Reçus
- `send-message` - Envoyer un message
- `booking-update` - Mise à jour réservation
- `join-room` - Rejoindre une room

## 🧪 Tests et Développement

### Comptes de Test
```json
{
  "admin": {
    "email": "admin@chefathome.fr",
    "password": "admin123"
  },
  "client": {
    "email": "client@chefathome.fr", 
    "password": "client123"
  },
  "chef": {
    "email": "chef@chefathome.fr",
    "password": "chef123"
  },
  "b2b": {
    "email": "b2b@chefathome.fr",
    "password": "b2b123"
  }
}
```

### Données de Test
```bash
# Créer des données de test
npm run seed create

# Supprimer les données de test
npm run seed remove

# Réinitialiser
npm run seed reset
```

## 📈 Rate Limiting

### Limites par Défaut
- **API générale** : 100 requêtes/15 minutes par IP
- **Authentification** : 5 tentatives/15 minutes par IP
- **Upload de fichiers** : 10 uploads/heure par utilisateur
- **Messages** : 50 messages/heure par utilisateur

### Headers de Rate Limiting
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔍 Filtres et Recherche

### Opérateurs de Recherche
- `$regex` - Recherche textuelle
- `$gte` / `$lte` - Comparaisons numériques
- `$in` - Valeurs multiples
- `$exists` - Présence de champ

### Exemples de Filtres
```javascript
// Recherche de chefs
GET /chefs?city=Paris&minPrice=50&maxPrice=100&rating=4&cuisineType=french

// Recherche de réservations
GET /bookings?status=confirmed&dateFrom=2024-01-01&dateTo=2024-01-31
```

## 📊 Pagination

### Format Standard
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Paramètres de Pagination
- `page` - Numéro de page (défaut: 1)
- `limit` - Éléments par page (défaut: 20, max: 100)

## 🔄 Gestion des Erreurs

### Types d'Erreurs
```javascript
// Erreur de validation
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}

// Erreur d'authentification
{
  "success": false,
  "message": "Not authorized, invalid token"
}

// Erreur serveur
{
  "success": false,
  "message": "Internal server error"
}
```

## 📁 Upload de Fichiers

### Endpoints d'Upload
- `POST /chefs/me/documents` - Documents chef
- `POST /chefs/me/portfolio/images` - Images portfolio
- `POST /users/avatar` - Photo de profil

### Limites d'Upload
- **Taille max** : 5MB par fichier
- **Types acceptés** : JPG, PNG, PDF
- **Nombre max** : 10 images portfolio

### Format de Réponse
```json
{
  "success": true,
  "url": "https://cloudinary.com/image.jpg",
  "publicId": "chef-documents/user123/cv"
}
```

## 🎯 Exemples d'Utilisation

### Workflow Complet de Réservation
```javascript
// 1. Rechercher des chefs
const chefs = await fetch('/api/chefs?city=Paris&cuisineType=french');

// 2. Créer une réservation
const booking = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chefId: 'chef123',
    eventDetails: {
      date: '2024-01-15',
      startTime: '19:00',
      duration: 3,
      guests: 4
    },
    location: {
      address: '123 Rue de la Paix',
      city: 'Paris',
      zipCode: '75001'
    }
  })
});

// 3. Créer le paiement
const payment = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    bookingId: booking.id,
    amount: 240
  })
});

// 4. Confirmer le paiement
await fetch('/api/payments/confirm', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paymentIntentId: payment.paymentIntentId,
    bookingId: booking.id
  })
});
```

### Gestion des Notifications en Temps Réel
```javascript
// Connexion WebSocket
const socket = io('ws://localhost:5000', {
  auth: { token: jwtToken }
});

// Écouter les notifications
socket.on('booking-notification', (data) => {
  console.log('Nouvelle notification:', data);
});

// Envoyer un message
socket.emit('send-message', {
  recipientId: 'user123',
  content: 'Bonjour !',
  conversationId: 'conv123'
});
```

## 🔧 Configuration Avancée

### Variables d'Environnement Complètes
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/chef-home
MONGODB_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/chef-home

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@chefathome.fr
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=chef-home
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Frontend
CLIENT_URL=https://chefathome.fr
```

## 📚 Ressources Supplémentaires

### Documentation Technique
- [Guide d'Installation](./INSTALLATION.md)
- [Guide de Déploiement](./DEPLOYMENT.md)
- [Spécifications Fonctionnelles](./FEATURES.md)

### Support Développeur
- **Email** : dev@chefathome.fr
- **Discord** : [Chef@Home Developers](https://discord.gg/chefathome)
- **GitHub** : [Issues et Discussions](https://github.com/chefathome/platform)

---

Cette documentation est maintenue à jour avec chaque version de l'API. Pour la version la plus récente, consultez `/api` endpoint.