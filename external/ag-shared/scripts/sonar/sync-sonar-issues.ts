#!/usr/bin/env tsx

/**
 * Script to sync accepted/false-positive issues from one SonarCloud project to another.
 *
 * This is useful for syncing exceptions from the development project (e.g. ag-charts-community-latest)
 * to the release project (e.g. ag-charts-community) during the release process.
 *
 * The script auto-detects the correct SonarCloud project keys from the workspace root package.json
 * name. Supported products: ag-charts, ag-grid. For other products, use --source and --target.
 *
 * Usage:
 *   SONAR_TOKEN=<your-token> npx tsx external/ag-shared/scripts/sonar/sync-sonar-issues.ts
 *
 *   # Dry run (preview only):
 *   SONAR_TOKEN=<your-token> npx tsx external/ag-shared/scripts/sonar/sync-sonar-issues.ts --dry-run
 *
 *   # Explicit project overrides:
 *   SONAR_TOKEN=<your-token> npx tsx external/ag-shared/scripts/sonar/sync-sonar-issues.ts \
 *     --source ag-charts-community-latest \
 *     --target ag-charts-community
 *
 * Prerequisites:
 *   1. Generate a SonarCloud token at: https://sonarcloud.io/account/security
 *   2. Ensure you have "Administer Issues" permission on BOTH projects
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SONAR_TOKEN = process.env.SONAR_TOKEN;
const SONAR_BASE_URL = 'https://sonarcloud.io/api';
const PAGE_SIZE = 500;
const RATE_LIMIT_DELAY_MS = 100;

/** Known product-to-SonarCloud project key mappings. */
const PRODUCT_SONAR_KEYS: Record<string, { source: string; target: string }> = {
    'ag-charts': { source: 'ag-charts-community-latest', target: 'ag-charts-community' },
    'ag-grid': { source: 'ag-grid-community-latest', target: 'ag-grid-community' },
};

/**
 * Auto-detect default SonarCloud project keys from the workspace root package.json name.
 * Returns undefined if the product is not recognised.
 */
function detectSonarDefaults(): { source: string; target: string } | undefined {
    try {
        const pkgPath = join(process.cwd(), 'package.json');
        const { name } = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        return PRODUCT_SONAR_KEYS[name];
    } catch {
        return undefined;
    }
}

if (!SONAR_TOKEN) {
    console.error('Error: SONAR_TOKEN environment variable is required');
    console.error('Generate a token at: https://sonarcloud.io/account/security');
    process.exit(1);
}

interface Issue {
    key: string;
    rule: string;
    component: string;
    line?: number;
    message: string;
    status: string;
    resolution?: string;
    comments?: Array<{ markdown: string; createdAt: string }>;
}

interface IssueSearchResponse {
    total: number;
    p: number;
    ps: number;
    issues: Issue[];
}

interface SyncConfig {
    sourceProject: string;
    targetProject: string;
    dryRun: boolean;
    verbose: boolean;
}

interface MatchResult {
    sourceIssue: Issue;
    targetIssue: Issue | null;
    signature: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): SyncConfig {
    const args = process.argv.slice(2);
    const defaults = detectSonarDefaults();
    const config: SyncConfig = {
        sourceProject: defaults?.source ?? '',
        targetProject: defaults?.target ?? '',
        dryRun: false,
        verbose: false,
    };

    for (let i = 0; i < args.length; ++i) {
        const arg = args[i];
        if (arg === '--source' && args[i + 1]) {
            config.sourceProject = args[++i];
        } else if (arg === '--target' && args[i + 1]) {
            config.targetProject = args[++i];
        } else if (arg === '--dry-run') {
            config.dryRun = true;
        } else if (arg === '--verbose') {
            config.verbose = true;
        } else if (arg === '--help') {
            const knownProducts = Object.keys(PRODUCT_SONAR_KEYS).join(', ');
            const autoDetected = defaults
                ? `auto-detected: ${defaults.source} / ${defaults.target}`
                : 'not detected (use --source and --target)';
            console.log(`
Usage: npx tsx sync-sonar-issues.ts [options]

Options:
  --source <project>   Source SonarCloud project key (${autoDetected})
  --target <project>   Target SonarCloud project key
  --dry-run            Preview matches without applying changes
  --verbose            Show detailed matching information
  --help               Show this help message

Project keys are auto-detected from the workspace root package.json name.
Known products: ${knownProducts}. For other products, specify --source and --target.

Environment:
  SONAR_TOKEN          Required. SonarCloud API token with "Administer Issues" permission
`);
            process.exit(0);
        }
    }

    if (!config.sourceProject || !config.targetProject) {
        const knownProducts = Object.keys(PRODUCT_SONAR_KEYS).join(', ');
        console.error(
            `Error: Could not auto-detect SonarCloud project keys from package.json.\n` +
                `Known products: ${knownProducts}\n` +
                `Please specify --source and --target explicitly.`
        );
        process.exit(1);
    }

    return config;
}

