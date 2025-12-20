# Scrum Meeting Summaries

## Project: Student Grade Tracker Web Application
**Repository:** omarabdelwahed22/student-grade-tracker — https://github.com/omarabdelwahed22/student-grade-tracker  
**Project Duration:** November 5, 2025 - December 19, 2025 (3 Sprints)  
**Technology Stack:** Express.js, MongoDB, React.js

---

## Executive Summary

This document provides a comprehensive sprint-by-sprint breakdown of Scrum activities for the Student Grade Tracker Web Application. The project spans three 2‑week sprints focused on project setup and authentication, course and grade management, and dashboards/GPA calculation with final polish and testing. The team delivered core features including user authentication, role‑based access for students and instructors, grade management and display, and dashboard statistics. CI and basic QA tooling were added during the final sprint to support release readiness.

**Key Metrics (from repository)**
- Primary languages:
  - JavaScript: 97.5%
  - CSS: 2.4%
  - HTML: 0.1%
- Recent significant merges and CI additions reflected in commit history (see Appendix)
- Active Team: 3 (team roster below)

---

## Sprint 1: Nov 5 — Nov 18, 2025
### Sprint Overview
**Sprint Goal:** Establish project foundation and core backend infrastructure including user authentication.

### Accomplishments

#### Backend Development
1. User Authentication (Register / Login)
   - Status: Completed
   - Description: Implemented secure registration and login endpoints, password hashing, and session/token handling.
   - Deliverables: Authentication routes, user schema, basic validation middleware.

2. MongoDB Models
   - Status: Completed
   - Description: Defined and implemented database models for Users, Courses, and Grades.
   - Deliverables: Mongoose schemas, seed scripts for development data.

#### Frontend Development
3. Frontend Setup (React)
   - Status: Completed
   - Description: Initialized React application scaffolding, routing, layout components, and basic pages (Login, Register).
   - Deliverables: App shell, routing, authentication forms wired to backend endpoints.

### Sprint Metrics
- Issues Closed: (project-provided items completed in Sprint 1)
- Story Points Completed: High
- Team Velocity: Solid
- Blockers: None reported

### Team Notes
- Authentication and models completed early, enabling frontend integration.
- Seed data populated for development and testing.

---

## Sprint 2: Nov 19 — Dec 2, 2025
### Sprint Overview
**Sprint Goal:** Implement course and grade management functionality and enforce role-based access.

### Accomplishments

#### Role & Access Control
1. Role-Based Routing & Authorization
   - Status: Completed
   - Description: Enforced role checks in routing and APIs so instructors and students have appropriate access.
   - Deliverables: Middleware for role verification, client routing guards.

#### Instructor Features
2. Grade Management (Add / Edit)
   - Status: Completed
   - Description: Implemented instructor workflows to add, edit, and persist grades; basic validation and error handling included.
   - Deliverables: Grade CRUD endpoints, frontend UI for grade entry and editing.

#### Data & UI Enhancements
3. Course Pages & Grade Display
   - Status: In progress → Completed (as part of later merges)
   - Description: Course lists, per-course grade displays, and average calculations displayed on instructor dashboard and course pages.

### Sprint Metrics
- Issues Closed: (role and grade-management related)
- Pull Requests Merged: multiple feature PRs for grade and access control
- Team Velocity: Moderate
- Blockers: Minor validation and UI rework resolved during sprint

### Team Notes
- Instructor flows integrated end-to-end; students can view provided grades.
- Basic validation covered but further QA planned for edge cases (bulk upload, partial failures).

---

## Sprint 3: Dec 3 — Dec 19, 2025
### Sprint Overview
**Sprint Goal:** Deliver student dashboard with GPA calculation, dashboard statistics, CI additions, and final polish for release.

### Accomplishments

#### Student Dashboard & Statistics
1. Student Dashboard UI
   - Status: Completed
   - Description: Student-facing dashboard to view grades, per-course averages and GPA calculation.
   - Deliverables: Frontend dashboard, GPA calculation logic, grade detail pages.

