// Cloudflare Worker for Cashfree Payment Integration
// Deploy this to Cloudflare Workers (free tier)

// Cashfree Configuration
const CASHFREE_CONFIG = {
    appId: '234045d6728c4d8904abbe258c540432',
    secretKey: '6e0e2ab958a833939003bd2d0f583fc0bca02096',
    apiVersion: '2023-08-01',
    baseUrl: 'https://api.cashfree.com/pg'
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS request (CORS preflight)
function handleOptions() {
    return new Response(null, {
        headers: corsHeaders
    });
}

// Create Cashfree Order
async function createOrder(orderData) {
    const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const payload = {
        order_id: orderId,
        order_amount: orderData.order_amount,
        order_currency: orderData.order_currency,
        customer_details: orderData.customer_details,
        order_meta: {
            return_url: orderData.order_meta.return_url,
            notify_url: orderData.order_meta.notify_url || 'https://flexi.flexifunnels.co/api/webhook',
            payment_methods: orderData.order_meta.payment_methods
        },
        order_note: orderData.order_note || 'Dr. Monica Yoga - 7 Day Trial',
        order_tags: orderData.order_tags
    };
    
    const response = await fetch(`${CASHFREE_CONFIG.baseUrl}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-version': CASHFREE_CONFIG.apiVersion,
            'x-client-id': CASHFREE_CONFIG.appId,
            'x-client-secret': CASHFREE_CONFIG.secretKey
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cashfree API error: ${error}`);
    }
    
    const data = await response.json();
    
    return {
        success: true,
        session_id: data.payment_session_id,
        order_id: data.order_id
    };
}

// Handle Webhook
async function handleWebhook(request) {
    try {
        const body = await request.json();
        const signature = request.headers.get('x-webhook-signature');
        const timestamp = request.headers.get('x-webhook-timestamp');
        
        // In production, verify signature here
        // const signatureData = timestamp + JSON.stringify(body.data);
        // const expectedSignature = await crypto.subtle.sign(...);
        
        const { order } = body.data;
        
        console.log('Webhook received:', {
            orderId: order.order_id,
            status: order.order_status,
            amount: order.payment_amount
        });
        
        // TODO: Save to database or send to your CRM
        // For now, just log and acknowledge
        
        if (order.order_status === 'PAID') {
            // Send confirmation email/SMS
            // You can integrate with SendGrid, Twilio, etc.
        }
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// Main request handler
async function handleRequest(request) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return handleOptions();
    }
    
    // Route: Create Order
    if (url.pathname === '/api/create-order' && request.method === 'POST') {
        try {
            const orderData = await request.json();
            const result = await createOrder(orderData);
            
            return new Response(JSON.stringify(result), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Create order error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to create order',
                message: error.message
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
    
    // Route: Webhook
    if (url.pathname === '/api/webhook' && request.method === 'POST') {
        return handleWebhook(request);
    }
    
    // Route: Health Check
    if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
            status: 'ok',
            service: 'Dr. Monica Yoga Payment API',
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    
    // 404 for other routes
    return new Response('Not Found', {
        status: 404,
        headers: corsHeaders
    });
}

// Cloudflare Workers entry point
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// For local development with Wrangler
export default {
    async fetch(request) {
        return handleRequest(request);
    }
};
