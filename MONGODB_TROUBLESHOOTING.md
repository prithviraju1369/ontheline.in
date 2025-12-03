# MongoDB Connection Troubleshooting Guide

## 🚨 **Error: "Operation buffering timed out after 10000ms"**

This error means your Vercel serverless function **cannot connect to MongoDB** within the timeout period.

---

## 🎓 **Understanding the Problem**

### What's Happening:

```
Vercel Function Starts
       ↓
Tries to connect to MongoDB
       ↓
Waits... waits... waits...
       ↓
10 seconds pass
       ↓
❌ Timeout! Operation fails
```

### Why It Happens in Serverless:

1. **Cold starts**: Every new function instance must establish a connection
2. **Network latency**: Connection from Vercel → MongoDB Atlas takes time
3. **Blocked connections**: MongoDB Atlas may reject the connection
4. **Missing environment variables**: No connection string provided

---

## ✅ **Solution Checklist**

### Step 1: Verify MONGODB_URI is Set in Vercel

**Check in Vercel Dashboard:**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click: **Settings** → **Environment Variables**
4. Look for: `MONGODB_URI`

**Should see:**
```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname
```

**If missing:**
```
Click "Add New" →
Name: MONGODB_URI
Value: [your MongoDB Atlas connection string]
Environment: Production, Preview (check both)
Save → Redeploy
```

---

### Step 2: Get Correct MongoDB Atlas Connection String

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/

2. **Click "Connect" on your cluster**

3. **Choose "Connect your application"**

4. **Copy the connection string**:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

5. **Replace placeholders**:
   - `<username>` → Your database user
   - `<password>` → User's password (NOT your Atlas login password!)
   - `<dbname>` → Your database name (e.g., `ondc_buyer_app`)

**Example:**
```
mongodb+srv://myuser:myP@ssw0rd@cluster0.abc123.mongodb.net/ondc_buyer_app?retryWrites=true&w=majority
```

**⚠️ Common Mistakes:**
- Using Atlas login password instead of database user password
- Forgetting to replace `<password>` placeholder
- Missing database name
- Special characters in password not URL-encoded

---

### Step 3: Configure MongoDB Atlas IP Whitelist

**This is the #1 cause of connection timeouts!**

1. **In MongoDB Atlas, go to**: Network Access (left sidebar)

2. **Click**: "Add IP Address"

3. **Choose**: "Allow Access from Anywhere"
   ```
   0.0.0.0/0
   ```

4. **Click**: "Confirm"

**Why this is needed:**
- Vercel functions run on many different IP addresses
- These IPs change dynamically
- You cannot whitelist specific Vercel IPs
- `0.0.0.0/0` allows all IPs (safe with strong password)

**Security concerns?**
```
✅ Safe because:
- Strong password required
- MongoDB authentication still enforced
- TLS/SSL encryption used
- Only your database user can connect

❌ Unsafe alternatives:
- Trying to whitelist specific IPs (won't work, IPs change)
- Using weak passwords (never do this!)
```

---

### Step 4: Verify Database User Exists

1. **In MongoDB Atlas**: Database Access (left sidebar)

2. **Check your user exists**:
   - Username: `myuser`
   - Database: Built-in Role → `readWrite` on your database

3. **If missing, create one**:
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and **strong** password
   - Built-in Role: `Read and write to any database`
   - Click "Add User"

**⚠️ Important:**
- Remember this password - you'll need it in the connection string
- Don't use special characters that need URL encoding (or encode them)

**URL Encoding for Special Characters:**
```
! → %21
# → %23
$ → %24
% → %25
& → %26
@ → %40
```

Example:
```
Password: myP@ss!
Encoded:  myP%40ss%21
```

---

### Step 5: Redeploy After Changes

**Critical:** Vercel must redeploy for environment variable changes to take effect!

**Option A: Via Dashboard**
1. Go to: Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

**Option B: Via Git**
```bash
git commit --allow-empty -m "Trigger redeployment"
git push origin main
```

**Option C: Via CLI**
```bash
vercel --prod
```

---

## 🔍 **Debugging Steps**

### Debug 1: Check Environment Variable in Vercel Logs

Look for this in your Vercel Function logs:

```json
{
  "error": "MONGODB_URI environment variable is not set"
}
```

If you see this → MONGODB_URI is not set in Vercel Dashboard

---

### Debug 2: Test Connection Locally

```bash
# Create a test file
node << 'EOF'
require('dotenv').config();
const mongoose = require('mongoose');

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set ✅' : 'NOT SET ❌');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ Connected successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
EOF
```

---

### Debug 3: Verify Connection String Format

**Test your connection string format:**

```javascript
const connectionString = process.env.MONGODB_URI;

// Should start with:
if (!connectionString.startsWith('mongodb+srv://')) {
  console.error('❌ Should start with mongodb+srv://');
}

// Should contain:
if (!connectionString.includes('@')) {
  console.error('❌ Missing @ separator');
}

if (!connectionString.includes('.mongodb.net')) {
  console.error('❌ Should include .mongodb.net');
}

// Extract parts
const match = connectionString.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
if (match) {
  const [_, username, password, cluster, database] = match;
  console.log('✅ Username:', username);
  console.log('✅ Password:', password.length > 0 ? '[SET]' : '[EMPTY]');
  console.log('✅ Cluster:', cluster);
  console.log('✅ Database:', database);
}
```

---

