# BlackRoad Agent Registry

> Registry of 1,000 AI agents living in the Lucidia world with integrated Kanban project management

## Overview

| Metric | Count |
|--------|-------|
| **Total Agents** | 1,000 |
| **Agent Types** | 20 |
| **Home World** | Lucidia |
| **Integrated APIs** | 10+ |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/BlackRoad-OS/agent-registry.git
cd agent-registry

# Test hashing utilities
python lib/hashing.py sha256 "test data"
python lib/hashing.py agent "Nova Helix" "2024-01-15"
```

## Project Structure

```
agent-registry/
├── agents.json           # Full registry (1,000 agents)
├── agents-by-type.json   # Type-indexed registry
├── generate-agents.py    # Agent generator script
├── AGENT_INSTRUCTIONS.md # Instructions for AI agents
├── config/
│   ├── endpoints.json    # API endpoint configurations
│   └── crm-state.json    # CRM state management config
├── lib/
│   ├── __init__.py
│   └── hashing.py        # SHA256 & SHA-Infinity utilities
├── .kanban/
│   ├── project.json      # Kanban board configuration
│   └── cards.json        # Task cards schema
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
        ├── pr-validation.yml
        └── sync-state.yml
```

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

## Kanban Project System

The kanban system integrates with Salesforce (CRM), Cloudflare (edge state), and GitHub (file storage).

### Boards

| Board | Purpose | Columns |
|-------|---------|---------|
| Main | Operations | Backlog → To Do → In Progress → Review → Done |
| Agents | Assignments | Available → Assigned → Working → Completed |

### Task Assignment

Tasks are automatically assigned to agents based on:
- Agent type matching
- Capability requirements
- Current availability
- Load balancing (round-robin)

## API Integrations

### Configured Endpoints

| Service | Purpose | Auth Type |
|---------|---------|-----------|
| Cloudflare | KV state, Workers, R2 | Bearer token |
| Salesforce | CRM source of truth | OAuth2 |
| Vercel | Deployments | Bearer token |
| DigitalOcean | Infrastructure | Bearer token |
| Claude API | Agent operations | API key |
| GitHub | Files, PRs, Projects | Bearer token |
| Termius | SSH management | Bearer token |
| Raspberry Pi | Edge computing nodes | API key |

### iOS App Integrations

| App | Protocol | Purpose |
|-----|----------|---------|
| iSH | `x-ish://` | Linux shell on iOS |
| Shellfish | `shellfish://` | SSH/SFTP client |
| Working Copy | `working-copy://` | Git operations |
| Pyto | `pyto://` | Python scripting |

### API Examples

```bash
# List all agents
curl https://cmd.blackroad.io/agents

# Get specific agent
curl https://cmd.blackroad.io/agents/agent-0001

# Get agents by type
curl https://cmd.blackroad.io/agents/type/engineer

# Assign task to agent
curl -X POST https://cmd.blackroad.io/agents/agent-0042/assign \
  -H "Content-Type: application/json" \
  -d '{"task_id": "task-001"}'

# Sync state
curl -X POST https://cmd.blackroad.io/sync \
  -H "Authorization: Bearer $TOKEN"
```

## Hashing System

### SHA256

Standard cryptographic hashing for data integrity:

```python
from lib.hashing import sha256, sha256_short

# Full hash (64 chars)
hash = sha256("data")

# Truncated hash (16 chars, used for memory_hash)
short = sha256_short("data", 16)
```

### SHA-Infinity (Chain Hashing)

Recursive chain hashing for immutable audit trails:

```python
from lib.hashing import SHAInfinity

chain = SHAInfinity(seed="blackroad")

# Each hash incorporates previous hash
hash1 = chain.hash("first action")
hash2 = chain.hash("second action")  # Includes hash1

# Verify chain integrity
is_valid = chain.verify_chain()

# Export/import for persistence
state = chain.export_chain()
restored = SHAInfinity.import_chain(state)
```

### Memory Hash Formula

Each agent's memory hash:
```
hash = sha256(name:birthday:blackroad)[:16]
```

## State Management

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Salesforce │ ──► │  Cloudflare │ ──► │   GitHub    │
│ (CRM Truth) │     │  (KV Edge)  │     │   (Files)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Sync Triggers

| Event | Flow | Action |
|-------|------|--------|
| on_change | SF → CF | 100ms delay, batch 50 |
| on_commit | CF → GH | Requires hash verification |
| on_merge | GH → SF | Creates audit log |

## PR Quality Gates

All pull requests must pass:

1. **Hash Verification** - Valid SHA256 hashes
2. **Chain Integrity** - Unbroken hash chain
3. **JSON Validation** - Valid schema
4. **State Sync** - CRM reflects changes
5. **Lint & Format** - Code quality

## Environment Variables

```bash
# Required
export CLOUDFLARE_API_TOKEN="..."
export SALESFORCE_CLIENT_ID="..."
export SALESFORCE_CLIENT_SECRET="..."
export GITHUB_TOKEN="..."
export ANTHROPIC_API_KEY="..."

# Optional
export VERCEL_TOKEN="..."
export DIGITALOCEAN_TOKEN="..."
export TERMIUS_API_KEY="..."
export PI_API_KEY="..."
```

## For AI Agents

See [AGENT_INSTRUCTIONS.md](./AGENT_INSTRUCTIONS.md) for:
- Task workflow procedures
- Todo item specifications
- Hash verification requirements
- Common failure fixes
- Emergency procedures

## Files

| File | Description |
|------|-------------|
| [`agents.json`](./agents.json) | Full registry of all 1,000 agents |
| [`agents-by-type.json`](./agents-by-type.json) | Agents grouped by type |
| [`generate-agents.py`](./generate-agents.py) | Generator script |
| [`config/endpoints.json`](./config/endpoints.json) | API configurations |
| [`config/crm-state.json`](./config/crm-state.json) | State management |
| [`lib/hashing.py`](./lib/hashing.py) | Hashing utilities |

## License

Part of the BlackRoad-OS ecosystem.

---

*Every action generates a hash. Every hash extends the chain. The chain is truth.*
