// Test du processus de checkout frontend
// Simuler les erreurs potentielles dans le navigateur

console.log('🔍 DEBUGGING FRONTEND CHECKOUT PROCESS');

// 1. Test de l'API avec fetch
async function testAPI() {
    const API_URL = 'http://127.0.0.1:8000/api';
    
    console.log('\n--- Test connexion API ---');
    
    // Test 1: Health check
    try {
        const response = await fetch('http://127.0.0.1:8000/health/');
        const data = await response.json();
        console.log('✅ Health check:', data);
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return false;
    }
    
    // Test 2: Produits
    try {
        const response = await fetch(`${API_URL}/products/`);
        const data = await response.json();
        console.log('✅ Products API:', data.count, 'products found');
    } catch (error) {
        console.error('❌ Products API failed:', error);
    }
    
    // Test 3: Authentification
    const loginData = {
        email: 'test2@example.com',
        password: 'testpass123'
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Login successful, token received');
        
        const token = data.access;
        
        // Test 4: Créer une commande
        const orderData = {
            shipping_name: "Test Frontend User",
            shipping_phone: "221700000001",
            shipping_address: "123 Frontend Test Street", 
            shipping_city: "Dakar",
            shipping_country: "Sénégal",
            notes: "Frontend test order",
            items: [
                {product_id: 1, quantity: 1}
            ]
        };
        
        console.log('\n--- Test création commande ---');
        console.log('Order data:', orderData);
        
        const orderResponse = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            console.error('❌ Order creation failed:', errorText);
            return false;
        }
        
        const orderResult = await orderResponse.json();
        console.log('✅ Order created:', orderResult.id, orderResult.reference);
        
        // Test 5: Initier paiement
        const paymentData = {
            order_id: orderResult.id,
            method: 'wave',
            phone_number: '221700000001'
        };
        
        console.log('\n--- Test initiation paiement ---');
        console.log('Payment data:', paymentData);
        
        const paymentResponse = await fetch(`${API_URL}/payments/initiate/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        
        if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            console.error('❌ Payment initiation failed:', errorText);
            return false;
        }
        
        const paymentResult = await paymentResponse.json();
        console.log('✅ Payment initiated:', paymentResult);
        
        return true;
        
    } catch (error) {
        console.error('❌ Authentication failed:', error);
        return false;
    }
}

// 2. Test des erreurs courantes dans React
function testCommonErrors() {
    console.log('\n--- Test erreurs courantes React ---');
    
    // Test localStorage
    try {
        localStorage.setItem('test', 'value');
        localStorage.getItem('test');
        localStorage.removeItem('test');
        console.log('✅ localStorage works');
    } catch (error) {
        console.error('❌ localStorage error:', error);
    }
    
    // Test fetch API
    if (typeof fetch === 'undefined') {
        console.error('❌ Fetch API not available');
    } else {
        console.log('✅ Fetch API available');
    }
    
    // Test CORS
    console.log('Current origin:', window.location.origin);
}

// 3. Test configuration Paytech
function testPaytechConfig() {
    console.log('\n--- Test configuration Paytech ---');
    
    // Ces valeurs devraient être dans les variables d'environnement backend
    const paytechConfig = {
        api_url: 'https://paytech.sn/api', // ou sandbox
        api_key: 'PAYTECH_API_KEY',
        api_secret: 'PAYTECH_API_SECRET',
        env: 'sandbox'  // ou production
    };
    
    console.log('Configuration Paytech attendue:', paytechConfig);
    console.log('⚠️  Vérifiez que ces variables sont définies dans le backend:');
    console.log('   - PAYTECH_API_KEY');
    console.log('   - PAYTECH_API_SECRET'); 
    console.log('   - PAYTECH_API_URL');
    console.log('   - PAYTECH_ENV');
}

// 4. Test configuration PWA
function testPWAConfig() {
    console.log('\n--- Test configuration PWA ---');
    
    // Test service worker
    if ('serviceWorker' in navigator) {
        console.log('✅ Service Worker API available');
        
        navigator.serviceWorker.getRegistrations().then(registrations => {
            if (registrations.length > 0) {
                console.log('✅ Service Workers registered:', registrations.length);
            } else {
                console.log('ℹ️  No service workers registered');
            }
        });
    } else {
        console.log('❌ Service Worker API not available');
    }
    
    // Test manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
        console.log('✅ Manifest link found:', manifestLink.href);
    } else {
        console.log('❌ No manifest link found');
    }
    
    // Test PWA install prompt
    if ('beforeinstallprompt' in window) {
        console.log('✅ PWA install prompt available');
    } else {
        console.log('ℹ️  PWA install prompt not available (normal on desktop)');
    }
}

// Exécuter tous les tests
async function runAllTests() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                 TEST DIAGNOSTIC FRONTEND                      ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    
    testCommonErrors();
    testPWAConfig();
    testPaytechConfig();
    
    const apiWorking = await testAPI();
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 RÉSULTATS DU DIAGNOSTIC');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (apiWorking) {
        console.log('✅ L\'API backend fonctionne correctement');
        console.log('✅ Le processus de commande fonctionne');
        console.log('\n💡 Si vous voyez "erreur lors de la commande" dans l\'interface:');
        console.log('   1. Vérifiez la console du navigateur (F12)');
        console.log('   2. Vérifiez l\'authentification (token valide)');
        console.log('   3. Vérifiez les CORS (origine autorisée)');
        console.log('   4. Vérifiez les variables d\'environnement Paytech');
    } else {
        console.log('❌ Problème détecté avec l\'API backend');
        console.log('   → Vérifiez que le serveur Django tourne sur le port 8000');
        console.log('   → Vérifiez la configuration CORS');
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
}

// Auto-exécution si dans un navigateur
if (typeof window !== 'undefined') {
    runAllTests();
} else {
    console.log('Ce script doit être exécuté dans la console du navigateur');
}