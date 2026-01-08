# Security Review: rulesync

**Date**: 2026-01-08
**Package**: [rulesync](https://github.com/dyoshikawa/rulesync)
**Version Reviewed**: 5.2.0
**Reviewer**: Claude Code

## Executive Summary

**Overall Risk Assessment: LOW-MEDIUM**

rulesync is a CLI tool that generates AI coding assistant configuration files from unified rule definitions. The package demonstrates generally good security practices but has some areas of concern that should be considered before adoption.

## Package Overview

| Attribute | Value |
|-----------|-------|
| Version | 5.2.0 |
| License | MIT |
| Stars | 575 |
| Forks | 36 |
| Node.js Required | >=22.0.0 |
| Known CVEs | None |
| Security Policy | Yes (SECURITY.md) |

## Positive Security Findings

### 1. No Shell Execution
- **No use of `child_process`, `exec`, `spawn`, or `execSync`** - eliminates command injection risks
- No `eval()`, `new Function()`, or `vm` module usage - no arbitrary code execution vectors

### 2. Dependency Security
- Uses patched version of **js-yaml (4.1.1)** - fixes CVE-2025-64718 (prototype pollution)
- No known CVEs in jsonc-parser or other core dependencies
- Includes **secretlint** in dev dependencies for detecting secrets in code

### 3. Input Validation Patterns
- CLI uses `commander.js` for safe argument parsing
- Tool targets are validated via intersection with allowed values
- Uses schema validation (Zod, Valibot) for configuration

### 4. Development Practices
- Has security policy (SECURITY.md) with supported version matrix
- Uses pre-commit hooks via `simple-git-hooks`
- Includes comprehensive test suite (Vitest)
- No published security advisories

## Security Concerns

### 1. Path Traversal Vulnerabilities (MEDIUM)

The `file.ts` utility has incomplete path traversal protection:

- `checkPathTraversal()` validates for ".." segments but does not resolve symlinks (symlink attacks possible)
- The check `resolve(resolved) !== resolved` is ineffective

**Risk**: A malicious configuration file could potentially access files outside intended directories through symlink manipulation.

### 2. Unsafe Directory Deletion (MEDIUM)

The `removeDirectory()` function uses a blocklist approach:

- Only blocks hardcoded paths like "src", "node_modules"
- Path variations like "./src" or "src/" may bypass checks
- No symlink detection before recursive deletion

**Risk**: Unintended deletion of critical directories if attacker can influence deletion paths.

### 3. Insufficient baseDir Validation (LOW-MEDIUM)

Configuration values from `rulesync.jsonc` are used without full validation:

- baseDir from config used directly in file operations
- No whitelist validation for base directories
- Relies on downstream functions for safety

**Risk**: A malicious or compromised config file could target unintended directories.

### 4. Glob Pattern Injection (LOW)

User-supplied glob patterns are not sanitized:

- Could access unintended directories
- Potential for excessive filesystem traversal (performance DoS)

## Dependency Analysis

| Dependency | Version | Status |
|------------|---------|--------|
| js-yaml | 4.1.1 | Patched (CVE-2025-64718 fixed) |
| jsonc-parser | 3.3.1 | No known CVEs |
| commander | 14.0.2 | Widely trusted CLI framework |
| gray-matter | 4.0.3 | No known CVEs |
| zod | 4.3.4 | No known CVEs |
| effect | 3.19.14 | No known CVEs |

## Attack Surface Analysis

| Vector | Risk Level | Notes |
|--------|------------|-------|
| Shell injection | None | No shell execution |
| Code injection | None | No eval/Function usage |
| Path traversal | Medium | Incomplete validation in file utilities |
| Prototype pollution | Low | Uses patched js-yaml |
| Supply chain | Low | Well-known dependencies |
| Network | None | No network requests in core functionality |

## Recommendations

### For AG Grid Team (if adopting)

1. **Use with trusted configuration only** - Don't run rulesync with config files from untrusted sources
2. **Pin the version** - Lock to v5.2.0 or later; avoid <4.0.x (unsupported)
3. **Review generated files** - Inspect output before committing to version control
4. **Run in CI with sandboxing** - Consider running in a container/sandbox for additional isolation
5. **Monitor for updates** - The project is actively maintained; watch for security patches

### Suggested Mitigations (if contributing upstream)

1. Use `realpath()` to resolve symlinks before path validation
2. Implement allowlist-based path validation instead of blocklists
3. Add explicit symlink detection in deletion operations
4. Sanitize or restrict glob patterns to safe subsets

## Verdict

**Recommendation: ACCEPTABLE FOR ADOPTION WITH PRECAUTIONS**

rulesync is a reasonably secure tool for its purpose. The identified vulnerabilities are primarily relevant if:
- Running with untrusted configuration files
- Operating in an adversarial environment

For typical usage (trusted developers, controlled environment), the risk is **low**. The absence of shell execution and code injection vectors significantly reduces the attack surface.

**Key mitigations for safe use:**
1. Only use rulesync with configuration files you control
2. Run in a sandboxed environment if processing untrusted input
3. Review generated output before committing

## Sources

- [rulesync GitHub Repository](https://github.com/dyoshikawa/rulesync)
- [Snyk - js-yaml vulnerabilities](https://security.snyk.io/package/npm/js-yaml)
- [CVE-2025-64718 - js-yaml Prototype Pollution](https://www.resolvedsecurity.com/vulnerability-catalog/CVE-2025-64718)
- [Snyk - gray-matter vulnerabilities](https://security.snyk.io/package/npm/gray-matter)
- [Snyk - jsonc-parser](https://security.snyk.io/package/npm/jsonc-parser)
- [GitHub Advisory Database](https://github.com/advisories)
