const ADVISORY_PATTERN = /(GHSA-[\w-]+|CVE-\d{4}-\d+)/;
const VULNERABILITIES_CHECK_DOC_URL = 'https://github.com/ossf/scorecard/blob/main/docs/checks.md#vulnerabilities';

function formatAdvisoryRow(id, index) {
    return `| ${index + 1} | \`${id}\` | [advisories/${id}](https://github.com/advisories/${id}) |`;
}

export function generateScorecardSummaryMarkdown({ results, threshold, project, hasPassed }) {
    const resultsUrl = `https://scorecard.dev/viewer/?uri=github.com/ag-grid/ag-${project}`;
    const score = results?.score;
    const commit = results?.repo?.commit ? `\`${results.repo.commit.slice(0, 7)}\`` : '(unknown)';
    const runDate = results?.date ?? '(unknown)';
    const statusIcon = hasPassed ? '✅' : '❌';

    const checks = results?.checks ?? [];
    const vulnCheck = checks.find((c) => c.name === 'Vulnerabilities');

    let md = `# OSSF Scorecard — ${project}\n\n`;
    md += `**Overall score:** ${score} / 10 (threshold ${threshold}) ${statusIcon}\n`;
    md += `**Commit:** ${commit} · **Run date:** ${runDate}\n`;
    md += `[Full scorecard report ↗](${resultsUrl})\n\n`;

    if (!vulnCheck) {
        md += `## Vulnerabilities check\n\n`;
        md += `_Not reported by scorecard._\n`;
        return md;
    }

    const advisoryIds = (vulnCheck.details ?? [])
        .map((detail) => detail.match(ADVISORY_PATTERN)?.[1])
        .filter(Boolean);

    const checkDocUrl = vulnCheck.documentation?.url ?? VULNERABILITIES_CHECK_DOC_URL;

    md += `## Vulnerabilities check — score ${vulnCheck.score} / 10\n\n`;
    md += `> ${vulnCheck.reason}\n\n`;
    md += `[About this check ↗](${checkDocUrl})\n\n`;

    if (advisoryIds.length === 0) {
        md += `✅ No vulnerabilities detected.\n`;
        return md;
    }

    md += `| # | Advisory | Link |\n| - | --- | --- |\n`;
    md += advisoryIds.map(formatAdvisoryRow).join('\n');
    md += '\n';

    return md;
}