2. Dashboard Statistics / Course Averages
   - Status: Completed (merged via feature branches)
   - Description: Instructor and dashboard statistics showing course averages and grade distributions.
   - Deliverables: Dashboard statistics components, backend aggregation endpoints.

#### DevOps / CI / QA
3. CI & Lint/Test Setup
   - Status: Completed
   - Description: Added ESLint, Jest configuration and GitHub Actions workflows to run lint and tests on push/PR.
   - Deliverables: GitHub Actions workflows, test and lint scripts, initial unit tests.

4. Build & Deployment Adjustments
   - Status: Completed
   - Description: Netlify SPA redirects and build config adjustments for successful deployment.
   - Deliverables: Netlify config changes, build script updates.

### Sprint Metrics
- Pull Requests Merged: multiple merges that include dashboard, stats, CI and build config changes
- Team Velocity: Strong during polish and integration phase
- Blockers: No major blockers; QA and end-to-end tests recommended

### Team Notes
- Final sprint focused on polish, statistics, CI integration, and deployment readiness.
- QA and acceptance testing remain important before production deployment.

---

## Current Backlog / Open Work
(As of latest project snapshot — derived from planning and repository activity)
- Remaining / validation work:
  - End-to-end testing of grade workflows and GPA calculations
  - Edge-case validation for grade editing and bulk updates
  - Release checklist and staging deployment verification
  - Optional: Dockerization and CD pipeline extension (Netlify used for SPA deployment)

---

## Project Analytics & Repository Signals

### Language Composition
- JavaScript: 97.5%  
- CSS: 2.4%  
- HTML: 0.1%

### Recent Repository Activity (selected merges & commits)
Note: commit listing below is a selected view pulled from the repository and may be incomplete due to API limits. View full history at: https://github.com/omarabdelwahed22/student-grade-tracker/commits

- Merge PR #28 — "Netlify SPA redirects + build config"  
  Commit: 1eb5428478a0834accea82a9b8459143acf1e151 — 2025-12-19T23:39:56Z
- "Netlify SPA redirects + build config" — commit 8f7c25e6ea2eacac4c098a74ab440fb9c706f408 — 2025-12-19T23:37:17Z
- Merge PR #27 — "Add CI/CD setup: ESLint, Jest, GitHub Actions workflows"  
  Commit: c5b667c07569ccf6afce5ef49f61dd3422bfa966 — 2025-12-19T22:35:55Z
- "Add CI/CD setup: ESLint, Jest, GitHub Actions workflows" — commit beaf807108006ed1d3e58e6c0ed005e324a62a2b — 2025-12-19T22:32:10Z
- Merge PR #15 — "Add course grades and averages display to Courses and Dashboard pages"  
  Commit: 0b170fab41e8c96d9576482ab4ec46b42c734144 — 2025-12-19T21:04:48Z
- "Add course grades and averages display to Courses and Dashboard pages" — commit e7e614b3258ed8d3d74472c73cfee75ce9800269 — 2025-12-19T21:03:27Z
- Merge PR #14 — "added dashboard and statistics feature branch"  
  Commit: f2a8b1f2a561043a15dda0b9f3cabcecb84cb617 — 2025-12-19T18:58:43Z
- "added dashboard and statistics feature branch" — commit 1754ebc16e0da4777c88f980863268b4bbc3337a — 2025-12-19T18:57:22Z
- Merge PR #13 — route and Students pages; Grades page updates  
  Commit: 0cbeb8e96ce128c9005d462aec868d6c78e3ea50 — 2025-12-18T21:23:26Z
- "Implemented route to fetch user by ID; added Students and StudentDetails pages; updated Grades page" — commit fd65f01ff66158543c1495551a59406773c3137d — 2025-12-18T21:22:25Z

---

## Code Quality Indicators

#### Positive Indicators
- CI tooling (ESLint, Jest) added and integrated via GitHub Actions.
- Feature work merged via pull requests indicating code review flow.
- Dashboard and statistical features implemented and merged.
- Build and deployment configuration updated for SPA hosting (Netlify).

