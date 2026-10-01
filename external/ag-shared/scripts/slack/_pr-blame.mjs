import { getUserDisplay, ghaWarning, githubApi, updateWithJiraUrl } from './_ci-notification-utils.mjs';

const MAX_COMMITS_INSPECTED = 60;
const MAX_LISTED_PRS = 10;
const LOOKUP_CONCURRENCY = 5;
// Slack rejects a section over 3,000 characters, which ten untrimmed titles plus their link
// markup can reach on their own.
const MAX_TITLE_LENGTH = 120;
// The same 3,000-character limit applies to the finished section, and breaching it costs the
// whole message, so the budget keeps headroom for the markup Slack counts but a reader does not.
const MAX_SECTION_LENGTH = 2800;
// One author line cannot be allowed to run away on its own: a wide range of single-PR authors
// would otherwise spend the entire budget naming them.
const MAX_AUTHOR_LIST_LENGTH = 400;

// Fallbacks for when the associated-pulls endpoint gives us nothing: a squash merge puts the
// number in a trailing `(#123)`, and a true merge commit uses GitHub's own subject line.
const SQUASH_PR_RE = /\(#(\d+)\)\s*$/;
const MERGE_PR_RE = /^Merge pull request #(\d+)\b/;

/**
 * The pull requests whose commits land in baseSha..currentSha, newest first.
 *
 * Commits are resolved through the associated-pulls endpoint rather than by reading the commit
 * message, because the three repos do not share a merge style: ag-grid and ag-studio squash (the
 * number is in the subject), while ag-charts carries both squashes and real merge commits whose
 * branch commits mention no number at all. The endpoint answers all three, and several commits
 * from one branch collapse onto a single PR once deduped.
 *
 * Returns `truncated: true` when the range was too wide to inspect in full, so the caller can say
 * so rather than presenting a partial list as complete.
 */
export async function getPullRequestsInRange({ repository, token, baseSha, currentSha }) {
    if (!repository || !token || !baseSha || !currentSha || baseSha === currentSha) {
        return { pullRequests: [], truncated: false };
    }

    const { commits, truncated: rangeTruncated } = await listCommits({
        repository,
        token,
        baseSha,
        currentSha,
    });
    // The oldest are kept, not the newest: the range starts at the last run that passed, so a
    // range wide enough to need the cap is a long red period whose first commit is the suspect.
    const inspected = commits.slice(-MAX_COMMITS_INSPECTED);
    if (inspected.length < commits.length) {
        ghaWarning(
            `Range holds ${commits.length} commits; only the oldest ${MAX_COMMITS_INSPECTED} were checked for a pull request.`,
            { title: 'PR attribution truncated' }
        );
    }

    const perCommit = await mapWithConcurrency(inspected, LOOKUP_CONCURRENCY, (commit) =>
        pullRequestForCommit({ repository, token, commit })
    );

    const byNumber = new Map();
    for (const pullRequest of perCommit) {
        if (pullRequest && !byNumber.has(pullRequest.number)) {
            byNumber.set(pullRequest.number, pullRequest);
        }
    }

    return {
        pullRequests: [...byNumber.values()],
        truncated: rangeTruncated || inspected.length < commits.length,
    };
}

/**
 * Renders the blame section as Slack mrkdwn, or undefined when there is nothing to show.
 *
 * `mention` is 'slack' to ping each author and 'name' to name them without notifying.
 */
export function renderPullRequestBlame({ pullRequests, users = [], mention = 'slack', isSuccess, truncated }) {
    if (!pullRequests?.length) {
        return undefined;
    }

    const display = (pullRequest) => authorDisplay(pullRequest, mention, users);
    const heading = isSuccess
        ? 'PRs since the last passing run:'
        : pullRequests.length === 1
          ? 'Suspect PR:'
          : 'Suspect PRs since the last passing run:';

    // Slack rejects the entire message when a section runs over its limit, so the section is
    // assembled and then shrunk a line at a time until it fits. A range wide enough to need that
    // is a long red period, and naming fewer of its PRs beats losing the notification outright.
    for (let shown = Math.min(pullRequests.length, MAX_LISTED_PRS); ; shown--) {
        const text = assembleBlame({ pullRequests, heading, shown, display, truncated });
        if (text.length <= MAX_SECTION_LENGTH || shown === 0) {
            return text;
        }
    }
}

function assembleBlame({ pullRequests, heading, shown, display, truncated }) {
    const lines = pullRequests.slice(0, shown).map((pullRequest) => {
        const title = updateWithJiraUrl(shorten(pullRequest.title || `#${pullRequest.number}`));
        return `• ${display(pullRequest)} - ${title} (<${pullRequest.url}|#${pullRequest.number}>)`;
    });

    // The overflow still names its authors: the point of the section is that whoever landed the
    // change hears about it, and being the eleventh PR in the range does not excuse them.
    const hidden = pullRequests.slice(shown);
    if (hidden.length > 0) {
        const authors = joinAuthorsWithinBudget([...new Set(hidden.map(display))]);
        lines.push(
            shown > 0
                ? `• ...and ${hidden.length} more from ${authors}`
                : `• ${hidden.length} PRs in range, from ${authors}`
        );
    }
    if (truncated) {
        lines.push('• _the range was too wide to list in full; older PRs are not shown_');
    }
    return `${heading}\n${lines.join('\n')}`;
}

/** Names as many authors as the allowance holds and counts the rest, so the line stays bounded. */
function joinAuthorsWithinBudget(names) {
    const kept = [];
    let length = 0;
    for (const name of names) {
        const addition = (kept.length > 0 ? 2 : 0) + name.length;
        if (length + addition > MAX_AUTHOR_LIST_LENGTH) {
            break;
        }
        kept.push(name);
        length += addition;
    }
    const remaining = names.length - kept.length;
    if (remaining === 0) {
        return kept.join(', ');
    }
    return kept.length > 0 ? `${kept.join(', ')} and ${remaining} others` : `${names.length} authors`;
}

/** Guarded against a missing login, which would otherwise match a directory row that records none. */
function authorDisplay(pullRequest, mention, users) {
    return pullRequest.authorLogin ? getUserDisplay(pullRequest.authorLogin, mention, users) : 'unknown author';
}

function shorten(title) {
    return title.length > MAX_TITLE_LENGTH ? `${title.slice(0, MAX_TITLE_LENGTH).trimEnd()}…` : title;
}

/** Newest first, via the compare API so the shallow CI checkout is irrelevant. It caps its own list at 250. */
async function listCommits({ repository, token, baseSha, currentSha }) {
    const comparison = await githubApi(`/repos/${repository}/compare/${baseSha}...${currentSha}`, token);
    const commits = (comparison.commits ?? [])
        .map(({ sha, commit }) => ({ sha, message: commit?.message ?? '' }))
        .reverse();
    return { commits, truncated: (comparison.total_commits ?? commits.length) > commits.length };
}

async function pullRequestForCommit({ repository, token, commit }) {
    try {
        const associated = await githubApi(`/repos/${repository}/commits/${commit.sha}/pulls`, token);
        const chosen = chooseAssociatedPullRequest(associated, commit.sha);
        if (chosen) {
            return toPullRequest(chosen);
        }
    } catch (error) {
        ghaWarning(`Could not list pull requests for ${commit.sha.slice(0, 7)}: ${error.message}`, {
            title: 'PR attribution: lookup failed',
        });
    }
    return pullRequestFromCommitMessage({ repository, token, commit });
}

/**
 * One PR per commit. A commit can sit in several - it was cherry-picked, or its branch was merged
 * onward - and listing them all would name PRs that never touched the deployed site. A merged PR
 * wins over an open one, and the PR this very commit merged wins over the rest.
 *
 * Failing an exact match, the oldest merge wins: the later PRs are the ones that carried the
 * commit onward, so the earliest is the one that introduced it. Picking the most recent instead
 * would blame whoever forward-merged latest into their branch. Squash merges (ag-grid, ag-studio)
 * match exactly and never reach that tie-break; ag-charts also carries real merge commits, whose
 * branch commits match no merge_commit_sha at all.
 */
function chooseAssociatedPullRequest(associated, commitSha) {
    if (!Array.isArray(associated) || associated.length === 0) {
        return undefined;
    }
    const merged = associated.filter((pullRequest) => pullRequest.merged_at);
    const exact = (merged.length > 0 ? merged : associated).find(
        (pullRequest) => pullRequest.merge_commit_sha === commitSha
    );
    if (exact) {
        return exact;
    }
    return merged.length > 0
        ? [...merged].sort((a, b) => Date.parse(a.merged_at) - Date.parse(b.merged_at))[0]
        : associated[0];
}

async function pullRequestFromCommitMessage({ repository, token, commit }) {
    const subject = commit.message.split('\n')[0];
    const number = Number(SQUASH_PR_RE.exec(subject)?.[1] ?? MERGE_PR_RE.exec(subject)?.[1] ?? NaN);
    if (!Number.isInteger(number)) {
        return undefined;
    }
    try {
        return toPullRequest(await githubApi(`/repos/${repository}/pulls/${number}`, token));
    } catch (error) {
        // The number is still worth reporting even without the author it would have named.
        ghaWarning(`Could not fetch PR #${number} read from a commit subject: ${error.message}`, {
            title: 'PR attribution: partial',
        });
        return {
            number,
            title: subject,
            url: `https://github.com/${repository}/pull/${number}`,
            authorLogin: undefined,
        };
    }
}

function toPullRequest(pullRequest) {
    return {
        number: pullRequest.number,
        title: pullRequest.title,
        url: pullRequest.html_url,
        authorLogin: pullRequest.user?.login,
    };
}

/** Index-preserving concurrent map, so callers keep the input's ordering. */
async function mapWithConcurrency(items, limit, fn) {
    const results = new Array(items.length);
    let next = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (next < items.length) {
            const index = next++;
            results[index] = await fn(items[index], index);
        }
    });
    await Promise.all(workers);
    return results;
}
