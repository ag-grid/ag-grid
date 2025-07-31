const projects = ['grid', 'charts'];

export async function belowThreshold(project, threshold) {
    if (!projects.includes(project)) {
        console.error(`Invalid project supplied. Valid projects are: ${projects.join(', ')}`);
        process.exit(1);
    }

    const response = await fetch(`https://api.securityscorecards.dev/projects/github.com/ag-grid/ag-${project}`);
    const { score } = await response.json();

    return score < threshold;
}
