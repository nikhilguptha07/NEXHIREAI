# 📚 NEXHIRE AI Documentation

This directory contains technical documentation and architecture blueprints for **NEXHIRE AI**.

- [Architecture & Tech Stack](./ARCHITECTURE.md)
- [CI/CD & Render Deployment](../DEPLOYMENT.md)

---

## 🏛️ System Architecture Overview

- **Frontend**: Next.js 15 (App Router, Tailwind CSS, TypeScript, Zustand, React Query)
- **Backend**: Spring Boot 3.3.4 (Java 21, Spring Security, OAuth2 Client, JWT HMAC-SHA512)
- **Database**: Oracle XE 21c (Local) / Oracle Cloud Autonomous DB (Production)
- **Cache & Rate Limiting**: Redis / Memurai
- **Object Storage**: MinIO / S3
- **CI/CD & Hosting**: GitHub Actions & Render Auto-Deploy
