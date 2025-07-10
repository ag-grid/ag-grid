import fs from 'node:fs';

export function getHeader(
    isSuccess,
    link,
    workflowName,
    jobId,
    jobUrl,
    branchName,
    bold,
    inlineCode,
    lastFailedStep,
    section
) {
    const emoji = isSuccess ? '✅' : '❌';
    const jobLink = link(`${workflowName} #${jobId}`, jobUrl);
    const atStep = lastFailedStep ? ` at step ${inlineCode(lastFailedStep)}` : '';
    const status = isSuccess ? bold('is successful') : `${bold('failed')}${atStep}`;
    return section(`${emoji} AgGrid / ${jobLink} run (on ${branchName}) ${status}`);
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
        } catch (e) {}
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
