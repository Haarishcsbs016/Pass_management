# Public Transport Pass Management System

A web-based application for automating and simplifying the process of issuing and managing transport passes.

## 🚀 Features

### User Features
- Registration and Login
- Apply for new transport passes
- Upload ID proof documents
- Select routes and duration
- Track application status
- Download approved passes

### Admin Features
- Secure admin login
- View and manage user applications
- Approve/Reject pass requests
- Manage transport routes and pricing
- Generate reports and statistics

## 🏗️ System Architecture

- **Frontend**: React.js with modern UI components
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Upload**: Multer for document handling

## 📁 Project Structure

```
transport-pass-system/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── docs/
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to backend directory
2. Install dependencies: `npm install`
3. Create `.env` file with environment variables
4. Start the server: `npm start`

### Frontend Setup
1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## 📊 Database Schema

### User Collection
- _id, name, email, password, role, createdAt

### Pass Collection
- _id, userId, source, destination, duration, price, status, date, documents

### Route Collection
- _id, source, destination, basePrice

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication
- Input validation and sanitization
- File upload security
- CORS configuration

## 📈 Future Enhancements

- Online payment gateway integration
- QR code-based pass verification
- Mobile application support
- SMS/Email notifications
- AI-based route suggestions

## 📝 License

This project is licensed under the MIT License.
