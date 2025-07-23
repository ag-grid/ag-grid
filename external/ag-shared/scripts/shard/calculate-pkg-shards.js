/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

const LIBRARIES = ['grid', 'charts'];
const library = process.env.AG_LIBRARY;

if (!LIBRARIES.includes(library)) {
    console.error(`AG_LIBRARY environment variable is not set. Valid values are: ${LIBRARIES.join(', ')}`);
    process.exit(1);
}

let matches;
let affectedProjectsCmd;
if (library === 'grid') {
    matches = {
        'ag-grid-angular': 'angular',
        'ag-grid-react': 'react',
        'ag-grid-vue3': 'vue',
    };
    affectedProjectsCmd = 'yarn nx show projects --affected -t pack';
} else if (library === 'charts') {
    matches = {
        'ag-charts-angular': 'angular',
        'ag-charts-react': 'react',
        'ag-charts-vue3': 'vue',
        'angular-package-tests': 'angular',
        'react-package-tests': 'react',
        'vue-package-tests': 'vue',
    };
    affectedProjectsCmd = 'yarn nx show projects --affected -t pack -t test:package';
}

const result = { framework: [] };
const affectedProjects = execSync(affectedProjectsCmd, { encoding: 'utf-8' }).split('\n');

for (const packageName in matches) {
    if (affectedProjects.includes(packageName)) {
        result.framework.push(matches[packageName]);
    }
}

if (result.framework.length === 0) {
    // Avoid failing GHA matrix execution due to zero matrix permutations.
    result.framework.push('none');
}

console.log(JSON.stringify(result));
