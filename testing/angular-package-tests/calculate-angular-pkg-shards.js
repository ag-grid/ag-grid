/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

const matches = {
    'ag-grid-angular': 'angular',
};

const result = { framework: [] };
const affectedProjects = execSync('yarn nx show projects --affected  -t pack', { encoding: 'utf-8' }).split('\n');

for (const packageName in matches) {
    if (affectedProjects.includes(packageName)) {
        result.framework.push(matches[packageName]);
    }
}

if (result.framework.length === 0) {
    // Avoid failing GHA matrix execution due to zero matrix permutations.
    result.framework.push('none');
} else {
    result.shard = Array.from(
        Array(
            parseInt(
                execSync('grep "test:package:shard-" ./testing/angular-package-tests/project.json | wc -l | xargs', {
                    encoding: 'utf-8',
                })
            )
        ).keys()
    );
}

console.log(JSON.stringify(result));
