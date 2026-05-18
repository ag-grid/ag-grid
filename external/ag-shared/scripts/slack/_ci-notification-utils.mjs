import { execSync } from 'node:child_process';

const JIRA_BASE_URL = 'https://ag-grid.atlassian.net/browse/AG';
const MANY_CHANGES_LIMIT = 10;

export function getGithubBaseUrl(project) {
    if (project === 'Blog') return 'https://github.com/ag-grid/ag-blog-content';
    if (project === 'AgCharts') return 'https://github.com/ag-grid/ag-charts';
    return 'https://github.com/ag-grid/ag-grid';
}

export function getRunUrl(project, runId) {
    return `${getGithubBaseUrl(project)}/actions/runs/${runId}`;
}

export function getEmoji(project) {
    if (project === 'AgGrid') return ':bento:';
    if (project === 'AgCharts') return ':bar_chart:';
    return '';
}

export function getStagingUrl(project) {
    if (project === 'AgCharts') return 'https://charts-staging.ag-grid.com';
    return 'https://grid-staging.ag-grid.com';
}

export function getBranchLink(ref, project) {
    if (!ref) return '';
    const baseUrl = getGithubBaseUrl(project);
    if (ref === 'refs/heads/latest') return `<${baseUrl}/tree/latest|latest>`;
    if (ref.startsWith('pull/')) return `<${baseUrl}/${ref}|PR #${ref.slice('pull/'.length)}>`;
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
    return str.replace(/(AG-[0-9]+)(.*)/gm, `<${JIRA_BASE_URL}/$1|$1>$2`);
}

export function updateWithGithubPRUrl({ str, baseGithubUrl }) {
    return str.replace(/#(\d+)/gm, `<${baseGithubUrl}/pull/$1 | #$1>`);
}

export function getGitChanges(currentSha, lastSuccessfulSha, users) {
    const firstAfterSuccess = execSync(
        `git log --reverse --ancestry-path --pretty=%H ${lastSuccessfulSha}..HEAD | head -1`,
        { stdio: 'pipe', encoding: 'utf-8' }
    );

    const gitCommand =
        firstAfterSuccess.length === 0 || firstAfterSuccess === currentSha
            ? `git log ${currentSha} --format="%ae||%an||%h||%s" | head -1`
            : `git log ${currentSha}...${firstAfterSuccess} --format="%ae||%an||%h||%s" | head -1`;

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
