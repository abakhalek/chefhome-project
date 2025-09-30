# Chef@Home Backend API

A comprehensive Node.js backend API for the Chef@Home platform, connecting clients with professional chefs for home dining experiences.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Multi-role system (Client, Chef, Admin, B2B)
- **Chef Profiles**: Complete chef management with verification system
- **Booking System**: Advanced booking management with real-time updates
- **Payment Processing**: Stripe integration for secure payments
- **Real-time Communication**: Socket.io for notifications and chat
- **Admin Dashboard**: Comprehensive admin tools and analytics
- **B2B Solutions**: Corporate booking and mission management

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe API
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chef-home/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (recommended)
   # Update MONGODB_URI in .env
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chef-home
MONGODB_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/chef-home

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend
CLIENT_URL=http://localhost:5173
```

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
POST /api/auth/logout      # User logout
POST /api/auth/refresh     # Refresh token
```

### User Management

```http
GET    /api/users/profile     # Get user profile
PUT    /api/users/profile     # Update profile
PUT    /api/users/change-password  # Change password
DELETE /api/users/account     # Delete account
GET    /api/users             # Get all users (Admin)
```

### Chef Management

```http
GET  /api/chefs              # Get all chefs (public)
GET  /api/chefs/:id          # Get chef profile
POST /api/chefs              # Create chef profile
PUT  /api/chefs/:id          # Update chef profile
GET  /api/chefs/me/profile   # Get own profile
PUT  /api/chefs/me/availability  # Update availability
GET  /api/chefs/me/stats     # Get chef statistics
```

### Booking System

```http
POST /api/bookings           # Create booking
GET  /api/bookings           # Get user bookings
GET  /api/bookings/:id       # Get single booking
PUT  /api/bookings/:id/status    # Update booking status
POST /api/bookings/:id/review    # Add review
```

### Payment Processing

```http
POST /api/payments/create-intent  # Create payment intent
POST /api/payments/confirm        # Confirm payment
POST /api/payments/refund         # Process refund
POST /api/payments/webhook        # Stripe webhook
GET  /api/payments/history        # Payment history
```

### Admin Routes

```http
GET  /api/admin/stats            # Dashboard statistics
GET  /api/admin/chefs/pending    # Pending chef applications
PUT  /api/admin/chefs/:id/verify # Approve/reject chef
GET  /api/admin/bookings         # All bookings
PUT  /api/admin/bookings/:id/dispute  # Handle disputes
GET  /api/admin/analytics        # Platform analytics
```

### B2B Routes

```http
POST /api/b2b/missions           # Create B2B mission
GET  /api/b2b/missions           # Get B2B missions
GET  /api/b2b/chefs/search       # Search chefs for B2B
PUT  /api/b2b/missions/:id/assign   # Assign chef to mission
GET  /api/b2b/analytics          # B2B analytics
POST /api/b2b/missions/:id/invoice  # Generate invoice
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: express-validator for request validation
- **Role-based Access**: Different permissions for each user type

## 📊 Database Schema

### Users Collection
- Authentication and profile data
- Role-based permissions
- Preferences and settings

### Chefs Collection
- Professional profiles
- Verification status
- Availability and pricing
- Reviews and ratings

### Bookings Collection
- Event details and location
- Payment information
- Status tracking
- Communication history

## 🚀 Deployment

### Using Render (Recommended)

1. **Connect Repository**
   - Link your GitHub repository to Render

2. **Environment Variables**
   - Set all required environment variables in Render dashboard

3. **Database**
   - Use MongoDB Atlas for production database

4. **Deploy**
   - Render will automatically deploy on push to main branch

### Using Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create chef-home-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI_PROD=your-mongodb-atlas-uri
# ... set other variables

# Deploy
git push heroku main
```

## 📈 Monitoring & Analytics

- **Health Check**: `/health` endpoint for monitoring
- **Logging**: Morgan for HTTP request logging
- **Error Handling**: Centralized error handling middleware
- **Performance**: Compression middleware for response optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

Built with ❤️ for the Chef@Home platform