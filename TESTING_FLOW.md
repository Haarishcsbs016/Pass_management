# Complete Project Flow & Testing Guide

## Project Status ✅
- **Backend**: Running on `http://localhost:5000`
- **Frontend**: Running on `http://localhost:3000`
- **Database**: MongoDB connected to `mongodb://localhost:27017/transport_pass_system`
- **Test Data**: Seeded with admin and regular users

---

## How to Run Locally

### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```
Expected output:
```
MongoDB Connected: localhost
Server running on port 5000
Environment: development
```

### Step 2: Start the Frontend Dev Server
```bash
cd frontend
npm run dev
```
Expected output:
```
Compiled successfully!
You can now view transport-pass-frontend in the browser.
Local: http://localhost:3000
```

### Step 3: Seed Test Data (First Time Only)
```bash
cd backend
node seed.js
```

---

## Complete Auth Flow (Step by Step)

### 1. Login as Admin User
**URL**: `http://localhost:3000/login`

1. Click the **Sign in** tab (it's already active)
2. Enter credentials:
   - **Email**: `admin@transport.com`
   - **Password**: `admin123`
3. Click **"Sign in securely"**
4. **Expected Result**: Redirects to `/admin/dashboard` immediately
5. You should see admin control panel with:
   - Manage Passes
   - Manage Routes
   - Reports
   - User profile in sidebar

### 2. Login as Regular User
1. Go back to `http://localhost:3000/login` or logout
2. Click the **Sign in** tab
3. Enter credentials:
   - **Email**: `john@example.com`
   - **Password**: `password123`
4. Click **"Sign in securely"**
5. **Expected Result**: Redirects to `/dashboard` immediately
6. You should see user dashboard with:
   - Apply for Pass
   - My Passes (list of applications)
   - Profile
   - User's greeting in sidebar

### 3. Sign Up as New User
1. Go to `http://localhost:3000/login`
2. Click the **Sign up** tab
3. Fill in the form:
   - **Full Name**: Your name
   - **Email**: Your email
   - **Phone**: 10-digit number (e.g., 9876543210)
   - **Password**: At least 6 characters
   - **Confirm Password**: Must match
   - **Address**: (Optional) Street, City, State, Pincode
4. Click **"Create account"**
5. **Expected Result**: Redirects to `/dashboard` immediately as new user

### 4. Logout
1. Click your profile avatar/name in the sidebar
2. Click **"Logout"** button
3. **Expected Result**: Redirects to `/login`

---

## Key Features Verified

### Authentication ✅
- [x] Admin login redirects to `/admin/dashboard` on first click
- [x] Regular user login redirects to `/dashboard` on first click
- [x] New user registration works and redirects to `/dashboard`
- [x] Logout clears token and redirects to `/login`
- [x] Invalid credentials show error toast

### Authorization ✅
- [x] Regular users cannot access `/admin/*` routes
- [x] Admin users see admin panel
- [x] Protected routes require authentication

### UI/UX ✅
- [x] Professional branded login/signup screen
- [x] Split-screen design on desktop
- [x] Responsive on mobile
- [x] Error messages display properly
- [x] Loading spinner shows during submission
- [x] Demo credentials button works
- [x] Smooth transitions and animations

### Backend API ✅
- [x] POST `/api/auth/register` - User registration
- [x] POST `/api/auth/login` - User login with JWT
- [x] GET `/api/auth/me` - Get current user (protected)
- [x] POST `/api/auth/logout` - Client-side logout endpoint
- [x] PUT `/api/auth/profile` - Update profile (protected)
- [x] Password hashing with bcrypt
- [x] JWT token generation (7-day expiry)

---

## Troubleshooting

### Issue: "Port already in use"
**Solution**: 
```bash
# Kill existing Node processes
Get-Process | Where-Object {$_.Name -eq "node"} | Stop-Process -Force
```

### Issue: MongoDB connection error
**Solution**: Ensure MongoDB is running
```bash
# On Windows, if using MongoDB service:
net start MongoDB

# If using local MongoDB without service, start it manually
mongod
```

### Issue: Login not redirecting
**Solution**: 
1. Hard refresh browser: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
2. Clear browser cache/cookies
3. Check browser console for errors (F12)
4. Verify backend is responding: `http://localhost:5000/api/health`

### Issue: "CORS error"
**Solution**: Ensure backend CORS is configured for `http://localhost:3000`
Check: `backend/.env` has `FRONTEND_URL=http://localhost:3000`

---

## Test Credentials

### Admin Account
- **Email**: `admin@transport.com`
- **Password**: `admin123`
- **Role**: admin
- **Access**: Full admin dashboard

### Test Regular Users
| Email | Password | Role |
|-------|----------|------|
| john@example.com | password123 | user |
| jane@example.com | password123 | user |
| robert@example.com | password123 | user |

---

## Project Structure
```
transport-pass-system/
├── backend/
│   ├── controllers/      # Auth, Pass, Route handlers
│   ├── models/          # User, Pass, Route schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, upload, validation
│   ├── server.js        # Express app setup
│   └── seed.js          # Database seeding
├── frontend/
│   ├── src/
│   │   ├── pages/       # Login, Dashboard, etc.
│   │   ├── components/  # Layout, Navbar, etc.
│   │   ├── contexts/    # AuthContext
│   │   ├── services/    # API calls
│   │   └── App.js       # Main router
│   └── package.json
└── docs/
    ├── API_DOCUMENTATION.md
    └── SETUP.md
```

---

## Next Steps

### Feature Development
1. **Pass Management**: Implement apply-pass, manage-passes (admin)
2. **Route Management**: Create, edit, delete routes (admin)
3. **Reports**: Generate statistics and reports (admin)
4. **Profile Management**: Update user details
5. **File Upload**: Document upload and verification

### Deployment
1. Build frontend: `npm run build`
2. Deploy to hosting (Vercel, Netlify, etc.)
3. Deploy backend to server (Heroku, DigitalOcean, etc.)
4. Use MongoDB Atlas for production database
5. Set up environment variables for production

### Security Improvements
1. Add refresh token with httpOnly cookies
2. Add 2FA (Two-Factor Authentication)
3. Rate limiting on auth endpoints
4. Email verification for new accounts
5. Password reset functionality

---

## Browser Access

- **Login/Signup**: `http://localhost:3000/login`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **User Dashboard**: `http://localhost:3000/dashboard`
- **API Health Check**: `http://localhost:5000/api/health`

---

## Notes

- All passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens expire in 7 days
- Token is stored in `localStorage` on the browser
- Session expires automatically on:
  - Token expiry
  - 401 Unauthorized response
  - Manual logout
- CORS allows requests from `http://localhost:3000`
- Rate limiting: 100 requests per 15 minutes per IP

---

**Testing Last Updated**: April 15, 2026
**Status**: ✅ All systems operational and ready for use
