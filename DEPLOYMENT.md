# Where2Meet Deployment Guide

## Quick Overview
Where2Meet consists of:
- **Backend**: Flask app (Python 3.9+) on port 5001
- **Frontend**: React SPA served as static files
- **Dependencies**: No database required (in-memory storage), optional OSRM server

---

## Option 1: Render.com (Recommended for Portfolio)

### Why Render?
- Free tier available (backend sleeps after 15 min inactivity)
- Easy setup, no config files needed
- Auto-deploy from GitHub
- Custom domains supported

### Backend Deployment

1. **Prepare backend**
```bash
cd backend
pip install gunicorn
pip freeze > requirements.txt
```

2. **Push to GitHub** (if not already)

3. **Deploy on Render**
- Go to [render.com](https://render.com) → New Web Service
- Connect your GitHub repo
- Configure:
  - **Name**: where2meet-api
  - **Root Directory**: `backend`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `gunicorn wsgi:app --bind 0.0.0.0:$PORT`
  - **Environment**: Python 3
- Add environment variable: `FLASK_ENV=production`
- Click "Create Web Service"

4. **Get your backend URL**: `https://where2meet-api.onrender.com`

### Frontend Deployment

1. **Update API URL**
```bash
cd frontend
echo "REACT_APP_API_URL=https://where2meet-api.onrender.com/api" > .env.production
```

2. **Deploy to Netlify**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=build
```

Or use Netlify's GitHub integration for auto-deploy.

**Cost**: Free (backend sleeps when idle) or $7/month for always-on

---

## Option 2: Heroku (Classic Choice)

### Backend

1. **Create Procfile**
```bash
cd backend
echo "web: gunicorn wsgi:app --bind 0.0.0.0:\$PORT" > Procfile
pip install gunicorn
pip freeze > requirements.txt
echo "python-3.9.18" > runtime.txt
```

2. **Deploy**
```bash
heroku login
heroku create where2meet-api
git init
git add .
git commit -m "Deploy"
git push heroku main
```

### Frontend
- Deploy to Netlify/Vercel (same as Render option)
- Set `REACT_APP_API_URL=https://where2meet-api.herokuapp.com/api`

**Cost**: $0 (limited hours) or $7/month for hobby tier

---

## Option 3: Vercel (Best for Full-Stack Simplicity)

Vercel can host both frontend and backend in one place.

### Setup

1. **Create `vercel.json` in root**
```json
{
  "builds": [
    {
      "src": "backend/wsgi.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/wsgi.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

2. **Deploy**
```bash
npm install -g vercel
vercel
```

**Cost**: Free for hobby projects

---

## Option 4: Railway.app (Modern & Fast)

### Deploy Both Services

```bash
# Install Railway CLI
npm install -g @railway/cli

# Backend
cd backend
railway login
railway init
railway up

# Frontend
cd ../frontend
railway init
railway up
```

Railway auto-detects Python and Node.js apps. Set environment variables in the dashboard.

**Cost**: $5 credit/month free, then pay-as-you-go

---

## Option 5: AWS (Production-Grade)

### Backend: Elastic Beanstalk

```bash
cd backend
pip install awsebcli
pip install gunicorn
pip freeze > requirements.txt

# Create .ebextensions/python.config
mkdir .ebextensions
cat > .ebextensions/python.config << EOF
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: wsgi:app
EOF

# Deploy
eb init -p python-3.9 where2meet --region us-east-1
eb create where2meet-prod
```

### Frontend: S3 + CloudFront

```bash
cd frontend
echo "REACT_APP_API_URL=https://your-eb-url.elasticbeanstalk.com/api" > .env.production
npm run build

# Upload to S3
aws s3 sync build/ s3://where2meet-frontend
aws s3 website s3://where2meet-frontend --index-document index.html

# Create CloudFront distribution (optional, for HTTPS + CDN)
```

**Cost**: ~$15-30/month

---

## Option 6: Docker on Any VPS

### Create Dockerfiles

**backend/Dockerfile**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .
EXPOSE 5001

CMD ["gunicorn", "wsgi:app", "--bind", "0.0.0.0:5001", "--workers", "2"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml** (root directory)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - FLASK_ENV=production
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      args:
        REACT_APP_API_URL: http://your-server-ip:5001/api
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### Deploy to VPS (DigitalOcean, Linode, etc.)

```bash
# On your VPS
git clone https://github.com/AjitSivakumar/Where2Meet.git
cd Where2Meet

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

**Cost**: $5-10/month for basic VPS

---

## Recommended Setup by Use Case

| Use Case | Backend | Frontend | Cost | Effort |
|----------|---------|----------|------|--------|
| **Portfolio/Demo** | Render.com | Netlify | Free | ⭐ Easy |
| **MVP/Startup** | Railway | Vercel | $5-10/mo | ⭐ Easy |
| **Production** | AWS EB | S3+CloudFront | $20-40/mo | ⭐⭐⭐ Hard |
| **Full Control** | VPS+Docker | VPS+Docker | $5-10/mo | ⭐⭐⭐ Hard |

---

## Environment Variables

### Backend
```bash
FLASK_ENV=production
PORT=5001  # Auto-set by most platforms
```

### Frontend
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api
```

---

## Post-Deployment Checklist

- [ ] Backend health check: `curl https://your-api.com/health` returns 200
- [ ] Frontend loads without console errors
- [ ] API calls work (create event, add location, finalize)
- [ ] Maps display correctly
- [ ] CORS configured for your frontend domain
- [ ] HTTPS enabled (green lock in browser)
- [ ] Custom domain configured (optional)

---

## CORS Configuration

Update `backend/app/__init__.py` to allow your frontend domain:

```python
from flask_cors import CORS

CORS(app, origins=[
    'http://localhost:3000',  # Development
    'https://your-frontend.netlify.app',  # Production
])
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: |
          cd frontend
          npm ci
          echo "REACT_APP_API_URL=${{ secrets.API_URL }}" > .env.production
          npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './frontend/build'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs on Render/Heroku
render logs
heroku logs --tail

# Common issues:
# 1. Missing gunicorn: pip install gunicorn
# 2. Wrong start command: should be "gunicorn wsgi:app"
# 3. Port binding: use $PORT variable, not hardcoded 5001
```

### Frontend can't reach backend
```bash
# Check browser console for CORS errors
# Verify REACT_APP_API_URL is correct
# Test backend directly: curl https://your-api.com/health
```

### AI model fails to load
```bash
# Increase memory limit on hosting platform
# Render: Scale to 1GB+ instance
# Heroku: Use Standard tier
```

---

## Quick Start (5 Minutes)

```bash
# 1. Backend on Render
cd backend
pip install gunicorn && pip freeze > requirements.txt
# Push to GitHub, connect on render.com

# 2. Frontend on Netlify
cd frontend
echo "REACT_APP_API_URL=https://your-render-app.onrender.com/api" > .env.production
npm run build
npx netlify-cli deploy --prod --dir=build

# Done! 🚀
```

---

## Scaling Considerations

### Current Limits (Free Tier)
- ~100 concurrent users
- In-memory storage: ~1000 events
- OSM API: 2 requests/sec

### When to Scale
- **Traffic > 1000 users/day**: Upgrade to paid tier
- **Need persistence**: Add Redis or PostgreSQL
- **Global users**: Add CDN (CloudFront, Cloudflare)
- **Heavy AI usage**: Move to GPU instance

### Scaling Path
1. Add Redis for event storage → handle millions of events
2. Cache OSM responses → reduce API calls by 90%
3. Load balancer + multiple backend instances → handle 10K+ concurrent users
4. GPU inference server → 10x faster AI ranking

---

## Interview Talking Points

**"How would you deploy this?"**

*"For a portfolio project, I'd use Render for the Flask backend and Netlify for the React frontend—both have free tiers and deploy from GitHub with minimal config. The architecture is already deployment-ready: the backend is a standard WSGI app with gunicorn, the frontend builds to static files, and there's no database dependency for the MVP.*

*For production, I'd migrate to AWS Elastic Beanstalk for auto-scaling backend, S3+CloudFront for global CDN delivery, and add Redis for persistent storage. I'd also set up CI/CD with GitHub Actions to run tests and deploy automatically on every push to main.*

*Cost-wise, the free tier handles thousands of users for demos, and production would be ~$20-40/month with room to scale."*

---

**Live Demo URL** (example):
- Frontend: https://where2meet.netlify.app
- Backend: https://where2meet-api.onrender.com
- Health: https://where2meet-api.onrender.com/health
