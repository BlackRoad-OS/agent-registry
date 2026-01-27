"""
BlackRoad Agent Registry Library

Provides utilities for:
- SHA256 and SHA-Infinity hashing
- Agent memory hash generation
- Task and state verification
- Chain integrity validation
"""

from .hashing import (
    SHA256Hasher,
    SHAInfinity,
    AgentHasher,
    sha256,
    sha256_short,
    sha_infinity,
)

__all__ = [
    "SHA256Hasher",
    "SHAInfinity",
    "AgentHasher",
    "sha256",
    "sha256_short",
    "sha_infinity",
]

__version__ = "1.0.0"
