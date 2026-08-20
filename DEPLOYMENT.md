# 🚀 NEXHIRE AI — GitHub & Render Deployment Guide

This guide provides step-by-step instructions for connecting the **NEXHIRE AI** repository to GitHub and configuring automatic continuous deployment (CI/CD) on Render for both backend and frontend services.

---

## 📋 Architecture & Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│                       LOCAL MACHINE                         │
│   git add .  ──►  git commit -m "..."  ──►  git push origin │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                          GITHUB                             │
│                  Repository (Branch: main)                  │
└──────────────┬──────────────────────────────┬───────────────┘
               │ Auto-Deploy Webhook          │ Auto-Deploy Webhook
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│    RENDER BACKEND SERVICE    │ │   RENDER FRONTEND SERVICE  │
│   (Spring Boot 3.3.4 / Java) │ │     (Next.js 15 / Node.js) │
│                              │ │                            │
│  Root Dir: backend/          │ │  Root Dir: frontend/       │
│  Build: mvn clean package    │ │  Build: npm ci && npm build│
│  Start: java -jar ...        │ │  Start: npm start          │
│  Health: /api/health         │ │  Port: 3000 / $PORT        │
└──────────────┬───────────────┘ └────────────┬───────────────┘
               │                              │
               └──────────────◄───────────────┘
                     HTTPS REST & OAuth API
```

---

## 1. Connecting the Local Project to GitHub

### Step 1.1: Create a New GitHub Repository
1. Go to [GitHub](https://github.com/new).
2. Create a new repository named `nexhire-ai` (or your preferred name).
3. **Important**: Do **not** initialize with a README, license, or .gitignore (the repository already has complete `.gitignore` and structure).
4. Copy the repository remote URL (e.g. `https://github.com/<your-username>/nexhire-ai.git`).

### Step 1.2: Add Remote and Push Local Code
Run the following commands in the project root (`c:\Users\nikhi\Downloads\NEXHIREAI`):

```powershell
# Verify current branch is main
git branch -M main

# Stage all files (sensitive files are automatically excluded by .gitignore)
git add .

# Create initial commit
git commit -m "feat: configure NEXHIRE AI for GitHub and Render automated CI/CD"

# Add your GitHub remote URL
git remote add origin https://github.com/<your-username>/nexhire-ai.git

# Push to GitHub
git push -u origin main
```

---

## 2. Render Deployment Options

You can deploy using either **Render Blueprints (render.yaml)** or **Manual Service Creation**.

### Option A: Render Blueprints (Recommended)
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** ➔ **Blueprint**.
2. Connect your GitHub repository `nexhire-ai`.
3. Render will read `render.yaml` and configure both `nexhire-backend` and `nexhire-frontend` automatically.
4. Fill in the required secret environment variables prompted by Render (see Section 3).

---

### Option B: Manual Service Creation

#### Step 2.1: Create the Render Backend Service
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Select your GitHub repository.
3. Configure the service settings:
   - **Name**: `nexhire-backend`
   - **Region**: Oregon (or your preferred region)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Java` (Java 21)
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/nexhire-backend.jar`
   - **Auto-Deploy**: `Yes`
   - **Health Check Path**: `/api/health`
4. Add the Backend Environment Variables listed in Section 3.
5. Click **Create Web Service**. Note your backend URL: `https://nexhire-backend.onrender.com`.

#### Step 2.2: Create the Render Frontend Service
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Select the same GitHub repository.
3. Configure the service settings:
   - **Name**: `nexhire-frontend`
   - **Region**: Same region as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Auto-Deploy**: `Yes`
4. Add the Frontend Environment Variables listed in Section 3:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://nexhire-backend.onrender.com/api`
   - `NEXT_PUBLIC_APP_URL`: `https://nexhire-frontend.onrender.com`
5. Click **Create Web Service**.

---

## 3. Environment Variables Reference

### 🔐 Backend Environment Variables (`nexhire-backend`)

| Variable Name | Recommended Production Value | Description |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile |
| `PORT` | `8080` (or injected by Render) | Dynamic port for Spring Boot |
| `JWT_SECRET` | *(64-char random string)* | Secret for HMAC-SHA512 token signing |
| `ORACLE_JDBC_URL` | `jdbc:oracle:thin:@//<host>:<port>/<service>` | Remote Oracle 21c / Autonomous Cloud DB |
| `ORACLE_USERNAME` | `<db_user>` | Production Oracle database username |
| `ORACLE_PASSWORD` | `<db_password>` | Production Oracle database password |
| `REDIS_HOST` | `<redis-host>` (e.g. Upstash Redis) | Redis host for token caching & rate limits |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `<redis-password>` | Redis authentication password |
| `MINIO_ENDPOINT` | `<s3_or_minio_endpoint>` | Object storage endpoint for resumes |
| `MINIO_ACCESS_KEY` | `<access_key>` | Storage access key |
| `MINIO_SECRET_KEY` | `<secret_key>` | Storage secret key |
| `GOOGLE_CLIENT_ID` | `<google_client_id>` | Google OAuth 2.0 Web Client ID |
| `GOOGLE_CLIENT_SECRET` | `<google_client_secret>` | Google OAuth 2.0 Web Client Secret |
| `BACKEND_CORS_ALLOWED_ORIGINS` | `https://nexhire-frontend.onrender.com` | Frontend URL allowed for CORS |
| `NEXT_PUBLIC_APP_URL` | `https://nexhire-frontend.onrender.com` | Frontend URL for OAuth redirects |

---

### 🎨 Frontend Environment Variables (`nexhire-frontend`)

| Variable Name | Recommended Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://nexhire-backend.onrender.com/api` | Backend API base endpoint |
| `NEXT_PUBLIC_APP_URL` | `https://nexhire-frontend.onrender.com` | Deployed frontend domain |
| `NEXT_PUBLIC_APP_NAME` | `NEXHIRE AI` | Application branding |

---

## 4. Google Cloud OAuth 2.0 Configuration

1. Open [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create or select your project.
3. Configure the **OAuth Consent Screen** (User type: External, add scopes `openid`, `email`, `profile`).
4. Go to **Credentials** ➔ **Create Credentials** ➔ **OAuth client ID**.
5. Select **Web application**.
6. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - `https://nexhire-frontend.onrender.com`
7. Under **Authorized redirect URIs**, add:
   - **Local Development**: `http://localhost:8080/api/login/oauth2/code/google`
   - **Render Production**: `https://nexhire-backend.onrender.com/api/login/oauth2/code/google`
8. Copy the **Client ID** and **Client Secret** into your Render Backend environment variables.

---

## 5. Continuous Deployment (CI/CD) Workflow

Once configured, your deployment workflow is 100% automated:

1. **Make changes locally** in your code editor.
2. **Commit and push** to GitHub:
   ```powershell
   git add .
   git commit -m "feat: add new candidate scoring feature"
   git push origin main
   ```
3. **Render detects the push** via GitHub webhook.
4. **Render builds & deploys**:
   - Backend runs `mvn clean package -DskipTests` and restarts the service.
   - Frontend runs `npm ci && npm run build` and restarts the service.
5. **Zero Downtime**: Render health-checks `/api/health` before routing live traffic to the new version.

---

## 6. Local Testing Instructions

### Run Backend Locally
```powershell
cd backend
mvn spring-boot:run
```
- API Base: `http://localhost:8080/api`
- Health Check: `http://localhost:8080/api/health`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### Run Frontend Locally
```powershell
cd frontend
npm run dev
```
- Web Application: `http://localhost:3000`
