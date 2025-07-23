import fs from 'node:fs';

export function getHeader({
    isSuccess,
    link,
    workflowName,
    jobId,
    jobUrl,
    branchName,
    bold,
    inlineCode,
    lastFailedStep,
    section,
    title,
}) {
    const emoji = isSuccess ? '✅' : '❌';
    const jobLink = link(`${workflowName} #${jobId}`, jobUrl);
    const atStep = lastFailedStep ? ` at step ${inlineCode(lastFailedStep)}` : '';
    const status = isSuccess ? bold('is successful') : `${bold('failed')}${atStep}`;
    return section(`${emoji} ${title} / ${jobLink} run (on ${branchName}) ${status}`);
}

export function getGitDiffLinks(repoUrl, currentCommitSha, previousCommitSha, context, section, link, parsedReport) {
    if (!repoUrl) {
        return context('No git diff available');
    }

    const links = new Set();
    parsedReport?.results?.tests?.forEach((test) => {
        try {
            const controlGitHash = getGitHashFromTest(test);
            const variantGitHash = getGitHashFromTest(test, 'variant');
            if (!controlGitHash || !variantGitHash || controlGitHash === variantGitHash) {
                return;
            }
            links.add(getDiffUrl(controlGitHash, variantGitHash, repoUrl));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Ignore error
        }
    });

    if (links.size === 0) {
        if (!currentCommitSha || !previousCommitSha || previousCommitSha === currentCommitSha) {
            return context('No new changes');
        }
        links.add(getDiffUrl(previousCommitSha, currentCommitSha, repoUrl));
    }
    const linksArr = [...links].map((url) => getGitDiffLink(url, (t) => t, link));
    return section(linksArr.join('\n'));
}

export function getDiffUrl(controlHash, variantHash, repoUrl) {
    return `${repoUrl}/compare/${controlHash.slice(0, 7)}...${variantHash.slice(0, 7)}`;
}

export function getGitDiffLink(url, section, link) {
    return section(link('Git diff', url));
}

export function getGitHashFromTest(test, type = 'control') {
    return test?.extra?.annotations?.[0]?.description?.[type]?.gitHash;
}

export function parseCtrfReport(ctrfReportFile) {
    try {
        const rawReport = fs.readFileSync(ctrfReportFile, 'utf8').trim();
        if (!rawReport) {
            console.warn(`Report file ${ctrfReportFile} is empty. Continuing without it.`);
        }
        return JSON.parse(rawReport);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        console.warn(`Failed to read CTRF report from ${ctrfReportFile}. Continuing without it.`);
    }
}
function renderStat(statKey, parsedReport) {
    return `${statKey}: ${parsedReport.results.summary[statKey]}`;
}

export function getStats(parsedReport, context) {
    if (!parsedReport || !parsedReport.results || !parsedReport.results.summary) {
        return '';
    }
    return parsedReport
        ? context(
              `Tests ${['failed', 'passed', 'skipped']
                  .filter((n) => parsedReport.results.summary[n])
                  .map((key) => renderStat(key, parsedReport))
                  .join(', ')}`
          )
        : '';
}

const JIRA_API_URL = 'https://ag-grid.atlassian.net/rest/api/2';

// Transition an issue to a new status
export async function transitionJiraIssue(issue, transitionId) {
    const url = `${JIRA_API_URL}/issue/${issue.key}/transitions`;
    try {
        await commonFetch(url, { method: 'POST', body: JSON.stringify({ transition: { id: transitionId } }) });
        await updateJiraIssue(issue.key, { fields: { assignee: { accountId: issue.fields.assignee.accountId } } });
        console.log(`Issue ${issue.key} transitioned successfully`);
    } catch (error) {
        console.error('Error transitioning issue:', error.message);
        throw error;
    }
}

export async function updateJiraIssue(issueKey, body) {
    const url = `${JIRA_API_URL}/issue/${issueKey}`;
    try {
        await commonFetch(url, { method: 'PUT', body: JSON.stringify(body) });
        console.log(`Issue ${issueKey} updated successfully`);
    } catch (error) {
        console.error('Error updating issue:', error.message);
        throw error;
    }
}

export async function commonFetch(url, options) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${process.env.JIRA_API_AUTH}`,
        },
        ...options,
    });
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status} ${response.statusText} ${await response.text()}`);
    }
    return response.json().catch((e) => {
        if (e.message === 'Unexpected end of JSON input') {
            return {};
        }
    });
}

export async function getJiraTransitions(issueKey) {
    const url = `${JIRA_API_URL}/issue/${issueKey}/transitions`;
    try {
        const data = await commonFetch(url, { method: 'GET' });
        return data.transitions;
    } catch (error) {
        console.error('Error fetching transitions:', error.message);
        throw error;
    }
}

export async function getJiraIssue(issueKey) {
    const url = `${JIRA_API_URL}/issue/${issueKey}`;
    try {
        return await commonFetch(url, { method: 'GET' });
    } catch (error) {
        console.error('Error fetching issue:', error.message);
        throw error;
    }
}
// Add a comment to an issue
export async function addJiraComment(issueKey, body) {
    const url = `https://ag-grid.atlassian.net/rest/api/3/issue/${issueKey}/comment`;

    try {
        await commonFetch(url, { method: 'POST', body: JSON.stringify({ body }) });
        console.log(`Added comment to issue ${issueKey}`);
    } catch (error) {
        console.error('Error adding comment:', error.message);
        throw error;
    }
}

export function jiraLink(text, url) {
    return `[${text}|${url}]`;
}
