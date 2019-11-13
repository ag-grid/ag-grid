const fs = require('fs');
const path = require('path');
const process = require('process');
const glob = require('glob');

const uppercaseFirstChar = word => word.charAt(0).toUpperCase() + word.slice(1)

let getModuleInformation = function (moduleDir, enterprise) {
    return glob.sync(`../../../${moduleDir}/*`)
        .filter(directory =>
            !directory.includes('grid-all-modules') &&
            !directory.includes('grid-core'))
        .map(directory => {
            const moduleFiles = glob.sync(`${directory}/src/*Module.ts`);
            if (moduleFiles.length === 0) {
                return null;
            }

            const basename = path.basename(moduleFiles[0], '.ts');

            const modulePackage = require(path.resolve(`${directory}/package.json`));
            const exposedModule = modulePackage.name;
            const dependants = modulePackage.dependencies ?
                Object.keys(modulePackage.dependencies)
                    .filter(dependency =>
                        dependency.startsWith('@ag-') &&
                        !dependency.includes('/all-modules') &&
                        !dependency.includes('/core'))
                : [];


            return {
                exportedModuleName: uppercaseFirstChar(basename),
                moduleSource: `${exposedModule}/src/${basename}`,
                exposedModule: exposedModule,
                dependants,
                enterprise
            }
        })
        .filter(entry => entry !== null)
};

const communityModules = getModuleInformation('community-modules', false);
const enterpriseModules = getModuleInformation('enterprise-modules', true);
const sourceBundleTemplate = fs.readFileSync('./source-bundle-template.ts', 'UTF-8');

const webpackCommands = [];

const runTestScriptCommands = [
`#!/usr/bin/env bash
error_found=0`
];

const outputTest = (moduleName, testModuleName) => {
    return `
count=$(grep -c 'var ${testModuleName} = {' ../bundles/${moduleName}.bundle.js)
if [ $count -gt 0 ]
then
    echo "ERROR: ${testModuleName} found in ../bundles/${moduleName}.bundle.js"
    error_found=1
fi
`
};

const processModules = (module, enterprise) => {
    const exportedModuleName = module.exportedModuleName;

    const testBundleLines = [
        `import {${exportedModuleName} as GridModule} from '${module.exposedModule}';`
    ];


    // the bundle entry file
    const testBundleContents = testBundleLines.concat(sourceBundleTemplate.toString().split('\n')).join('\n');
    const moduleEntryFile = `${exportedModuleName}.ts`;
    fs.writeFileSync(`../test-input/${moduleEntryFile}`, testBundleContents);

    // add module to list of webpack commands that will be used to generate bundles
    webpackCommands.push(`../node_modules/.bin/webpack --config webpack.config.js --entry ./${moduleEntryFile} -o ../bundles/${exportedModuleName}.bundle.js`);

    // the module source files that we'll pass into the moduleParser - we'll use this to search the webpack bundles for the module entries
    const moduleSourceImport = `import  {${exportedModuleName}} from "${module.moduleSource}"`;
    fs.writeFileSync(`../tests/${exportedModuleName}.ts`, moduleSourceImport);

    // the contents of the final run tests script that will check for the contents of a module in each bundle
    communityModules
        .filter(checkModule => checkModule.exportedModuleName !== exportedModuleName)
        .filter(checkModule => !module.dependants.includes(checkModule.exportedModuleName))
        .forEach(checkModule => {
            runTestScriptCommands.push(outputTest(exportedModuleName, checkModule.exportedModuleName));
        });

    if(!enterprise) {
        runTestScriptCommands.push(outputTest(exportedModuleName, 'EnterpriseCoreModule'));
    }
    enterpriseModules
        .filter(checkModule => checkModule.exportedModuleName !== exportedModuleName)
        .filter(checkModule => !module.dependants.includes(checkModule.exportedModuleName))
        .forEach(checkModule => {
            runTestScriptCommands.push(outputTest(exportedModuleName, checkModule.exportedModuleName));
        });

};

// generate the entry files that will be used to generate bundle files
communityModules.forEach(module => processModules(module, false));
enterpriseModules.forEach(module => processModules(module, true));

runTestScriptCommands.push('exit $error_found');

// output webpack file that will be used to generate the various module bundles
const webpackFile = '../test-input/webpack.sh';
fs.writeFileSync(webpackFile, webpackCommands.join('\n'));
fs.chmodSync(webpackFile, "755");

// the final run tests script that will check for the contents of a module in each bundle
const runTestScript = '../tests/runTests.sh';
fs.writeFileSync(runTestScript, runTestScriptCommands.join(' '));
fs.chmodSync(runTestScript, "755");
