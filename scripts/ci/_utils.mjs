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
    const links = new Set();
    parsedReport?.results?.tests?.forEach((test) => {
        try {
            const controlGitHash = test.extra.annotations[0].description.control.gitHash;
            const variantGitHash = test.extra.annotations[0].description.control.gitHash;
            if (!controlGitHash || !variantGitHash || controlGitHash === variantGitHash) {
                return;
            }
            links.add(getUrl(controlGitHash, variantGitHash));
        } catch (e) {}
    });

    if (!repoUrl) {
        return context('No git diff available');
    }

    const getGitDiffLink = (url) => section(link('Git diff', url));
    const getUrl = (control, variant) => `${repoUrl}/compare/${control.slice(0, 7)}...${variant.slice(0, 7)}`;

    if (links.size === 0) {
        if (!currentCommitSha || !previousCommitSha || previousCommitSha === currentCommitSha) {
            return context('No new changes');
        }
        links.add(getUrl(previousCommitSha, currentCommitSha));
    }

    return section([...links].map(getGitDiffLink).join('\n'));
}