#### Areas for Improvement
- End-to-end tests and integration tests coverage need verification.
- Docker / containerization not present in repository (if desired for uniform environments).
- CD pipeline beyond Netlify (staging/prod promotion) may need expansion.

---

## Risk Assessment

### Technical Risks
1. Testing Coverage (Medium)
   - Risk: E2E gaps may allow regressions (GPA calculation, bulk grade updates).
   - Mitigation: Add Cypress or Playwright E2E tests covering core user flows.

2. Deployment & Environment Consistency (Low-Medium)
   - Risk: Local/CI environments may differ; Docker not yet implemented.
   - Mitigation: Add docker-compose for local dev and CI test runners.

3. Data Integrity (Medium)
   - Risk: Weighting and assignment categories require careful validation to ensure correct GPA/average calculations.
   - Mitigation: Add unit tests for calculation logic and test data cases.

### Project Risks
1. Release Readiness Timing (Low)
   - Risk: QA backlog items delaying production release.
   - Mitigation: Prioritize test cases and staging verification.

---

## Recommendations for Next Steps

### Immediate Actions
1. Validate CI pipelines and ensure all checks pass on `main`.
2. Add end-to-end tests for:
   - Instructor grade entry → Student grade visibility and GPA update.
   - Course average calculations and dashboard statistics.
3. Run QA sessions focused on grade calculations and role permissions.
4. Prepare release notes and a staging deployment checklist.

### Short-term Goals (2-4 weeks)
1. Add Docker support for consistent local and CI environments (optional).
2. Expand test coverage and automate deployment steps (staging promotion).
3. Address any bugs surfaced in QA and stabilize release candidate.

### Long-term Goals (post-release)
1. Consider bulk grade upload with robust partial-failure handling.
2. Add notifications (email) for grade publication or changes.
3. Improve analytics (trend graphs, exportable reports).

---

## Lessons Learned

### What Went Well
- Clear sprint goals and scope enabled steady progress.
- Team collaboration delivered key features (auth, role control, grade management).
- CI and build configuration added to support quality and deployment.

### Areas for Improvement
- Invest earlier in E2E testing and QA planning.
- Consider environment parity via Docker sooner in the project.
- Define acceptance criteria for edge cases (bulk operations, grades weighting).

---

## Appendix: Commit & Pull Request Reference

(Selected merges and commits from the repository — may be incomplete. For full history see https://github.com/omarabdelwahed22/student-grade-tracker/commits)

- PR #28 — "Netlify SPA redirects + build config" — merged (commit 1eb5428)  
  https://github.com/omarabdelwahed22/student-grade-tracker/commit/1eb5428478a0834accea82a9b8459143acf1e151

- PR #27 — "Add CI/CD setup: ESLint, Jest, GitHub Actions workflows" — merged (commit c5b667c)  
  https://github.com/omarabdelwahed22/student-grade-tracker/commit/c5b667c07569ccf6afce5ef49f61dd3422bfa966

- PR #15 — "Add course grades and averages display to Courses and Dashboard pages" — merged (commit 0b170fa)  
  https://github.com/omarabdelwahed22/student-grade-tracker/commit/0b170fab41e8c96d9576482ab4ec46b42c734144

- PR #14 — "added dashboard and statistics feature branch" — merged (commit f2a8b1f)  
  https://github.com/omarabdelwahed22/student-grade-tracker/commit/f2a8b1f2a561043a15dda0b9f3cabcecb84cb617

- PR #13 — route & Students pages; Grades updates — merged (commit 0cbeb8e)  
  https://github.com/omarabdelwahed22/student-grade-tracker/commit/0cbeb8e96ce128c9005d462aec868d6c78e3ea50

---

**Document Prepared By:** Scrum Team
**Date:** December 19, 2025
**Document Version:** 1.0

**Note:** Commit list and repository-derived details above were gathered from repository queries and may be incomplete. To view the complete commit history and PR list, visit: https://github.com/omarabdelwahed22/student-grade-tracker/commits
