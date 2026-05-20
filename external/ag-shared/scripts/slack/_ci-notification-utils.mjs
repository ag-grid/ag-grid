import { execSync } from 'node:child_process';

// ────────────────────────────────────────────────────────────────────────────
// Per-library config. Add/edit entries here when a new library is onboarded.
// `project` values match the AG_PROJECT env var set by the calling workflow.
// ────────────────────────────────────────────────────────────────────────────
const LIBRARY_CONFIG = {
    AgGrid: {
        githubBaseUrl: 'https://github.com/ag-grid/ag-grid',
        stagingUrl: 'https://grid-staging.ag-grid.com',
        emoji: ':bento:',
    },
    AgCharts: {
        githubBaseUrl: 'https://github.com/ag-grid/ag-charts',
        stagingUrl: 'https://charts-staging.ag-grid.com',
        emoji: ':bar_chart:',
    },
    AgStudio: {
        githubBaseUrl: 'https://github.com/ag-grid/ag-studio',
        stagingUrl: 'https://studio-staging.ag-grid.com',
        emoji: ':jigsaw:',
    },
    Blog: {
        githubBaseUrl: 'https://github.com/ag-grid/ag-blog-content',
        stagingUrl: 'https://grid-staging.ag-grid.com',
        emoji: '',
    },
};

const DEFAULT_LIBRARY = 'AgGrid';

// JIRA ticket prefix → project's browse URL. Tickets in commit messages from
// any library are linked regardless of which prefix they use.
const JIRA_BASE_URL_BY_PREFIX = {
    AG: 'https://ag-grid.atlassian.net/browse/AG',
    AS: 'https://ag-grid.atlassian.net/browse/AS',
};

const MANY_CHANGES_LIMIT = 10;

