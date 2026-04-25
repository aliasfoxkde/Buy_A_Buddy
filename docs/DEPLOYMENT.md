# Deployment Guide

## 🏠 Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
# Clone and install
cd Buy_A_Buddy
npm install

# Start frontend dev server
npm run dev

# In another terminal, start API server
npm run dev:api
```

### URLs
- Frontend: http://localhost:5173
- API Server: http://localhost:3001
- API Docs: http://localhost:3001/api-docs

---

## ☁️ Cloudflare Pages Deployment

### Option 1: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

### Option 2: GitHub Actions (Recommended)

The repository includes a CI workflow (`.github/workflows/deploy.yml`) that:
1. Runs tests on every push
2. Builds the production bundle
3. Deploys to Cloudflare Pages on merge to main

#### Setup

1. **Add Secrets to GitHub:**
   - `CLOUDFLARE_API_TOKEN`: API token with Pages edit permission
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

2. **Create Project:**
   ```bash
   wrangler pages project create buy-a-buddy
   ```

3. **Push and Deploy:**
   ```bash
   git push origin main
   ```

### Configuration

`wrangler.toml`:
```toml
name = "buy-a-buddy"
compatibility_date = "2024-12-01"
pages_build_output_dir = "dist"
```

### Environment Variables

Set in Cloudflare Pages dashboard:
- `NODE_VERSION`: 20
- `NPM_FLAGS`: --legacy-peer-deps (if needed)

---

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t buy-a-buddy:latest .
```

### Run Container
```bash
docker run -d -p 8080:80 \
  -e PORT=80 \
  buy-a-buddy:latest
```

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### API Server (.env)
```env
PORT=3001
CORS_ORIGIN=*
API_URL=https://buy-a-buddy.pages.dev
```

### Cloudflare Pages
Set in dashboard or `wrangler.toml`:
```toml
[vars]
SITE_URL = "https://buy-a-buddy.pages.dev"
```

---

## 📱 PWA Installation

The game is a Progressive Web App that can be installed on:
- Mobile devices (iOS/Android)
- Desktop (Chrome/Edge/Firefox)

### Installation Steps

**On Mobile:**
1. Open the game in Chrome/Safari
2. Tap "Add to Home Screen" in the menu

**On Desktop:**
1. Open the game in Chrome
2. Click the install icon in the address bar

### Features
- Works offline with cached assets
- Auto-updates when new version deployed
- Full-screen immersive experience

---

## 🔄 Rollback

If a deployment fails or causes issues:

### Cloudflare
```bash
# List deployments
wrangler pages deployment list --project-name buy-a-buddy

# Rollback to previous
wrangler pages deployment rollback <deployment-id> --project-name buy-a-buddy
```

### Docker
```bash
# Re-tag previous image
docker tag buy-a-buddy:previous buy-a-buddy:latest
docker run -d buy-a-buddy:latest
```

---

## 📊 Monitoring

### Cloudflare Analytics
- Dashboard: https://dash.cloudflare.com
- Pages Analytics: Runtime performance, visitor stats

### Application Logs
View logs via:
```bash
wrangler pages project tail buy-a-buddy
```

---

## 🛡️ Security

### Recommendations

1. **API Authentication:**
   - Add API key validation for admin endpoints
   - Use Cloudflare Access for team access

2. **Rate Limiting:**
   - Configure Cloudflare Rate Limiting rules
   - Add request throttling to API server

3. **Environment Variables:**
   - Never commit secrets to repository
   - Use Cloudflare Workers Secrets for sensitive data

---

## 🚀 Performance Tips

1. **Enable Caching:**
   - Assets cached via Service Worker
   - Configure Cache-Control headers

2. **Minimize Bundle:**
   ```bash
   npm run build -- --mode production
   ```

3. **Use CDN:**
   - Deploy to Cloudflare's global CDN
   - Automatic asset optimization

---

## 📞 Support

For deployment issues:
1. Check Cloudflare Pages dashboard for errors
2. Verify `wrangler.toml` configuration
3. Check GitHub Actions logs for CI failures