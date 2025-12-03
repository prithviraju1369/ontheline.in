#!/usr/bin/env node

/**
 * Generate RSA Key Pair for ONDC (Serverless-Compatible)
 * 
 * RSA keys work reliably in all environments including serverless.
 * ed25519 has compatibility issues with Vercel's Node.js runtime.
 */

const crypto = require('crypto');
const fs = require('fs');

console.log('🔐 Generating RSA-2048 Key Pair for ONDC...\n');

// Generate RSA key pair (2048-bit)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Save to files
fs.writeFileSync('ondc_rsa_private.pem', privateKey);
fs.writeFileSync('ondc_rsa_public.pem', publicKey);

console.log('✅ RSA Keys generated successfully!\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📋 PRIVATE KEY (Keep Secret - For Your Server Only)');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(privateKey);

console.log('═══════════════════════════════════════════════════════════════');
console.log('📋 PUBLIC KEY (Share with ONDC During Registration)');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(publicKey);

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 VERCEL ENVIRONMENT VARIABLES');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Copy these to Vercel Dashboard > Settings > Environment Variables:\n');

console.log('1. ONDC_SIGNING_PRIVATE_KEY:');
console.log('   ' + privateKey.replace(/\n/g, '\\n'));

console.log('\n2. ONDC_SIGNING_PUBLIC_KEY:');
console.log('   ' + publicKey.replace(/\n/g, '\\n'));

console.log('\n3. ONDC_UNIQUE_KEY_ID:');
console.log('   ontheline-prod-key-1');

console.log('\n4. ONDC_SUBSCRIBER_ID:');
console.log('   ontheline.in/buyer-app');

console.log('\n5. ONDC_SUBSCRIBER_URI:');
console.log('   https://ontheline.vercel.app (or your actual domain)');

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('✅ WHY RSA INSTEAD OF ED25519?');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('• RSA-SHA256 works reliably in ALL environments');
console.log('• ed25519 has compatibility issues with Vercel serverless');
console.log('• ONDC accepts multiple algorithms including RSA-SHA256');
console.log('• RSA-2048 provides strong security for production use\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📝 NEXT STEPS');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('1. Update the 5 environment variables above in Vercel');
console.log('2. Redeploy your app (automatic after env var update)');
console.log('3. Test the search endpoint');
console.log('4. Register with ONDC using the PUBLIC KEY');
console.log('5. Wait for ONDC approval (2-7 business days)\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('⚠️  SECURITY NOTES');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('• NEVER commit these keys to git');
console.log('• Keep the private key secure');
console.log('• Only share the public key with ONDC');
console.log('• Delete the .pem files after copying to Vercel\n');

console.log('Files saved:');
console.log('  - ondc_rsa_private.pem');
console.log('  - ondc_rsa_public.pem\n');

