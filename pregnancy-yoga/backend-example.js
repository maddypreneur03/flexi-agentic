// Backend API Handler for Cashfree Integration
// Node.js / Express example
// Deploy this on your backend server

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Cashfree Credentials
const CASHFREE_CONFIG = {
    appId: '234045d6728c4d8904abbe258c540432',
    secretKey: '6e0e2ab958a833939003bd2d0f583fc0bca02096',
    apiVersion: '2023-08-01',
    // Use sandbox for testing
    baseUrl: 'https://api.cashfree.com/pg' // Production
    // baseUrl: 'https://sandbox.cashfree.com/pg' // Sandbox for testing
};

// Endpoint 1: Create Cashfree Order
app.post('/api/create-order', async (req, res) => {
    try {
        const {
            order_amount,
            order_currency,
            customer_details,
            order_meta,
            order_note,
            order_tags
        } = req.body;
        
        // Generate unique order ID
        const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Prepare Cashfree order payload
        const orderPayload = {
            order_id: orderId,
            order_amount: order_amount,
            order_currency: order_currency,
            customer_details: customer_details,
            order_meta: {
                return_url: order_meta.return_url,
                notify_url: order_meta.notify_url || `${req.protocol}://${req.get('host')}/api/webhook`,
                payment_methods: order_meta.payment_methods
            },
            order_note: order_note || 'Dr. Monica Yoga - 7 Day Trial',
            order_tags: order_tags
        };
        
        // Call Cashfree API to create order
        const response = await axios.post(
            `${CASHFREE_CONFIG.baseUrl}/orders`,
            orderPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-version': CASHFREE_CONFIG.apiVersion,
                    'x-client-id': CASHFREE_CONFIG.appId,
                    'x-client-secret': CASHFREE_CONFIG.secretKey
                }
            }
        );
        
        // Extract payment session ID
        const { payment_session_id, order_id } = response.data;
        
        // TODO: Save order details to your database
        // await saveOrderToDatabase({
        //     orderId: order_id,
        //     amount: order_amount,
        //     customerEmail: customer_details.customer_email,
        //     customerPhone: customer_details.customer_phone,
        //     status: 'INITIATED',
        //     createdAt: new Date()
        // });
        
        // Return session ID to frontend
        res.json({
            success: true,
            session_id: payment_session_id,
            order_id: order_id
        });
        
    } catch (error) {
        console.error('Cashfree order creation failed:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create order',
            message: error.response?.data?.message || error.message
        });
    }
});

// Endpoint 2: Webhook Handler (Cashfree will call this on payment status change)
app.post('/api/webhook', async (req, res) => {
    try {
        const { data } = req.body;
        
        // Verify webhook signature (IMPORTANT for security)
        const receivedSignature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        
        // Create signature for verification
        const signatureData = timestamp + JSON.stringify(data);
        const expectedSignature = crypto
            .createHmac('sha256', CASHFREE_CONFIG.secretKey)
            .update(signatureData)
            .digest('base64');
        
        if (receivedSignature !== expectedSignature) {
            console.error('Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }
        
        // Payment data
        const {
            order_id,
            order_status,
            payment_time,
            payment_completion_time,
            payment_amount,
            cf_payment_id
        } = data.order;
        
        console.log('Payment webhook received:', {
            orderId: order_id,
            status: order_status,
            amount: payment_amount,
            paymentId: cf_payment_id
        });
        
        // TODO: Update order status in your database
        // if (order_status === 'PAID') {
        //     await updateOrderStatus(order_id, 'PAID', cf_payment_id);
        //     
        //     // Send confirmation email/SMS to customer
        //     await sendConfirmationEmail(order_id);
        //     
        //     // Activate trial membership
        //     await activateTrialMembership(order_id);
        // }
        
        // Acknowledge webhook
        res.json({ success: true });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Endpoint 3: Verify Payment (optional - for frontend to double-check)
app.get('/api/verify-payment/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Call Cashfree API to get order status
        const response = await axios.get(
            `${CASHFREE_CONFIG.baseUrl}/orders/${orderId}`,
            {
                headers: {
                    'x-api-version': CASHFREE_CONFIG.apiVersion,
                    'x-client-id': CASHFREE_CONFIG.appId,
                    'x-client-secret': CASHFREE_CONFIG.secretKey
                }
            }
        );
        
        const { order_status, payment_link, order_amount } = response.data;
        
        res.json({
            success: true,
            order_id: orderId,
            status: order_status,
            amount: order_amount,
            isPaid: order_status === 'PAID'
        });
        
    } catch (error) {
        console.error('Payment verification failed:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Cashfree backend running on port ${PORT}`);
});

module.exports = app;
