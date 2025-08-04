const projects = ['grid', 'charts'];

const args = process.argv.slice(2);

if (args.length !== 2) {
    console.error(`Usage: node getAndCheckResults.mjs <project grid|charts> <threshold>`);
    process.exit(1);
}

const project = args[0];
const threshold = args[1];

if (!projects.includes(project)) {
    console.error(`Invalid project supplied. Valid projects are: ${projects.join(', ')}`);
    process.exit(1);
}

(async () => {
    const response = await fetch(`https://api.securityscorecards.dev/projects/github.com/ag-grid/ag-${project}`);
    const { score } = await response.json();

    if (score < threshold) {
        console.error(`Score for project ag-${project} is below threshold: ${score} < ${threshold}`);
        process.exit(1);
    }
})();
