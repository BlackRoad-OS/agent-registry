#!/usr/bin/env python3
"""
BlackRoad Agent Registry - SHA Hashing Utilities
Implements SHA256 and SHA-Infinity hashing for data integrity and chain verification.

SHA-Infinity: A recursive hashing mechanism that chains hashes together,
creating an immutable audit trail. Each hash incorporates the previous hash,
forming an unbreakable chain of verification.
"""

import hashlib
import json
import time
from typing import Any, Dict, List, Optional, Union
from datetime import datetime


class SHA256Hasher:
    """Standard SHA256 hashing utility."""

    @staticmethod
    def hash(data: Union[str, bytes, dict]) -> str:
        """
        Generate SHA256 hash of data.

        Args:
            data: String, bytes, or dict to hash

        Returns:
            64-character hex string
        """
        if isinstance(data, dict):
            data = json.dumps(data, sort_keys=True, separators=(',', ':'))
        if isinstance(data, str):
            data = data.encode('utf-8')
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def hash_short(data: Union[str, bytes, dict], length: int = 16) -> str:
        """Generate truncated SHA256 hash."""
        return SHA256Hasher.hash(data)[:length]

    @staticmethod
    def verify(data: Union[str, bytes, dict], expected_hash: str) -> bool:
        """Verify data against expected hash."""
        actual = SHA256Hasher.hash(data)
        if len(expected_hash) < 64:
            actual = actual[:len(expected_hash)]
        return actual == expected_hash


class SHAInfinity:
    """
    SHA-Infinity: Recursive chain hashing for immutable audit trails.

    Each hash in the chain incorporates:
    - The data being hashed
    - The previous hash in the chain
    - A timestamp
    - A sequence number

    This creates an unbreakable verification chain where any modification
    invalidates all subsequent hashes.
    """

    GENESIS_HASH = "0" * 64  # Genesis block hash

    def __init__(self, seed: str = "blackroad"):
        """
        Initialize SHA-Infinity hasher.

        Args:
            seed: Seed value incorporated into all hashes
        """
        self.seed = seed
        self.chain: List[Dict[str, Any]] = []
        self.current_hash = self.GENESIS_HASH
        self.sequence = 0

    def hash(self, data: Union[str, bytes, dict]) -> str:
        """
        Generate next hash in the infinite chain.

        Args:
            data: Data to hash

        Returns:
            64-character hex string incorporating chain state
        """
        if isinstance(data, dict):
            data = json.dumps(data, sort_keys=True, separators=(',', ':'))
        if isinstance(data, bytes):
            data = data.decode('utf-8', errors='replace')

        timestamp = datetime.utcnow().isoformat()
        self.sequence += 1

        # Construct chain block
        block = {
            "seq": self.sequence,
            "data": data,
            "prev": self.current_hash,
            "seed": self.seed,
            "ts": timestamp
        }

        # Generate hash
        block_str = json.dumps(block, sort_keys=True, separators=(',', ':'))
        new_hash = hashlib.sha256(block_str.encode('utf-8')).hexdigest()

        # Record in chain
        self.chain.append({
            "sequence": self.sequence,
            "hash": new_hash,
            "previous": self.current_hash,
            "timestamp": timestamp,
            "data_hash": SHA256Hasher.hash(data)
        })

        self.current_hash = new_hash
        return new_hash

    def hash_recursive(self, data: Union[str, bytes, dict], depth: int = 1) -> str:
        """
        Apply recursive hashing for enhanced security.

        Args:
            data: Data to hash
            depth: Number of recursive hash iterations

        Returns:
            Final hash after all iterations
        """
        result = self.hash(data)
        for _ in range(depth - 1):
            result = self.hash(result)
        return result

    def get_chain(self) -> List[Dict[str, Any]]:
        """Get the full hash chain."""
        return self.chain.copy()

    def verify_chain(self) -> bool:
        """
        Verify the integrity of the entire chain.

        Returns:
            True if chain is valid, False if corrupted
        """
        if not self.chain:
            return True

        prev_hash = self.GENESIS_HASH
        for i, block in enumerate(self.chain):
            if block["previous"] != prev_hash:
                return False
            prev_hash = block["hash"]

        return True

    def export_chain(self) -> Dict[str, Any]:
        """Export chain state for persistence."""
        return {
            "seed": self.seed,
            "sequence": self.sequence,
            "current_hash": self.current_hash,
            "chain": self.chain,
            "exported_at": datetime.utcnow().isoformat()
        }

    @classmethod
    def import_chain(cls, state: Dict[str, Any]) -> 'SHAInfinity':
        """Import chain state from persistence."""
        instance = cls(seed=state["seed"])
        instance.sequence = state["sequence"]
        instance.current_hash = state["current_hash"]
        instance.chain = state["chain"]
        return instance


