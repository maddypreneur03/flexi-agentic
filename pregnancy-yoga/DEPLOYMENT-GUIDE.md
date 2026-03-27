# 🚀 Serverless Backend Deployment Guide

## Cloudflare Workers Setup (FREE - No Credit Card Required!)

---

## ✅ **What You Get:**
- Free serverless backend
- No server management
- Automatic scaling
- Global CDN
- 100,000 requests/day FREE

---

## 📋 **Step-by-Step Deployment:**

### **Step 1: Create Cloudflare Account**

1. Go to: https://dash.cloudflare.com/sign-up
2. Sign up (FREE - no credit card needed)
3. Verify your email

### **Step 2: Create a Worker**

1. Go to: https://dash.cloudflare.com/
2. Click "Workers & Pages" in left sidebar
3. Click "Create Application"
4. Click "Create Worker"
5. Name it: `dr-monica-payment-api`
6. Click "Deploy"

### **Step 3: Add the Code**

1. After deployment, click "Edit Code"
2. Delete all existing code
3. Copy the entire contents of `cloudflare-worker.js`
4. Paste it into the editor
5. Click "Save and Deploy"

### **Step 4: Get Your Worker URL**

Your worker URL will be:
```
https://dr-monica-payment-api.YOUR-SUBDOMAIN.workers.dev
```

Example:
```
https://dr-monica-payment-api.maddypreneur.workers.dev
```

### **Step 5: Update Checkout Page**

In `checkout.html`, find line ~848 and update:

```javascript
// OLD:
const backendUrl = '/api/create-order';

// NEW:
const backendUrl = 'https://dr-monica-payment-api.YOUR-SUBDOMAIN.workers.dev/api/create-order';
```

Replace `YOUR-SUBDOMAIN` with your actual Cloudflare subdomain.

---

## 🧪 **Test Your Backend:**

### Test 1: Health Check
Open in browser:
```
https://dr-monica-payment-api.YOUR-SUBDOMAIN.workers.dev/api/health
```

You should see:
```json
{
  "status": "ok",
  "service": "Dr. Monica Yoga Payment API",
  "timestamp": "2026-03-27T05:44:00.000Z"
}
```

### Test 2: Create Order (via curl or Postman)
```bash
curl -X POST https://dr-monica-payment-api.YOUR-SUBDOMAIN.workers.dev/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "order_amount": 1.00,
    "order_currency": "INR",
    "customer_details": {
      "customer_id": "TEST_123",
      "customer_name": "Test User",
      "customer_email": "test@example.com",
      "customer_phone": "+919876543210"
    },
    "order_meta": {
      "return_url": "https://flexi.flexifunnels.co/pregnancy-yoga/success.html",
      "payment_methods": "upi"
    },
    "order_note": "Test Order"
  }'
```

Success response:
```json
{
  "success": true,
  "session_id": "session_abc123...",
  "order_id": "ORDER_1234567890_xyz"
}
```

---

## 🔒 **Security (IMPORTANT!):**

### Option 1: Use Wrangler Secrets (Recommended)

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Add secrets:
```bash
wrangler secret put CASHFREE_APP_ID
# Enter: 234045d6728c4d8904abbe258c540432

wrangler secret put CASHFREE_SECRET_KEY
# Enter: 6e0e2ab958a833939003bd2d0f583fc0bca02096
```

4. Update worker code to use secrets:
```javascript
const CASHFREE_CONFIG = {
    appId: env.CASHFREE_APP_ID,
    secretKey: env.CASHFREE_SECRET_KEY,
    // ...
};
```

### Option 2: Use Environment Variables (Dashboard)

1. Go to your Worker settings
2. Click "Variables and Secrets"
3. Add:
   - `CASHFREE_APP_ID` = `234045d6728c4d8904abbe258c540432`
   - `CASHFREE_SECRET_KEY` = `6e0e2ab958a833939003bd2d0f583fc0bca02096`
4. Update worker code same as above

---

## 🔗 **Custom Domain (Optional)**

Want to use `api.flexifunnels.co` instead of workers.dev?

1. Go to Workers & Pages
2. Click your worker
3. Click "Custom Domains"
4. Add: `api.flexifunnels.co`
5. Cloudflare will handle DNS automatically

Then your backend URL becomes:
```
https://api.flexifunnels.co/api/create-order
```

---

## 📊 **Monitor Your Backend:**

View logs and analytics:
1. Go to your Worker in dashboard
2. Click "Logs" tab
3. See real-time requests, errors, and performance

---

## 🎯 **Alternative: GitHub Pages + Cloudflare Workers**

Since your frontend is on GitHub Pages, this setup is perfect:

```
Frontend (GitHub Pages)
    ↓ API call
Backend (Cloudflare Worker)
    ↓ Creates order
Cashfree Payment Gateway
    ↓ Payment
Success Page (GitHub Pages)
```

Everything is serverless and FREE! 🎉

---

## 💡 **Quick Deploy Commands:**

If you want to deploy via CLI:

1. Install Wrangler:
```bash
npm install -g wrangler
```

2. Login:
```bash
wrangler login
```

3. Create wrangler.toml:
```toml
name = "dr-monica-payment-api"
main = "cloudflare-worker.js"
compatibility_date = "2024-01-01"

[vars]
CASHFREE_APP_ID = "234045d6728c4d8904abbe258c540432"
```

4. Deploy:
```bash
wrangler deploy
```

---

## 🆘 **Need Help?**

**Cloudflare Docs:** https://developers.cloudflare.com/workers/  
**Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/

---

## ✅ **Final Checklist:**

- [ ] Cloudflare account created
- [ ] Worker deployed with code
- [ ] Worker URL obtained
- [ ] checkout.html updated with Worker URL
- [ ] Tested `/api/health` endpoint
- [ ] Tested payment flow end-to-end
- [ ] (Optional) Added secrets for security
- [ ] (Optional) Set up custom domain

---

**Once deployed, your checkout page will work perfectly with Cashfree payments!** 🚀
