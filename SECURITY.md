# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability in the BlackRoad Agent Registry, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **blackroad.systems@gmail.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Security Practices

- All GitHub Actions are pinned to specific commit hashes
- Dependabot monitors dependencies weekly
- Secret scanning is enabled on the repository
- No secrets or credentials are stored in source code
- D1 database access is restricted to the Cloudflare Worker
- CORS headers are configured for API security
- Input validation on all API endpoints

## Scope

The following are in scope for security reports:

- The Cloudflare Worker API (`cmd.blackroad.io`)
- GitHub Actions workflows
- Agent data integrity
- Authentication and authorization issues

## License

This project is proprietary software owned by BlackRoad OS, Inc.
See [LICENSE](./LICENSE) for full terms.