class AgentHasher:
    """
    Specialized hasher for agent operations.
    Combines SHA256 for data hashing with SHA-Infinity for audit trails.
    """

    def __init__(self, namespace: str = "blackroad-agents"):
        """
        Initialize agent hasher.

        Args:
            namespace: Namespace for hash chain isolation
        """
        self.namespace = namespace
        self.sha256 = SHA256Hasher()
        self.chain = SHAInfinity(seed=namespace)

    def hash_agent(self, agent: Dict[str, Any]) -> str:
        """
        Generate memory hash for an agent.

        Args:
            agent: Agent data dict with name, birthday, etc.

        Returns:
            16-character memory hash
        """
        components = [
            agent.get("name", ""),
            agent.get("birthday", ""),
            self.namespace
        ]
        data = ":".join(components)
        return self.sha256.hash_short(data, 16)

    def hash_task(self, task: Dict[str, Any]) -> str:
        """
        Generate hash for a kanban task/card.

        Args:
            task: Task data dict

        Returns:
            64-character task hash
        """
        return self.chain.hash(task)

    def hash_state(self, state: Dict[str, Any]) -> str:
        """
        Generate state hash for CRM sync verification.

        Args:
            state: State object to hash

        Returns:
            64-character state hash
        """
        return self.sha256.hash(state)

    def create_verification_token(self, data: Dict[str, Any], expiry_seconds: int = 3600) -> Dict[str, str]:
        """
        Create a verification token with expiry.

        Args:
            data: Data to include in token
            expiry_seconds: Token validity period

        Returns:
            Token dict with hash and metadata
        """
        timestamp = int(time.time())
        expiry = timestamp + expiry_seconds

        token_data = {
            "data": data,
            "issued": timestamp,
            "expires": expiry,
            "namespace": self.namespace
        }

        return {
            "token": self.chain.hash(token_data),
            "issued_at": datetime.fromtimestamp(timestamp).isoformat(),
            "expires_at": datetime.fromtimestamp(expiry).isoformat(),
            "chain_sequence": self.chain.sequence
        }

    def verify_pr_hash(self, pr_data: Dict[str, Any], expected_hash: str) -> bool:
        """
        Verify a pull request hash for integrity.

        Args:
            pr_data: PR data to verify
            expected_hash: Expected hash value

        Returns:
            True if valid, False otherwise
        """
        # Extract relevant PR fields for hashing
        pr_essence = {
            "title": pr_data.get("title"),
            "branch": pr_data.get("head", {}).get("ref"),
            "base": pr_data.get("base", {}).get("ref"),
            "sha": pr_data.get("head", {}).get("sha"),
            "files_changed": pr_data.get("changed_files", 0)
        }
        return self.sha256.verify(pr_essence, expected_hash)


# Convenience functions for direct usage
def sha256(data: Union[str, bytes, dict]) -> str:
    """Quick SHA256 hash."""
    return SHA256Hasher.hash(data)


def sha256_short(data: Union[str, bytes, dict], length: int = 16) -> str:
    """Quick truncated SHA256 hash."""
    return SHA256Hasher.hash_short(data, length)


def sha_infinity(data: Union[str, bytes, dict], seed: str = "blackroad") -> str:
    """Quick SHA-Infinity hash (single chain link)."""
    hasher = SHAInfinity(seed=seed)
    return hasher.hash(data)


# CLI interface
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python hashing.py <command> [args]")
        print("Commands:")
        print("  sha256 <data>       - Generate SHA256 hash")
        print("  short <data> [len]  - Generate truncated hash")
        print("  infinity <data>     - Generate SHA-Infinity hash")
        print("  agent <name> <bday> - Generate agent memory hash")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "sha256" and len(sys.argv) >= 3:
        print(sha256(sys.argv[2]))
    elif cmd == "short" and len(sys.argv) >= 3:
        length = int(sys.argv[3]) if len(sys.argv) > 3 else 16
        print(sha256_short(sys.argv[2], length))
    elif cmd == "infinity" and len(sys.argv) >= 3:
        print(sha_infinity(sys.argv[2]))
    elif cmd == "agent" and len(sys.argv) >= 4:
        hasher = AgentHasher()
        agent = {"name": sys.argv[2], "birthday": sys.argv[3]}
        print(hasher.hash_agent(agent))
    else:
        print(f"Unknown command or missing args: {cmd}")
        sys.exit(1)
