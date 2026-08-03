# DevTrack

### Modern project and task management in one focused workspace

Organize projects, manage tasks, track deadlines, and monitor progress through a clean, responsive dashboard.

> **Demo notice**
>
> The backend is hosted on a free service and may need up to **50 seconds** to wake up after a period of inactivity. Please allow a brief moment for the first request to complete. You can access the demo website via "https://dev-track-ten.vercel.app" address.
> This is a public portfolio demo. Please do not enter sensitive,
> confidential, or personally identifiable information.

## Overview

DevTrack is a full-stack project and task management application designed to keep daily work organized and easy to follow.

It combines project planning, task tracking, Kanban workflows, deadline monitoring, analytics, and account preferences in a single interface. The application is suitable for managing personal projects, development work, study plans, or any workflow that benefits from clear task organization.

## Core Features

### Project Management

Create and manage multiple projects from one dashboard. Each project includes its own description, task collection, activity, and progress information.

### Task Management

Tasks can be created, edited, and deleted with the following details:

- Title and description
- Priority level
- Current status
- Due date
- Completion state

### Kanban Workflow

Tasks are organized into three workflow stages:

```text
To Do  →  In Progress  →  Completed
```

Task cards can be moved between columns using drag and drop or updated through their status controls.

### Search and Filtering

Tasks and projects can be found quickly using search tools. Task lists can also be filtered by:

- Status
- Priority
- Due date
- Overdue state

### Deadline Tracking

Upcoming and overdue tasks are highlighted so that important work remains visible and easier to prioritize.

### Dashboard and Analytics

The dashboard provides a clear summary of current activity, including:

- Total projects and tasks
- Completed and overdue tasks
- Task status distribution
- Completion activity
- Recent projects
- Recent tasks

### Account Customization

Users can manage their profile information, update their password, and choose from built-in avatar options.

## How It Is Used

1. **Create an account**  
   Register a new account or sign in to an existing one.

2. **Create a project**  
   Add a project with a name and description.

3. **Add tasks**  
   Create the tasks required to complete the project.

4. **Set task details**  
   Define each task's priority, status, description, and due date.

5. **Track progress**  
   Move tasks through the Kanban workflow as work advances.

6. **Review activity**  
   Use the Dashboard, Tasks, and Analytics pages to monitor progress and deadlines.

7. **Personalize the account**  
   Update profile details, change the password, or select an avatar from Settings.

## Main Pages

| Page | Purpose |
|---|---|
| **Dashboard** | Displays statistics, task summaries, charts, and recent activity |
| **Projects** | Lists and manages all projects |
| **Project Detail** | Provides project information and the Kanban task board |
| **Tasks** | Displays and manages tasks across all projects |
| **Analytics** | Presents progress and task completion data |
| **Settings** | Manages profile, password, and avatar preferences |

## Application Flow

```text
Create a project
        ↓
Add and organize tasks
        ↓
Track work on the Kanban board
        ↓
Monitor deadlines and progress
        ↓
Review activity through analytics
```

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js
- dnd-kit
- react-hot-toast
- Lucide React

### Backend

- ASP.NET Core 8
- Entity Framework Core
- PostgreSQL
- JWT authentication
- BCrypt
- FluentValidation
- Swagger / OpenAPI
- Docker

## Author

Developed and maintained by the repository owner, Eren Karamehmetoğlu.
