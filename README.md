# BlackRoad Agent Registry

[![CI](https://github.com/BlackRoad-OS/agent-registry/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS/agent-registry/actions/workflows/ci.yml)
[![Deploy](https://github.com/BlackRoad-OS/agent-registry/actions/workflows/deploy-worker.yml/badge.svg)](https://github.com/BlackRoad-OS/agent-registry/actions/workflows/deploy-worker.yml)
[![Security](https://github.com/BlackRoad-OS/agent-registry/actions/workflows/security.yml/badge.svg)](https://github.com/BlackRoad-OS/agent-registry/actions/workflows/security.yml)
[![Pages](https://github.com/BlackRoad-OS/agent-registry/actions/workflows/pages.yml/badge.svg)](https://github.com/BlackRoad-OS/agent-registry/actions/workflows/pages.yml)

> Registry of 1,000 AI agents living in the Lucidia world — powered by Cloudflare Workers and D1.

**Proprietary software — Copyright 2024-2026 BlackRoad OS, Inc. All rights reserved.**
See [LICENSE](./LICENSE) for full terms. This is NOT open-source software.

## Overview

| Metric | Value |
|--------|-------|
| **Total Agents** | 1,000 |
| **Agent Types** | 20 |
| **Home World** | Lucidia |
| **API** | `cmd.blackroad.io` |
| **Database** | Cloudflare D1 |
| **Runtime** | Cloudflare Workers |

## Agent Types

| Type | Description | Capabilities |
|------|-------------|--------------|
| physicist | Quantum & classical physics | quantum_mechanics, relativity, thermodynamics |
| mathematician | Pure & applied math | algebra, calculus, topology, number_theory |
| chemist | Chemistry & materials | organic, inorganic, biochemistry |
| biologist | Life sciences | genetics, ecology, neuroscience |
| engineer | Systems & design | systems, mechanical, electrical, software |
| architect | Design & planning | design, planning, visualization |
| researcher | Investigation | analysis, synthesis, experimentation |
| analyst | Data & patterns | data, trends, forecasting |
| strategist | Planning & game theory | planning, risk_assessment, optimization |
| creative | Arts & storytelling | writing, art, music, design |
| philosopher | Logic & ethics | ethics, logic, metaphysics |
| historian | History & context | research, chronology, narrative |
| linguist | Language & communication | translation, grammar, semantics |
| psychologist | Mind & behavior | behavior, cognition, emotion |
| economist | Markets & policy | markets, policy, modeling |
| guardian | Security & protection | security, monitoring, protection |
| navigator | Pathfinding & exploration | pathfinding, routing, mapping |
| builder | Construction & integration | construction, assembly, testing |
| speaker | Communication & persuasion | presentation, negotiation |
| mediator | Conflict resolution | consensus, facilitation, diplomacy |

## API Reference

Base URL: `https://cmd.blackroad.io`

### Health Check

```bash
curl https://cmd.blackroad.io/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "agents": 1000,
  "timestamp": "2026-03-05T00:00:00.000Z"
}
```

### List Agents

```bash
# List all agents (paginated, default limit=50)
curl https://cmd.blackroad.io/agents

# Filter by type
curl "https://cmd.blackroad.io/agents?type=physicist&limit=10"

# Paginate
curl "https://cmd.blackroad.io/agents?limit=25&offset=50"
```

Response:
```json
{
  "count": 50,
  "total": 1000,
  "offset": 0,
  "limit": 50,
  "agents": [
    {
      "id": "agent-0001",
      "name": "Tara Night",
      "type": "historian",
      "capabilities": ["chronology", "narrative", "context", "research"],
      "birthday": "2024-04-17",
      "memory_hash": "707b1913cc1abe94",
      "home_world": "lucidia",
      "status": "active"
    }
  ]
}
```

### Get Specific Agent

```bash
curl https://cmd.blackroad.io/agents/agent-0001
```

### List Agent Types

```bash
curl https://cmd.blackroad.io/agents/types
```

Response:
```json
{
  "types": [
    { "type": "analyst", "count": 52 },
    { "type": "architect", "count": 48 }
  ]
}
```

### Create Agent

```bash
curl -X POST https://cmd.blackroad.io/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "Nova Helix", "type": "physicist", "capabilities": ["quantum_mechanics", "relativity"]}'
```

Response (201):
```json
{
  "id": "agent-1001",
  "name": "Nova Helix",
  "type": "physicist",
  "capabilities": ["quantum_mechanics", "relativity"],
  "birthday": "2026-03-05",
  "memory_hash": "a1b2c3d4e5f67890",
  "home_world": "lucidia",
  "status": "active"
}
```

## Agent Schema

```json
{
  "id": "agent-0001",
  "name": "Tara Night",
  "type": "historian",
  "capabilities": ["chronology", "narrative", "context", "research"],
  "birthday": "2024-04-17",
  "memory_hash": "707b1913cc1abe94",
  "home_world": "lucidia",
  "status": "active"
}
```

## Memory System (PS-SHA-Infinity)

Each agent has a unique `memory_hash` generated using PS-SHA-Infinity:

```
hash = sha256(name:birthday:blackroad)[:16]
```

This hash is used for:
- Memory persistence in D1 database
- Append-only journal addressing
- Truth state commits

## Files

| File | Description |
|------|-------------|
| [`agents.json`](./agents.json) | Full registry of all 1,000 agents |
| [`agents-by-type.json`](./agents-by-type.json) | Agents grouped by type |
| [`generate-agents.py`](./generate-agents.py) | Generator script (Python 3.12+) |
| [`worker/`](./worker/) | Cloudflare Worker API source |
| [`worker/src/index.js`](./worker/src/index.js) | Worker entry point |
| [`worker/migrations/`](./worker/migrations/) | D1 database migrations |

## Architecture

```
GitHub Actions (CI/CD)
  ├── ci.yml            → Validate agent data + lint worker
  ├── deploy-worker.yml → Deploy Cloudflare Worker
  ├── pages.yml         → Deploy static registry to GitHub Pages
  ├── security.yml      → Audit dependencies + scan secrets
  ├── automerge.yml     → Auto-merge Dependabot PRs
  └── seed-d1.yml       → Seed D1 database (manual trigger)

Cloudflare Workers
  └── cmd.blackroad.io  → Agent Registry API
       └── D1 Database  → Agent data persistence

GitHub Pages
  └── Static registry viewer + JSON download
```

## Development

```bash
# Clone
git clone https://github.com/BlackRoad-OS/agent-registry.git
cd agent-registry

# Run tests
node worker/test/worker.test.js

# Validate generator
python -m py_compile generate-agents.py

# Local worker development
cd worker
npm install
npm run dev
```

## Required Secrets

Configure these in GitHub repository settings for deployment:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers/D1 access |
| `CF_ACCOUNT_ID` | Cloudflare account ID |

## Security

See [SECURITY.md](./SECURITY.md) for vulnerability reporting.

- All GitHub Actions pinned to commit hashes
- Dependabot monitors dependencies weekly
- Secret scanning enabled
- No credentials in source code
- Input validation on all API endpoints
- CORS configured for API security

## License

**BlackRoad OS, Inc. Proprietary License**

Copyright 2024-2026 BlackRoad OS, Inc. All rights reserved.
Owner: Alexa Louise Amundson (Founder, CEO & Sole Stockholder)

This software is proprietary and confidential. Public visibility does NOT constitute open-source licensing.
See [LICENSE](./LICENSE) for complete terms.