### Debug 4: Check MongoDB Atlas Cluster Status

1. **In MongoDB Atlas Dashboard**
2. **Look at your cluster**
3. **Check status**:
   - ✅ Green = Active (good!)
   - ⚠️ Yellow = Paused (must resume!)
   - ❌ Red = Error (check notifications)

**If paused:**
- Free tier clusters pause after inactivity
- Click "Resume" to activate
- Wait 1-2 minutes for cluster to start
- Then redeploy your Vercel app

---

## 🛠️ **Common Error Messages & Solutions**

### Error: "MongoServerSelectionError"

**Cause:** Cannot reach MongoDB server

**Solutions:**
1. Check IP whitelist (0.0.0.0/0)
2. Verify cluster is not paused
3. Check internet connectivity
4. Verify cluster exists and is running

---

### Error: "Authentication failed"

**Cause:** Wrong username or password

**Solutions:**
1. Verify database user exists in Atlas
2. Check password is correct (NOT Atlas login password)
3. Check for special characters (URL encode them)
4. Recreate database user if unsure

---

### Error: "Could not connect to any servers"

**Cause:** DNS or network issue

**Solutions:**
1. Use `mongodb+srv://` (not `mongodb://`)
2. Check cluster URL is correct
3. Verify `.mongodb.net` domain in connection string

---

### Error: "Connection string is invalid"

**Cause:** Malformed connection string

**Solutions:**
1. Get fresh connection string from Atlas
2. Check all placeholders are replaced
3. Verify no extra spaces or line breaks
4. Test with: `new URL(connectionString)`

---

## 📊 **Connection Optimization for Serverless**

### Our Implementation:

```javascript
// Key optimizations in server/utils/database.js:

1. bufferCommands: false
   → Fail fast instead of buffering (better for serverless)

2. serverSelectionTimeoutMS: 5000
   → 5 second timeout (vs 30s default)
   → Fits within Vercel 10s function limit

3. Connection caching
   → Reuse connection across warm invocations
   → Reduces cold start impact

4. Per-request connection
   → Ensure connection before processing
   → Graceful error handling
```

---

## 🎯 **Verification Steps**

After fixing, verify everything works:

### Test 1: Health Check

```bash
curl https://your-app.vercel.app/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-03T...",
  "database": "connected",
  "environment": "production"
}
```

---

### Test 2: Database Health Check

```bash
curl https://your-app.vercel.app/api/health/db
```

**Expected:**
```json
{
  "status": "ok",
  "database": {
    "state": "connected",
    "readyState": 1,
    "host": "cluster0-shard-00-00.xxxxx.mongodb.net:27017",
    "name": "ondc_buyer_app",
    "cached": true
  },
  "timestamp": "2025-12-03T..."
}
```

---

### Test 3: Make an API Call

```bash
# Test registration
curl https://your-app.vercel.app/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "phone": "1234567890"
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**NOT expected:**
```json
{
  "error": "Service temporarily unavailable",
  "message": "Unable to connect to database"
}
```

---

## 🔒 **Security Best Practices**

### DO:
- ✅ Use strong database passwords (16+ characters, mixed case, numbers, symbols)
- ✅ Use different passwords for dev/prod
- ✅ Rotate database passwords every 90 days
- ✅ Use environment variables for credentials
- ✅ Enable MongoDB Atlas audit logs (paid tier)
- ✅ Restrict database user to specific database (not admin)

### DON'T:
- ❌ Commit connection strings to git
- ❌ Use weak passwords
- ❌ Share database users across environments
- ❌ Give unnecessary privileges to database users
- ❌ Disable IP whitelist completely without strong passwords

---

## 📈 **Performance Monitoring**

### In Vercel Dashboard:

1. **Go to**: Functions tab
2. **Look for**:
   - Invocation count
   - Error rate
   - Duration (should be < 1s for warm starts)
   - Cold start duration (can be 2-5s)

### In MongoDB Atlas:

1. **Go to**: Metrics tab
2. **Monitor**:
   - Connections (should stabilize)
   - Operations per second
   - Query performance
   - Network usage

**Warning signs:**
- ⚠️ Connection count keeps growing (connection leak)
- ⚠️ High error rate (connection issues)
- ⚠️ Slow queries (need indexes)

---

## 🆘 **Still Having Issues?**

### Collect this information:

1. **Vercel Function Logs:**
   ```
   Vercel Dashboard → Your Project → Logs → Functions
   Copy the full error message
   ```

2. **MongoDB Atlas Logs:**
   ```
   Atlas Dashboard → Your Cluster → ... → View Monitoring
   Check connection attempts
   ```

3. **Environment Variables:**
   ```bash
   # What's set:
   vercel env ls
   
   # Pull to verify:
   vercel env pull .env.local
   cat .env.local | grep MONGODB_URI
   ```

4. **Connection String (redacted):**
   ```javascript
   // Mask password before sharing
   console.log(
     process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//USER:****@')
   );
   ```

---

## 📚 **Additional Resources**

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Mongoose Connection Guide](https://mongoosejs.com/docs/connections.html)
- [Serverless MongoDB Best Practices](https://www.mongodb.com/developer/products/atlas/serverless-development-atlas-best-practices/)

---

**Remember**: 
1. Set `MONGODB_URI` in Vercel Dashboard
2. Whitelist 0.0.0.0/0 in MongoDB Atlas
3. Redeploy after changes
4. Test with `/api/health/db` endpoint

