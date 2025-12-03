#!/usr/bin/env node

/**
 * Generate ed25519 Key Pair for ONDC
 * 
 * ONDC requires ed25519 keys for cryptographic signing.
 * This script generates a proper key pair.
 */

const crypto = require('crypto');
const fs = require('fs');

console.log('🔐 Generating ed25519 Key Pair for ONDC...\n');

// Generate ed25519 key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
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
fs.writeFileSync('ondc_ed25519_private.pem', privateKey);
fs.writeFileSync('ondc_ed25519_public.pem', publicKey);

console.log('✅ Keys generated successfully!\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📋 PRIVATE KEY (Keep Secret - For Your Server Only)');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(privateKey);

console.log('═══════════════════════════════════════════════════════════════');
console.log('📋 PUBLIC KEY (Share with ONDC During Registration)');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(publicKey);

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 Next Steps:');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1. SET VERCEL ENVIRONMENT VARIABLES:');
console.log('   Go to: Vercel Dashboard > Settings > Environment Variables\n');

console.log('   ONDC_SIGNING_PRIVATE_KEY:');
console.log('   Copy the PRIVATE KEY above (replace \\n with actual newlines):\n');
console.log('   ' + privateKey.replace(/\n/g, '\\n'));
console.log('\n   ONDC_SIGNING_PUBLIC_KEY:');
console.log('   Copy the PUBLIC KEY above (replace \\n with actual newlines):\n');
console.log('   ' + publicKey.replace(/\n/g, '\\n'));

console.log('\n   ONDC_UNIQUE_KEY_ID:');
console.log('   Set to a unique identifier (e.g., ontheline-prod-key-1)\n');

console.log('2. REGISTER WITH ONDC:');
console.log('   - Follow instructions in ONDC_REGISTRATION.md');
console.log('   - Submit the PUBLIC KEY during registration');
console.log('   - Wait for approval (2-7 business days)\n');

console.log('3. REDEPLOY:');
console.log('   After updating environment variables, trigger a new deployment\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('⚠️  SECURITY NOTES:');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('- NEVER commit these keys to git');
console.log('- Keep the private key secure');
console.log('- Only share the public key with ONDC');
console.log('- Delete the .pem files after copying to Vercel\n');

console.log('Files saved:');
console.log('  - ondc_ed25519_private.pem');
console.log('  - ondc_ed25519_public.pem\n');

