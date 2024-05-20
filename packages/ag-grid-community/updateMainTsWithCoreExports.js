const fs = require('fs');
const coreExports = require('../../community-modules/core/dist/package/main.cjs.js');
const { EOL } = require('os');

const chartInterfaceExclusions = [
    '__FORCE_MODULE_DETECTION',
    'AgChartThemeOverrides',
    'AgChartThemePalette',
    'AgChartTheme',
];

function updateBetweenStrings(fileContents, fragmentToBeInserted) {
    const startIndex = fileContents.indexOf('/** AUTO_GENERATED_START **/') + '/** AUTO_GENERATED_START **/'.length;
    const endIndex = fileContents.indexOf('/** AUTO_GENERATED_END **/');

    return `${fileContents.substring(0, startIndex)}${EOL}${fragmentToBeInserted}${EOL}${fileContents.substring(endIndex)}`;
}

const exportsToAdd = [];
Object.keys(coreExports).forEach(function (exportName) {
    if (!chartInterfaceExclusions.some((exclusion) => exclusion === exportName)) {
        exportsToAdd.push(`export { ${exportName} } from '@ag-grid-community/core';`);
    }
});

const replaceMainFile = (filename) => {
    const existingContents = fs.readFileSync(filename, 'utf-8');
    const newContents = updateBetweenStrings(existingContents, exportsToAdd.join('\n'));
    fs.writeFileSync(filename, newContents, 'utf-8');
};

replaceMainFile('./src/main.ts');
replaceMainFile('./src/main-styles.ts');
