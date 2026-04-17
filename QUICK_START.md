# Quick Start Guide

## 🚀 Start Everything in 2 Minutes

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```
Wait for: `Server running on port 5000`

### Terminal 2: Start Frontend  
```bash
cd frontend
npm run dev
```
Wait for: `Compiled successfully!`

### Terminal 3 (One time): Seed Database
```bash
cd backend
node seed.js
```
Wait for: `Seed Data Created Successfully`

---

## ✅ Ready to Test

Go to: **http://localhost:3000/login**

### Quick Test
1. **Sign In** (Admin)
   - Email: `admin@transport.com`
   - Password: `admin123`
   - Should redirect to admin dashboard immediately ✓

2. **Sign In** (User)
   - Email: `john@example.com`
   - Password: `password123`
   - Should redirect to user dashboard immediately ✓

3. **Sign Up** (New User)
   - Fill form and create account
   - Should redirect to dashboard immediately ✓

---

## 🔧 What's Working

✅ Backend (Express + MongoDB)
- All auth endpoints working
- Connected to MongoDB
- JWT authentication active
- Error handling in place

✅ Frontend (React)
- Combined login/signup page
- Professional UI with brand colors
- One-click redirect after login
- Role-based routing (admin vs user)

✅ Database (MongoDB)
- Users table seeded with test accounts
- Routes table seeded with transport routes
- Ready for pass applications

---

## 📱 Test Accounts

**Admin User**
- Email: admin@transport.com
- Password: admin123

**Regular Users**
- Email: john@example.com | Password: password123
- Email: jane@example.com | Password: password123
- Email: robert@example.com | Password: password123

---

## 🐛 If Something's Wrong

**Backend won't start?**
```bash
# Check if port 5000 is in use
Get-Process | Where-Object {$_.Name -eq "node"} | Stop-Process -Force
npm run dev
```

**Frontend won't connect?**
- Hard refresh: `Ctrl+Shift+R`
- Check: http://localhost:5000/api/health returns green

**Login not redirecting?**
- Check browser console (F12)
- Verify backend is running
- Check localStorage has token

---

## 📖 Full Documentation

See `TESTING_FLOW.md` for complete feature list and troubleshooting.

---

**Status**: Everything is ready. Click login and test! 🎉
