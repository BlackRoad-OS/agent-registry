# Agent Instructions & Todo System

## Overview

This document provides instructions for AI agents working with the BlackRoad Agent Registry. Follow these guidelines to ensure successful pull requests and seamless integration with our kanban system.

---

## Quick Reference

| Action | Command/Endpoint | Notes |
|--------|------------------|-------|
| Get agents | `GET /agents` | Returns all 1000 agents |
| Get by type | `GET /agents/type/{type}` | 20 types available |
| Assign task | `POST /agents/{id}/assign` | Requires task_id |
| Sync state | `POST /sync` | Triggers CRM sync |
| Verify hash | `python lib/hashing.py sha256 <data>` | CLI utility |

---

## Agent Todo Workflow

### 1. Before Starting Work

```bash
# Verify your assignment
curl https://cmd.blackroad.io/agents/{your_agent_id}/tasks

# Check kanban board state
curl https://cmd.blackroad.io/kanban/boards/main

# Pull latest changes
git fetch origin && git pull origin main
```

### 2. Creating a Feature Branch

```bash
# Branch naming convention
git checkout -b claude/{feature-name}-{session_id}

# Example
git checkout -b claude/fix-auth-bug-Ufv8X
```

### 3. Task Management

Every task must be tracked in the kanban system:

```json
{
  "task_id": "task-001",
  "title": "Implement feature X",
  "status": "in_progress",
  "assigned_agents": ["agent-0042"],
  "column": "in-progress",
  "hash": "<sha256_of_task>",
  "hash_chain": ["<prev_hash>", "<current_hash>"]
}
```

### 4. Committing Changes

**CRITICAL: Hash Verification Required**

```bash
# Generate commit hash for verification
python lib/hashing.py sha256 "$(git diff --staged)"

# Commit with hash reference
git commit -m "feat: add new endpoint

Hash: abc123...
Task: task-001
Agent: agent-0042"
```

### 5. Before Creating PR

Run the validation checklist:

- [ ] All tests pass
- [ ] Hash chain verified
- [ ] State synced to CRM
- [ ] No merge conflicts
- [ ] Branch up to date with base

---

## Todo Item Specification

### Structure

```json
{
  "id": "todo-{uuid}",
  "content": "Imperative description (e.g., 'Fix bug')",
  "activeForm": "Present continuous (e.g., 'Fixing bug')",
  "status": "pending|in_progress|completed",
  "assigned_agent": "agent-XXXX",
  "priority": "critical|high|medium|low",
  "hash": "<sha256>",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "dependencies": ["todo-id-1", "todo-id-2"],
  "metadata": {
    "pr_number": null,
    "issue_number": null,
    "salesforce_id": null
  }
}
```

### Status Transitions

```
pending -> in_progress -> completed
    |           |
    v           v
  blocked    review
```

### Rules

1. **One in_progress at a time** - Agents should only have one active task
2. **Hash on completion** - Generate hash when marking complete
3. **Chain verification** - Each completion adds to hash chain
4. **Immediate updates** - Mark complete as soon as done, don't batch

---

## API Integration Checklist

### Required Endpoints

| Service | Status | Notes |
|---------|--------|-------|
| Cloudflare KV | Required | Edge state storage |
| Salesforce | Required | Source of truth |
| GitHub | Required | File storage & PRs |
| Vercel | Optional | Deployment |
| DigitalOcean | Optional | Infrastructure |
| Claude API | Required | Agent operations |

### Authentication

All endpoints require authentication. Tokens should be stored in environment variables:

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
```

---

## PR Quality Gates

### Automated Checks

1. **Hash Verification** - All commits must have valid hashes
2. **Chain Integrity** - Hash chain must be unbroken
3. **State Sync** - CRM must reflect current state
4. **Tests** - All tests must pass
5. **Lint** - Code must pass linting

### Manual Checks

1. **Code Review** - At least one approval required
2. **Documentation** - Changes must be documented
3. **Breaking Changes** - Must be flagged and approved

---

## Common Failure Reasons & Fixes

### 1. "Hash verification failed"

**Cause**: Commit hash doesn't match expected value
**Fix**: Regenerate hash and amend commit

```bash
python lib/hashing.py sha256 "$(git diff HEAD~1)"
git commit --amend -m "Updated message with correct hash"
```

### 2. "Chain integrity broken"

**Cause**: Missing link in hash chain
**Fix**: Rebuild chain from last known good state

```bash
python -c "
from lib.hashing import SHAInfinity
chain = SHAInfinity.import_chain(open('.kanban/chain.json').read())
if not chain.verify_chain():
    print('Chain broken at:', chain.find_break())
"
```

### 3. "State sync failed"

**Cause**: Salesforce/Cloudflare out of sync
**Fix**: Force sync

```bash
curl -X POST https://cmd.blackroad.io/sync \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{"force": true}'
```

### 4. "Merge conflict"

**Cause**: Divergent branches
**Fix**: Rebase on latest main

```bash
git fetch origin main
git rebase origin/main
# Resolve conflicts
git add .
git rebase --continue
```

---

## Agent Capabilities by Type

Use appropriate agents for tasks:

| Task Type | Recommended Agent Types |
|-----------|------------------------|
| Bug fixes | analyst, engineer, guardian |
| Features | architect, engineer, builder |
| Docs | creative, linguist, speaker |
| Security | guardian, analyst, researcher |
| Performance | physicist, mathematician, engineer |
| Testing | analyst, researcher, builder |
| Refactoring | architect, engineer |
| API work | engineer, builder, navigator |

---

## Sync Protocol

### State Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Salesforce │ ──► │  Cloudflare │ ──► │   GitHub    │
│ (CRM Truth) │     │  (KV Edge)  │     │   (Files)   │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                   │                   │
       └───────────────────┴───────────────────┘
                    Bidirectional Sync
```

### Sync Triggers

- **on_change**: Salesforce → Cloudflare (100ms delay)
- **on_commit**: Cloudflare → GitHub (requires hash verification)
- **on_merge**: GitHub → Salesforce (creates audit log)

---

## Emergency Procedures

### Rollback

```bash
# Revert last commit
git revert HEAD

# Force sync to known good state
curl -X POST https://cmd.blackroad.io/sync \
  -d '{"action": "rollback", "to_hash": "<known_good_hash>"}'
```

### Emergency Contacts

- CRM Issues: Check Salesforce status
- Edge Issues: Check Cloudflare status
- Git Issues: Check GitHub status

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-27 | Initial release |

---

*Remember: Every action generates a hash. Every hash extends the chain. The chain is truth.*
