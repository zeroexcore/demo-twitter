# Demo Twitter - Development Prompts

A chronicle of prompts used to build this Twitter clone with AI assistance.

## Project Setup

### Initial Creation
> "Create a Twitter clone demo project using Hono API, React web app, D1 database"

**Effect**: Set up monorepo structure with:
- `apps/api` - Hono + Cloudflare Workers API
- `apps/web` - React + Vite + TanStack Query + Zustand
- `packages/cdn` - Static assets and R2 uploads
- `packages/types` - Shared TypeScript types
- `packages/utils` - Shared utilities
- pnpm workspaces + Turborepo configuration

### Database Schema
> "Set up D1 database with users, tweets, likes, retweets, follows tables"

**Effect**: Created migration `0001_initial.sql` with:
- Users table (id, username, email, password_hash, display_name, bio, avatar_url)
- Tweets table (id, user_id, content, created_at, updated_at)
- Likes table (user_id, tweet_id)
- Retweets table (user_id, tweet_id)
- Follows table (follower_id, following_id)

### API Routes
> "Create API routes for auth, tweets, users, timeline"

**Effect**: Implemented routes:
- `/auth/register`, `/auth/login` - Authentication
- `/tweets` - CRUD operations, like/unlike, retweet/unretweet
- `/users/:username` - Profile, tweets, follow/unfollow
- `/timeline/public`, `/timeline/home` - Timeline feeds

### Web Components
> "Create React components for tweet card, compose tweet, timeline, profile page"

**Effect**: Built components:
- `TweetCard` - Display tweet with actions
- `ComposeTweet` - Tweet composition form
- `TweetList` - Infinite scroll tweet list
- `Layout` - App shell with header and navigation
- Pages: HomePage, ProfilePage, TweetPage, LoginPage, RegisterPage

---

## Features

### Dark Mode (OXC-203)
> "Add dark mode support with theme toggle"

**Effect**:
- Added `ThemeToggle` component with sun/moon icons
- Zustand store for theme persistence in localStorage
- Tailwind `dark:` classes throughout components

### Auto-generated Avatars (OXC-204)
> "Add auto-generated user avatars using DiceBear API"

**Effect**:
- Integrated DiceBear initials API for avatar generation
- Fallback avatars based on username seed
- Consistent avatar styling across components

### Typography (OXC-207)
> "Improve typography with Inter font"

**Effect**:
- Added Google Fonts Inter import
- Updated Tailwind config with font family
- Applied to body and components

### Seed Data (OXC-208)
> "Create realistic seed data with multiple users and tweets"

**Effect**: Created `seed.sql` with:
- 12 demo users with varied bios
- 30 tweets with realistic tech content
- Follow relationships creating social graph
- Likes and retweets for engagement

### Image Uploads (OXC-205)
> "Add image uploads to tweets - store in R2, display in tweet cards with lightbox"

**Effect**:
- Added `images` column to tweets table (migration `0002_add_images.sql`)
- CDN POST `/upload` endpoint for R2 storage
- Updated API routes to include/parse images JSON
- `ComposeTweet` with image picker, previews, upload progress
- `TweetCard` with image grid (1-4 images) and lightbox modal

---

## Bug Fixes

### Dark Mode Fixes
> "Dark mode looks like shit, check that tweet timeline, card etc follow theme and don't have colors hardcoded anywhere"

**Effect**: Fixed hardcoded light-mode colors in:
- `HomePage.tsx` - header and container
- `TweetList.tsx` - empty state text
- `ProfilePage.tsx` - all text, borders, buttons, avatar borders
- `TweetPage.tsx` - header, error state, back button

### Screenshot Script
> "Seed some tweets, otherwise it's too empty. Make screenshots with timeline full of tweets"

**Effect**:
- Fixed vite proxy to use configurable `VITE_API_PORT`
- Screenshot script passes API port to web server
- Added API data availability check before screenshots
- Screenshots now show full timeline with 20+ tweets

### Header Overlap
> "Heading is covering the timeline and profile timeline as well, can you ensure padding is sufficient and it does not overlap by default"

**Effect**:
- Removed sticky positioning from inner page headers
- Headers now scroll with content, no overlap

### CORS Issues
> "I have CORS issues, redeploy API and add necessary CORS"

**Effect**: Updated API CORS config to allow:
- `http://localhost:5173` (dev)
- `http://localhost:3000` (dev)
- `http://localhost:35173` (screenshots)
- `https://twitter-demo.oxc.dev` (production)

### Public Timeline for Logged-in Users
> "When user is logged in but not on profile page - display public timeline for now"

**Effect**: Changed HomePage to always show public timeline instead of home timeline (which requires follows).

---

## Deployment

### Production Deployment
> "Use wrangler CLI to deploy current version, use twitter-demo.oxc.dev and twitter-demo-api.oxc.dev routes"

**Effect**:
- Created D1 database `demo-twitter-db` (ID: `6cf0c91c-1135-416b-b89b-0690aab9059e`)
- API deployed to `twitter-demo-api.oxc.dev` (Workers + D1)
- Web deployed to `twitter-demo.oxc.dev` (Workers + Assets SPA)

### Assets Configuration
> "Don't use Pages, instead use assets directive in wrangler.toml and deploy with wrangler deploy, use SPA for not found handler"

**Effect**: Updated `apps/web/wrangler.toml`:
```toml
[assets]
directory = "dist"
not_found_handling = "single-page-application"
```

### Database Seeding
> "Run database migrations" / "Also seed tweets"

**Effect**:
- Applied migrations to production D1
- Seeded with 12 users, 30 tweets, follows, likes, retweets

---

## Screenshots

### Screenshot Generation
> "Make new screenshots, rename them accordingly and update Linear issues"

**Effect**:
- New v2 screenshots with proper dark mode theming
- Filenames: `timeline-light-v2.png`, `timeline-dark-v2.png`, etc.
- Deployed to CDN at `demo-twitter-cdn.oxc.workers.dev`

---

## URLs

- **Web**: https://twitter-demo.oxc.dev
- **API**: https://twitter-demo-api.oxc.dev
- **CDN**: https://demo-twitter-cdn.oxc.workers.dev
- **GitHub**: https://github.com/zeroexcore/demo-twitter
