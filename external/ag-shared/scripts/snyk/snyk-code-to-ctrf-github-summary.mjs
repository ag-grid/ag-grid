export function convertToCtrfGithubSummary({ results, githubRepoUrl }) {
    const passed = results.runs.reduce(
        (mem, run) => mem + run.properties.coverage.reduce((mem2, cov) => mem2 + (cov.isSupported ? cov.files : 0), 0),
        0
    );
    const rules = {};
    const failedTests = results.runs
        .map((r) => {
            return r.results.map((res) => {
                const locations = res.locations.map((loc) => {
                    return {
                        uri: loc.physicalLocation.artifactLocation.uri,
                        file: loc.physicalLocation?.artifactLocation?.uri,
                        col: loc.physicalLocation?.region?.startColumn,
                        endColumn: loc.physicalLocation?.region?.endColumn,
                        line: loc.physicalLocation?.region?.startLine,
                        endLine: loc.physicalLocation?.region?.endLine,
                    };
                });

                const { ruleId, message } = res;
                if (!rules[ruleId]) {
                    const rule = r.tool.driver.rules.find(({ id }) => id === ruleId);
                    rules[ruleId] = {
                        shortDescription: rule.shortDescription.text,
                        helpMarkdown: rule.help.markdown,
                    };
                }

                return {
                    id: ruleId,
                    message: message.text,
                    shortDescription: rules[ruleId].shortDescription,
                    locations,
                };
            });
        })
        .flat();
    const failed = failedTests.length;
    const skipped = results.runs.reduce(
        (mem, run) => mem + run.properties.coverage.reduce((mem2, cov) => mem2 + (cov.isSupported ? 0 : cov.files), 0),
        0
    );

    const ctrf = { results: { summary: { failed, passed, skipped } } };

    let githubSummary = `# SAST Code Scan Summary\n\n`;
    githubSummary += `| Failed ❌ | Passed ✅ | Skipped ⏭️ |\n| - | - | - |\n| ${failed} | ${passed} | ${skipped} |\n`;

    if (failed > 0) {
        githubSummary += `\n## Failed Tests (${failed})\n\n`;
        failedTests.forEach(({ id, shortDescription, message, locations }) => {
            const locationsSummary = [];
            locations.forEach(({ file, line, endLine }) => {
                const lineInfo = line === endLine ? `${line}` : `${line}-${endLine}`;
                const locationFileRef = `${file}#L${lineInfo}`;
                const locationUrl = `${githubRepoUrl}/blob/latest/${locationFileRef}`;
                locationsSummary.push(`[${locationFileRef}](${locationUrl})`);
            });

            githubSummary += `- ${locationsSummary.join(', ')}\n`;
            githubSummary += `  - [${shortDescription}](#user-content-${id.toLowerCase()}): ${message}\n`;
        });

        Object.keys(rules).forEach((ruleId) => {
            const { shortDescription, helpMarkdown } = rules[ruleId];
            githubSummary += '\n\n---\n\n';
            githubSummary += `# <a name="${ruleId}"></a>${shortDescription}\n\n${helpMarkdown}`;
        });
    }

    return {
        failedTests,
        ctrf,
        githubSummary,
    };
}
