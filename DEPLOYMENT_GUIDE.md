# Deployment Guide

## 1. Security First (Crucial)

Before deploying, ensure your secrets are safe.

1.  **API Keys & Secrets:**
    *   We have created a `.gitignore` file to ensure `service-account-key.json`, `.env`, and `office.db` are **NOT** uploaded to GitHub.
    *   **Action:** If you have already committed these files, you must remove them from your Git history or rotate the keys.

2.  **Environment Variables:**
    *   Create a `.env` file in the `backend` folder for your production secrets (see `.env.example`).

## 2. Database & Hosting (Why not Vercel?)

You mentioned you wanted to host on **Vercel**. However, Vercel is a "Serverless" platform.
*   **The Problem:** Serverless functions "sleep" when not in use. When they wake up, they start fresh.
*   **The Result:** If you use a local database (like our `office.db` SQLite file), **all your data will be deleted** every time the server restarts or deploys.

### Recommended Solution: Use a VPS or Persistent Cloud Hosting

Instead of Vercel, we recommend using a provider that supports **Persistent Storage** (disks that don't get deleted).

#### Option A: Render.com (Easiest)
1.  Create a **Web Service** (not a Static Site).
2.  Connect your GitHub repo.
3.  Add a **Disk** (Persistent Disk) and mount it to `/opt/render/project/src/backend/office.db` (or wherever you store the DB).
    *   *Note:* You might need to update the `database.js` path to point to the mounted disk.

#### Option B: Railway.app (Good alternative)
1.  Deploy the repo.
2.  Add a **Volume** to persist the database file.

#### Option C: Cloud Database (If you MUST use Vercel)
If you strictly want to use Vercel for the backend:
1.  You must migrate from SQLite to a Cloud Database (like **Neon** (Postgres) or **Turso** (LibSQL)).
2.  This requires changing the code in `backend/database.js` to connect to the cloud URL instead of a local file.

## 3. Deployment Steps (for Render/Railway)

1.  **Build Command:** `npm install`
2.  **Start Command:** `node backend/server.js`
3.  **Environment Variables:**
    *   Set `PORT` to `3000` (or let the provider assign it).
    *   Set any API keys here.

## 4. Performance Optimization

We have optimized the **User Management** portal:
*   **Caching:** Users are now loaded once and cached.
*   **Filtering:** Filtering by Role/Department happens instantly on the client side without reloading from the server.
