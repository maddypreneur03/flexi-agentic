# Cashfree Payment Integration Guide

## 🎉 Setup Complete!

Your checkout page is now integrated with Cashfree payment gateway.

---

## 📋 What's Been Done:

### ✅ Frontend Integration:
- Checkout page updated with Cashfree SDK
- Payment flow implemented
- Success page created
- Error handling added

### ✅ Files Created:
1. `checkout.html` - Updated with Cashfree integration
2. `success.html` - Payment success page
3. `backend-example.js` - Node.js backend example
4. `cashfree-handler.js` - Standalone payment handler

---

## 🔧 Backend Setup Required:

You need to deploy a backend API to handle order creation securely.

### Option 1: Node.js/Express (Recommended)

1. **Install dependencies:**
```bash
npm install express axios
```

2. **Deploy `backend-example.js` to your server**

3. **Update environment:**
```javascript
// In backend-example.js
const CASHFREE_CONFIG = {
    appId: '234045d6728c4d8904abbe258c540432',
    secretKey: '6e0e2ab958a833939003bd2d0f583fc0bca02096',
    baseUrl: 'https://api.cashfree.com/pg' // Production
};
```

4. **Update frontend:**
```javascript
// In checkout.html (line ~848)
const backendUrl = 'https://your-backend.com/api/create-order';
```

### Option 2: PHP Backend

```php
<?php
// create-order.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$CASHFREE_CONFIG = [
    'appId' => '234045d6728c4d8904abbe258c540432',
    'secretKey' => '6e0e2ab958a833939003bd2d0f583fc0bca02096',
    'baseUrl' => 'https://api.cashfree.com/pg'
];

$input = json_decode(file_get_contents('php://input'), true);

$orderId = 'ORDER_' . time() . '_' . bin2hex(random_bytes(5));

$payload = [
    'order_id' => $orderId,
    'order_amount' => $input['order_amount'],
    'order_currency' => $input['order_currency'],
    'customer_details' => $input['customer_details'],
    'order_meta' => $input['order_meta'],
    'order_note' => $input['order_note']
];

$ch = curl_init($CASHFREE_CONFIG['baseUrl'] . '/orders');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-version: 2023-08-01',
    'x-client-id: ' . $CASHFREE_CONFIG['appId'],
    'x-client-secret: ' . $CASHFREE_CONFIG['secretKey']
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo json_encode([
        'success' => true,
        'session_id' => $data['payment_session_id'],
        'order_id' => $data['order_id']
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to create order'
    ]);
}
?>
```

---

## 🔗 API Endpoints Needed:

### 1. Create Order
- **URL:** `/api/create-order`
- **Method:** POST
- **Request Body:**
```json
{
  "order_amount": 1.00,
  "order_currency": "INR",
  "customer_details": {
    "customer_id": "YOGA_1234567890",
    "customer_name": "Jane Doe",
    "customer_email": "jane@example.com",
    "customer_phone": "+919876543210"
  },
  "order_meta": {
    "return_url": "https://flexi.flexifunnels.co/pregnancy-yoga/success.html?order_id={order_id}",
    "payment_methods": "upi"
  },
  "order_note": "Dr. Monica Yoga - 7 Day Trial (₹1)",
  "order_tags": {
    "trimester": "second",
    "batch": "morning",
    "source": "website"
  }
}
```

- **Response:**
```json
{
  "success": true,
  "session_id": "session_abc123...",
  "order_id": "ORDER_1234567890_abc"
}
```

### 2. Webhook Handler (Optional but Recommended)
- **URL:** `/api/webhook`
- **Method:** POST
- **Cashfree will call this on payment status change**

---

## 🧪 Testing:

### Sandbox Mode (Testing):
1. Change environment to SANDBOX in checkout.html:
```javascript
const cashfree = await Cashfree({
    mode: 'SANDBOX' // Testing mode
});
```

2. Update backend baseUrl:
```javascript
baseUrl: 'https://sandbox.cashfree.com/pg'
```

3. Use Cashfree test cards:
- Card: 4111 1111 1111 1111
- CVV: 123
- Expiry: Any future date

### Production Mode:
1. Set mode to 'PROD' in frontend
2. Use production baseUrl: `https://api.cashfree.com/pg`
3. Test with real payment

---

## 📱 Payment Flow:

1. User fills checkout form
2. Clicks "Claim Your ₹1 Trial Now"
3. Frontend calls your backend `/api/create-order`
4. Backend creates Cashfree order, returns session_id
5. Frontend opens Cashfree payment modal
6. User completes payment (UPI/Card)
7. Cashfree redirects to success.html
8. Cashfree calls your webhook with payment status

---

## 🔐 Security Notes:

1. **Never expose secret key in frontend**
2. **Always create orders on backend**
3. **Verify webhook signatures**
4. **Use HTTPS in production**
5. **Store API keys as environment variables**

---

## 🎯 Next Steps:

1. ✅ Deploy backend API
2. ✅ Update `backendUrl` in checkout.html
3. ✅ Test in sandbox mode
4. ✅ Go live!

---

## 📞 Support:

**Cashfree Docs:** https://docs.cashfree.com/docs/payment-gateway  
**API Reference:** https://docs.cashfree.com/reference/pgcreateorder

---

## 🚀 URLs:

**Checkout:** https://flexi.flexifunnels.co/pregnancy-yoga/checkout  
**Success:** https://flexi.flexifunnels.co/pregnancy-yoga/success.html

---

**Happy integrating! 🎉**