/**
 * Normalize component path by removing the project key prefix
 */
function normalizeComponent(component: string, projectKey: string): string {
    return component.replace(`${projectKey}:`, '');
}

/**
 * Create a unique signature for issue matching
 */
function createIssueSignature(issue: Issue, projectKey: string): string {
    return JSON.stringify({
        rule: issue.rule,
        file: normalizeComponent(issue.component, projectKey),
        line: issue.line ?? 0,
        message: issue.message,
    });
}

/**
 * Fetch all issues from a project with pagination
 */
async function fetchAllIssues(projectKey: string, statuses: string[]): Promise<Issue[]> {
    const allIssues: Issue[] = [];
    let page = 1;
    let total: number;

    do {
        const statusParam = statuses.join(',');
        const url = `${SONAR_BASE_URL}/issues/search?componentKeys=${projectKey}&issueStatuses=${statusParam}&ps=${PAGE_SIZE}&p=${page}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${SONAR_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch issues: ${response.status} ${response.statusText}`);
        }

        const data: IssueSearchResponse = await response.json();
        allIssues.push(...data.issues);
        total = data.total;
        page++;

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    } while (allIssues.length < total);

    return allIssues;
}

/**
 * Determine the transition type based on the issue's current status/resolution
 */
function getTransitionType(issue: Issue): 'falsepositive' | 'accept' {
    if (issue.resolution === 'FALSE-POSITIVE') {
        return 'falsepositive';
    }
    return 'accept';
}

/**
 * Add a comment to an issue
 */
async function addComment(issueKey: string, comment: string): Promise<void> {
    const url = `${SONAR_BASE_URL}/issues/add_comment`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${SONAR_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            issue: issueKey,
            text: comment,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to add comment to ${issueKey}: ${response.status} ${text}`);
    }
}

/**
 * Transition an issue to a new status
 */
async function transitionIssue(issueKey: string, transition: string): Promise<void> {
    const url = `${SONAR_BASE_URL}/issues/do_transition`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${SONAR_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            issue: issueKey,
            transition: transition,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to transition issue ${issueKey}: ${response.status} ${text}`);
    }
}

/**
 * Match source issues to target issues
 */
function matchIssues(sourceIssues: Issue[], targetIssues: Issue[], config: SyncConfig): MatchResult[] {
    // Build a map of target issues by signature for O(1) lookup
    const targetMap = new Map<string, Issue>();
    for (const issue of targetIssues) {
        const signature = createIssueSignature(issue, config.targetProject);
        targetMap.set(signature, issue);
    }

    // Match source issues to target issues
    const results: MatchResult[] = [];
    for (const sourceIssue of sourceIssues) {
        const signature = createIssueSignature(sourceIssue, config.sourceProject);
        const targetIssue = targetMap.get(signature) ?? null;
        results.push({ sourceIssue, targetIssue, signature });
    }

    return results;
}

/**
 * Format a file path for display
 */
function formatFilePath(component: string, projectKey: string): string {
    const path = normalizeComponent(component, projectKey);
    // Truncate long paths
    if (path.length > 60) {
        return '...' + path.slice(-57);
    }
    return path;
}

/**
 * Main execution
 */