// ────────────────────────────────────────────────────────────────────────────
// GitHub Actions workflow-command helpers. Emit `::warning::` / `::error::`
// annotations so failures surface in the Actions run summary even when the
// script exits 0. https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions
// ────────────────────────────────────────────────────────────────────────────
function escapeAnnotation(message) {
    return String(message).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

function emitAnnotation(level, message, { title } = {}) {
    const titlePart = title ? ` title=${escapeAnnotation(title)}` : '';
    console.log(`::${level}${titlePart}::${escapeAnnotation(message)}`);
}

export function ghaWarning(message, opts) {
    emitAnnotation('warning', message, opts);
}

export function ghaError(message, opts) {
    emitAnnotation('error', message, opts);
}

function getLibrary(project) {
    return LIBRARY_CONFIG[project] ?? LIBRARY_CONFIG[DEFAULT_LIBRARY];
}

export function getGithubBaseUrl(project) {
    return getLibrary(project).githubBaseUrl;
}

export function getRunUrl(project, runId) {
    return `${getGithubBaseUrl(project)}/actions/runs/${runId}`;
}

export function getEmoji(project) {
    return getLibrary(project).emoji;
}

export function getStagingUrl(project) {
    return getLibrary(project).stagingUrl;
}

export function getBranchLink(ref, project) {
    if (!ref) return '';
    const baseUrl = getGithubBaseUrl(project);
    if (ref === 'refs/heads/latest') return `<${baseUrl}/tree/latest|latest>`;
    // GitHub Actions exposes PR refs as `refs/pull/<n>/{merge,head}`; also accept the bare `pull/<n>` form.
    const pullMatch = ref.match(/^(?:refs\/)?pull\/(\d+)(?:\/[^/]+)?$/);
    if (pullMatch) {
        const prNumber = pullMatch[1];
        return `<${baseUrl}/pull/${prNumber}|PR #${prNumber}>`;
    }
    if (ref.startsWith('refs/tags/')) {
        const tag = ref.slice('refs/tags/'.length);
        return `<${baseUrl}/tree/${tag}|${tag}>`;
    }
    return ref;
}

export function findUserByEmail(testEmail, users) {
    return users.find(({ gitEmails }) => Array.isArray(gitEmails) && gitEmails.some((e) => e === testEmail));
}

export function getUser(githubUsername, users) {
    return users.find((u) => u.github === githubUsername);
}

export function getUserDisplay(githubUsername, userDisplayType, users) {
    const user = getUser(githubUsername, users);
    const slackId = user?.slackId;
    let display = user?.fullName || githubUsername;
    if (slackId) {
        if (userDisplayType === 'name') {
            display = user.fullName || githubUsername;
        } else if (userDisplayType === 'slack') {
            display = `<@${slackId}>`;
        } else if (userDisplayType === 'debug') {
            display = `${display} (${slackId})`;
        }
    }
    return display;
}

export function updateWithJiraUrl(str) {
    return str.replace(/((AG|AS)-[0-9]+)(.*)/gm, (_, ticket, prefix, rest) => {
        const base = JIRA_BASE_URL_BY_PREFIX[prefix];
        return base ? `<${base}/${ticket}|${ticket}>${rest}` : `${ticket}${rest}`;
    });
}

export function updateWithGithubPRUrl({ str, baseGithubUrl }) {
    return str.replace(/#(\d+)/gm, `<${baseGithubUrl}/pull/$1 | #$1>`);
}

export function getGitChanges(currentSha, lastSuccessfulSha, users) {
    // Trim trailing newline before interpolating — `head -1` keeps it and the
    // embedded newline would otherwise break the next `git log` command.
    const firstAfterSuccess = execSync(
        `git log --reverse --ancestry-path --pretty=%H ${lastSuccessfulSha}..HEAD | head -1`,
        { stdio: 'pipe', encoding: 'utf-8' }
    ).trim();

    const gitCommand =
        firstAfterSuccess.length === 0 || firstAfterSuccess === currentSha
            ? `git log ${currentSha} --format="%ae||%an||%h||%s" | head -1`
            : `git log ${lastSuccessfulSha}..${currentSha} --format="%ae||%an||%h||%s"`;

    const rawChanges = execSync(gitCommand, { stdio: 'pipe', encoding: 'utf-8' });

    return rawChanges
        .split('\n')
        .filter((change) => change.length > 0)
        .map((change) => change.split('||'))
        .map(([email, authorName, version, comment]) => {
            const user = findUserByEmail(email, users);
            return {
                username: user?.github || authorName,
                slackId: user?.slackId,
                version,
                comment,
            };
        });
}

export function getChangesData({ currentSha, lastSuccessfulSha, project, gitChanges, userDisplayTypeSetting, users }) {
    const baseGithubUrl = getGithubBaseUrl(project);
    const githubUrl =
        gitChanges.length > 1
            ? `${baseGithubUrl}/compare/${lastSuccessfulSha}...${currentSha}`
            : `${baseGithubUrl}/commit/${currentSha}`;

    const tooManyChanges = gitChanges.length > MANY_CHANGES_LIMIT;
    const changes = tooManyChanges ? gitChanges.slice(0, MANY_CHANGES_LIMIT) : gitChanges;

    const allUsers = gitChanges.map(({ username }) => username);
    const allOtherUsers = allUsers.slice(MANY_CHANGES_LIMIT);
    const uniqueUsers = [...new Set(allUsers)];

    // Use names (not slack mentions) when there are many changes from multiple authors,
    // so we don't ping a long list of people.
    const userDisplayType =
        tooManyChanges && userDisplayTypeSetting === 'slack' && uniqueUsers.length > 1
            ? 'name'
            : userDisplayTypeSetting;

    const otherUsers = [...new Set(allOtherUsers)]
        .map((username) => getUserDisplay(username, userDisplayType, users))
        .join(', ');

    let changeDetails = changes
        .map(({ username, comment, version }) => {
            const firstLine = updateWithGithubPRUrl({
                str: updateWithJiraUrl(comment.split('\n')[0]),
                baseGithubUrl,
            });
            const shortSha = version.slice(0, 7);
            const userDisplay = getUserDisplay(username, userDisplayType, users);
            return `• ${userDisplay}: ${firstLine} (<${baseGithubUrl}/commit/${version}|${shortSha}>)`;
        })
        .join('\n');

    if (tooManyChanges) {
        changeDetails += `\n• ...(${gitChanges.length - MANY_CHANGES_LIMIT} more changes from ${otherUsers})`;
    }

    const changesText =
        gitChanges.length === 0 ? '_No changes_' : `Changes (<${githubUrl}|Github diff>):\n${changeDetails}`;

    return { uniqueUsers, changesText };
}

export function getJobStatusSummary(jobStatuses) {
    const symbol = (status) => (status === 'success' ? '✅' : status === 'failure' ? '❌' : '➖');
    return Object.entries(jobStatuses)
        .map(([job, status]) => `${job}: ${symbol(status)}`)
        .join(' | ');
}

export function deriveStatus(jobStatuses) {
    // Mirror the workflow's own check: only an explicit 'failure' counts as a failure;
    // 'skipped' / 'cancelled' / 'n/a' are not failures.
    return Object.values(jobStatuses).some((status) => status === 'failure') ? 'failure' : 'success';
}
