# Research Findings for Agent Media Posting System

## Decision: Stack for MVP web orchestration
- **Decision**: Node.js 20 + TypeScript 5 backend with Express 5, coupled with Next.js 15 frontend.
- **Rationale**: TypeScript/Node provide fast bootstrapping, a neutral runtime for AI HTTP services, and free tooling; Next.js covers SSR/CSR needs without extra pipeline.
- **Alternatives considered**: Python/FastAPI (more manual UI wiring), Rust (longer iteration time), Ruby/Rails (overkill for MVP).

## Decision: Scalable data storage
- **Decision**: PostgreSQL 15 accessed through Prisma ORM.
- **Rationale**: PostgreSQL is free, battle-tested, supports JSON/text for captions, and Prisma simplifies migrations while keeping schema versioned.
- **Alternatives considered**: SQLite (not cloud-friendly), MongoDB (would complicate joins across agents/posts), Supabase (adds infrastructure lift for now).

## Decision: AI/backoffice integration approach
- **Decision**: Leverage existing downstream connectors for publishing; the system orchestrates agents/captions without new connectors.
- **Rationale**: Reduces scope per clarification, keeps MVP simple, and relies on proven connectors managed outside this feature.
- **Alternatives considered**: Bundle connector SDKs (delays delivery), build plugin framework (too much upfront investment).