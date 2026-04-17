# Payment Demo Guide

Use this when you need to show a full payment flow without real gateway credentials.

## 1) Enable Demo Mode

Set these values before starting the app:

Backend env (`backend/.env`):

```env
PAYMENT_DEMO_MODE=true
```

Frontend env (`frontend/.env`):

```env
REACT_APP_PAYMENT_DEMO_MODE=true
```

You can keep existing Razorpay keys as-is. In demo mode, real checkout is skipped.

## 2) Start App

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

## 3) Demo Script (Presenter Flow)

1. Login as a normal user.
2. Apply for a pass.
3. You will land on the payment page.
4. Click **Pay in Demo Mode**.
5. Payment status becomes **Paid** and user is redirected to **My Passes**.
6. Open the pass details and show payment status is saved.

## 4) What Demo Mode Does

- Creates a synthetic order ID (`demo_order_<timestamp>`)
- Verifies with a synthetic payment ID (`demo_pay_<timestamp>`)
- Updates pass payment fields in DB exactly like real flow
- Keeps all auth and pass ownership checks enabled

## 5) Return to Real Gateway

Disable demo mode:

- Remove or set `PAYMENT_DEMO_MODE=false`
- Remove or set `REACT_APP_PAYMENT_DEMO_MODE=false`

Restart backend and frontend.