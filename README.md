# Demo Twitter

A full-stack Twitter clone demonstrating the oxc tech stack.

![Demo Twitter](https://demo-twitter-cdn.oxc.workers.dev/screenshots/home.png)

<details>
<summary>Mobile View</summary>

![Mobile](https://demo-twitter-cdn.oxc.workers.dev/screenshots/home-mobile.png)

</details>

## Tech Stack

### API (`apps/api`)
- **[Hono](https://hono.dev/)** - Fast, lightweight web framework
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Edge runtime
- **[D1](https://developers.cloudflare.com/d1/)** - SQLite database
- **[Zod](https://zod.dev/)** - Runtime validation

### Web (`apps/web`)
- **[React 19](https://react.dev/)** - UI framework
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[TanStack Query](https://tanstack.com/query)** - Server state
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Client state
- **[React Router](https://reactrouter.com/)** - Routing

### Monorepo
- **[pnpm](https://pnpm.io/)** - Package manager
- **[Turborepo](https://turbo.build/)** - Build orchestration

## Features

- User authentication (register/login)
- Create, edit, delete tweets
- Like and retweet
- User profiles with follow/unfollow
- Timeline feed (home & public)
- Mobile-friendly responsive design

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/zeroexcore/demo-twitter.git
cd demo-twitter

# Install dependencies
pnpm install

# Set up local database
pnpm --filter @demo-twitter/api db:setup
```

### Development

```bash
# Start all services (API + Web)
pnpm dev

# Or start individually
pnpm --filter @demo-twitter/api dev   # API on http://localhost:8787
pnpm --filter @demo-twitter/web dev   # Web on http://localhost:5173
```

### Quality Checks

```bash
pnpm typecheck  # TypeScript
pnpm lint       # ESLint
pnpm test       # Vitest
```

## Project Structure

```
demo-twitter/
├── apps/
│   ├── api/                 # Hono API (Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── routes/      # API routes
│   │   │   ├── middleware/  # Auth middleware
│   │   │   ├── db/          # Database schema
│   │   │   └── index.ts     # Entry point
│   │   └── wrangler.toml    # Cloudflare config
│   └── web/                 # React web app
│       ├── src/
│       │   ├── components/  # UI components
│       │   ├── pages/       # Route pages
│       │   ├── stores/      # Zustand stores
│       │   ├── hooks/       # Custom hooks
│       │   └── lib/         # Utilities
│       └── index.html
├── packages/
│   ├── cdn/                 # Static assets (screenshots)
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utilities
├── turbo.json               # Turborepo config
└── pnpm-workspace.yaml      # Workspace config
```

## API Endpoints

### Auth
- `POST /auth/register` - Create account
- `POST /auth/login` - Sign in

### Tweets
- `GET /tweets/:id` - Get tweet
- `POST /tweets` - Create tweet (auth required)
- `PUT /tweets/:id` - Update tweet (auth required)
- `DELETE /tweets/:id` - Delete tweet (auth required)
- `POST /tweets/:id/like` - Like tweet (auth required)
- `DELETE /tweets/:id/like` - Unlike tweet (auth required)
- `POST /tweets/:id/retweet` - Retweet (auth required)
- `DELETE /tweets/:id/retweet` - Undo retweet (auth required)

### Users
- `GET /users/:username` - Get profile
- `GET /users/:username/tweets` - Get user's tweets
- `PUT /users/me` - Update profile (auth required)
- `POST /users/:username/follow` - Follow user (auth required)
- `DELETE /users/:username/follow` - Unfollow user (auth required)

### Timeline
- `GET /timeline/public` - Public timeline
- `GET /timeline/home` - Home timeline (auth required)

## Deployment

Deployments are automated via GitHub Actions on push to `main`.

### Live URLs
- **Web**: https://demo-twitter-web.pages.dev
- **API**: https://demo-twitter-api.zeroexcore.workers.dev

### Manual Deployment

#### API (Cloudflare Workers)

```bash
cd apps/api
wrangler deploy
```

#### Web (Cloudflare Pages)

```bash
cd apps/web
pnpm build
pnpm deploy
```

### CI/CD Setup

1. Create a Cloudflare API token with these permissions:
   - Workers Scripts: Edit
   - Pages: Edit
   - D1: Edit

2. Add the token as a GitHub secret:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Your API token

3. Push to `main` to trigger deployment

## License

MIT
