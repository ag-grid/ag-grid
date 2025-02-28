/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

const matches = {
    'ag-charts-angular': 'angular',
    'ag-charts-react': 'react',
    'ag-charts-vue3': 'vue',
};

const result = { framework: [] };
const affectedProjects = execSync('yarn nx show projects --affected -t pack', { encoding: 'utf-8' }).split('\n');

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
