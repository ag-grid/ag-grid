const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');
const docsLock = require('./../docsLock');

const getModuleDirNames = (type) => {
    return fs.readdirSync(path.resolve(__dirname, `../../${type}-modules`));
};

const flattenArray = array => [].concat.apply([], array);

const mapToScopes = (barrelName, moduleDirNames) => flattenArray(moduleDirNames.map(moduleDirName => ['--scope', `@ag-grid-${barrelName}/${moduleDirName.replace('grid-', '')}`]));

const getScopeForModules = types => flattenArray(types.map(type => mapToScopes(type, getModuleDirNames(type))));

const executeLernaCommand = (arguments) => {
    if (docsLock.isLocked()) {
        console.error("Cannot execute a lerna command when the docs server is running.");
        return;
    }

    const flattenedArguments = flattenArray(arguments);
    console.log('----------------------------------------------------------------');
    console.log(`Executing [../../node_modules/.bin/lerna ${flattenedArguments.join(' ')}`);
    console.log('----------------------------------------------------------------');

    const child = spawn(path.resolve(__dirname, `../../node_modules/.bin/lerna`), flattenedArguments);
    child.on('exit', (code) => {
        console.log(`Child process exited with code ${code}`);
    });
    child.stdout.on('data', (data) => {
        console.log(` ${data}`);
    });
    child.stderr.on('data', (data) => {
        console.log(`${data}`);
    });
};


const getCommunityScopes = flattenArray(getScopeForModules(['community']));
const getEnterpriseScopes = flattenArray(getScopeForModules(['enterprise']));
const getModuleScopes = flattenArray(getScopeForModules(['community', 'enterprise']));

module.exports.cleanCommunityModules = () => executeLernaCommand(['clean', '--yes', getCommunityScopes]);
module.exports.cleanEnterpriseModules = () => executeLernaCommand(['clean', '--yes', getEnterpriseScopes]);
module.exports.cleanModules = () => executeLernaCommand(['clean', '--yes', getModuleScopes]);

module.exports.bootstrapCommunityModules = () => executeLernaCommand(['bootstrap', getCommunityScopes]);
module.exports.bootstrapEnterpriseModules = () => executeLernaCommand(['bootstrap', getEnterpriseScopes]);
module.exports.bootstrapModules = () => executeLernaCommand(['bootstrap', getModuleScopes]);

module.exports.buildCommunityModules = () => executeLernaCommand(['run', 'build', getCommunityScopes]);
module.exports.buildEnterpriseModules = () => executeLernaCommand(['run', 'build', getEnterpriseScopes]);
module.exports.buildModules = () => executeLernaCommand(['run', 'build', getModuleScopes]);

module.exports.testCommunityModules = () => executeLernaCommand(['run', 'test', getCommunityScopes]);
module.exports.testEnterpriseModules = () => executeLernaCommand(['run', 'test', getEnterpriseScopes]);
module.exports.testModules = () => executeLernaCommand(['run', 'test', getModuleScopes]);
