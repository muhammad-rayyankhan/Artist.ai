# Data Model: Agent Media Posting System

## Entities

### Agent Profile
- **Fields**:
  - `id`: UUID
  - `name`: string (required)
  - `persona`: text describing voice and intent
  - `scope`: text or JSON blob capturing allowed channels/topics
  - `captions_tone`: string (default guidance for captions)
  - `status`: enum [active, paused, retired]
  - `created_by`: user identifier
  - `created_at`: timestamp
  - `updated_at`: timestamp
- **Relationships**:
  - Has many `Visual Post`
  - Has many `Governance Action`
- **Validation**: `name` and `persona` required; `status` defaults to `active`; UUID primary key

### Visual Post
- **Fields**:
  - `id`: UUID
  - `agent_id`: FK → `Agent Profile`
  - `caption`: text (max 4000 characters)
  - `asset_reference`: URL or blob identifier
  - `status`: enum [draft, scheduled, published, failed]
  - `target_channel`: string (e.g., Instagram, LinkedIn)
  - `scheduled_for`: timestamp
  - `created_at`: timestamp
  - `published_at`: timestamp (nullable)
- **Relationships**:
  - Belongs to `Agent Profile`
  - Has many `Caption Guidance` references (if using templates)
- **Validation**: `caption` respects length rules; `status` transitions follow allowed graph (draft→scheduled→published or failed)

### Caption Guidance
- **Fields**:
  - `id`: UUID
  - `agent_id`: FK → `Agent Profile`
  - `tone`: string (free text)
  - `keywords`: array of strings
  - `structure_template`: text
  - `created_at`: timestamp
- **Relationships**:
  - Belongs to `Agent Profile`
- **Validation**: `agent_id` required; `tone` defaults to agent-level tone if empty

### Governance Action
- **Fields**:
  - `id`: UUID
  - `agent_id`: FK → `Agent Profile`
  - `action`: enum [create, update, pause, resume]
  - `performed_by`: user reference
  - `notes`: text
  - `created_at`: timestamp
- **Relationships**:
  - Belongs to `Agent Profile`
- **Validation**: `action` required; `performed_by` required for audit

## State Transitions
- **Agent status**: `active` → `paused` → `active` (replayable) → `retired` (no revive without admin review).
- **Visual Post status**: `draft` → `scheduled` / `failed`; `scheduled` → `published` / `failed`; `failed` may re-enter `draft` after manual intervention.

## Assumptions
- Operators can upload assets in a pre-validated format; actual storage references are handed off to asset hosting services.
- Caption guidance remains lightweight, with keyword lists and templates stored per agent rather than rich AI embeddings.   