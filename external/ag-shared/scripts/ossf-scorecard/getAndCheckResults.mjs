const projects = ['grid', 'charts'];

export async function getOSSFScorecardResults({ project, threshold }) {
    if (!projects.includes(project)) {
        console.error(`Invalid project supplied. Valid projects are: ${projects.join(', ')}`);
        process.exit(1);
    }

    const scorecardJsonUrl = `https://api.securityscorecards.dev/projects/github.com/ag-grid/ag-${project}`;
    const response = await fetch(scorecardJsonUrl);
    const results = await response.json();

    const score = results.score;
    const hasPassed = score >= threshold;
    const status = hasPassed ? 'passed' : 'failed';
    const summary = hasPassed
        ? {
              passed: 1,
              failed: 0,
              skipped: 0,
          }
        : {
              passed: 0,
              failed: 1,
              skipped: 0,
          };
    const resultsUrl = `https://scorecard.dev/viewer/?uri=github.com/ag-grid/ag-${project}`;

    const report = {
        results: {
            summary,
        },
        tests: [
            {
                name: `OpenSSF Score >= ${threshold}`,
                message: `Score = ${score}, from ${scorecardJsonUrl}. See ${resultsUrl} for full details.`,
                status,
                duration: 0,
            },
        ],
    };

    return {
        response,
        report,
        score,
        hasPassed,
    };
}
