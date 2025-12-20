# Student Grade Tracker

This repository contains a starter full-stack Student Grade Tracker.

Frontend:
- React (Vite-ready structure)
- Folders: `components`, `pages`, `services`

Backend:
- Node.js + Express
- Folders: `routes`, `controllers`, `models`, `config`
- Health endpoint: `GET /api/health`

How to run (backend only):

1. Install dependencies for backend:

```powershell
cd backend; npm install
```

2. Start backend:

```powershell
npm start
```

Frontend setup (optional):

```powershell
cd frontend; npm install; npm run dev
```
# Student Grade Tracker

A full-stack web application for tracking student grades and performance. Built with React, Node.js/Express, and designed for a software engineering course.

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # Route definitions
│   │   ├── config/          # Configuration files
│   │   └── server.js        # Express app entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API service functions
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    ├── public/
    │   └── index.html
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The API will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:5173`

## API Endpoints

- **GET /api/health** - Health check endpoint
  ```json
  {
    "status": "healthy",
    "timestamp": "2024-12-17T00:00:00.000Z",
    "uptime": 123.45
  }
  ```

## Features (Roadmap)

- [ ] Authentication (Login/Register)
- [ ] Student Management (CRUD)
- [ ] Assignment Management
- [ ] Grade Tracking
- [ ] Reports and Analytics
- [ ] User Roles (Admin, Teacher, Student)

## Deployment

### Deploying to Netlify

When deploying the frontend to Netlify, you need to configure the backend API URL:

1. **Set Environment Variable in Netlify:**
   - Go to Site settings → Build & deploy → Environment variables
   - Add a new variable:
     - Key: `VITE_API_URL`
     - Value: Your backend API URL (e.g., `https://your-backend.example.com/api`)

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `frontend`

3. **Important Notes:**
   - The frontend expects the backend API to be accessible at the URL specified in `VITE_API_URL`
   - If you see 404 errors on `/api/*` paths, ensure `VITE_API_URL` is set correctly
   - For local development, the Vite proxy (configured in `vite.config.js`) forwards requests to `http://localhost:4000`
   - In production, direct API calls are made to the configured `VITE_API_URL`

### Troubleshooting

**Problem:** Getting 404 errors on `/api/auth/login` or other `/api/*` endpoints

**Solution:** This happens when `VITE_API_URL` is not configured. The frontend is making same-origin requests to `/api/*` which don't exist on the Netlify static site. You must:
- Set the `VITE_API_URL` environment variable in Netlify to point to your deployed backend
- OR deploy the backend as Netlify Functions (requires code changes)

## Development Notes

- No authentication or database configured yet
- Uses ES6 modules (import/export)
- Backend uses Express with CORS enabled
- Frontend uses React with Vite for fast development

## Branching Strategy

For the course project, each feature should be developed in a separate branch:

```bash
# Create a feature branch
git checkout -b feature/<feature-name>

# Example features
git checkout -b feature/authentication
git checkout -b feature/students-crud
git checkout -b feature/grade-tracking
```

Create pull requests into `main` for review before merging.

# student-grade-tracker
