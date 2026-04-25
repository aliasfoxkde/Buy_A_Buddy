# 🚀 Deployment Guide

> Last Updated: 2026-04-25

---

## 📋 Overview

Buy a Buddy is deployed to Cloudflare Pages as a PWA (Progressive Web App).

**Live URL:** https://buy-a-buddy.pages.dev

---

## 🏗 Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   Cloudflare    │     │   Cloudflare      │
│   Pages         │────▶│   Workers         │
│   (Frontend)    │     │   (Future API)    │
└─────────────────┘     └──────────────────┘
        │
        ▼
┌─────────────────┐
│   Cloudflare    │
│   KV (Future)   │
│   (Cloud Save)  │
└─────────────────┘
```

---

## 🔧 Prerequisites

1. Node.js 18+
2. Wrangler CLI (`npm install -g wrangler`)
3. Cloudflare account

---

## 🚀 Deployment Steps

### 1. Build the Project
```bash
npm run build
```

This creates the `dist/` directory with:
- `index.html` - Entry point
- `assets/` - Bundled JS/CSS
- `manifest.webmanifest` - PWA manifest
- `sw.js` - Service worker

### 2. Deploy to Cloudflare Pages

#### Option A: Wrangler CLI
```bash
wrangler pages deploy dist --project-name buy-a-buddy
```

#### Option B: GitHub Actions (Recommended)
Push to main branch to trigger automatic deployment.

See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) for the CI/CD pipeline.

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: buy-a-buddy
          directory: dist
```

### Required Secrets
| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

---

## ⚙️ Configuration

### wrangler.toml
```toml
name = "buy-a-buddy"
compatibility_date = "2024-12-01"
pages_build_output_dir = "dist"

[vars]
SITE_URL = "https://buy-a-buddy.pages.dev"

[build]
command = "npm run build"
```

### Environment Variables

#### Build-time
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Build mode |

#### Runtime (Future)
| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `/api` | API base URL |

---

## 🌐 Custom Domain

1. Go to Cloudflare Dashboard
2. Select Pages project
3. Go to Custom Domains
4. Add your domain (e.g., `game.mydomain.com`)
5. Configure DNS

---

## 🔒 Security Headers

The game includes security headers via service worker:

```javascript
// Content-Security-Policy
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
connect-src 'self';
```

---

## 📱 PWA Features

### Installable
Users can install the game to:
- Desktop taskbar/dock
- Mobile home screen

### Offline Support
- Service worker caches app shell
- Assets cached for offline play
- No data sync when offline

### Push Notifications (Future)
- New buddy announcements
- Daily reward reminders
- Event notifications

---

## 📊 Monitoring

### Cloudflare Analytics
- Requests per day
- Bandwidth usage
- Cache hit rate
- Error rates

### Application Performance
| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Total Blocking Time | < 200ms |

---

## 🔧 Troubleshooting

### Build Failures
```bash
# Clear cache
npm run clean

# Reinstall
rm -rf node_modules
npm install
```

### Deployment Issues
```bash
# Check Wrangler auth
wrangler whoami

# Redeploy
wrangler pages deploy dist --project-name buy-a-buddy --force
```

### Common Errors

| Error | Solution |
|-------|----------|
| `Module not found` | Run `npm install` |
| `Build timeout` | Increase build timeout in Pages settings |
| `404 on assets` | Check `_redirects` file in `public/` |

---

## 🔄 Rollback

### From Cloudflare Dashboard
1. Go to Pages project
2. Select Deployments
3. Click on previous deployment
4. Click "Promote to production"

---

## 📚 Related Documentation

- [docs/API.md](./API.md) - API documentation
- [docs/TESTING.md](./TESTING.md) - Testing guide
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [vite-plugin-pwa](https://vite-pwa.dev/)