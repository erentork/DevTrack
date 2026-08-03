DevTrack

DevTrack is a full-stack project and task management application built for organizing software projects, tracking tasks, monitoring deadlines, and reviewing productivity through a modern analytics dashboard.

The application includes secure JWT-based authentication, project and task management, a drag-and-drop Kanban board, global search, deadline notifications, analytics, responsive navigation, and persistent profile avatar selection.

Preview

Add screenshots of the application to a docs/screenshots directory and replace the placeholders below.

docs/
└── screenshots/
    ├── dashboard.png
    ├── kanban.png
    ├── tasks.png
    ├── analytics.png
    └── settings.png

Example:

![DevTrack Dashboard](docs/screenshots/dashboard.png)

Features

Authentication and account

User registration and login

JWT-based authentication

Protected and public routes

Automatic session-expiration handling

Profile information updates

Password changes with validation

Five persistent profile avatar options

Secure logout flow

Projects

Create, view, edit, and delete projects

View recent projects

Search projects globally

Project ownership checks on the backend

Tasks

Create, view, edit, and delete tasks

Task priority and status management

Due dates and overdue detection

Centralized task management page

Quick status updates

Search and filtering

Drag-and-drop Kanban board

Optimistic updates with rollback

Completion timestamps

Dashboard and analytics

Project and task totals

Completed and overdue task counts

Productivity rate

Recent project and task activity

Task distribution chart

Daily completion activity

Dedicated analytics page

User interface

Responsive dashboard layout

Collapsible desktop sidebar

Mobile sidebar drawer

Global project and task search

Deadline notifications

Loading, empty, error, and confirmation states

Toast notifications

Dark SaaS-style interface

Technology Stack

Backend

ASP.NET Core 8

Entity Framework Core

PostgreSQL

JWT Bearer authentication

BCrypt password hashing

FluentValidation

Swagger / OpenAPI

Docker

Frontend

React

TypeScript

Vite

Tailwind CSS

React Router

Axios

Chart.js

react-chartjs-2

dnd-kit

react-hot-toast

Lucide React

Project Structure

DevTrack/
├── backend/
│   └── DevTrack.API/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Entities/
│       ├── Exceptions/
│       ├── Interfaces/
│       ├── Middleware/
│       ├── Migrations/
│       ├── Repositories/
│       ├── Services/
│       ├── Validators/
│       └── Program.cs
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── contexts/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       └── types/
│
├── .gitignore
└── README.md

Local Development

Prerequisites

Install the following tools:

.NET 8 SDK

Node.js and npm

Docker Desktop

Git

1. Clone the repository

git clone <your-repository-address>
cd DevTrack

2. Start PostgreSQL

Use your existing PostgreSQL Docker configuration or create a local development container.

Do not place the real database password in tracked files.

3. Configure backend secrets

Move into the backend project:

cd backend/DevTrack.API

Initialize ASP.NET Core Secret Manager:

dotnet user-secrets init

Set the development database connection string:

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=DevTrackDB;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"

Set a long random JWT key:

dotnet user-secrets set "Jwt:Key" "REPLACE_WITH_A_LONG_RANDOM_DEVELOPMENT_KEY"

Set the remaining JWT configuration:

dotnet user-secrets set "Jwt:Issuer" "DevTrack.API"
dotnet user-secrets set "Jwt:Audience" "DevTrack.Client"
dotnet user-secrets set "Jwt:ExpireMinutes" "60"

Never use the example values in production.

4. Apply database migrations

dotnet ef database update

5. Start the backend

dotnet run

The local API address depends on your launch configuration. Update the frontend environment variable if your port is different.

6. Configure the frontend

Open another terminal:

cd frontend

Copy the example environment file:

Copy-Item .env.example .env

For Bash-compatible terminals:

cp .env.example .env

Example development value:

VITE_API_URL=http://127.0.0.1:5175/api

Only public client configuration belongs in VITE_ variables. Never place database passwords, JWT signing keys, private API keys, or other secrets in the frontend.

7. Install dependencies and start Vite

npm install
npm run dev

Open the address printed by Vite in your browser.

Production Security Notes

Before deploying the project:

Store database credentials and JWT signing keys in the hosting provider's secret or environment-variable system.

Use a separate production database.

Use a different and randomly generated JWT key for production.

Restrict CORS to the deployed frontend origin.

Serve the frontend and backend through HTTPS.

Disable Swagger outside development unless it is intentionally protected.

Do not expose PostgreSQL publicly unless the hosting design requires it and access is restricted.

Do not commit .env, local settings, database backups, logs, tokens, private keys, or real credentials.

Rotate any credential that has previously been committed or shared.

Use a non-personal demo account for the public demo.

Pre-Push Checks

Run these commands before publishing:

Backend

cd backend/DevTrack.API
dotnet restore
dotnet build

Frontend

cd frontend
npm install
npm run build

Repository inspection

git status
git diff --cached

Search tracked files for common secret patterns before the first push:

git grep -n -I -E "Password=|Jwt.*Key|Bearer |BEGIN (RSA|OPENSSH|PRIVATE) KEY|api[_-]?key|client[_-]?secret"

Review every match manually. Some matches may be harmless example text.

API Overview

Main route groups:

/api/Auth
/api/Users
/api/Projects
/api/Tasks
/api/Dashboard
/api/Search
/api/Notifications

Authentication-protected endpoints require a valid Bearer token.

Suggested Future Improvements

Automated backend and frontend tests

Refresh-token flow

Email verification

Password reset

Pagination for large project and task collections

Audit logs

CI workflow for build and test checks

Hosted demo environment

Author

Developed by Eren Karamehmetoğlu as a full-stack portfolio project.