# Frontend Dashboard

A production-ready React frontend that integrates with the Node.js backend API. Built with React, TypeScript, Vite, and TailwindCSS.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and builds
- **TailwindCSS v4** for styling
- **Axios** for HTTP requests
- **TanStack React Query** for server state management
- **Zustand** for global client state
- **React Hook Form + Zod** for form validation
- **React Router v7** for routing
- **React Hot Toast** for notifications

## Project Structure

```
src/
├── api/            # Axios client with interceptors
├── components/
│   ├── layout/     # Navbar, Sidebar
│   └── ui/         # Button, Input, Modal, Table, Pagination, Skeleton
├── constants/      # API endpoints, route paths, query keys
├── hooks/          # React Query hooks (useAuth, useUsers)
├── layouts/        # DashboardLayout, AuthLayout
├── pages/
│   ├── auth/       # LoginPage, RegisterPage
│   ├── dashboard/  # DashboardPage, UserListPage, UserProfilePage, EditProfilePage
│   └── system/     # NotFoundPage
├── routes/         # AppRouter, ProtectedRoute, PublicRoute
├── services/       # API service functions (auth, users, health)
├── store/          # Zustand stores (auth, app)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on `http://localhost:5000`

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` to match your backend URL:

```
VITE_API_URL=http://localhost:5000/api/v1
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:3000` with API requests proxied to the backend.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Features

### Authentication
- Login / Register with form validation
- JWT access + refresh token management
- Automatic token refresh on 401 responses
- Protected routes with role-based access
- Secure token storage in localStorage
- Auto-logout on token expiration

### User Management
- User list with pagination
- Create, view, edit, and delete users
- Role-based UI (admin vs user)

### UI/UX
- Responsive design (mobile-friendly sidebar)
- Loading skeletons for data fetching
- Toast notifications for actions
- Form validation with error messages
- 404 error page

## API Integration

The frontend integrates with these backend endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/change-password` | Change password |
| GET | `/api/v1/users` | List users |
| GET | `/api/v1/users/:id` | Get user |
| POST | `/api/v1/users` | Create user |
| PATCH | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |
| GET | `/api/v1/health` | Health check |
