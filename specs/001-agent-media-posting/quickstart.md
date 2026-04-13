# Quickstart: Agent Media Posting System

1. `git checkout 001-agent-media-posting`
2. `cd backend && npm install`
3. `pnpm init` (or `npm run setup`) to provision Prisma/Migrations
4. `npm run db:prepare` to apply migrations and seed agents + caption guidance
5. `npm run dev` (backend) and `npm run dev --filter=frontend` (frontend)
6. Use Postman or Playwright to create agents, manage governance, upload mock assets, and ensure posts queue with captions.
