---
targets: ['*']
description: 'Self-check for shell scripts, CI workflows, deployment scripts and docs-site edge rules'
globs:
    [
        '**/*.sh',
        'scripts/**/*',
        '.github/**/*',
        'external/ag-shared/scripts/**/*',
        'external/ag-shared/github/**/*',
        'documentation/ag-grid-docs/src/utils/htaccess/**/*',
        'documentation/ag-grid-docs/testing/**/*',
    ]
---

# Scripts and CI

## Self-check before review

Each item is a class of finding that automated review kept raising across several PRs on scripts, workflows and docs-site rules.

- **Fail closed.** Start shell scripts with `set -euo pipefail`. A failure inside a pipe, a sub-command or a remote `cd` must stop the script, not let it carry on in the wrong directory or with partial output.
- **Keep argument boundaries.** Build commands in arrays (`args+=("$value")`, `"${args[@]}"`), never by concatenating strings. Check that an option has a value before `shift`.
- **Validate before destructive steps.** Reject empty or whitespace-only input before a sync, delete or overwrite, and serialise writers that share a file or remote path.
- **No vacuous passes.** A check must fail on a failed request, a missing resource or an empty sample, not skip it. Compare whole structures rather than a subset, reject input the check doesn't recognise, and don't advance a baseline past a run that tested nothing. Make each new check fail once against a broken input before trusting it.
- **Every build variant.** A caching, CSP, redirect or crawler change covers the live docs, every archive build and host (see the deployed-archive fixtures in `documentation/ag-grid-docs/src/utils/htaccess/__fixtures__/`), staging and the per-page markdown variants. Say in the PR body which variants are out of scope.
