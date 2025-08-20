# 🚀 Deployment Guide - SpamGuard Pro

This guide covers deploying SpamGuard Pro to various hosting platforms.

## 🌐 **Deployment Options**

### **Option 1: Vercel (Frontend) + Railway (Backend) - Recommended**

#### **Frontend Deployment (Vercel)**
1. **Push to GitHub** (if not already done)
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Deploy

#### **Backend Deployment (Railway)**
1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Set environment variables:
     ```bash
     GEMINI_API_KEY=your_api_key_here
     PORT=5000
     ```
   - Deploy

### **Option 2: Netlify (Frontend) + Render (Backend)**

#### **Frontend Deployment (Netlify)**
1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy

#### **Backend Deployment (Render)**
1. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Set environment variables:
     ```bash
     GEMINI_API_KEY=your_api_key_here
     PORT=5000
     ```
   - Deploy

### **Option 3: Heroku (Full Stack)**

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set GEMINI_API_KEY=your_api_key_here
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### **Optional Environment Variables**
```bash
PORT=5000                    # Backend port
FLASK_ENV=production         # Production environment
FLASK_DEBUG=0                # Disable debug mode
```

## 📁 **Production Build**

### **Frontend Build**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in the `dist/` directory
```

### **Backend Preparation**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Ensure model file is present
ls best_logreg_tfidf.joblib
```

## 🚀 **Deployment Commands**

### **GitHub Actions (Automated Deployment)**
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install Python dependencies
      run: |
        pip install -r requirements.txt
    
    - name: Install Node.js dependencies
      run: |
        npm install
    
    - name: Build frontend
      run: |
        npm run build
    
    - name: Deploy to platform
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

## 🔒 **Security Considerations**

### **Production Security**
1. **HTTPS Only**: Ensure all deployments use HTTPS
2. **Environment Variables**: Never commit API keys to Git
3. **CORS Configuration**: Restrict CORS to your frontend domain
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Validate all user inputs

### **API Key Security**
```python
# In production, use environment variables
import os
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")
```

## 📊 **Monitoring & Logging**

### **Health Checks**
```bash
# Test your deployed backend
curl https://your-backend-url.com/api/health
```

### **Logging Configuration**
```python
# In app.py
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
```

## 🚨 **Troubleshooting**

### **Common Deployment Issues**

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

2. **Runtime Errors**:
   - Verify environment variables are set
   - Check model file is present
   - Verify API endpoints are accessible

3. **CORS Issues**:
   - Update CORS configuration for production domain
   - Check frontend-backend URL matching

### **Debug Commands**
```bash
# Check backend logs
heroku logs --tail

# Check environment variables
heroku config

# Test API endpoints
curl -X POST https://your-backend.com/api/analyze-email \
  -H "Content-Type: application/json" \
  -d '{"email_content": "test email"}'
```

## 🌍 **Custom Domain Setup**

### **Vercel Custom Domain**
1. Go to your Vercel project settings
2. Add custom domain
3. Update DNS records as instructed

### **Railway Custom Domain**
1. Go to your Railway service settings
2. Add custom domain
3. Configure DNS records

## 📈 **Performance Optimization**

### **Frontend Optimization**
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize bundle size

### **Backend Optimization**
- Enable caching headers
- Implement database connection pooling
- Use async/await for I/O operations
- Monitor memory usage

## 🔄 **Continuous Deployment**

### **Auto-deploy on Push**
Most platforms support automatic deployment when you push to main branch.

### **Manual Deployment**
```bash
# Force deployment
git push origin main --force

# Or trigger via platform dashboard
```

---

**Need help with deployment?** Create an issue in the GitHub repository or check the platform-specific documentation.
