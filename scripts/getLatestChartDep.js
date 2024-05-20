const { execSync } = require('child_process');

const packageJson = JSON.parse(
    execSync(`npm view ag-charts-community --json --registry http://52.50.158.57:4873`, {
        stdio: 'pipe',
        encoding: 'utf-8',
    })
);

console.log(packageJson['dist-tags'].latest);
