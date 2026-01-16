---
targets: ['*']
description: 'Fix build and lint errors by running commands, grouping issues, and orchestrating fixes'
---

# Fixup build and lint errors

Focusing on ${ARGUMENTS}, follow these steps:

1. Run the `yarn nx build`, `yarn nx lint` commands to identify any errors or warnings.
2. Group the errors and warnings into categories.
3. Identify examples of how to fix each category of error.

    - If you are not sure, ask the user to confirm their preferred approach before committing to a direction.

4. Orchestrate sub-agents to focus on specific groups of errors so they can efficiently make fixes.

    - Ensure sub-agents are instructed to focus on specific errors and/or projects and/or files, especially if running in parallel, to avoid interfering with each other (especially when verifying fixes and running tooling again).

5. Verify the fixes by running the `yarn nx build`, `yarn nx lint` commands again.

# NEVER DO THESE WORKAROUNDS

-   NEVER change build, lint or typecheck configurations to workaround errors or warnings.
-   NEVER reduce type-safety as a quick workaround.

The only exception is if the user has explicitly asked to change the build, lint or typecheck configurations to workaround errors or warnings, or after we have very clearly asked if that is allowed and the user has confirmed.

# Definition of Done

-   Run the `yarn nx build`, `yarn nx lint` show no warnings or errors.
-   We have NOT changed build/lint/typecheck configurations to workaround
-   Verify the `mcp__ide__getDiagnostics` tool to check for any errors or warnings in the codebase in the users IDE.
