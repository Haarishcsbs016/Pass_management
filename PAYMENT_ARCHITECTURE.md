# 💳 Payment Flow Architecture & Diagrams

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER REGISTRATION & LOGIN                  │
└──────────────┬────────────────────────────────────────────────┘
               │
               ▼
        ┌─────────────────┐
        │  User Dashboard │
        └────────┬────────┘
                 │
        ┌────────▼──────────┐
        │  Click: Apply     │
        │  for Pass         │
        └────────┬──────────┘
                 │
        ┌────────▼──────────────────────────────────────┐
        │     APPLICATION FORM PAGE                     │
        ├──────────────────────────────────────────────┤
        │  • Select Source (bangalore)                  │
        │  • Select Destination (chennai)              │
        │  • Select Duration (1-month)                 │
        │  • Upload Documents (1-3 files)              │
        │  • Click "Submit Application"                │
        │  ✓ Price calculated: ₹350                    │
        └────────┬──────────────────────────────────────┘
                 │
                 ▼ Backend Creates Pass
        ┌──────────────────────────────────┐
        │  DATABASE: Pass Created           │
        ├──────────────────────────────────┤
        │  status: "pending" ✅            │
        │  paymentStatus: "unpaid" ✅ NEW  │
        │  price: 350                      │
        │  documents: [...]                │
        │  _id: 507f1f77bcf86cd799439011  │
        └────────┬─────────────────────────┘
                 │
                 ▼ Return Pass ID
        ┌────────────────────────────────────────────┐
        │     🎯 REDIRECT TO PAYMENT PAGE 🎯 NEW   │
        │          /payment/{passId}                 │
        └────────┬────────────────────────────────────┘
                 │
                 ▼
     ╔════════════════════════════════════════════════╗
     ║                                                ║
     ║         💳 PAYMENT PAGE LOADED 💳 NEW        ║
     ║                                                ║
     ║  ┌──────────────────────────────────────────┐ ║
     ║  │  PASS DETAILS                            │ ║
     ║  ├──────────────────────────────────────────┤ ║
     ║  │  Route: bangalore → chennai              │ ║
     ║  │  Duration: 1 Month                       │ ║
     ║  │  Your Name: John Doe                     │ ║
     ║  │  Email: john@example.com                 │ ║
     ║  │  Phone: 9876543210                       │ ║
     ║  │                                          │ ║
     ║  │  STATUS BADGES:                          │ ║
     ║  │  Application: ⏳ Pending (for approval)  │ ║
     ║  │  Payment: ❌ Unpaid                      │ ║
     ║  │                                          │ ║
     ║  │  PRICE BREAKDOWN:                        │ ║
     ║  │  Base Price: ₹350                        │ ║
     ║  │  Duration: 1-month                       │ ║
     ║  │  ─────────────────                       │ ║
     ║  │  TOTAL: ₹350                             │ ║
     ║  │                                          │ ║
     ║  │  ┌─────────────────────────────────────┐ ║
     ║  │  │ 💳 PAY WITH RAZORPAY               │ ║
     ║  │  │ (Click to Open Checkout)           │ ║
     ║  │  └─────────────────────────────────────┘ ║
     ║  └──────────────────────────────────────────┘ ║
     ║                                                ║
     ╚════════════════════════════════════════════════╝
                 │
        User clicks "Pay with Razorpay"
                 │
                 ▼
        ┌──────────────────────────────────┐
        │  Backend: Create Razorpay Order  │
        │  POST /api/payment/create-order  │
        ├──────────────────────────────────┤
        │  Input: { passId, amount }       │
        │  Returns: {                      │
        │    orderId: "order_Aa00...",    │
        │    amount: 35000 (paise),       │
        │    keyId: "rzp_test_..."        │
        │  }                               │
        └────────┬────────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────────────────┐
        │    🎫 RAZORPAY CHECKOUT MODAL OPENS 🎫   │
        │                                            │
        │  ┌────────────────────────────────────┐   │
        │  │  RAZORPAY PAYMENT FORM             │   │
        │  ├────────────────────────────────────┤   │
        │  │  Order: order_Aa00...             │   │
        │  │  Amount: ₹350                     │   │
        │  │                                    │   │
        │  │  Card Details:                    │   │
        │  │  [4111 1111 1111 1111]           │   │
        │  │  [12/25] [123]                    │   │
        │  │  [Test User        ]              │   │
        │  │                                    │   │
        │  │  ┌──────────────────────────────┐ │   │
        │  │  │  💰 PAY ₹350                 │ │   │
        │  │  └──────────────────────────────┘ │   │
        │  │                                    │   │
        │  └────────────────────────────────────┘   │
        └────────┬────────────────────────────────┘
                 │
        User enters test card & clicks Pay
                 │
                 ▼
        ┌─────────────────────────────────────────┐
        │  Razorpay Processes Payment             │
        │  ✓ Validates card                       │
        │  ✓ Processes transaction                │
        │  ✓ Returns payment details              │
        │    - razorpay_order_id                  │
        │    - razorpay_payment_id                │
        │    - razorpay_signature                 │
        └────────┬────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────────────────┐
        │  Backend: Verify Payment Signature        │
        │  POST /api/payment/verify-payment         │
        ├────────────────────────────────────────────┤
        │  Algorithm: HMAC-SHA256                    │
        │  Input: order_id + "|" + payment_id       │
        │  Secret: RAZORPAY_KEY_SECRET              │
        │  ✓ Signature matches: VERIFIED ✅         │
        │  ✓ Update Pass document:                  │
        │    - paymentStatus: "unpaid" → "paid"    │
        │    - transactionId: payment_id stored    │
        │    - paymentDate: now()                  │
        │    - razorpayPaymentId: stored           │
        └────────┬───────────────────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────────────┐
        │  DATABASE: Pass Updated               │
        │  ✅ Transaction Stored                │
        ├──────────────────────────────────────┤
        │  paymentStatus: "paid" ✅            │
        │  transactionId: "pay_KZrKaMajBPj1o7" │
        │  paymentDate: 2024-04-15T11:00:00Z   │
        │  razorpayPaymentId: "pay_KZr..."     │
        │  razorpaySignature: "abcd1234xyz"    │
        └────────┬────────────────────────────┘
                 │
                 ▼ Frontend Callback
     ╔════════════════════════════════════════╗
     ║  ✅ PAYMENT SUCCESSFUL!               ║
     ║  Toast: "Payment verified             ║
     ║          successfully!"               ║
     ║                                        ║
     ║  Status Updated:                      ║
     ║  ✅ PAID                              ║
     ║                                        ║
     ║  [Auto-Redirect in 2 seconds...]     ║
     ╚════════════════────┬═══════════════════╝
                          │
                          ▼
        ┌──────────────────────────────────────┐
        │  /my-passes (User's Passes Page)     │
        │                                      │
        │  Pass Application Listed:            │
        │  ┌──────────────────────────────┐   │
        │  │ bangalore → chennai          │   │
        │  │ Duration: 1 Month            │   │
        │  │ Amount: ₹350                 │   │
        │  │ Status: ⏳ PENDING           │   │
        │  │ Payment: ✅ PAID ← NEW       │   │
        │  │                              │   │
        │  │ [View Details] [Download]    │   │
        │  └──────────────────────────────┘   │
        └──────────────────────────────────────┘
                          │
                          ▼
        ┌────────────────────────────────────────┐
        │  ADMIN DASHBOARD                       │
        │  ✓ Sees only PAID applications         │
        │  ✓ Can APPROVE or REJECT               │
        │                                        │
        │  Application Details:                 │
        │  - User: John Doe                     │
        │  - Payment Status: ✅ PAID            │
        │  - Documents: Verified ✓              │
        │  - Route: Valid ✓                     │
        │                                        │
        │  [Approve] [Reject with Reason]       │
        └────────┬───────────────────────────────┘
                 │
        Admin clicks "Approve"
                 │
                 ▼
        ┌────────────────────────────────────────┐
        │  DATABASE: Pass Status Updated         │
        │  status: "pending" → "approved" ✅    │
        ├────────────────────────────────────────┤
        │  passNumber: "TP20240001" (generated)  │
        │  approvedDate: 2024-04-15T11:05:00Z    │
        │  expiryDate: 2024-05-15T00:00:00Z      │
        └────────┬────────────────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────────────┐
        │  /my-passes (User's Passes Page)     │
        │                                      │
        │  Pass Application Updated:           │
        │  ┌──────────────────────────────┐   │
        │  │ bangalore → chennai          │   │
        │  │ Pass #: TP20240001           │   │
        │  │ Valid Till: 15 May 2024      │   │
        │  │ Status: ✅ APPROVED          │   │
        │  │ Payment: ✅ PAID             │   │
        │  │                              │   │
        │  │ [View Details] [Download ✅] │   │
        │  └──────────────────────────────┘   │
        └──────────────────────────────────────┘
                 │
                 ▼
        ┌──────────────────────────────────────┐
        │  USER CAN NOW DOWNLOAD PASS          │
        │  ✅ Complete Journey Done!           │
        └──────────────────────────────────────┘
```

---

## 🔐 Security Flow

```
PAYMENT VERIFICATION FLOW:

Frontend receives from Razorpay:
  - razorpay_order_id: "order_Aa00000000001"
  - razorpay_payment_id: "pay_Aa00000000001"
  - razorpay_signature: "abcd1234xyz..."
           │
           ▼ Send to Backend
           
Backend Signature Verification:
  ┌─────────────────────────────────────────────┐
  │ SECRET: RAZORPAY_KEY_SECRET (from .env)     │
  │ INPUT: "order_Aa00000000001|pay_Aa00000000001"
  │                                              │
  │ Algorithm: HMAC-SHA256                      │
  │ generated_sig = HMAC_SHA256(                │
  │   order_id + "|" + payment_id,              │
  │   RAZORPAY_KEY_SECRET                       │
  │ )                                            │
  │                                              │
  │ Compare:                                    │
  │ generated_sig == razorpay_signature ?       │
  │ ✅ YES → Payment Verified                   │
  │ ❌ NO  → Payment Rejected                   │
  └─────────────────────────────────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
SUCCESS        FAILURE
  │               │
  ▼               ▼
Update Pass    Log Error
  │               │
  ▼               ▼
paymentStatus  Return 400
= "paid"       with error
  │
  ▼
Save to DB
  │
  ▼
Return Success
to Frontend
  │
  ▼
Redirect to
My Passes
```

---

## 📊 Database State Changes

```
STEP 1: After Application Submission
┌────────────────────────────────────────┐
│ Pass Document Created                  │
├────────────────────────────────────────┤
│ {                                      │
│   _id: "507f1f77bcf86cd799439011",    │
│   userId: "507f1f77bcf86cd799439012", │
│   source: "bangalore",                 │
│   destination: "chennai",              │
│   duration: "1-month",                 │
│   price: 350,                          │
│   status: "pending",          ← Ready │
│   paymentStatus: "unpaid",    ← NEW   │
│   documents: [...],                    │
│   createdAt: 2024-04-15T10:30:00Z     │
│ }                                      │
└────────────────────────────────────────┘

STEP 2: After Payment Order Created
┌────────────────────────────────────────┐
│ Pass Document Updated                  │
├────────────────────────────────────────┤
│ {                                      │
│   ... (all above fields) ...           │
│   razorpayOrderId: "order_Aa00...",   │ ← NEW
│   paymentStatus: "pending",   ← Updated
│ }                                      │
└────────────────────────────────────────┘

STEP 3: After Successful Payment
┌────────────────────────────────────────┐
│ Pass Document Updated                  │
├────────────────────────────────────────┤
│ {                                      │
│   ... (all above fields) ...           │
│   paymentStatus: "paid",      ← Updated
│   transactionId: "pay_KZr...", ← NEW
│   razorpayPaymentId: "pay_...", ← NEW
│   razorpaySignature: "abcd1...", ← NEW
│   paymentDate: 2024-04-15T11:00:00Z, ← NEW
│   paymentMethod: "razorpay",  ← NEW
│ }                                      │
└────────────────────────────────────────┘

STEP 4: After Admin Approval
┌────────────────────────────────────────┐
│ Pass Document Updated                  │
├────────────────────────────────────────┤
│ {                                      │
│   ... (all above fields) ...           │
│   status: "approved",         ← Updated
│   passNumber: "TP20240001",   ← Generated
│   approvedDate: 2024-04-15T11:05:00Z ← NEW
│   expiryDate: 2024-05-15T00:00:00Z ← NEW
│ }                                      │
└────────────────────────────────────────┘
```

---

## 🚀 Component Architecture

```
FRONTEND COMPONENT TREE:

App.js
├── Routes
│   ├── Public Routes
│   │   ├── /login (Login.js)
│   │   └── /register (Login.js with initialMode)
│   │
│   ├── Protected User Routes
│   │   ├── /dashboard (Dashboard.js)
│   │   ├── /apply-pass (ApplyPass.js)
│   │   │   └── Redirects to → /payment/{passId}
│   │   │
│   │   ├── /payment/:passId (Payment.js) 🆕
│   │   │   ├── Loads Razorpay Script
│   │   │   ├── Fetches Pass Details
│   │   │   ├── Creates Order: POST /api/payment/create-order
│   │   │   ├── Opens Razorpay Modal
│   │   │   ├── Verifies Payment: POST /api/payment/verify-payment
│   │   │   └── Redirects to → /my-passes
│   │   │
│   │   ├── /my-passes (MyPasses.js)
│   │   └── /passes/:id (PassDetails.js)
│   │
│   └── Protected Admin Routes
│       ├── /admin/dashboard (AdminDashboard.js)
│       ├── /admin/passes (ManagePasses.js)
│       │   └── Shows only paymentStatus="paid" passes
│       └── /admin/routes (ManageRoutes.js)
```

---

## 🔗 API Call Flow

```
PAYMENT API SEQUENCE:

User Clicks "Pay with Razorpay"
         │
         ▼
Frontend: api.post('/payment/create-order', { passId, amount })
         │
         ├─ Request Headers: 
         │  ├─ Authorization: "Bearer {JWT_TOKEN}"
         │  └─ Content-Type: "application/json"
         │
         ├─ Request Body:
         │  ├─ passId: "507f1f77bcf86cd799439011"
         │  └─ amount: 350
         │
         ▼
Backend Endpoint: POST /api/payment/create-order (protected)
         │
         ├─ Verify JWT Token ✅
         ├─ Validate Pass exists ✅
         ├─ Verify Pass belongs to user ✅
         ├─ Create Razorpay Order ✅
         └─ Return: { orderId, amount, keyId, ... }
         │
         ▼
Frontend: Receives { orderId, keyId, ... }
         │
         ├─ Create Razorpay options
         │  ├─ key: keyId
         │  ├─ amount: amount (in paise)
         │  ├─ order_id: orderId
         │  └─ handler: handlePaymentSuccess
         │
         └─ new Razorpay(options).open()
         │
         ▼
Razorpay Modal Opens
         │
    ┌────┴────┐
    ▼         ▼
SUCCESS    FAILURE
    │         │
    ▼         ▼
Razorpay  handlePaymentDismiss
returns   called
payment   │
details   ▼
    │    api.post('/payment/failed', {...})
    │    │
    │    ▼
    │    Backend: Record failure ✅
    │
    ▼
handlePaymentSuccess called
with { order_id, payment_id, signature }
         │
         ▼
Frontend: api.post('/payment/verify-payment', 
          { order_id, payment_id, signature, passId })
         │
         ▼
Backend: POST /api/payment/verify-payment (protected)
         │
         ├─ Verify JWT Token ✅
         ├─ Verify Signature:
         │  ├─ Calculate HMAC-SHA256(order_id|payment_id)
         │  └─ Compare with received signature
         │     ├─ ✅ Match: Update Pass
         │     └─ ❌ No Match: Reject
         │
         ├─ Update Pass Document:
         │  ├─ paymentStatus: "paid"
         │  ├─ transactionId: payment_id
         │  └─ paymentDate: now()
         │
         └─ Return: { success: true, ... }
         │
         ▼
Frontend: Receives success response
         │
         ├─ Show success toast
         ├─ Update status badges
         └─ Auto-redirect to /my-passes (2 sec)
         │
         ▼
      DONE ✅
```

---

## 💾 Data Flow Diagram

```
REQUEST DATA FLOW:

User Form Input
└── Source: "bangalore"
└── Destination: "chennai" ─────────┐
└── Duration: "1-month"             │
└── Documents: [file1, file2, ...]  │
                                    │
         ┌──────────────────────────▼────────┐
         │ Frontend: ApplyPass Component     │
         └──────────────────────────────────┘
                  │
                  │ onSubmit(data)
                  │
         ┌────────▼──────────────────────────┐
         │ Create FormData                    │
         │ - append source                    │
         │ - append destination               │
         │ - append duration                  │
         │ - append documents (files)         │
         └────────┬──────────────────────────┘
                  │
                  │ POST /api/passes
                  │ Content-Type: multipart/form-data
                  │
         ┌────────▼──────────────────────────┐
         │ Backend: passController.js        │
         │ applyPass()                        │
         └────────┬──────────────────────────┘
                  │
                  ├─ Validate input ✅
                  ├─ Find route ✅
                  ├─ Calculate price ✅
                  ├─ Save files to /uploads ✅
                  └─ Create Pass document ✅
                  │
         ┌────────▼──────────────────────────┐
         │ MongoDB: passes collection        │
         │ Insert Pass document              │
         └────────┬──────────────────────────┘
                  │
                  │ Return: { _id, status, ... }
                  │
         ┌────────▼──────────────────────────┐
         │ Frontend: Receives PassID          │
         │ Navigate to /payment/{passId}     │
         └────────┬──────────────────────────┘
                  │
                  │ Payment Component loads
                  │
         ┌────────▼──────────────────────────┐
         │ Payment Component                  │
         │ - Fetch pass details               │
         │ - Display payment page             │
         │ - User clicks Pay                  │
         └────────┬──────────────────────────┘
                  │
                  │ Create Order Request:
                  │ { passId, amount }
                  │
         ┌────────▼──────────────────────────┐
         │ Backend: CREATE ORDER              │
         │ /api/payment/create-order          │
         └────────┬──────────────────────────┘
                  │
                  └─ Razorpay.orders.create()
                  │
         ┌────────▼──────────────────────────┐
         │ Razorpay Server                    │
         │ Creates order                      │
         │ Returns orderId, keyId             │
         └────────┬──────────────────────────┘
                  │
                  │ Frontend: Open Checkout
                  │
         ┌────────▼──────────────────────────┐
         │ Razorpay Checkout Modal            │
         │ User enters payment details        │
         │ Clicks Pay                         │
         └────────┬──────────────────────────┘
                  │
                  │ Razorpay processes payment
                  │
         ┌────────▼──────────────────────────┐
         │ Payment Success Callback           │
         │ handler(response)                  │
         │ response: {                        │
         │   razorpay_order_id,              │
         │   razorpay_payment_id,            │
         │   razorpay_signature              │
         │ }                                  │
         └────────┬──────────────────────────┘
                  │
                  │ Verify Payment Request:
                  │ { order_id, payment_id, signature }
                  │
         ┌────────▼──────────────────────────┐
         │ Backend: VERIFY PAYMENT            │
         │ /api/payment/verify-payment        │
         └────────┬──────────────────────────┘
                  │
                  ├─ Verify Signature ✅
                  ├─ Update Pass ✅
                  │  └─ paymentStatus: paid
                  └─ Return success
                  │
         ┌────────▼──────────────────────────┐
         │ MongoDB: Update Pass               │
         │ paymentStatus: "unpaid" → "paid"  │
         │ transactionId: stored              │
         └────────────────────────────────────┘
                  │
         ┌────────▼──────────────────────────┐
         │ Frontend: Success Response         │
         │ - Show success toast               │
         │ - Redirect to /my-passes           │
         │ - User sees "Payment: ✅ PAID"     │
         └────────────────────────────────────┘
```

---

This complete architecture ensures:
- ✅ **Secure**: Signature verification
- ✅ **Scalable**: Modular components
- ✅ **Maintainable**: Clear data flow
- ✅ **Testable**: Isolated endpoints
- ✅ **Fast**: Optimized queries

Ready to use in production! 🚀
