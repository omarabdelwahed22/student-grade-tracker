# Student Grade Tracker

![CI Status](https://github.com/omarabdelwahed22/student-grade-tracker/workflows/CI/badge.svg)

## Project Summary
Student Grade Tracker is a full‑stack web application that allows instructors to manage courses and assign grades, and enables students to view their grades and GPA through role‑based access. The application provides grade entry, per‑course averages, dashboard statistics, and tools to inspect student performance.

## Key Features
- Secure user registration and login with role selection (student / instructor)
- Role-based access control (instructor vs. student views)
- Instructor grade management (add, edit, bulk upload)
- Student dashboard showing grades, per-course averages and GPA calculation
- Dashboard statistics and course analytics
- RESTful backend API and React single-page frontend
- CI checks (linting and tests) and build configuration for deployment

## Tech Stack
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Frontend: React
- Tooling: ESLint, Jest, GitHub Actions
- Project layout: backend/, frontend/, public/, src/

## Quickstart
Prerequisites: Node.js (14+) and npm (or yarn). MongoDB instance (local or hosted).

1. Clone the repository
bash
git clone https://github.com/omarabdelwahed22/student-grade-tracker.git
cd student-grade-tracker


2. Install top-level (optional) and backend/frontend dependencies
bash
# Optional top-level install if workspaces/scripts exist
npm install

# Backend
cd backend
npm install

# Frontend (in a separate terminal)
cd ../frontend
npm install


3. Backend setup and run
bash
cd backend
# Create a .env file with MONGO_URI and JWT_SECRET (example: .env example provided)
npm run dev   # or `node server.js` depending on scripts

By default the backend listens on the port configured in backend/server.js or PORT environment variable.

4. Frontend setup and run
bash
cd frontend
npm start

The frontend runs on the port configured by the React app (commonly http://localhost:3000).

## Environment & Configuration
Create a .env file in backend/ with variables similar to:

PORT=5000
MONGO_URI=mongodb://localhost:27017/student-grade-tracker
JWT_SECRET=your_jwt_secret_here

Adjust values for production or hosted DB instances.

## Project Structure (high level)
- backend/ — Express server, route definitions in routes/, data models in models/, tests in tests/.
- frontend/ — React app, pages, components and styles.
- public/ — static assets and index.html for the frontend.
- src/ — shared or root-level frontend source (if applicable).

## Tests
A CI pipeline runs linting and tests on every push/PR (see .github/workflows).

### Running tests locally
Backend tests:
bash
cd backend
npm test


Frontend tests:
bash
cd frontend
npm test


## CI / Deployment
- GitHub Actions run lint and tests on push/PR.
- Netlify (or other SPA host) configuration is supported via build scripts and redirect rules (see frontend/netlify.toml or project build config).
- Ensure CI passes on main before deploying to staging/production.

## Contributing
- Fork the repo and create a feature branch.
- Open an issue to discuss larger changes before implementation.
- Create PRs against main with descriptive titles and linked issues.
- Add tests for new functionality and follow existing code style.
