import { getUserDisplay, ghaWarning, githubApi, updateWithJiraUrl } from './_ci-notification-utils.mjs';

const LOOKUP_CONCURRENCY = 5;
// Slack rejects a section over 3,000 characters, which ten untrimmed titles plus their link
// markup can reach on their own.
const MAX_TITLE_LENGTH = 120;
// The same 3,000-character limit applies to the finished section, and breaching it costs the
// whole message, so the budget keeps headroom for the markup Slack counts but a reader does not.
const MAX_SECTION_LENGTH = 2800;
// Two bounds on how wide a range the message will try to attribute. Past either of them it stops
// naming PRs and reports the commit count instead: nobody reads twenty names looking for the one
// that broke the site, and what landed is what the Git diff link already describes. The commit
// bound doubles as the guard against a bad baseline, because the runs list the workflow reads it
// from is an edge-cached endpoint that has been seen serving pages over a week stale, and the
// only visible symptom was a suspect list dozens of PRs long.
const MAX_BLAMEABLE_COMMITS = 20;
const MAX_LISTED_PRS = 10;
// Only a list short enough to be a real suspect list earns a ping each. Past this the authors are
// named without being notified: the message cannot say which of the PRs broke anything, so
// pinging all of them asks everyone to answer for somebody else's change.
const MAX_MENTIONED_PRS = 3;

// Fallbacks for when the associated-pulls endpoint gives us nothing: a squash merge puts the
// number in a trailing `(#123)`, and a true merge commit uses GitHub's own subject line.
const SQUASH_PR_RE = /\(#(\d+)\)\s*$/;
const MERGE_PR_RE = /^Merge pull request #(\d+)\b/;

/**
 * The pull requests whose commits land in baseSha..currentSha, newest first, with the range's own
 * commit count beside them so the caller can tell a narrow range from one too wide to attribute.
 *
 * Commits are resolved through the associated-pulls endpoint rather than by reading the commit
 * message, because the three repos do not share a merge style: ag-grid and ag-studio squash (the
 * number is in the subject), while ag-charts carries both squashes and real merge commits whose
 * branch commits mention no number at all. The endpoint answers all three, and several commits
 * from one branch collapse onto a single PR once deduped.
 */
export async function getPullRequestsInRange({ repository, token, baseSha, currentSha }) {
    if (!repository || !token || !baseSha || !currentSha || baseSha === currentSha) {
        return { pullRequests: [], totalCommits: 0 };
    }

    const { commits, totalCommits } = await listCommits({ repository, token, baseSha, currentSha });

    // Tested before the per-commit lookups rather than after them: a range this wide is reported
    // as a count, so resolving each of its commits to a pull request first would spend dozens of
    // API calls building a list that is then thrown away.
    if (totalCommits > MAX_BLAMEABLE_COMMITS) {
        return { pullRequests: [], totalCommits };
    }

    const perCommit = await mapWithConcurrency(commits, LOOKUP_CONCURRENCY, (commit) =>
        pullRequestForCommit({ repository, token, commit })
    );

    const byNumber = new Map();
    for (const pullRequest of perCommit) {
        if (pullRequest && !byNumber.has(pullRequest.number)) {
            byNumber.set(pullRequest.number, pullRequest);
        }
    }

    return { pullRequests: [...byNumber.values()], totalCommits };
}

/**
 * True when the range is wider than a suspect list can usefully be, so the message should report
 * its size rather than name the pull requests in it.
 */
export function isRangeTooWide({ pullRequests, totalCommits }) {
    return totalCommits > MAX_BLAMEABLE_COMMITS || pullRequests.length > MAX_LISTED_PRS;
}

/**
 * The stand-in for a range too wide to attribute, and the fallback whenever the list cannot be
 * rendered. One line, no names and no pings: what a reader needs from it is how far back the last
 * passing run was, and the Git diff link below the section already says what landed.
 */
export function renderRangeSummary({ totalCommits, tooWide }) {
    const commits = totalCommits === 1 ? '1 commit' : `${totalCommits} commits`;
    // Width is the designed reason to land here and worth naming. The other two - a range that
    // resolved to no pull request at all, and a list too long for one Slack section - are rare,
    // and the width wording would describe the wrong problem, so they get a neutral line.
    return tooWide
        ? `${commits} since the last passing run, too wide to point at a suspect; see the Git diff below.`
        : `${commits} since the last passing run, with no suspect list to show; see the Git diff below.`;
}

/**
 * Renders the blame section as Slack mrkdwn, or undefined when there is nothing to show or the
 * result would not fit Slack's section limit. The caller falls back to `renderRangeSummary` in
 * either case, so an over-budget section degrades to a count rather than silently dropping PRs -
 * and breaching the limit would cost the whole message, not just this block.
 *
 * Only a failure gets this section. A back-to-green message is read as "it is fixed", and the
 * range that led there answers a question nobody is asking by then.
 */
export function renderPullRequestBlame({ pullRequests, users = [] }) {
    if (!pullRequests?.length) {
        return undefined;
    }

    // The authors are pinged only while the list is short enough for each of them to be a
    // plausible cause; past that they are named without being notified.
    const mention = pullRequests.length <= MAX_MENTIONED_PRS ? 'slack' : 'name';
    const display = (pullRequest) => authorDisplay(pullRequest, mention, users);
    const heading = pullRequests.length === 1 ? 'Suspect PR:' : 'Suspect PRs since the last passing run:';

    const lines = pullRequests.map((pullRequest) => {
        const title = updateWithJiraUrl(shorten(pullRequest.title || `#${pullRequest.number}`));
        return `• ${display(pullRequest)} - ${title} (<${pullRequest.url}|#${pullRequest.number}>)`;
    });
    const text = `${heading}\n${lines.join('\n')}`;
    return text.length <= MAX_SECTION_LENGTH ? text : undefined;
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
    return { commits, totalCommits: comparison.total_commits ?? commits.length };
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
