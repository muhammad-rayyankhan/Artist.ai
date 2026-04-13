# Implementation Plan: Agent Media Posting System

**Branch**: `001-agent-media-posting` | **Date**: 2026-04-13 | **Spec**: specs/001-agent-media-posting/spec.md
**Input**: Feature specification from `/specs/001-agent-media-posting/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a web-based orchestration surface where marketing and content teams can create, govern, and trigger AI agents that publish visual posts with captions, using an AI-friendly backend, scalable PostgreSQL storage, and a lightweight Next.js frontend aligned with the clarified constraint of reusing existing downstream connectors.

## Technical Context

**Language/Version**: TypeScript 5 running on Node.js 20 for the backend and Next.js 15 for the frontend  
**Primary Dependencies**: Express 5 for REST APIs, Prisma 5 with the `pg` driver for database access, `next`/`react` for the UI, `openai` or similar HTTP client for AI coordination, `zustand` or `react-query` for frontend state, `supertest` and `Playwright` for tests  
**Storage**: PostgreSQL 15 (self-hosted or free-tier managed provider) with Prisma schema modeling the agent, post, caption, and governance tables  
**Testing**: Jest + Supertest for backend units, Playwright for frontend flows, and contract tests generated from the API spec  
**Target Platform**: Linux cloud instances for backend services and modern desktop browsers for the frontend experience  
**Project Type**: Web application with distinct backend and frontend directories  
**Performance Goals**: Response latency for roster updates and governance toggles under 300ms (P95) while camera-heavy uploads stay within ~5-second processing budget  
**Constraints**: Use free or freemium tooling only, keep MVP scope minimal (no new connectors), and treat every AI post request as auditable with deterministic logging  
**Scale/Scope**: Initial launch supports tens of agents, hundreds of queued posts, and a small operations team; design for eventual thousands of posts per day without architectural overhaul

## Constitution Check

All Constitution principles are respected: spec-driven delivery already in place, research keeps randomness bounded (AI calls logged and validated), the UI emphasis remains visual-first by focusing on roster/canvas views, and the MVP avoids overengineering by using existing connectors while still meeting cybersecurity expectations through audit logs and RBAC enforcement. No gate violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-agent-media-posting/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.yaml
└── tasks.md
```

### Source Code (repository root)
```
backend/
├── src/
│   ├── api/
│   │   ├── agents.ts
│   │   ├── posts.ts
│   │   └── governance.ts
│   ├── services/
│   │   ├── ai.ts
│   │   ├── storage.ts
│   │   └── scheduling.ts
│   └── lib/
│       ├── auth.ts
│       └── logging.ts
└── tests/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: Chose a two-project web application layout (backend/ + frontend/) to keep API/frontend concerns separated, matching the user request for a backend tailored to AI integration plus a modern frontend framework.

## Complexity Tracking

No Constitution gate violations are present, so no extra tracking table is necessary.
