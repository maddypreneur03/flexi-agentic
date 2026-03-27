// Cashfree Payment Handler for Dr. Monica Yoga Checkout
// This is a simple client-side implementation
// For production, move order creation to your backend

const CASHFREE_CONFIG = {
    appId: '234045d6728c4d8904abbe258c540432',
    // Environment: 'SANDBOX' for testing, 'PROD' for live
    environment: 'PROD' // Change to 'SANDBOX' for testing
};

// Load Cashfree SDK
const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
        if (window.Cashfree) {
            resolve(window.Cashfree);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => resolve(window.Cashfree);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Create order and initiate payment
async function initiatePayment(formData) {
    try {
        // Load Cashfree SDK
        const Cashfree = await loadCashfreeSDK();
        
        // Initialize Cashfree
        const cashfree = await Cashfree({
            mode: CASHFREE_CONFIG.environment
        });
        
        // Prepare order data
        const orderData = {
            order_amount: 1.00, // ₹1
            order_currency: 'INR',
            customer_details: {
                customer_id: 'CUST_' + Date.now(),
                customer_name: formData.fullName,
                customer_email: formData.email,
                customer_phone: formData.phone
            },
            order_meta: {
                return_url: window.location.origin + '/pregnancy-yoga/success.html',
                notify_url: window.location.origin + '/pregnancy-yoga/webhook.php', // Your webhook endpoint
                payment_methods: formData.paymentMethod === 'upi' ? 'upi' : 'card,netbanking,wallet'
            },
            order_note: 'Dr. Monica Yoga - 7 Day Trial',
            order_tags: {
                trimester: formData.trimester,
                batch: formData.batch
            }
        };
        
        // IMPORTANT: In production, this should be done on your backend
        // For now, we'll create a session token directly (NOT RECOMMENDED FOR PRODUCTION)
        // You need to implement: POST to your backend → backend creates order → returns session_id
        
        // Temporary: Call your backend to create order
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create order');
        }
        
        const { session_id, order_id } = await response.json();
        
        // Initiate payment
        const checkoutOptions = {
            paymentSessionId: session_id,
            returnUrl: orderData.order_meta.return_url
        };
        
        cashfree.checkout(checkoutOptions).then((result) => {
            if (result.error) {
                console.error('Payment failed:', result.error);
                alert('Payment failed: ' + result.error.message);
            }
            if (result.paymentDetails) {
                console.log('Payment successful:', result.paymentDetails);
                // Redirect will be handled by Cashfree
            }
        });
        
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment initialization failed. Please try again.');
    }
}

// Export for use in checkout page
window.initiateCashfreePayment = initiatePayment;
