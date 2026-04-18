# Audiobook Player Backend

Express.js backend with PostgreSQL and Prisma ORM.

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services (from audiobook-player-app directory)
docker compose up -d

# View logs
docker compose logs -f api

# Stop services
docker compose down
```

### Local Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Start PostgreSQL (via Docker)
docker compose up db -d

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (auth required)

### Audiobooks
- `GET /api/audiobooks` - List audiobooks (supports `page`, `limit`, `search`, `genre`)
- `GET /api/audiobooks/:id` - Get audiobook details
- `POST /api/audiobooks` - Create audiobook (auth required)
- `GET /api/audiobooks/:id/chapters` - Get chapters

### Library
- `GET /api/library` - Get user's library (auth required)
- `POST /api/library` - Add to library (auth required)
- `DELETE /api/library/:audiobookId` - Remove from library (auth required)

### Playback
- `GET /api/playback` - Get all playback states (auth required)
- `GET /api/playback/continue` - Get continue listening (auth required)
- `GET /api/playback/:audiobookId` - Get playback state (auth required)
- `PUT /api/playback/:audiobookId` - Update playback state (auth required)

### Bookmarks
- `GET /api/bookmarks` - List bookmarks (auth required)
- `POST /api/bookmarks` - Create bookmark (auth required)
- `PUT /api/bookmarks/:id` - Update bookmark (auth required)
- `DELETE /api/bookmarks/:id` - Delete bookmark (auth required)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |

## Database

View and manage data with Prisma Studio:

```bash
npm run db:studio
```
