# Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager
- **Git** (for version control)

## Project Structure

```
transport-pass-system/
├── backend/                 # Node.js/Express API server
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File upload directory
│   └── server.js          # Main server file
├── frontend/               # React.js frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── docs/                  # Documentation
└── README.md              # Project overview
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd transport-pass-system
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/transport_pass_system

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5000000
UPLOAD_PATH=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

Ensure MongoDB is running on your system. You can start it with:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 5. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 6. Start the Development Servers

**Terminal 1 - Backend Server:**

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

**Terminal 2 - Frontend Server:**

```bash
cd frontend
npm start
```

The frontend application will start on `http://localhost:3000`

## Default Admin Account

For testing purposes, you can create an admin account by registering with the email:
- **Email:** admin@transport.com
- **Password:** admin123

To make this user an admin, you'll need to manually update the database:

```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "admin@transport.com" },
  { $set: { role: "admin" } }
)
```

## Features Overview

### User Features
- User registration and authentication
- Apply for transport passes with document upload
- Track application status
- View and download approved passes
- Manage profile information

### Admin Features
- Admin dashboard with statistics
- Manage pass applications (approve/reject)
- Manage transport routes and pricing
- Generate reports and analytics
- View system statistics

### Technical Features
- JWT-based authentication
- File upload with validation
- Responsive design with Tailwind CSS
- RESTful API architecture
- MongoDB database with Mongoose ODM
- React Query for data fetching
- Form validation with React Hook Form

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Passes
- `POST /api/passes` - Apply for pass
- `GET /api/passes/my-passes` - Get user's passes
- `GET /api/passes/:id` - Get pass details
- `GET /api/passes` - Get all passes (Admin)
- `PUT /api/passes/:id/status` - Update pass status (Admin)
- `GET /api/passes/statistics` - Get statistics (Admin)

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes/calculate-price` - Calculate price
- `POST /api/routes` - Create route (Admin)
- `PUT /api/routes/:id` - Update route (Admin)
- `DELETE /api/routes/:id` - Delete route (Admin)

## Common Issues and Solutions

### 1. MongoDB Connection Error
**Problem:** Server fails to connect to MongoDB
**Solution:** Ensure MongoDB is running and the connection string in `.env` is correct

### 2. Port Already in Use
**Problem:** Error "Port already in use"
**Solution:** Change the PORT in `.env` file or kill the process using the port

### 3. CORS Issues
**Problem:** Frontend cannot connect to backend
**Solution:** Ensure FRONTEND_URL in `.env` matches your frontend URL

### 4. File Upload Issues
**Problem:** Document upload fails
**Solution:** Check file size limits and ensure uploads directory exists

## Development Tips

1. **Code Style:** Follow the existing code style and patterns
2. **Environment Variables:** Never commit `.env` files to version control
3. **Database:** Use MongoDB Compass for database management
4. **Testing:** Test both user and admin functionality
5. **Security:** Always validate input data on both client and server side

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Use a production MongoDB instance
3. Configure proper CORS settings
4. Set up SSL/HTTPS
5. Use process manager like PM2

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the build folder to a web server
3. Configure API endpoint properly
4. Set up proper routing for SPA

## Support

For any issues or questions:
1. Check the console for error messages
2. Review the API documentation
3. Ensure all environment variables are set correctly
4. Verify database connectivity

---

**Happy Coding! 🚀**
