# Backend API

A **production-ready Node.js backend** built with clean architecture and best practices. Features JWT authentication, role-based access control, Redis caching, PostgreSQL with Prisma ORM, and comprehensive API documentation.

---

## ✨ Features

- 🔐 **JWT Authentication** — Access tokens (15min) + Refresh tokens (7 days) with token rotation
- 👥 **Role-Based Access Control (RBAC)** — USER, ADMIN, MODERATOR roles
- 🗄️ **PostgreSQL + Prisma ORM** — Type-safe database access with migrations
- ⚡ **Redis Caching** — User profile caching with graceful degradation
- 🛡️ **Security** — Helmet, CORS, rate limiting, input validation
- ✅ **Validation** — Zod schemas for all request inputs and environment variables
- 📝 **Logging** — Winston logger with request ID tracking
- 📖 **API Documentation** — Swagger UI at `/api/v1/docs`
- 🐳 **Docker Ready** — Multi-stage Dockerfile + docker-compose
- 🧪 **Testing** — Jest + supertest unit and integration tests

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js 20 LTS | Runtime |
| Express.js | HTTP framework |
| PostgreSQL 15 | Primary database |
| Prisma ORM | Database access layer |
| Redis 7 | Caching |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| Zod | Schema validation |
| Winston | Logging |
| Swagger/OpenAPI | API documentation |
| Jest + supertest | Testing |
| Docker | Containerization |

---

## 📋 Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Docker** + **Docker Compose** ([Download](https://www.docker.com/))
- **PostgreSQL** 15+ (or use Docker)
- **Redis** 7+ (or use Docker)

---

## 🚀 Quick Start with Docker

The fastest way to get up and running:

```bash
# 1. Clone the repository
git clone <repo-url>
cd backend

# 2. Copy environment variables
cp .env.example .env

# 3. Update JWT secrets in .env (IMPORTANT for security!)
# JWT_ACCESS_SECRET=your-secure-random-string
# JWT_REFRESH_SECRET=your-other-secure-random-string

# 4. Start all services (app + postgres + redis)
docker-compose up -d --build

# 5. Run database migrations
docker-compose exec app npx prisma migrate deploy

# 6. Open API documentation
open http://localhost:3000/api/v1/docs
```

---

## 🔧 Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Database Setup

```bash
# Start PostgreSQL and Redis (if not already running)
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

### 4. Start Development Server

```bash
npm run dev
```

The server starts at `http://localhost:3000`.

---

## 📖 API Documentation

Interactive Swagger UI is available at:

```
http://localhost:3000/api/v1/docs
```

---

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma              # Database schema (User, Token models)
├── src/
│   ├── config/
│   │   ├── index.js               # Central config with Zod env validation
│   │   ├── database.js            # Prisma client singleton
│   │   ├── redis.js               # Redis client with graceful fallback
│   │   ├── logger.js              # Winston logger setup
│   │   └── swagger.js             # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   ├── auth.controller.js     # Auth HTTP handlers
│   │   ├── user.controller.js     # User CRUD HTTP handlers
│   │   └── health.controller.js   # Health check handler
│   ├── services/
│   │   ├── auth.service.js        # Authentication business logic
│   │   ├── user.service.js        # User management business logic
│   │   └── token.service.js       # JWT token management
│   ├── repositories/
│   │   ├── user.repository.js     # User data access layer
│   │   └── token.repository.js    # Token data access layer
│   ├── routes/
│   │   ├── index.js               # Route aggregator
│   │   ├── auth.routes.js         # Auth routes with Swagger docs
│   │   ├── user.routes.js         # User routes with Swagger docs
│   │   └── health.routes.js       # Health routes with Swagger docs
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT Bearer token verification
│   │   ├── rbac.middleware.js      # Role-based access control
│   │   ├── validate.middleware.js  # Zod request validation
│   │   ├── error.middleware.js     # Centralized error handler
│   │   ├── rateLimiter.middleware.js
│   │   └── requestId.middleware.js # Attach unique request ID
│   ├── validations/
│   │   ├── auth.validation.js     # Auth Zod schemas
│   │   └── user.validation.js     # User Zod schemas
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Standardized response helpers
│   │   ├── catchAsync.js          # Async error wrapper
│   │   └── pick.js                # Object pick utility
│   ├── docs/
│   │   └── swaggerDef.js          # Swagger spec export
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point with graceful shutdown
├── tests/
│   ├── unit/
│   │   └── auth.service.test.js   # Auth service unit tests
│   ├── integration/
│   │   └── auth.test.js           # Auth integration tests
│   └── setup.js                   # Jest global setup
├── .env.example                   # Environment variable template
├── .eslintrc.json                 # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── .gitignore
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Full stack with postgres + redis
├── jest.config.js
├── package.json
└── README.md
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot-reload |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check code style with ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run db:migrate` | Run Prisma database migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run docker:up` | Start all Docker services |
| `npm run docker:down` | Stop all Docker services |

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Environment (`development`/`production`/`test`) |
| `PORT` | No | `3000` | HTTP server port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL |
| `JWT_ACCESS_SECRET` | **Yes** | — | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | — | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRATION` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRATION` | No | `7d` | Refresh token TTL |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |

---

## 📡 API Endpoints

| Method | Endpoint | Auth Required | Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | ❌ | — | Register new user |
| `POST` | `/api/v1/auth/login` | ❌ | — | Login, get tokens |
| `POST` | `/api/v1/auth/refresh-token` | ❌ | — | Refresh access token |
| `POST` | `/api/v1/auth/logout` | ✅ | Any | Blacklist refresh token |
| `POST` | `/api/v1/auth/change-password` | ✅ | Any | Change password |
| `POST` | `/api/v1/users` | ✅ | ADMIN | Create user |
| `GET` | `/api/v1/users` | ✅ | ADMIN | List users (paginated) |
| `GET` | `/api/v1/users/:id` | ✅ | Any* | Get user by ID |
| `PATCH` | `/api/v1/users/:id` | ✅ | Any* | Update user profile |
| `DELETE` | `/api/v1/users/:id` | ✅ | ADMIN | Delete user |
| `GET` | `/api/v1/health` | ❌ | — | Health check |
| `GET` | `/api/v1/docs` | ❌ | — | Swagger UI |

*Users can only access/update their own profile; admins can access any

---

## 🔧 Example Requests

### Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass1",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass1"
  }'
```

### Get Users (Admin)

```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run specific test file
npx jest tests/unit/auth.service.test.js
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).