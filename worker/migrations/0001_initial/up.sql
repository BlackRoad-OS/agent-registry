-- BlackRoad Agent Registry — D1 Schema
-- Initial migration: Create agents table

CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN (
        'physicist', 'mathematician', 'chemist', 'biologist', 'engineer',
        'architect', 'researcher', 'analyst', 'strategist', 'creative',
        'philosopher', 'historian', 'linguist', 'psychologist', 'economist',
        'guardian', 'navigator', 'builder', 'speaker', 'mediator'
    )),
    capabilities TEXT NOT NULL DEFAULT '[]',
    birthday TEXT NOT NULL,
    memory_hash TEXT NOT NULL UNIQUE,
    home_world TEXT NOT NULL DEFAULT 'lucidia',
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_memory_hash ON agents(memory_hash);
CREATE INDEX idx_agents_birthday ON agents(birthday);