async function main() {
    const config = parseArgs();

    console.log('SonarCloud Issue Sync');
    console.log('=====================');
    console.log(`Source: ${config.sourceProject}`);
    console.log(`Target: ${config.targetProject}`);
    if (config.dryRun) {
        console.log('Mode: DRY RUN (no changes will be made)');
    }
    console.log('');

    // Fetch accepted/false-positive issues from source
    console.log('Fetching accepted issues from source...');
    const sourceIssues = await fetchAllIssues(config.sourceProject, ['ACCEPTED', 'FALSE_POSITIVE']);
    console.log(`  Found ${sourceIssues.length} accepted/false-positive issues`);

    if (sourceIssues.length === 0) {
        console.log('\nNo issues to sync. Done!');
        return;
    }

    // Fetch open issues from target
    console.log('Fetching open issues from target...');
    const targetIssues = await fetchAllIssues(config.targetProject, ['OPEN']);
    console.log(`  Found ${targetIssues.length} open issues`);

    // Match issues
    console.log('\nMatching issues...');
    const matches = matchIssues(sourceIssues, targetIssues, config);

    const matched = matches.filter((m) => m.targetIssue !== null);
    const unmatched = matches.filter((m) => m.targetIssue === null);

    console.log(`  Matched: ${matched.length}/${sourceIssues.length}`);
    console.log(`  Unmatched: ${unmatched.length}`);

    // Show verbose matching info
    if (config.verbose) {
        console.log('\n--- Matched Issues ---');
        for (const { sourceIssue } of matched) {
            const path = formatFilePath(sourceIssue.component, config.sourceProject);
            const transition = getTransitionType(sourceIssue);
            console.log(`  ✓ ${sourceIssue.rule} at ${path}:${sourceIssue.line ?? '?'} -> ${transition}`);
        }

        if (unmatched.length > 0) {
            console.log('\n--- Unmatched Issues (no corresponding open issue in target) ---');
            for (const { sourceIssue } of unmatched) {
                const path = formatFilePath(sourceIssue.component, config.sourceProject);
                console.log(`  ✗ ${sourceIssue.rule} at ${path}:${sourceIssue.line ?? '?'}`);
            }
        }
    }

    if (matched.length === 0) {
        console.log('\nNo matching issues to sync. Done!');
        return;
    }

    // Apply transitions
    console.log('\nApplying transitions...');

    if (config.dryRun) {
        console.log('  [DRY RUN] Would mark the following issues:');
        for (const { sourceIssue, targetIssue } of matched) {
            const transition = getTransitionType(sourceIssue);
            const path = formatFilePath(targetIssue!.component, config.targetProject);
            console.log(`    - ${targetIssue!.key}: ${transition} (${path}:${targetIssue!.line ?? '?'})`);
        }
        console.log(`\n  [DRY RUN] Would sync ${matched.length} issues`);
    } else {
        let successCount = 0;
        let failCount = 0;

        for (const { sourceIssue, targetIssue } of matched) {
            const transition = getTransitionType(sourceIssue);
            const path = formatFilePath(targetIssue!.component, config.targetProject);

            try {
                // Add sync comment
                const comment = `Synced from ${config.sourceProject}: ${transition.toUpperCase()}`;
                await addComment(targetIssue!.key, comment);

                // Apply transition
                await transitionIssue(targetIssue!.key, transition);

                successCount++;
                console.log(`  ✓ ${targetIssue!.key} -> ${transition} (${path})`);

                // Rate limiting
                await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
            } catch (error: unknown) {
                failCount++;
                const message = error instanceof Error ? error.message : String(error);
                console.error(`  ✗ ${targetIssue!.key}: ${message}`);
            }
        }

        console.log(`\nResults: ${successCount} succeeded, ${failCount} failed`);
    }

    // Summary by rule
    console.log('\n--- Summary by Rule ---');
    const ruleStats = new Map<string, { matched: number; unmatched: number }>();
    for (const { sourceIssue, targetIssue } of matches) {
        const stats = ruleStats.get(sourceIssue.rule) ?? { matched: 0, unmatched: 0 };
        if (targetIssue) {
            stats.matched++;
        } else {
            stats.unmatched++;
        }
        ruleStats.set(sourceIssue.rule, stats);
    }

    const sortedRules = [...ruleStats.entries()].sort((a, b) => b[1].matched - a[1].matched);
    for (const [rule, stats] of sortedRules) {
        const unmatchedNote = stats.unmatched > 0 ? ` (${stats.unmatched} unmatched)` : '';
        console.log(`  ${rule}: ${stats.matched} synced${unmatchedNote}`);
    }

    console.log('\n✓ Complete');
}

// Run the script
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
