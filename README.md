# Time Tracker Web Application

A modern, full-stack time tracking application built with Next.js, TypeScript, Tailwind CSS, and Supabase. This application helps users track time spent on tasks and projects, manage their workload, and generate reports.

## Features

- **Task Management**: Create, read, update, and delete tasks
- **Time Tracking**: Start/stop timer for tasks with real-time updates
- **Project Organization**: Group tasks by projects with custom colors
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Built-in dark theme support
- **Reports**: Generate and export time tracking reports
- **Authentication**: User authentication and authorization

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **State Management**: React Hook Form, Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Heroicons
- **Date Handling**: date-fns
- **Form Validation**: Zod

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (for database and authentication)
- Git

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/time-tracker-web-app.git
   cd time-tracker-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.**

## Project Structure

```
time-tracker-web-app/
├── app/                    # App router pages and layouts
├── components/             # Reusable UI components
│   ├── layout/            # Layout components (header, sidebar, etc.)
│   ├── projects/          # Project-related components
│   ├── tasks/             # Task-related components
│   ├── timer/             # Timer components
│   └── ui/                # Basic UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── supabase/          # Supabase client configuration
│   └── utils/             # Helper functions
├── public/                # Static files
├── styles/                # Global styles
├── types/                 # TypeScript type definitions
├── .env.local             # Environment variables (not committed to git)
├── next.config.js         # Next.js configuration
├── package.json           # Project dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Database Schema

The application uses the following database tables:

### `projects`
- `id` (UUID) - Primary key
- `name` (text) - Project name
- `color` (text) - Project color in hex format
- `user_id` (UUID) - Reference to users table
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp
- `is_active` (boolean) - Whether the project is active

### `tasks`
- `id` (UUID) - Primary key
- `title` (text) - Task title
- `description` (text) - Task description (optional)
- `status` (enum) - Task status (not_started, in_progress, in_review, completed)
- `project_id` (UUID) - Reference to projects table
- `user_id` (UUID) - Reference to users table
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp
- `completed_at` (timestamp) - When the task was completed (optional)
- `estimated_duration` (integer) - Estimated duration in minutes (optional)

### `time_entries`
- `id` (UUID) - Primary key
- `task_id` (UUID) - Reference to tasks table
- `user_id` (UUID) - Reference to users table
- `start_time` (timestamp) - When the timer was started
- `end_time` (timestamp) - When the timer was stopped (optional)
- `duration` (integer) - Duration in seconds (calculated if end_time is set)
- `notes` (text) - Optional notes about the time entry
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp

## API Routes

The application includes the following API routes:

- `GET /api/tasks` - Get all tasks for the current user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/[id]` - Get a specific task
- `PUT /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task
- `GET /api/projects` - Get all projects for the current user
- `POST /api/projects` - Create a new project
- `GET /api/time-entries` - Get time entries for the current user
- `POST /api/time-entries` - Create a new time entry

## Authentication

The application uses Supabase Auth for authentication. Users can sign up, sign in, and sign out using email/password or OAuth providers.

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-docs) from the creators of Next.js.

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the repository on Vercel
3. Add your environment variables
4. Deploy!

### Other Platforms

You can also deploy to other platforms like Netlify, AWS, or your own server. Make sure to set up the required environment variables and build the application before deploying.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js
- [Supabase Documentation](https://supabase.com/docs) - Learn about Supabase
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS
