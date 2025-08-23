# GlucoBalance Development Server Setup

## 🚀 Quick Start

### Option 1: Using Node.js (Recommended)
```bash
# Start the development server
node server.js

# Or use npm scripts
npm start
npm run dev
npm run server
```

### Option 2: Using Startup Scripts

**Windows:**
```cmd
# Double-click or run in command prompt
start-server.bat
```

**Linux/Mac:**
```bash
# Make executable and run
chmod +x start-server.sh
./start-server.sh
```

### Option 3: Using npm with specific ports
```bash
# Default port 8080
npm run serve:8080

# Port 3000
npm run serve:3000

# Port 5000
npm run serve:5000
```

## 📱 Accessing the Application

Once the server is running, you can access:

- **Main Application**: http://localhost:8080/
- **Test Pages**: http://localhost:8080/test-*.html
- **Verification Pages**: http://localhost:8080/verify-*.html

### Key URLs:
- 🏠 **Home**: http://localhost:8080/
- 🧪 **Take Assessment Test**: http://localhost:8080/test-take-assessment-integration.html
- 💙 **Mood Tracker Test**: http://localhost:8080/test-mood-tracker-complete.html
- 🎛️ **Dashboard Test**: http://localhost:8080/test-complete-dashboard-functionality.html

## 🛠️ Server Features

### Development-Friendly
- ✅ Automatic MIME type detection
- ✅ Security headers for development
- ✅ CORS enabled for API testing
- ✅ SPA routing support (falls back to index.html)
- ✅ Detailed error pages
- ✅ Directory traversal protection

### File Support
- 📄 HTML, CSS, JavaScript
- 🖼️ Images (PNG, JPG, SVG, WebP, ICO)
- 🔤 Fonts (WOFF, WOFF2, TTF, EOT)
- 📋 JSON, XML, WebManifest
- 🎨 All static assets

## 🔧 Configuration

### Environment Variables
```bash
# Set custom port
PORT=3000 node server.js

# Set custom host
HOST=0.0.0.0 node server.js

# Both
PORT=3000 HOST=0.0.0.0 node server.js
```

### Default Settings
- **Port**: 8080
- **Host**: localhost
- **Root**: Current directory
- **Index**: index.html

## 🚨 Troubleshooting

### Port Already in Use
```
❌ Port 8080 is already in use.
```

**Solutions:**
1. Use a different port: `PORT=3000 node server.js`
2. Kill the process using port 8080
3. Wait a moment and try again

### Node.js Not Found
```
❌ Node.js is not installed or not in PATH
```

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart your terminal/command prompt
3. Verify with `node --version`

### File Not Found Errors
- Check that `index.html` exists in the root directory
- Verify file paths are correct
- Ensure no typos in URLs

## 🌐 Network Access

### Local Network Access
To access from other devices on your network:

1. Start server with host binding:
   ```bash
   HOST=0.0.0.0 node server.js
   ```

2. Find your IP address:
   - **Windows**: `ipconfig`
   - **Linux/Mac**: `ifconfig` or `ip addr`

3. Access from other devices:
   ```
   http://YOUR_IP_ADDRESS:8080/
   ```

### Security Note
The development server includes basic security headers but is **NOT** intended for production use.

## 📋 Alternative Server Options

### Python HTTP Server
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

### Live Server (VS Code Extension)
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### http-server (npm package)
```bash
# Install globally
npm install -g http-server

# Run
http-server -p 8080
```

## 🎯 Testing the Application

### Core Features to Test
1. **Landing Page**: Registration and login
2. **Dashboard**: All cards and navigation
3. **Risk Assessment**: WHO/ADA questionnaire
4. **Mood Tracker**: Daily mood logging
5. **Nutrition**: Meal plan generation
6. **Progress**: Charts and analytics

### Test Files
- `test-take-assessment-integration.html` - Assessment integration
- `test-mood-tracker-complete.html` - Mood tracking features
- `test-complete-dashboard-functionality.html` - Dashboard functionality
- `verify-all-fixes.html` - Overall system verification

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all files are present
3. Ensure Node.js is properly installed
4. Try a different port if 8080 is busy
5. Check network connectivity

## 🎉 Success!

When everything is working, you should see:
- ✅ Server startup message with URLs
- ✅ GlucoBalance landing page loads
- ✅ No console errors
- ✅ All features functional

Happy developing! 🚀