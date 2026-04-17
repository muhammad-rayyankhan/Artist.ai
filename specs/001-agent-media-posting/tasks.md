---
description: "Task list for Agent Media Posting System implementation"
---

# Tasks: Agent Media Posting System

**Input**: Design documents from `/specs/001-agent-media-posting/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in the feature specification, so test tasks are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `backend/src/`, `frontend/src/` per plan.md
- **Backend**: Node.js 20 + TypeScript 5 + Express 5 + Prisma 5
- **Frontend**: Next.js 15 + React

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure with backend/ and frontend/ directories per implementation plan
- [X] T002 Initialize backend Node.js project with TypeScript, Express, Prisma dependencies in backend/
- [X] T003 Initialize frontend Next.js project with React dependencies in frontend/
- [ ] T004 [P] Configure TypeScript for both backend and frontend projects
- [ ] T005 [P] Setup linting and formatting tools (ESLint, Prettier) for both projects

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Setup PostgreSQL database connection and Prisma configuration in backend/prisma/schema.prisma
- [ ] T007 [P] Implement authentication/authorization framework in backend/src/lib/auth.ts
- [ ] T008 [P] Setup API routing and middleware structure in backend/src/api/
- [ ] T009 Create base database entities (Agent Profile, Visual Post, Caption Guidance, Governance Action) in backend/prisma/schema.prisma
- [ ] T010 Configure error handling and logging infrastructure in backend/src/lib/logging.ts
- [ ] T011 Setup environment configuration management (.env files) for both backend and frontend
- [ ] T012 [P] Create Prisma client and database migration scripts in backend/prisma/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Agent creation and onboarding (Priority: P1) 🎯 MVP

**Goal**: Marketing lead can define a new AI agent persona, configure its scope, and approve initial settings

**Independent Test**: Complete the onboarding flow for one agent and verify that it appears in the agent roster with its defined attributes and statuses

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create Agent Profile model with Prisma schema in backend/prisma/schema.prisma
- [ ] T014 [P] [US1] Create Agent service for CRUD operations in backend/src/services/agent.ts
- [ ] T015 [US1] Implement POST /agents endpoint for agent creation in backend/src/api/agents.ts
- [ ] T016 [US1] Implement GET /agents endpoint for agent roster in backend/src/api/agents.ts
- [ ] T017 [US1] Create agent creation form component in frontend/src/components/AgentCreationForm.tsx
- [ ] T018 [US1] Create agent roster view component in frontend/src/components/AgentRoster.tsx
- [ ] T019 [US1] Implement agent creation page in frontend/src/pages/agents/create.tsx
- [ ] T020 [US1] Implement agent roster page in frontend/src/pages/agents/index.tsx
- [ ] T021 [US1] Add validation for agent name and persona fields in backend/src/services/agent.ts
- [ ] T022 [US1] Add logging for agent creation operations in backend/src/lib/logging.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Agent management and governance (Priority: P2)

**Goal**: Content strategist can review active agents, pause one that is producing low-engagement posts, and see the change reflected

**Independent Test**: Access the agent list, pause an agent, and verify the system reports the paused state and removes it from scheduling until reactivated

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create Governance Action model with Prisma schema in backend/prisma/schema.prisma
- [ ] T024 [US2] Implement PATCH /agents/{agentId} endpoint for agent governance in backend/src/api/agents.ts
- [ ] T025 [US2] Create governance service for pause/resume operations in backend/src/services/governance.ts
- [ ] T026 [US2] Implement agent status toggle component in frontend/src/components/AgentStatusToggle.tsx
- [ ] T027 [US2] Add governance action logging to agent status changes in backend/src/services/governance.ts
- [ ] T028 [US2] Update agent roster view to show status and include pause/resume controls in frontend/src/components/AgentRoster.tsx
- [ ] T029 [US2] Implement agent details page with governance controls in frontend/src/pages/agents/[id].tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Visual content creation and posting (Priority: P3)

**Goal**: Social media operator can trigger a visual content post from an approved agent, supply caption guidance, and confirm the post is scheduled or published

**Independent Test**: Push a generated image and caption, then inspect the scheduled/published list to ensure the entry includes the right agent attribution and caption text

### Implementation for User Story 3

- [ ] T030 [P] [US3] Create Visual Post model with Prisma schema in backend/prisma/schema.prisma
- [ ] T031 [P] [US3] Create Caption Guidance model with Prisma schema in backend/prisma/schema.prisma
- [ ] T032 [US3] Implement POST /posts endpoint for visual post creation in backend/src/api/posts.ts
- [ ] T033 [US3] Implement GET /posts endpoint for post listing in backend/src/api/posts.ts
- [ ] T034 [US3] Create post service for scheduling and publishing in backend/src/services/post.ts
- [ ] T035 [US3] Create visual post creation form component in frontend/src/components/PostCreationForm.tsx
- [ ] T036 [US3] Implement post creation page in frontend/src/pages/posts/create.tsx
- [ ] T037 [US3] Implement post listing page in frontend/src/pages/posts/index.tsx
- [ ] T038 [US3] Add caption validation (max 4000 characters) in backend/src/services/post.ts
- [ ] T039 [US3] Implement post status transitions (draft→scheduled→published/failed) in backend/src/services/post.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T040 [P] Documentation updates in specs/001-agent-media-posting/
- [ ] T041 Code cleanup and refactoring across both backend and frontend
- [ ] T042 Performance optimization for agent roster updates (<300ms P95) in backend/src/api/agents.ts
- [ ] T043 Security hardening for API endpoints in backend/src/lib/auth.ts
- [ ] T044 Run quickstart.md validation to ensure end-to-end workflow works
- [ ] T045 [P] Add audit logging for all governance actions in backend/src/lib/logging.ts
- [ ] T046 Implement conflict handling for simultaneous agent updates in backend/src/services/agent.ts
- [ ] T047 Add descriptive error messages for failed uploads/validations in backend/src/services/post.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on Agent Profile model from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on Agent Profile model from US1

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create Agent Profile model with Prisma schema in backend/prisma/schema.prisma"

# Launch frontend components for User Story 1 together:
Task: "Create agent creation form component in frontend/src/components/AgentCreationForm.tsx"
Task: "Create agent roster view component in frontend/src/components/AgentRoster.tsx"
```

## Parallel Example: User Story 3

```bash
# Launch all models for User Story 3 together:
Task: "Create Visual Post model with Prisma schema in backend/prisma/schema.prisma"
Task: "Create Caption Guidance model with Prisma schema in backend/prisma/schema.prisma"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Agent creation)
   - Developer B: User Story 2 (Governance) - can start after Agent Profile model
   - Developer C: User Story 3 (Posting) - can start after Agent Profile model
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total tasks: 47
- Tasks per story: US1: 10, US2: 7, US3: 10, Setup: 5, Foundational: 7, Polish: 8
- Suggested MVP scope: User Story 1 only (after Setup + Foundational)