/**
 * BlackRoad Agent Registry — Cloudflare Worker
 * Serves the agent registry API at cmd.blackroad.io
 *
 * Copyright 2024-2026 BlackRoad OS, Inc. All rights reserved.
 * Proprietary and confidential.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function error(message, status = 400) {
  return json({ error: message }, status);
}

async function handleGetAgents(request, env) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 1000);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  let query = "SELECT * FROM agents WHERE status = 'active'";
  const bindings = [];

  if (type) {
    query += " AND type = ?";
    bindings.push(type);
  }

  query += " ORDER BY id ASC LIMIT ? OFFSET ?";
  bindings.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...bindings).all();

  const agents = results.map((row) => ({
    ...row,
    capabilities: JSON.parse(row.capabilities),
  }));

  const countQuery = type
    ? await env.DB.prepare("SELECT COUNT(*) as total FROM agents WHERE status = 'active' AND type = ?").bind(type).first()
    : await env.DB.prepare("SELECT COUNT(*) as total FROM agents WHERE status = 'active'").first();

  return json({
    count: agents.length,
    total: countQuery.total,
    offset,
    limit,
    agents,
  });
}

async function handleGetAgent(env, agentId) {
  const row = await env.DB.prepare("SELECT * FROM agents WHERE id = ?").bind(agentId).first();

  if (!row) {
    return error("Agent not found", 404);
  }

  return json({ ...row, capabilities: JSON.parse(row.capabilities) });
}

async function handleGetAgentsByType(env) {
  const { results } = await env.DB.prepare(
    "SELECT type, COUNT(*) as count FROM agents WHERE status = 'active' GROUP BY type ORDER BY type ASC"
  ).all();

  return json({ types: results });
}

async function handleCreateAgent(request, env) {
  const body = await request.json();

  if (!body.name || !body.type) {
    return error("name and type are required");
  }

  const validTypes = [
    "physicist", "mathematician", "chemist", "biologist", "engineer",
    "architect", "researcher", "analyst", "strategist", "creative",
    "philosopher", "historian", "linguist", "psychologist", "economist",
    "guardian", "navigator", "builder", "speaker", "mediator",
  ];

  if (!validTypes.includes(body.type)) {
    return error(`Invalid type. Must be one of: ${validTypes.join(", ")}`);
  }

  const lastAgent = await env.DB.prepare(
    "SELECT id FROM agents ORDER BY id DESC LIMIT 1"
  ).first();

  const lastNum = lastAgent ? parseInt(lastAgent.id.split("-")[1], 10) : 0;
  const newId = `agent-${String(lastNum + 1).padStart(4, "0")}`;
  const birthday = new Date().toISOString().split("T")[0];

  const encoder = new TextEncoder();
  const hashData = encoder.encode(`${body.name}:${birthday}:blackroad`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", hashData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const memoryHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);

  const capabilities = body.capabilities || [];

  await env.DB.prepare(
    `INSERT INTO agents (id, name, type, capabilities, birthday, memory_hash, home_world, status)
     VALUES (?, ?, ?, ?, ?, ?, 'lucidia', 'active')`
  ).bind(newId, body.name, body.type, JSON.stringify(capabilities), birthday, memoryHash).run();

  return json({ id: newId, name: body.name, type: body.type, capabilities, birthday, memory_hash: memoryHash, home_world: "lucidia", status: "active" }, 201);
}

async function handleHealthCheck(env) {
  try {
    const count = await env.DB.prepare("SELECT COUNT(*) as total FROM agents").first();
    return json({
      status: "healthy",
      version: "1.0.0",
      agents: count.total,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return json({ status: "degraded", error: e.message, timestamp: new Date().toISOString() }, 503);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/" || path === "/health") {
        return handleHealthCheck(env);
      }

      if (path === "/agents" && request.method === "GET") {
        return handleGetAgents(request, env);
      }

      if (path === "/agents/types" && request.method === "GET") {
        return handleGetAgentsByType(env);
      }

      const agentMatch = path.match(/^\/agents\/(agent-\d{4})$/);
      if (agentMatch && request.method === "GET") {
        return handleGetAgent(env, agentMatch[1]);
      }

      if (path === "/agents" && request.method === "POST") {
        return handleCreateAgent(request, env);
      }

      return error("Not found", 404);
    } catch (e) {
      return error(`Internal server error: ${e.message}`, 500);
    }
  },

  async scheduled(event, env, ctx) {
    const count = await env.DB.prepare("SELECT COUNT(*) as total FROM agents").first();
    console.log(`[health] ${new Date().toISOString()} — ${count.total} agents active`);
  },
};
