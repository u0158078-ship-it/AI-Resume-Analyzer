# AI Resume Analyzer

A small full-stack app that extracts text from a PDF resume, asks Google Gemini for a structured role-specific review, validates that response, and saves successful analyses in MongoDB Atlas.

## Before you start

Install [Node.js 20.19 or newer](https://nodejs.org/) (or 22.12 or newer) and npm. You will also need a Gemini API key and a MongoDB Atlas connection string to run real analyses. The web app does not contain either secret.

## Run locally

1. In the project folder, create the root environment file from the template if it does not already exist:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Add your own `GEMINI_API_KEY` and `MONGODB_URI` values to the root `.env`. If it already exists, do not overwrite it. Keep the file private; Git ignores it.
3. In a terminal opened at the project folder, install dependencies:

   ```powershell
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

4. Start both apps from the project folder:

   ```powershell
   npm run dev
   ```

   The website opens at `http://localhost:5173`; the API is at `http://localhost:5000`. The first terminal logs show whether MongoDB connected. To run just one app, use `npm run dev --prefix server` or `npm run dev --prefix client` from the project folder.

Check that the backend process is running at `http://localhost:5000/api/health`; it should return `{"status":"ok"}`. Check `http://localhost:5000/api/ready` for database and Gemini configuration status; it returns HTTP 503 until both are configured and available. The backend can start without credentials, but analysis and history need a working MongoDB connection, and analysis also needs a Gemini key.

## Environment variables

Backend (root `.env`):

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | For analysis | Private key from Google AI Studio |
| `MONGODB_URI` | For saved analyses | MongoDB Atlas connection string |
| `PORT` | No | API port; defaults to `5000` |
| `CLIENT_URL` | No | Allowed frontend origin; defaults to `http://localhost:5173` |

Frontend (`client/.env`, optional locally):

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend origin. Leave blank locally to use Vite's `/api` proxy. Set this to the deployed API origin in production. Never put secrets here. |

## GitHub

From the project folder, initialize Git, create a commit, and name the default branch:

```powershell
git init
git add .
git commit -m "Build AI Resume Analyzer MVP"
git branch -M main
```

Create an empty repository on GitHub. Replace the placeholder below with the URL GitHub shows for **your** repository, then run:

```powershell
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Do not include `server/.env` or `client/.env` in a commit.

## Deploy the API to Render

1. Push this project to your GitHub repository.
2. In Render, create a **Web Service** and select that repository.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
5. Add `GEMINI_API_KEY`, `MONGODB_URI`, and `CLIENT_URL` under Environment. Set `CLIENT_URL` to the deployed Vercel site origin (no trailing slash). You may set `PORT` to `5000`; Render also supplies a port automatically.
6. Deploy, then check `https://YOUR-RENDER-SERVICE.onrender.com/api/health` for `{"status":"ok"}` and `/api/ready` for HTTP 200 with MongoDB connected and Gemini configured.

In MongoDB Atlas, allow network access from Render. For a first deployment, Atlas can be configured to allow access from anywhere (`0.0.0.0/0`) with a strong database password; restrict access further when your hosting setup supports fixed outbound IPs. Keep the connection string only in Render's backend environment variables.

## Deploy the website to Vercel

1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `client`.
3. Use build command `npm run build` and output directory `dist` if Vercel asks.
4. Add `VITE_API_URL` with your Render service origin, such as `https://your-service.onrender.com` (no `/api` suffix and no trailing slash).
5. Deploy. Add the final Vercel site origin to Render's `CLIENT_URL`, then redeploy the backend if you changed that value.

Only the API URL belongs in Vercel environment variables. Gemini and MongoDB credentials belong on the backend only.

## What this MVP supports

- PDF-only uploads up to 8 MB; text-based PDFs are supported, but image-only scans need OCR and are rejected with a clear message.
- Gemini analysis is constrained to the resume and target role, generated as structured JSON, then checked against a Zod schema before storage or display.
- Recent analyses are saved in MongoDB Atlas and can be reopened from History. History is scoped to the current browser using a random workspace ID; clearing that browser's site data removes access to its history. This is workspace separation for an MVP, not account authentication.
- Resume text is sent to Google Gemini to produce the requested analysis. Only the result and filename are saved in MongoDB.