const glob = require('glob');
const { EOL } = require('os');

const frameworkModules = [
    'react',
    'angular',
    'vue',
    'vue3',
    'polymer'
];

const getAllModules = () => {
    const mapModules = moduleRoot => glob.sync(`../../${moduleRoot}/*`)
        .filter(module => !frameworkModules.includes(module.replace(`../../${moduleRoot}/`, '')))
        .map(module => glob.sync(`${module}/src/*Module.ts`)[0])
        .filter(module => module)
        .map(module => {
            // this relies on the module name within the module class to be the same as the filename
            const fullPath = `${module}`;
            const fullJsPath = fullPath.replace("/ts/", "").replace("/src/", "/dist/cjs/es5/");
            const filename = module.substr(module.lastIndexOf('/') + 1);
            const moduleName = filename.charAt(0).toUpperCase() + filename.slice(1).replace('.ts', '');

            let moduleDirName = fullPath.replace(`../../${moduleRoot}/`, '');
            moduleDirName = moduleDirName.substr(0, moduleDirName.lastIndexOf("/src"));

            const sourceDir = fullPath.substr(0, fullPath.lastIndexOf("/"));
            const rootDir = sourceDir.substr(0, sourceDir.lastIndexOf("/"));
            const publishedName = require(`${rootDir}/package.json`).name;

            const enterprise = publishedName.includes("enterprise");
            const allModules = publishedName.includes("all-modules");

            const realCjsFile = glob.sync(`${rootDir}/dist/*.cjs.js`)[0];
            const realCjsRelativePath = realCjsFile ? realCjsFile.substr(realCjsFile.lastIndexOf("dist"), realCjsFile.length) : null;
            const derivedCjsRelativePath = `dist/${publishedName.substr(publishedName.lastIndexOf("/") + 1, publishedName.length)}.cjs.js`;

            const cjsRelativePath = realCjsRelativePath ? realCjsRelativePath : derivedCjsRelativePath;
            const cjsFilename = `${publishedName}/${allModules ? enterprise ? "dist/ag-grid-enterprise.cjs.js" : "dist/ag-grid-community.cjs.js" : cjsRelativePath}`;
            const minVersionedCjs = cjsFilename.replace('.cjs.js', '.cjs.min.js').replace('/dist/', '@\${agGridVersion}/dist/')

            return {
                publishedName,
                fullPath,
                fullJsPath,
                filename,
                moduleName,
                sourceDir,
                rootDir,
                moduleDirName,
                cjsFilename,
                minVersionedCjs
            };
        });

    const gridCommunityModules = mapModules('community-modules');
    const gridEnterpriseModules = mapModules('enterprise-modules');

    const chartCommunityModules = mapModules('charts-packages');

    return { gridCommunityModules, gridEnterpriseModules, chartCommunityModules };
};

function updateBetweenStrings(
    fileContents,
    startString,
    endString,
    gridCommunityModules,
    gridEnterpriseModules,
    communityMappingFunc,
    enterpriseMappingFunc) {

    const startIndex = fileContents.indexOf(startString) + startString.length;
    const endIndex = fileContents.indexOf(endString);

    const communityModuleEntries = gridCommunityModules.map(communityMappingFunc);
    const enterpriseModuleEntries = gridEnterpriseModules.map(enterpriseMappingFunc);

    const fragmentToBeInserted = communityModuleEntries.concat(enterpriseModuleEntries).join(EOL);

    return `${fileContents.substring(0, startIndex)}${EOL}${fragmentToBeInserted}${EOL}${fileContents.substring(endIndex)}`;
}

const processStdio = func => async (data) => {
    let output = data.toString().trim();

    // trim off requests to reset the screen/scrolling position
    if(data[0] === 27 && data[1] === 99) {
        output = output.split('').splice(2).join('');
    }

    func(output)
}

exports.getAllModules = getAllModules;
exports.updateBetweenStrings = updateBetweenStrings;
exports.processStdio = processStdio;

