/**
 * BlackRoad Agent Registry — Worker Tests
 * Validates agent data integrity and API contract
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const AGENTS_PATH = path.resolve(__dirname, "../../agents.json");
const AGENTS_BY_TYPE_PATH = path.resolve(__dirname, "../../agents-by-type.json");

const VALID_TYPES = [
  "physicist", "mathematician", "chemist", "biologist", "engineer",
  "architect", "researcher", "analyst", "strategist", "creative",
  "philosopher", "historian", "linguist", "psychologist", "economist",
  "guardian", "navigator", "builder", "speaker", "mediator",
];

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

function verifyMemoryHash(name, birthday) {
  const data = `${name}:${birthday}:blackroad`;
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16);
}

console.log("BlackRoad Agent Registry — Test Suite\n");

// Test 1: agents.json structure
console.log("[1] agents.json structure");
const agentsData = JSON.parse(fs.readFileSync(AGENTS_PATH, "utf-8"));
assert(agentsData.count === 1000, "Agent count is 1000");
assert(Array.isArray(agentsData.agents), "Agents is an array");
assert(agentsData.agents.length === 1000, "Agents array has 1000 entries");

// Test 2: Agent schema validation
console.log("\n[2] Agent schema validation");
const requiredFields = ["id", "name", "type", "capabilities", "birthday", "memory_hash", "home_world", "status"];
const firstAgent = agentsData.agents[0];
for (const field of requiredFields) {
  assert(field in firstAgent, `Agent has required field: ${field}`);
}

// Test 3: Agent ID format
console.log("\n[3] Agent ID format");
const allIdsValid = agentsData.agents.every((a) => /^agent-\d{4}$/.test(a.id));
assert(allIdsValid, "All agent IDs match format agent-XXXX");

const uniqueIds = new Set(agentsData.agents.map((a) => a.id));
assert(uniqueIds.size === 1000, "All agent IDs are unique");

// Test 4: Agent types
console.log("\n[4] Agent types");
const allTypesValid = agentsData.agents.every((a) => VALID_TYPES.includes(a.type));
assert(allTypesValid, "All agents have valid types");

const typesFound = new Set(agentsData.agents.map((a) => a.type));
assert(typesFound.size === 20, `All 20 types represented (found ${typesFound.size})`);

// Test 5: Memory hash verification (sample)
console.log("\n[5] Memory hash verification (sampling 50 agents)");
const sample = agentsData.agents.filter((_, i) => i % 20 === 0);
let hashesValid = 0;
for (const agent of sample) {
  const expected = verifyMemoryHash(agent.name, agent.birthday);
  if (agent.memory_hash === expected) hashesValid++;
}
assert(hashesValid === sample.length, `All sampled memory hashes valid (${hashesValid}/${sample.length})`);

// Test 6: agents-by-type.json
console.log("\n[6] agents-by-type.json validation");
const byTypeData = JSON.parse(fs.readFileSync(AGENTS_BY_TYPE_PATH, "utf-8"));
const typeKeys = Object.keys(byTypeData);
assert(typeKeys.length === 20, `Has all 20 types (found ${typeKeys.length})`);

let totalByType = 0;
for (const type of typeKeys) {
  assert(typeof byTypeData[type].count === "number", `${type} has count`);
  assert(Array.isArray(byTypeData[type].agents), `${type} has agents array`);
  assert(byTypeData[type].count === byTypeData[type].agents.length, `${type} count matches array length`);
  totalByType += byTypeData[type].count;
}
assert(totalByType === 1000, `Total agents across types sums to 1000 (got ${totalByType})`);

// Test 7: Home world consistency
console.log("\n[7] Home world validation");
const allLucidia = agentsData.agents.every((a) => a.home_world === "lucidia");
assert(allLucidia, "All agents have home_world = lucidia");

// Test 8: Status consistency
console.log("\n[8] Status validation");
const allActive = agentsData.agents.every((a) => a.status === "active");
assert(allActive, "All agents have status = active");

// Test 9: Capabilities validation
console.log("\n[9] Capabilities validation");
const allCapsArray = agentsData.agents.every((a) => Array.isArray(a.capabilities) && a.capabilities.length >= 2);
assert(allCapsArray, "All agents have at least 2 capabilities");

// Test 10: Birthday format
console.log("\n[10] Birthday format validation");
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const allDatesValid = agentsData.agents.every((a) => dateRegex.test(a.birthday));
assert(allDatesValid, "All birthdays match YYYY-MM-DD format");

// Summary
console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${"=".repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}
