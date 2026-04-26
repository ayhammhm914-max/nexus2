# Security Policy

## Supported Versions

The active `main` branch is the supported version for security updates.

## Reporting a Vulnerability

Please report vulnerabilities privately to `security@nexus.gg`.

When you report an issue, include:

- A clear description of the vulnerability
- Steps to reproduce it
- The affected environment or URL
- Any proof-of-concept details that help validate the report

Please do not disclose the issue publicly until we have had a reasonable chance to investigate and ship a fix.

## Local Security Audits

Run these commands from the project root:

```bash
npm run install:all
npm run security:audit
npm run security:check
```

To try automated fixes where possible:

```bash
npm run security:audit:fix
```
