const fs = require('fs');

const moduleConfig = JSON.parse(fs.readFileSync('./module.config.json', 'UTF-8'));
const sourceBundleTemplate = fs.readFileSync('./source-bundle-template.ts', 'UTF-8');

const webpackCommands = [
    '../node_modules/.bin/webpack --config webpack.config.js --entry ./community.ts -o ../bundles/community.bundle.js',
    '../node_modules/.bin/webpack --config webpack.config.js --entry ./enterprise.ts -o ../bundles/enterprise.bundle.js'
];

const runTestsScriptPrefix = `#!/usr/bin/env bash
error_found=0
`;

const runTestsScriptErrorCheck = `
if [ $? -eq 1 ]
then
    error_found=1
fi
`;

const runTestScriptCommands = [];

// generate the entry files that will be used to generate umd bundle files
moduleConfig.modules.forEach(module => {
    const testBundleLines = [];
    module.exposedModules.forEach(exposedModule => {
        testBundleLines.push(`import '${exposedModule}';`);
    });

    if (module.enterprise) {
        testBundleLines.push("import 'ag-grid-enterprise';");
    }

    const exportedModuleName = module.moduleSource.exportedModuleName;

    // the bundle entry file
    const testBundleContents = testBundleLines.concat(sourceBundleTemplate.toString().split('\n')).join('\n');
    const moduleEntryFile = `${exportedModuleName}.ts`;
    fs.writeFileSync(`../test-input/${moduleEntryFile}`, testBundleContents);

    // add module to list of webpack commands that will be used to generate bundles
    webpackCommands.push(`../node_modules/.bin/webpack --config webpack.config.js --entry ./${moduleEntryFile} -o ../bundles/${exportedModuleName}.bundle.js`);

    // the module source files that we'll pass into the moduleParser - we'll use this to search the webpack bundles for the module entries
    const moduleSourceImport = `import  {${exportedModuleName}} from "${module.moduleSource.moduleSource}"`;
    fs.writeFileSync(`../tests/${exportedModuleName}.ts`, moduleSourceImport);

    // the contents of the final run tests script that will check for the contents of a module in each bundle
    runTestScriptCommands.push(`node moduleParser.js ${exportedModuleName}.ts ../bundles/enterprise.bundle.js false`);
    runTestScriptCommands.push(`node moduleParser.js ${exportedModuleName}.ts ../bundles/community.bundle.js false`);
    runTestScriptCommands.push(`node moduleParser.js ${exportedModuleName}.ts ../bundles/${exportedModuleName}.bundle.js true`);
});

// output webpack file that will be used to generate the various module bundles
const webpackFile = '../test-input/webpack.sh';
fs.writeFileSync(webpackFile, webpackCommands.join('\n'));
fs.chmodSync(webpackFile, "755");

// the final run tests script that will check for the contents of a module in each bundle
const runTestScript = '../tests/runTests.sh';
fs.writeFileSync(runTestScript,
    runTestsScriptPrefix.concat(
        runTestScriptCommands.join(runTestsScriptErrorCheck).concat(runTestsScriptErrorCheck)
    ).concat('\nexit $error_found'));
fs.chmodSync(runTestScript, "755");
