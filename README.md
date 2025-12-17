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
