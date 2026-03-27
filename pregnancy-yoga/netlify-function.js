// Netlify Function for Cashfree Payment Integration
// Place this file in: netlify/functions/create-order.js

const https = require('https');

const CASHFREE_CONFIG = {
    appId: process.env.CASHFREE_APP_ID || '234045d6728c4d8904abbe258c540432',
    secretKey: process.env.CASHFREE_SECRET_KEY || '6e0e2ab958a833939003bd2d0f583fc0bca02096',
    apiVersion: '2023-08-01',
    baseUrl: 'api.cashfree.com'
};

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle OPTIONS (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const orderData = JSON.parse(event.body);
        
        // Generate unique order ID
        const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const payload = {
            order_id: orderId,
            order_amount: orderData.order_amount,
            order_currency: orderData.order_currency,
            customer_details: orderData.customer_details,
            order_meta: {
                return_url: orderData.order_meta.return_url,
                notify_url: orderData.order_meta.notify_url || 'https://flexi.flexifunnels.co/.netlify/functions/webhook',
                payment_methods: orderData.order_meta.payment_methods
            },
            order_note: orderData.order_note || 'Dr. Monica Yoga - 7 Day Trial',
            order_tags: orderData.order_tags
        };
        
        // Make request to Cashfree
        const result = await callCashfreeAPI('/pg/orders', payload);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                session_id: result.payment_session_id,
                order_id: result.order_id
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to create order',
                message: error.message
            })
        };
    }
};

function callCashfreeAPI(path, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: CASHFREE_CONFIG.baseUrl,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'x-api-version': CASHFREE_CONFIG.apiVersion,
                'x-client-id': CASHFREE_CONFIG.appId,
                'x-client-secret': CASHFREE_CONFIG.secretKey
            }
        };
        
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(new Error(`Cashfree API error: ${body}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}
