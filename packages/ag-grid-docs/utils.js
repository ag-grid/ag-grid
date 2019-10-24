const glob = require('glob');

const frameworkModules = [
    'grid-react',
    'grid-angular',
    'grid-vue',
    'grid-polymer'
];

const getAllModules = () => {
    const mapModules = moduleRoot => glob.sync(`../../${moduleRoot}/*`)
        .filter(module => !frameworkModules.includes(module.replace(`../../${moduleRoot}/`, '')))
        .map(module => glob.sync(`${module}/src/*Module.ts`)[0])
        .filter(module => module)
        .map(module => {
            // this relies on the module name within the module class to be the same as the filename
            const fullPath = `${module}`;
            const fullJsPath = fullPath.replace("/ts/", "").replace("/src/", "/dist/cjs/");
            const filename = module.substr(module.lastIndexOf('/') + 1);
            const moduleName = filename.charAt(0).toUpperCase() + filename.slice(1).replace('.ts', '');

            let moduleDirName = fullPath.replace(`../../${moduleRoot}/`, '');
            moduleDirName = moduleDirName.substr(0, moduleDirName.lastIndexOf("/src"));

            const sourceDir = fullPath.substr(0, fullPath.lastIndexOf("/"));
            const rootDir = sourceDir.substr(0, sourceDir.lastIndexOf("/"));

            const barrelNamePrefix = moduleRoot === 'community-modules' ? '@ag-community' : '@ag-enterprise';
            const publishedName = `${barrelNamePrefix}/${moduleDirName}`;

            return {
                publishedName,
                fullPath,
                fullJsPath,
                filename,
                moduleName,
                sourceDir,
                rootDir,
                moduleDirName
            }
        });

    const communityModules = mapModules('community-modules');
    const enterpriseModules = mapModules('enterprise-modules');

    return {communityModules, enterpriseModules};
};

function updateSystemJsMappings(utilFileLines,
                                startString,
                                endString,
                                communityModules,
                                enterpriseModules,
                                communityMappingFunc,
                                enterpriseMappingFunc) {
    let foundStart = false;
    let foundEnd = false;

    const newUtilFileTop = [];
    const newUtilFileBottom = [];
    utilFileLines.forEach(line => {
        if (!foundStart) {
            newUtilFileTop.push(line);

            if (line.indexOf(startString) !== -1) {
                foundStart = true;
            }
        } else if (foundEnd) {
            newUtilFileBottom.push(line);
        } else if (foundStart && !foundEnd) {
            if (line.indexOf(endString) !== -1) {
                foundEnd = true;
                newUtilFileBottom.push(line);
            }
        }
    });

    const communityModuleEntries = communityModules.map(communityMappingFunc);
    const enterpriseModuleEntries = enterpriseModules.map(enterpriseMappingFunc);

    return newUtilFileTop.concat(communityModuleEntries).concat(enterpriseModuleEntries).concat(newUtilFileBottom);
}

exports.getAllModules = getAllModules;
exports.updateSystemJsMappings = updateSystemJsMappings;
